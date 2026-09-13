package contact

import "time"

type Contact struct {
	ID        string    `json:"id"`
	FullName  string    `json:"fullName"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Message   string    `json:"message,omitempty"`
	Status    string    `json:"status"`
	Source    string    `json:"source,omitempty"`
	Note      string    `json:"note,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}
