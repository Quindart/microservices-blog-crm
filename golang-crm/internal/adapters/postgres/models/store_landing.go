package models

import "time"

type LandingCategory struct {
	ID, Slug, Name string
	IsActive       bool
}

func (LandingCategory) TableName() string { return "landing_page_categories" }

type LandingPage struct {
	ID, Slug, Title, CategoryID, Description                   string
	Status, Currency, MetaTitle, MetaDescription, ThumbnailURL string
	Price                                                      float64
	PublishedAt                                                time.Time
	CreatedAt                                                  time.Time
	UpdatedAt                                                  time.Time
}

func (LandingPage) TableName() string { return "landing_pages" }

type LandingFeature struct {
	ID, LandingPageID, Content string
	SortOrder                  int
}

func (LandingFeature) TableName() string { return "landing_page_features" }
