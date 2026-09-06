package service

import (
	"context"
	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/customer"
)

type CustomerService struct{ repository out.CustomerRepository }

func NewCustomerService(repository out.CustomerRepository) *CustomerService {
	return &CustomerService{repository: repository}
}
func (s *CustomerService) List(ctx context.Context) ([]customer.Customer, error) {
	return s.repository.List(ctx)
}
func (s *CustomerService) GetByID(ctx context.Context, id string) (customer.Customer, error) {
	return s.repository.GetByID(ctx, id)
}
func (s *CustomerService) Create(ctx context.Context, c customer.Customer) (customer.Customer, error) {
	return s.repository.Create(ctx, c)
}
func (s *CustomerService) Update(ctx context.Context, c customer.Customer) (customer.Customer, error) {
	return s.repository.Update(ctx, c)
}
func (s *CustomerService) Delete(ctx context.Context, id string) error {
	return s.repository.Delete(ctx, id)
}
