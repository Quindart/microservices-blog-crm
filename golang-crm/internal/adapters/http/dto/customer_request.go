package dto

type CreateCustomerRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	City  string `json:"city"`
}

type UpdateCustomerRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	City  string `json:"city"`
}
