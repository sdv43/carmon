package carbatt

import (
	"log"
	"net/http"
	"os/exec"
	"strconv"

	"github.com/sdv43/carmon/internal"
)

type Response struct {
	Value int64
}

// BattTracSoc_Pc_Actl, Battery_StateOfCharge
// smdb-read -n vdm_vdt_current_data -e BattTracSoc_Pc_Actl
// smdb-read -n vdm_vdt_current_data -e Battery_StateOfCharge

func HandleCarBatt(w http.ResponseWriter, r *http.Request) {
	// out, err := exec.Command("echo", "15").Output()
	out, err := exec.Command("smdb-read", "-n", "vdm_vdt_current_data", "-e", "BattTracSoc_Pc_Actl").Output()

	if err != nil {
		log.Printf("Cannot get battery charge level, error %v", err)
		internal.RespondError(w, "Cannot get battery charge level, error: "+err.Error())
		return
	}

	log.Printf("Charge level: %s", string(out))

	level, err := strconv.ParseInt(string(out[:len(out)-1]), 10, 0)

	if err != nil {
		internal.RespondError(w, "Cannot parse battery charge level, error: "+err.Error())
		return
	}

	internal.Respond(w, Response{
		Value: level,
	})
}
