package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/store/contact"
)

type ContactUseCase struct{ repository out.ContactRepository }

func NewContactUseCase(repository out.ContactRepository) ContactUseCase {
	return ContactUseCase{repository: repository}
}

func (u ContactUseCase) CreateContact(
	ctx context.Context,
	item contact.Contact,
) (*contact.Contact, error) {
	return u.repository.CreateContact(ctx, item)
}

func (u ContactUseCase) ListContacts(
	ctx context.Context,
	page, limit int,
) ([]contact.Contact, int, error) {
	return u.repository.ListContacts(ctx, page, limit)
}
