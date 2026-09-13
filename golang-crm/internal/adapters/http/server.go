package http

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"os"
	"strconv"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	input "golang-crm/internal/application/ports/in"
	"golang-crm/internal/domain/store/blog"
	"golang-crm/internal/domain/store/catalog"
	"golang-crm/internal/domain/store/checkout"
	"golang-crm/internal/domain/store/contact"
	"gorm.io/gorm"
)

type Server struct {
	port           string
	catalog        input.CatalogService
	landingService input.LandingPageService
	blogService    input.BlogService
	contact        input.ContactService
	cartService    input.CartService
	checkout       input.CheckoutService
}

func NewServer(
	port string,
	catalogService input.CatalogService,
	landingService input.LandingPageService,
	blogService input.BlogService,
	contactService input.ContactService,
	cartService input.CartService,
	checkoutService input.CheckoutService,
) *Server {
	return &Server{
		port: port, catalog: catalogService, landingService: landingService,
		blogService: blogService, contact: contactService, cartService: cartService,
		checkout: checkoutService,
	}
}

func (s *Server) Start() error {
	e := echo.New()
	e.Use(middleware.RequestLogger(), middleware.Recover())
	e.GET("/health", health)

	e.GET("/api/products", s.products)
	e.GET("/api/products/:slug", s.product)
	e.GET("/api/categories", s.categories)

	e.GET("/api/landing-pages", s.landings)
	e.GET("/api/landing-pages/:slug", s.landing)

	e.GET("/api/blogs", s.blogs)
	e.GET("/api/blogs/:slug", s.blog)
	e.GET("/api/blog-categories", s.blogCategories)

	e.POST("/api/contacts", s.createContact)
	e.GET("/api/contacts", s.contacts)

	e.GET("/api/cart", s.cart)
	e.POST("/api/cart/items", s.addCart)
	e.PATCH("/api/cart/items/:itemId", s.updateCart)
	e.DELETE("/api/cart/items/:itemId", s.deleteCart)

	e.POST("/api/orders", s.createOrder)
	e.GET("/api/orders/:orderNumber", s.order)
	e.GET("/swagger.json", func(c *echo.Context) error {
		return c.Blob(http.StatusOK, "application/json", mustReadSpec("swagger.json"))
	})
	e.GET(
		"/api.yml",
		func(c *echo.Context) error {
			return c.Blob(http.StatusOK, "application/yaml", mustReadSpec("api.yml"))
		},
	)
	e.GET("/docs", swaggerUI)
	return e.Start(":" + s.port)
}

func health(
	c *echo.Context,
) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
func mustReadSpec(name string) []byte {
	data, err := os.ReadFile(name)
	if err != nil {
		panic(err)
	}
	return data
}
func swaggerUI(c *echo.Context) error {
	return c.HTML(
		http.StatusOK,
		`<!doctype html><html><head><title>Store API Docs</title>`+
			`<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"></head>`+
			`<body><div id="swagger-ui"></div>`+
			`<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>`+
			`<script>window.ui=SwaggerUIBundle({url:'/swagger.json',dom_id:'#swagger-ui'});</script>`+
			`</body></html>`,
	)
}
func page(c *echo.Context) (int, int, error) {
	p, l := 1, 12
	var err error
	if v := c.QueryParam("page"); v != "" {
		p, err = strconv.Atoi(v)
		if err != nil || p < 1 {
			return 0, 0, errors.New("page must be a positive integer")
		}
	}
	if v := c.QueryParam("limit"); v != "" {
		l, err = strconv.Atoi(v)
		if err != nil || l < 1 || l > 100 {
			return 0, 0, errors.New("limit must be between 1 and 100")
		}
	}
	return p, l, nil
}
func paginate(items any, p, l, total int) map[string]any {
	return map[string]any{
		"items": items,
		"pagination": map[string]int{
			"page":       p,
			"limit":      l,
			"total":      total,
			"totalPages": (total + l - 1) / l,
		},
	}
}
func bad(c *echo.Context, err error) error {
	return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
}
func fail(c *echo.Context) error {
	return c.JSON(
		http.StatusInternalServerError,
		map[string]string{"error": "internal server error"},
	)
}
func (s *Server) products(c *echo.Context) error {
	p, l, e := page(c)
	if e != nil {
		return bad(c, e)
	}
	var min, max *float64
	if v := c.QueryParam("minPrice"); v != "" {
		n, x := strconv.ParseFloat(v, 64)
		if x != nil {
			return bad(c, x)
		}
		min = &n
	}
	if v := c.QueryParam("maxPrice"); v != "" {
		n, x := strconv.ParseFloat(v, 64)
		if x != nil {
			return bad(c, x)
		}
		max = &n
	}
	items, total, e := s.catalog.ListProducts(
		c.Request().Context(),
		catalog.ProductFilter{
			Page:     p,
			Limit:    l,
			Category: c.QueryParam("category"),
			Search:   c.QueryParam("search"),
			Sort:     c.QueryParam("sort"),
			MinPrice: min,
			MaxPrice: max,
		},
	)
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, paginate(items, p, l, total))
}
func (s *Server) product(c *echo.Context) error {
	v, e := s.catalog.GetProduct(c.Request().Context(), c.Param("slug"))
	if errors.Is(e, gorm.ErrRecordNotFound) || v == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "product not found"})
	}
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, v)
}
func (s *Server) categories(c *echo.Context) error {
	items, err := s.catalog.ListCategories(c.Request().Context())
	if err != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, items)
}
func (s *Server) landings(c *echo.Context) error {
	p, l, e := page(c)
	if e != nil {
		return bad(c, e)
	}
	items, total, e := s.landingService.ListLandingPages(c.Request().Context(), p, l)
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, paginate(items, p, l, total))
}
func (s *Server) landing(c *echo.Context) error {
	v, e := s.landingService.GetLandingPage(c.Request().Context(), c.Param("slug"))
	if errors.Is(e, gorm.ErrRecordNotFound) || v == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "landing page not found"})
	}
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, v)
}
func (s *Server) blogs(c *echo.Context) error {
	p, l, e := page(c)
	if e != nil {
		return bad(c, e)
	}
	items, total, e := s.blogService.ListBlogs(
		c.Request().Context(),
		blog.BlogFilter{
			Page:     p,
			Limit:    l,
			Category: c.QueryParam("category"),
			Tag:      c.QueryParam("tag"),
			Author:   c.QueryParam("author"),
			Search:   c.QueryParam("search"),
			Sort:     c.QueryParam("sort"),
		},
	)
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, paginate(items, p, l, total))
}
func (s *Server) blog(c *echo.Context) error {
	v, e := s.blogService.GetBlog(c.Request().Context(), c.Param("slug"))
	if errors.Is(e, gorm.ErrRecordNotFound) || v == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "blog not found"})
	}
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, v)
}
func (s *Server) blogCategories(c *echo.Context) error {
	items, err := s.blogService.ListCategories(c.Request().Context())
	if err != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, items)
}
func (s *Server) createContact(c *echo.Context) error {
	var v contact.Contact
	if e := c.Bind(&v); e != nil || v.FullName == "" || v.Email == "" || v.Phone == "" {
		return bad(c, errors.New("fullName, email and phone are required"))
	}
	if v.Source == "" {
		v.Source = "homepage-contact-form"
	}
	out, e := s.contact.CreateContact(c.Request().Context(), v)
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusCreated, out)
}
func (s *Server) contacts(c *echo.Context) error {
	p, l, e := page(c)
	if e != nil {
		return bad(c, e)
	}
	items, total, e := s.contact.ListContacts(c.Request().Context(), p, l)
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, paginate(items, p, l, total))
}
func session(c *echo.Context) string {
	if v := c.Request().Header.Get("X-Session-ID"); v != "" {
		return v
	}
	if v, err := c.Cookie("session_id"); err == nil && v != nil && v.Value != "" {
		return v.Value
	}
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	v := hex.EncodeToString(b)
	c.SetCookie(&http.Cookie{Name: "session_id", Value: v, Path: "/", HttpOnly: true})
	return v
}
func (s *Server) cart(c *echo.Context) error {
	v, e := s.cartService.GetCart(c.Request().Context(), session(c))
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, v)
}
func (s *Server) addCart(c *echo.Context) error {
	var req struct {
		VariantID string `json:"variantId"`
		Quantity  int    `json:"quantity"`
	}
	if e := c.Bind(&req); e != nil || req.VariantID == "" || req.Quantity < 1 {
		return bad(c, errors.New("variantId and positive quantity are required"))
	}
	v, e := s.cartService.AddCartItem(c.Request().Context(), session(c), req.VariantID, req.Quantity)
	if e != nil {
		return bad(c, e)
	}
	return c.JSON(http.StatusOK, v)
}
func (s *Server) updateCart(c *echo.Context) error {
	var req struct {
		Quantity int `json:"quantity"`
	}
	if e := c.Bind(&req); e != nil || req.Quantity < 1 {
		return bad(c, errors.New("positive quantity is required"))
	}
	v, e := s.cartService.UpdateCartItem(
		c.Request().Context(),
		session(c),
		c.Param("itemId"),
		req.Quantity,
	)
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, v)
}
func (s *Server) deleteCart(c *echo.Context) error {
	if e := s.cartService.DeleteCartItem(c.Request().Context(), session(c), c.Param("itemId")); e != nil {
		return fail(c)
	}
	return c.NoContent(http.StatusNoContent)
}
func (s *Server) createOrder(c *echo.Context) error {
	var req struct {
		CustomerName    string           `json:"customerName"`
		CustomerEmail   string           `json:"customerEmail"`
		ShippingAddress checkout.Address `json:"shippingAddress"`
	}
	if e := c.Bind(&req); e != nil || req.CustomerName == "" || req.CustomerEmail == "" {
		return bad(c, errors.New("customerName and customerEmail are required"))
	}
	v, e := s.checkout.CreateOrder(
		c.Request().Context(),
		session(c),
		checkout.CreateOrderInput{
			CustomerName:    req.CustomerName,
			CustomerEmail:   req.CustomerEmail,
			ShippingAddress: req.ShippingAddress,
		},
	)
	if e != nil {
		return bad(c, e)
	}
	return c.JSON(http.StatusCreated, v)
}
func (s *Server) order(c *echo.Context) error {
	v, e := s.checkout.GetOrder(c.Request().Context(), c.Param("orderNumber"))
	if errors.Is(e, gorm.ErrRecordNotFound) || v == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "order not found"})
	}
	if e != nil {
		return fail(c)
	}
	return c.JSON(http.StatusOK, v)
}
