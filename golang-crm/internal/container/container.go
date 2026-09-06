package container

import (
	"golang-crm/internal/adapters/http"
	"golang-crm/internal/adapters/postgres"
	"golang-crm/internal/application/service"
	"golang-crm/internal/config"
)

// Container is the composition root for the application.
// It owns infrastructure resources and wires adapters to application services.
type Container struct {
	database *postgres.Database
	server   *http.Server
}

func New(cfg config.Config) (*Container, error) {

	database, err := postgres.NewDatabase(postgres.Config{
		Host: cfg.Database.Host, Port: cfg.Database.Port, User: cfg.Database.User,
		Password: cfg.Database.Password, Name: cfg.Database.Name,
	})
	if err != nil {
		return nil, err
	}

	repository := postgres.NewCustomerRepository(database)
	customerService := service.NewCustomerService(repository)
	server := http.NewServer(cfg.Port, http.Dependencies{
		CustomerService: customerService,
	})

	return &Container{database: database, server: server}, nil
}

func (c *Container) Start() error { return c.server.Start() }

func (c *Container) Close() { postgres.CloseDatabase(c.database) }
