package out

import (
	"context"

	"golang-crm/internal/domain/customer"
)

type CustomerRepository interface {
	List(ctx context.Context) ([]customer.Customer, error)
	GetByID(ctx context.Context, id string) (*customer.Customer, error)
	Create(ctx context.Context, item customer.Customer) (*customer.Customer, error)
	Update(ctx context.Context, item customer.Customer) (*customer.Customer, error)
	Delete(ctx context.Context, id string) error
}
