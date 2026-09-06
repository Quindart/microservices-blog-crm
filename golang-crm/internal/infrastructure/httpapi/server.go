package httpapi

import (
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"golang-crm/internal/application"
	"net/http"
)

type Server struct {
	port string
	list application.ListCustomers
}

func NewServer(port string, list application.ListCustomers) *Server { return &Server{port, list} }
func (s *Server) Start() error {
	e := echo.New()
	e.Use(middleware.RequestLogger(), middleware.Recover())
	e.GET("/health", func(c *echo.Context) error { return c.JSON(http.StatusOK, map[string]string{"status": "ok"}) })
	e.GET("/api/v1/customers", s.getCustomers)
	return e.Start(":" + s.port)
}
func (s *Server) getCustomers(c *echo.Context) error {
	v, err := s.list.Execute()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not list customers"})
	}
	return c.JSON(http.StatusOK, v)
}
