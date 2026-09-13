package catalog

type Price struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}

type Category struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Media struct {
	URL       string `json:"url"`
	Alt       string `json:"alt,omitempty"`
	IsPrimary bool   `json:"isPrimary"`
}

type Variant struct {
	ID        string `json:"id"`
	SKU       string `json:"sku"`
	Name      string `json:"name,omitempty"`
	ColorName string `json:"-"`
	ColorCode string `json:"-"`
	Price     Price  `json:"price"`
	Stock     int    `json:"stock"`
	Available bool   `json:"available"`
}

type Rating struct {
	Average float64 `json:"average"`
	Count   int     `json:"count"`
}

type Product struct {
	ID               string    `json:"id"`
	Slug             string    `json:"slug"`
	Name             string    `json:"name"`
	Category         Category  `json:"category"`
	ShortDescription string    `json:"shortDescription,omitempty"`
	Description      string    `json:"description,omitempty"`
	Price            Price     `json:"price"`
	Rating           Rating    `json:"rating"`
	Badge            string    `json:"badge,omitempty"`
	Highlight        string    `json:"highlight,omitempty"`
	FreeShipping     bool      `json:"freeShipping"`
	Thumbnail        *Media    `json:"thumbnail,omitempty"`
	Media            []Media   `json:"media,omitempty"`
	Variants         []Variant `json:"variants,omitempty"`
	InStock          bool      `json:"inStock"`
}

type ProductFilter struct {
	Page, Limit            int
	Category, Search, Sort string
	MinPrice, MaxPrice     *float64
}
