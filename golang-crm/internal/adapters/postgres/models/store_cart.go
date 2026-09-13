package models

import "time"

type Cart struct {
	ID, SessionID        string
	UserID               *string
	CreatedAt, UpdatedAt time.Time
}

func (Cart) TableName() string { return "carts" }

type CartItem struct {
	ID, CartID, VariantID string
	Quantity              int
}

func (CartItem) TableName() string { return "cart_items" }
