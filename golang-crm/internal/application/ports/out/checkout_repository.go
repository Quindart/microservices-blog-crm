package out

import (
	"context"

	"golang-crm/internal/domain/store/checkout"
)

type CheckoutRepository interface {
	CreateOrder(context.Context, string, checkout.CreateOrderInput) (*checkout.Order, error)
	GetOrder(context.Context, string) (*checkout.Order, error)
}
