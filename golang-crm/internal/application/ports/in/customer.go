package in

import (
	"context"

	"golang-crm/internal/domain/customer"
)

type ListCustomers interface {
	Execute(ctx context.Context) ([]customer.Customer, error)
}
