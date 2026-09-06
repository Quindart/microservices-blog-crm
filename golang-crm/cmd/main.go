package main

import (
	"golang-crm/internal/config"
	"golang-crm/internal/container"
	"log"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	app, err := container.New(cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer app.Close()

	log.Printf("CRM API listening on :%s", cfg.Port)
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
