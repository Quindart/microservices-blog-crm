package main

import (
	"golang-crm/internal/adapters/http"
	"golang-crm/internal/adapters/postgres"
	"golang-crm/internal/application/service"
	"golang-crm/internal/config"
	"log"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	db, err := postgres.NewDatabase(postgres.Config{
		Host: cfg.Database.Host, Port: cfg.Database.Port, User: cfg.Database.User,
		Password: cfg.Database.Password, Name: cfg.Database.Name,
	})
	if err != nil {
		log.Fatal(err)
	}
	defer postgres.CloseDatabase(db)

	server := http.NewServer(cfg.Port, service.NewCustomerService(postgres.NewCustomerRepository(db)))

	log.Printf("CRM API listening on :%s", cfg.Port)
	if err := server.Start(); err != nil {
		log.Fatal(err)
	}
}
