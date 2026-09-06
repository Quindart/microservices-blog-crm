package main

import (
	"golang-crm/internal/application"
	"golang-crm/internal/config"
	"golang-crm/internal/infrastructure/httpapi"
	"golang-crm/internal/infrastructure/persistence"
	"log"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	db, err := persistence.NewDatabase(cfg.Database)
	if err != nil {
		log.Fatal(err)
	}
	defer persistence.CloseDatabase(db)
	server := httpapi.NewServer(cfg.Port, application.NewListCustomers(persistence.NewCustomerRepository(db)))
	log.Printf("CRM API listening on :%s", cfg.Port)
	if err := server.Start(); err != nil {
		log.Fatal(err)
	}
}
