package product

type Product struct {
	ID           int64   `json:"id"`
	Name         string  `json:"name"`
	Category     string  `json:"category"`
	UnitPrice    float64 `json:"unitPrice"`
	Cost         float64 `json:"cost"`
	Discontinued bool    `json:"discontinued"`
	Stock        int     `json:"stock"`
}
