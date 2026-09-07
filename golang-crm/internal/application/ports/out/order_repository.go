package out

import (
	"context"

	"golang-crm/internal/domain/order"
)

type OrderRepository interface {
	GetByParams(context.Context, int, int) ([]order.Order, error)
	GetByID(context.Context, string) (*order.Order, error)
	GetByCustomerID(context.Context, string) ([]order.Order, error)
}
