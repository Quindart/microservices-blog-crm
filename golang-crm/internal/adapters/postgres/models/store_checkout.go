package models

import "time"

type CheckoutOrder struct {
	ID, OrderNumber, Status, Currency, CustomerName, CustomerEmail string
	UserID                                                         *string
	Subtotal, ShippingFee, Discount, Total                         float64
	ShippingAddress                                                []byte `gorm:"type:jsonb"`
	CreatedAt, UpdatedAt                                           time.Time
}

func (CheckoutOrder) TableName() string { return "store_orders" }

type CheckoutOrderItem struct {
	ID, OrderID, VariantID, ProductName, VariantName, SKU string
	UnitPrice, TotalPrice                                 float64
	Quantity                                              int
}

func (CheckoutOrderItem) TableName() string { return "store_order_items" }
