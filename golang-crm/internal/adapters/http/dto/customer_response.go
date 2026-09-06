package dto

import "golang-crm/internal/domain/customer"

type CustomerResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	City  string `json:"city"`
}

func NewCustomerResponse(item customer.Customer) CustomerResponse {
	return CustomerResponse{ID: item.ID, Name: item.Name, Email: item.Email, City: item.City}
}

func NewCustomerResponses(items []customer.Customer) []CustomerResponse {
	responses := make([]CustomerResponse, len(items))
	for i, item := range items {
		responses[i] = NewCustomerResponse(item)
	}
	return responses
}
