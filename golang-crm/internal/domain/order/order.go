package order

type Item struct {
	ProductID int64   `json:"productId"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unitPrice"`
	Discount  float64 `json:"discount"`
}

type Order struct {
	ID            int64   `json:"id"`
	CustomerID    string  `json:"customerId"`
	OrderDate     string  `json:"orderDate"`
	Status        string  `json:"status"`
	ShippingFee   float64 `json:"shippingFee"`
	PaymentMethod string  `json:"paymentMethod"`
	Items         []Item  `json:"items"`
}
