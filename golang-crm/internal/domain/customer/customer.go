package customer

type Customer struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
type Repository interface{ List() ([]Customer, error) }
