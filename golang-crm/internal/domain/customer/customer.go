package customer

import "github.com/google/uuid"

type Customer struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	City  string `json:"city"`
}

func New(name, email, city string) Customer {
	return Customer{ID: uuid.NewString(), Name: name, Email: email, City: city}
}

type Repository interface{ List() ([]Customer, error) }
