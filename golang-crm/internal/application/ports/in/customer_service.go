package in

import (
	"context"
	"golang-crm/internal/domain/customer"
)

type CustomerService interface {
	List(context.Context) ([]customer.Customer, error)
	GetByID(context.Context, string) (customer.Customer, error)
	Create(context.Context, customer.Customer) (customer.Customer, error)
	Update(context.Context, customer.Customer) (customer.Customer, error)
	Delete(context.Context, string) error
}
