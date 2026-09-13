package cart

type CartItem struct {
	ID           string  `json:"id"`
	ProductID    string  `json:"productId"`
	VariantID    string  `json:"variantId"`
	Name         string  `json:"name"`
	VariantName  string  `json:"variantName,omitempty"`
	UnitPrice    float64 `json:"unitPrice"`
	Quantity     int     `json:"quantity"`
	TotalPrice   float64 `json:"totalPrice"`
	ThumbnailURL string  `json:"thumbnailUrl,omitempty"`
}

type Cart struct {
	Items   []CartItem `json:"items"`
	Summary Summary    `json:"summary"`
}

type Summary struct {
	Subtotal    float64 `json:"subtotal"`
	ShippingFee float64 `json:"shippingFee"`
	Total       float64 `json:"total"`
	Currency    string  `json:"currency"`
}
