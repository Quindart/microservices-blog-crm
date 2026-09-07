package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/customer"
)

type CustomerUseCase struct{ repository out.CustomerRepository }

func NewCustomerUseCase(repository out.CustomerRepository) CustomerUseCase {
	return CustomerUseCase{repository: repository}
}

func (u CustomerUseCase) List(ctx context.Context) ([]customer.Customer, error) {
	return u.repository.List(ctx)
}

func (u CustomerUseCase) ListByParams(ctx context.Context, limit, offset int) ([]customer.Customer, error) {
	return u.repository.ListByParams(ctx, limit, offset)
}

func (u CustomerUseCase) GetByID(ctx context.Context, id string) (*customer.Customer, error) {
	return u.repository.GetByID(ctx, id)
}

func (u CustomerUseCase) Create(ctx context.Context, item customer.Customer) (*customer.Customer, error) {
	return u.repository.Create(ctx, item)
}

func (u CustomerUseCase) Update(ctx context.Context, item customer.Customer) (*customer.Customer, error) {
	return u.repository.Update(ctx, item)
}

func (u CustomerUseCase) Delete(ctx context.Context, id string) error {
	return u.repository.Delete(ctx, id)
}
