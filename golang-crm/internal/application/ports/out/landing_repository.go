package out

import (
	"context"

	"golang-crm/internal/domain/store/landing"
)

type LandingPageRepository interface {
	ListLandingPages(context.Context, int, int) ([]landing.LandingPage, int, error)
	GetLandingPage(context.Context, string) (*landing.LandingPage, error)
}
