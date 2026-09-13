package checkout

import "time"

type Address struct {
	Line1      string `json:"line1"`
	City       string `json:"city"`
	State      string `json:"state"`
	PostalCode string `json:"postalCode"`
	Country    string `json:"country"`
}

type CreateOrderInput struct {
	CustomerName    string
	CustomerEmail   string
	ShippingAddress Address
}

type Order struct {
	ID              string      `json:"id"`
	OrderNumber     string      `json:"orderNumber"`
	Status          string      `json:"status"`
	Subtotal        float64     `json:"subtotal"`
	ShippingFee     float64     `json:"shippingFee"`
	Discount        float64     `json:"discount"`
	Total           float64     `json:"total"`
	Currency        string      `json:"currency"`
	CustomerName    string      `json:"customerName"`
	CustomerEmail   string      `json:"customerEmail"`
	ShippingAddress Address     `json:"shippingAddress"`
	Items           []OrderItem `json:"items"`
	CreatedAt       time.Time   `json:"createdAt"`
}

type OrderItem struct {
	ID          string  `json:"id"`
	ProductName string  `json:"productName"`
	VariantName string  `json:"variantName,omitempty"`
	SKU         string  `json:"sku,omitempty"`
	UnitPrice   float64 `json:"unitPrice"`
	Quantity    int     `json:"quantity"`
	TotalPrice  float64 `json:"totalPrice"`
}
