package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path"

	"github.com/sdv43/carmon/internal/carbatt"
	"github.com/sdv43/carmon/internal/obd2"
	"github.com/sdv43/carmon/internal/storage"
)

func main() {
	isStartServer := flag.Bool("server", false, "Starts web server")
	workDir := flag.String("wd", "", "Working directory")

	flag.Parse()

	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	checkStorageDir(*workDir)
	startServer(*isStartServer, *workDir)
}

func checkStorageDir(wd string) {
	if wd == "" {
		log.Printf("Working directory should be set")
		os.Exit(0)
	}

	storageDir := path.Join(wd, "storage")

	err := os.Mkdir(storageDir, 0755)

	if err == nil {
		log.Printf("Storage dir was created \"%s\"", storageDir)
	} else if os.IsExist(err) {
		log.Printf("Storage dir already exists \"%s\"", storageDir)
	} else {
		log.Printf("Cannot create storage dir: %v", err)
		os.Exit(0)
	}

	storage.StorageDir = storageDir
}

func startServer(is bool, wd string) {
	if !is {
		return
	}

	const serverPort = "27400"

	log.Printf("Server port: %s", serverPort)

	http.HandleFunc("/storage/set", storage.HandleStorageSave)
	http.HandleFunc("/storage/get", storage.HandleStorageGet)
	http.HandleFunc("/obd2/data", obd2.HandleOBD2Data)
	http.HandleFunc("/carbattery", carbatt.HandleCarBatt)

	writeToHealthFile(wd, "1")

	err := http.ListenAndServe(":"+serverPort, nil)

	writeToHealthFile(wd, "0")

	log.Printf("Server listen error: %v", err)
}

func writeToHealthFile(wd string, status string) {
	healthFile := path.Join(wd, "health.txt")

	if err := os.WriteFile(healthFile, []byte(status), 0644); err != nil {
		log.Printf("Cannot write %s to health file \"%s\": %v", status, healthFile, err)
		os.Exit(0)
	}
}
