package models

import "time"

type Contact struct {
	ID, FullName, Email, Phone, Message, Status, Source, Note string
	CreatedAt, UpdatedAt                                      time.Time
}

func (Contact) TableName() string { return "contacts" }
