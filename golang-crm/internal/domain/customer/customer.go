package customer

type Customer struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	City  string `json:"city"`
}
type Repository interface{ List() ([]Customer, error) }
