package usecase

import (
	"context"
	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/customer"
)

type CustomerCRUD struct{ repository out.CustomerRepository }

func NewCustomerCRUD(repository out.CustomerRepository) CustomerCRUD {
	return CustomerCRUD{repository: repository}
}
func (u CustomerCRUD) List(ctx context.Context) ([]customer.Customer, error) {
	return u.repository.List(ctx)
}
func (u CustomerCRUD) GetByID(ctx context.Context, id string) (*customer.Customer, error) {
	return u.repository.GetByID(ctx, id)
}
func (u CustomerCRUD) Create(ctx context.Context, item customer.Customer) (*customer.Customer, error) {
	return u.repository.Create(ctx, item)
}
func (u CustomerCRUD) Update(ctx context.Context, item customer.Customer) (*customer.Customer, error) {
	return u.repository.Update(ctx, item)
}
func (u CustomerCRUD) Delete(ctx context.Context, id string) error {
	return u.repository.Delete(ctx, id)
}
