package obd2

import (
	"log"
	"net/http"

	"github.com/sdv43/carmon/internal"
)

type Response struct {
	PCMVoltage float64
	OilTemp    float64
	OilPress   int64
	OilLevel   int64
	TirePress1 float64
	TirePress2 float64
	TirePress3 float64
	TirePress4 float64
}

func HandleOBD2Data(w http.ResponseWriter, r *http.Request) {
	obd2, err := NewOBD2Connection("192.168.0.10:35000")

	if err != nil {
		log.Printf("obd2/data error: %v", err)
		internal.RespondError(w, "Cannot connect to adapter, error: "+err.Error())
		return
	}

	defer func() {
		if err := obd2.Close(); err != nil {
			log.Printf("Connection close error: %v", err)
		}
	}()

	if _, err = obd2.command("ATE0"); err != nil {
		log.Printf("obd2/data error: %v", err)
		internal.RespondError(w, "Cannot disable echo, error: "+err.Error())
		return
	}

	if _, err = obd2.command("ATTP6"); err != nil {
		log.Printf("obd2/data error: %v", err)
		internal.RespondError(w, "Cannot set 6 protocol, error: "+err.Error())
		return
	}

	pcmData, pcmErr := obd2.getPCMData()

	if pcmErr != nil {
		log.Printf("obd2/data pcm data error: %v", pcmErr)
	}

	icData, icErr := obd2.getICData()

	if icErr != nil {
		log.Printf("obd2/data ic data error: %v", icErr)
	}

	log.Printf("obd2/data data: %+v, %+v", pcmData, icData)

	internal.Respond(w, Response{
		PCMVoltage: pcmData.voltage,
		OilLevel:   pcmData.level,
		OilPress:   pcmData.pressure,
		OilTemp:    pcmData.temperature,
		TirePress1: icData.tirePress1,
		TirePress2: icData.tirePress2,
		TirePress3: icData.tirePress3,
		TirePress4: icData.tirePress4,
	})
}
