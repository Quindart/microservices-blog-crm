package in

import (
	"context"

	"golang-crm/internal/domain/store/contact"
)

type ContactService interface {
	CreateContact(context.Context, contact.Contact) (*contact.Contact, error)
	ListContacts(context.Context, int, int) ([]contact.Contact, int, error)
}
