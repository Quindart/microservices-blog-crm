package http

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"os"

	input "golang-crm/internal/application/ports/in"
	"golang-crm/internal/domain/customer"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"gorm.io/gorm"
)

type Server struct {
	port      string
	customers input.CustomerCRUD
}

func NewServer(port string, customers input.CustomerCRUD) *Server {
	return &Server{port: port, customers: customers}
}

func (s *Server) Start() error {
	e := echo.New()
	e.Use(middleware.RequestLogger(), middleware.Recover())
	e.GET("/health", health)
	e.GET("/api/v1/customers", s.list)
	e.POST("/api/v1/customers", s.create)
	e.GET("/api/v1/customers/:id", s.getByID)
	e.PUT("/api/v1/customers/:id", s.update)
	e.DELETE("/api/v1/customers/:id", s.delete)
	e.GET("/swagger.json", func(c *echo.Context) error {
		return c.Blob(http.StatusOK, "application/json", mustReadSpec("swagger.json"))
	})
	e.GET("/api.yml", func(c *echo.Context) error {
		return c.Blob(http.StatusOK, "application/yaml", mustReadSpec("api.yml"))
	})
	e.GET("/docs", swaggerUI)
	return e.Start(":" + s.port)
}

func mustReadSpec(name string) []byte {
	data, err := os.ReadFile(name)
	if err != nil {
		panic(err)
	}
	return data
}

func swaggerUI(c *echo.Context) error {
	return c.HTML(http.StatusOK, `<!doctype html>
		<html><head><title>CRM API Docs</title>
		<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"></head>
		<body><div id="swagger-ui"></div>
		<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
		<script>window.ui = SwaggerUIBundle({url: '/swagger.json', dom_id: '#swagger-ui'});</script>
		</body></html>`)
}

func health(c *echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

type customerResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	City  string `json:"city"`
}

func (s *Server) list(c *echo.Context) error {
	customers, err := s.customers.List(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not list customers"})
	}

	response := make([]customerResponse, len(customers))
	for i, item := range customers {
		response[i] = customerResponse{ID: item.ID, Name: item.Name, Email: item.Email, City: item.City}
	}
	return c.JSON(http.StatusOK, response)
}

type customerRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	City  string `json:"city"`
}

func (s *Server) create(c *echo.Context) error {
	var req customerRequest
	if err := c.Bind(&req); err != nil || req.Name == "" || req.Email == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "name and email are required"})
	}
	item := customer.Customer{ID: newUUID(), Name: req.Name, Email: req.Email, City: req.City}
	created, err := s.customers.Create(c.Request().Context(), item)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not create customer"})
	}
	return c.JSON(http.StatusCreated, created)
}

func (s *Server) getByID(c *echo.Context) error {
	item, err := s.customers.GetByID(c.Request().Context(), c.Param("id"))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "customer not found"})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not get customer"})
	}
	return c.JSON(http.StatusOK, item)
}

func (s *Server) update(c *echo.Context) error {
	var req customerRequest
	if err := c.Bind(&req); err != nil || req.Name == "" || req.Email == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "name and email are required"})
	}
	item, err := s.customers.Update(c.Request().Context(), customer.Customer{ID: c.Param("id"), Name: req.Name, Email: req.Email, City: req.City})
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "customer not found"})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not update customer"})
	}
	return c.JSON(http.StatusOK, item)
}

func (s *Server) delete(c *echo.Context) error {
	err := s.customers.Delete(c.Request().Context(), c.Param("id"))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "customer not found"})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not delete customer"})
	}
	return c.NoContent(http.StatusNoContent)
}

func newUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return hex.EncodeToString(b[:4]) + "-" + hex.EncodeToString(b[4:6]) + "-" + hex.EncodeToString(b[6:8]) + "-" + hex.EncodeToString(b[8:10]) + "-" + hex.EncodeToString(b[10:])
}
