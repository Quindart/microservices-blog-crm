package models

import "time"

type CatalogCategory struct {
	ID, Slug, Name string
	Description    string
	IsActive       bool
}

func (CatalogCategory) TableName() string { return "categories" }

type CatalogProduct struct {
	ID, Slug, Name, ShortDescription, Description, CategoryID, Status, Badge, Highlight string
	FreeShipping                                                                        bool
	RatingAverage                                                                       float64
	ReviewCount                                                                         int
	CreatedAt, UpdatedAt                                                                time.Time
}

func (CatalogProduct) TableName() string { return "products" }

type CatalogVariant struct {
	ID, ProductID, SKU, Name, Currency, ColorName, ColorCode string
	Price, ComparePrice                                      float64
	Stock                                                    int
	IsDefault, IsActive                                      bool
}

func (CatalogVariant) TableName() string { return "product_variants" }

type CatalogMedia struct {
	ID, ProductID, VariantID, Type, URL, AltText string
	SortOrder                                    int
	IsPrimary                                    bool
}

func (CatalogMedia) TableName() string { return "product_media" }
