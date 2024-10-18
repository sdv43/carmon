package obd2

import (
	"bufio"
	"bytes"
	"fmt"
	"net"
	"strconv"
	"time"
)

type PCMData struct {
	level       int64
	pressure    int64
	temperature float64
	voltage     float64
}

type ICData struct {
	tirePress1 float64
	tirePress2 float64
	tirePress3 float64
	tirePress4 float64
}

type OBD2Connection struct {
	net.Conn
}

func NewOBD2Connection(address string) (*OBD2Connection, error) {
	dialer := net.Dialer{Timeout: time.Second * 10}
	conn, err := dialer.Dial("tcp", address)

	if err != nil {
		return nil, err
	}

	return &OBD2Connection{Conn: conn}, nil
}

func (obd *OBD2Connection) command(cmd string) ([]byte, error) {
	if err := obd.SetDeadline(time.Now().Add(time.Second * 5)); err != nil {
		return nil, err
	}

	// writing cmd
	bcmd := append([]byte(cmd), 13) // add symbol "\r"
	nbytes, err := obd.Write(bcmd)

	if err != nil {
		return nil, err
	}

	if nbytes != len(bcmd) {
		return nil, fmt.Errorf("Writing error: %d/%d bytes", nbytes, (bcmd))
	}

	// reading cmd response
	reader := bufio.NewReader(obd)
	respbytes, err := reader.ReadBytes(62) // until symbol ">"

	if err != nil {
		return nil, err
	}

	respbytes, _ = bytes.CutSuffix(respbytes, []byte{62})         // remove ">"
	respbytes = bytes.ReplaceAll(respbytes, []byte{13}, []byte{}) // replace "\r" symbols
	respbytes = bytes.ReplaceAll(respbytes, []byte{32}, []byte{}) // replace " " symbols

	// log.Printf("respbytes %d, %s, %v", len(respbytes), respbytes, respbytes)

	return respbytes, nil
}

func (obd *OBD2Connection) getOilTemp() (float64, error) {
	res, err := obd.command("2213101")

	if err != nil {
		return 0, err
	}

	if len(res) < 10 {
		return 0, fmt.Errorf("Cannot parse oil temp: %d, %s", len(res), res)
	}

	var kf [4]int64

	for i, v := range res[6:10] {
		kf[i], _ = strconv.ParseInt(string(v), 16, 0)
	}

	var temp float64 = -40

	temp += float64(kf[0])
	temp += float64(kf[0] * 40)
	temp += (float64(kf[1]) * 2.5625)
	temp += (float64(kf[1]) * 0.16)
	temp += (float64(kf[1]) * 0.0105625)

	return temp, nil
}

func (obd *OBD2Connection) getOilPress() (int64, error) {
	res, err := obd.command("2204151")

	if err != nil {
		return 0, err
	}

	if len(res) < 10 {
		return 0, fmt.Errorf("Cannot parse oil pressure: %d, %s", len(res), res)
	}

	pressure, _ := strconv.ParseInt(string(res[8:10]), 16, 0)

	return pressure, nil
}

func (obd *OBD2Connection) getOilLevel() (int64, error) {
	res, err := obd.command("22DAAC6")

	if err != nil {
		return 0, err
	}

	if len(res) < 23 {
		return 0, fmt.Errorf("Cannot parse oil level: %d, %s", len(res), res)
	}

	level, _ := strconv.ParseInt(string(res[21:23]), 16, 0)

	return level, nil
}

func (obd *OBD2Connection) getPCMVoltage() (float64, error) {
	res, err := obd.command("22F4421")

	if err != nil {
		return 0, err
	}

	if len(res) < 10 {
		return 0, fmt.Errorf("Cannot parse pcm voltage: %d, %s", len(res), res)
	}

	value, _ := strconv.ParseInt(string(res[6:10]), 16, 0)
	voltage := float64(value) / 1000

	return voltage, nil
}

func (obd *OBD2Connection) getTirePressure(n int) (float64, error) {
	res, err := obd.command(fmt.Sprintf("222A0%d1", 4+n))

	if err != nil {
		return 0, err
	}

	if len(res) < 8 {
		return 0, fmt.Errorf("Cannot parse tire pressure %d: %d, %s", n, len(res), res)
	}

	a1, _ := strconv.ParseInt(string(res[6]), 16, 0)
	a2, _ := strconv.ParseInt(string(res[7]), 16, 0)

	pressure := float64(a1)*21.96 + float64(a2)*1.3725

	return pressure, nil
}

func (obd *OBD2Connection) getICData() (ICData, error) {
	var icData ICData
	var lastErr, err error

	if _, err = obd.command("ATSH000720"); err != nil {
		return icData, err
	}

	if _, err = obd.command("ATCRA728"); err != nil {
		return icData, err
	}

	if icData.tirePress1, err = obd.getTirePressure(1); err != nil {
		lastErr = err
	}

	if icData.tirePress2, err = obd.getTirePressure(2); err != nil {
		lastErr = err
	}

	if icData.tirePress3, err = obd.getTirePressure(3); err != nil {
		lastErr = err
	}

	if icData.tirePress4, err = obd.getTirePressure(4); err != nil {
		lastErr = err
	}

	return icData, lastErr
}

func (obd *OBD2Connection) getPCMData() (PCMData, error) {
	var pcmData PCMData
	var lastErr, err error

	if _, err = obd.command("ATSH0007E0"); err != nil {
		return pcmData, err
	}

	if _, err = obd.command("ATCRA7E8"); err != nil {
		return pcmData, err
	}

	if pcmData.voltage, err = obd.getPCMVoltage(); err != nil {
		lastErr = err
	}

	if pcmData.level, err = obd.getOilLevel(); err != nil {
		lastErr = err
	}

	if pcmData.pressure, err = obd.getOilPress(); err != nil {
		lastErr = err
	}

	if pcmData.temperature, err = obd.getOilTemp(); err != nil {
		lastErr = err
	}

	return pcmData, lastErr
}
