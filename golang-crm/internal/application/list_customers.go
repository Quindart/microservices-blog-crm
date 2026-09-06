package application

import "golang-crm/internal/domain/customer"

type ListCustomers struct{ repo customer.Repository }

func NewListCustomers(repo customer.Repository) ListCustomers { return ListCustomers{repo} }
func (u ListCustomers) Execute() ([]customer.Customer, error) { return u.repo.List() }
