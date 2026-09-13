package models

import "time"

type Customer struct {
	ID    string `gorm:"type:uuid;primaryKey"`
	Name  string
	Email string `gorm:"uniqueIndex"`
	City  string
}

func (Customer) TableName() string { return "customers" }

type CRMProduct struct {
	ID           int64 `gorm:"primaryKey"`
	Name         string
	Category     string
	UnitPrice    float64
	Cost         float64
	Discontinued bool
	Stock        int
}

func (CRMProduct) TableName() string { return "products" }

type CRMOrder struct {
	ID            int64 `gorm:"primaryKey"`
	CustomerID    string
	OrderDate     time.Time
	Status        string
	ShippingFee   float64
	PaymentMethod string
}

func (CRMOrder) TableName() string { return "orders" }

type CRMOrderDetail struct {
	OrderID   int64 `gorm:"primaryKey"`
	ProductID int64 `gorm:"primaryKey"`
	Quantity  int
	UnitPrice float64
	Discount  float64
}

func (CRMOrderDetail) TableName() string { return "order_details" }
