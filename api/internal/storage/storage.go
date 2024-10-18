package storage

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/sdv43/carmon/internal"
)

var StorageDir = ""

func HandleStorageSave(w http.ResponseWriter, r *http.Request) {
	key := r.FormValue("key")
	value := r.FormValue("value")

	if key == "" {
		internal.RespondError(w, "Empty key")
		return
	}

	if value == "" {
		internal.RespondError(w, "Empty value")
		return
	}

	log.Printf("storage/save %s:%s", key, value)

	keyFile := filepath.Join(StorageDir, key+".txt")

	if err := os.WriteFile(keyFile, []byte(value), 0644); err != nil {
		internal.RespondError(w, "Cannot save the data: "+err.Error())
	}

	internal.Respond(w, nil)
}

func HandleStorageGet(w http.ResponseWriter, r *http.Request) {
	type Response struct {
		Value *string
	}

	key := r.FormValue("key")

	if key == "" {
		internal.RespondError(w, "Empty key")
		return
	}

	data, err := os.ReadFile(filepath.Join(StorageDir, key+".txt"))
	dataAsString := string(data)

	log.Printf("storage/get %s:%s", key, dataAsString)

	if err == nil {
		internal.Respond(w, Response{Value: &dataAsString})
		return
	}

	if os.IsNotExist(err) {
		internal.Respond(w, Response{Value: nil})
		return
	}

	internal.RespondError(w, "Cannot get the data by key: "+err.Error())
}
