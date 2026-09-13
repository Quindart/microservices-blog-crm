package usecase

import (
	"context"

	"golang-crm/internal/application/ports/out"
	"golang-crm/internal/domain/store/landing"
)

type LandingUseCase struct{ repository out.LandingPageRepository }

func NewLandingUseCase(repository out.LandingPageRepository) LandingUseCase {
	return LandingUseCase{repository: repository}
}

func (u LandingUseCase) ListLandingPages(
	ctx context.Context,
	page, limit int,
) ([]landing.LandingPage, int, error) {
	return u.repository.ListLandingPages(ctx, page, limit)
}

func (u LandingUseCase) GetLandingPage(
	ctx context.Context,
	slug string,
) (*landing.LandingPage, error) {
	return u.repository.GetLandingPage(ctx, slug)
}
