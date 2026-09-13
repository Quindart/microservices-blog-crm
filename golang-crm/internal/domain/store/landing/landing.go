package landing

type Price struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}

type LandingPage struct {
	ID           string   `json:"id"`
	Slug         string   `json:"slug"`
	Title        string   `json:"title"`
	Category     string   `json:"category"`
	Description  string   `json:"description,omitempty"`
	Price        Price    `json:"price"`
	ThumbnailURL string   `json:"thumbnailUrl,omitempty"`
	Features     []string `json:"features"`
}
