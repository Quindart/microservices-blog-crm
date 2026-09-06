package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/customer"
)

type ListCustomers struct {
	repository out.CustomerRepository
}

func NewListCustomers(repository out.CustomerRepository) ListCustomers {
	return ListCustomers{repository: repository}
}

func (u ListCustomers) Execute(ctx context.Context) ([]customer.Customer, error) {
	return u.repository.List(ctx)
}
