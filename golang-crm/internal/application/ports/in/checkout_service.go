package in

import (
	"context"

	"golang-crm/internal/domain/store/checkout"
)

type CheckoutService interface {
	CreateOrder(context.Context, string, checkout.CreateOrderInput) (*checkout.Order, error)
	GetOrder(context.Context, string) (*checkout.Order, error)
}
