package http

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"os"
	"strconv"

	input "golang-crm/internal/application/ports/in"
	"golang-crm/internal/domain/customer"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"gorm.io/gorm"
)

type Server struct {
	port      string
	customers input.CustomerService
	orders    input.OrderService
	products  input.ProductService
}

func NewServer(port string, customers input.CustomerService, orders input.OrderService, products input.ProductService) *Server {
	return &Server{port: port, customers: customers, orders: orders, products: products}
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

	e.GET("/api/v1/orders", s.getOrderByParams)
	e.GET("/api/v1/orders/:id", s.getOrderByID)
	e.GET("/api/v1/customers/:customerId/orders", s.getOrdersByCustomer)

	e.GET("/api/v1/products", s.getProducts)
	e.GET("/api/v1/products/:id", s.getProductByID)
	e.GET(
		"/api/v1/customers/:customerId/orders",
		s.getOrdersByCustomer,
	)

	e.GET("/swagger.json", func(c *echo.Context) error {
		return c.Blob(http.StatusOK, "application/json", mustReadSpec("swagger.json"))
	})
	e.GET("/api.yml", func(c *echo.Context) error {
		return c.Blob(http.StatusOK, "application/yaml", mustReadSpec("api.yml"))
	})
	e.GET("/docs", swaggerUI)
	return e.Start(":" + s.port)
}

func (s *Server) getProducts(c *echo.Context) error {
	limit, offset, err := pagination(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	items, err := s.products.GetByParams(c.Request().Context(), limit, offset)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not list products"})
	}
	return c.JSON(http.StatusOK, items)
}

func (s *Server) getProductByID(c *echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid product id"})
	}
	item, err := s.products.GetByID(c.Request().Context(), id)
	if errors.Is(err, gorm.ErrRecordNotFound) || item == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "product not found"})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not get product"})
	}
	return c.JSON(http.StatusOK, item)
}

func (s *Server) getOrderByParams(c *echo.Context) error {
	limit, offset, err := pagination(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	items, err := s.orders.GetByParams(c.Request().Context(), limit, offset)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not list orders"})
	}
	return c.JSON(http.StatusOK, items)
}

func (s *Server) getOrderByID(c *echo.Context) error {
	item, err := s.orders.GetByID(c.Request().Context(), c.Param("id"))
	if errors.Is(err, gorm.ErrRecordNotFound) || item == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "order not found"})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not get order"})
	}
	return c.JSON(http.StatusOK, item)
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
	limit, offset, err := pagination(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	customers, err := s.customers.ListByParams(c.Request().Context(), limit, offset)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not list customers"})
	}

	response := make([]customerResponse, len(customers))
	for i, item := range customers {
		response[i] = customerResponse{ID: item.ID, Name: item.Name, Email: item.Email, City: item.City}
	}
	return c.JSON(http.StatusOK, response)
}

func pagination(c *echo.Context) (int, int, error) {
	limit, offset := 0, 0
	var err error
	if value := c.QueryParam("limit"); value != "" {
		limit, err = strconv.Atoi(value)
		if err != nil || limit < 1 {
			return 0, 0, errors.New("limit must be a positive integer")
		}
	}
	if value := c.QueryParam("offset"); value != "" {
		offset, err = strconv.Atoi(value)
		if err != nil || offset < 0 {
			return 0, 0, errors.New("offset must be a non-negative integer")
		}
	}
	return limit, offset, nil
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

func (s *Server) getOrdersByCustomer(c *echo.Context) error {
	items, err := s.orders.GetByCustomerID(c.Request().Context(), c.Param("customerId"))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "could not list customer orders"})
	}
	return c.JSON(http.StatusOK, items)
}

func newUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return hex.EncodeToString(b[:4]) + "-" + hex.EncodeToString(b[4:6]) + "-" + hex.EncodeToString(b[6:8]) + "-" + hex.EncodeToString(b[8:10]) + "-" + hex.EncodeToString(b[10:])
}
