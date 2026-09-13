package blog

import "time"

type Category struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Author struct {
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	AvatarURL string `json:"avatarUrl,omitempty"`
}

type Blog struct {
	Slug          string     `json:"slug"`
	Title         string     `json:"title"`
	Excerpt       string     `json:"excerpt,omitempty"`
	Content       string     `json:"content"`
	ContentFormat string     `json:"contentFormat"`
	Category      Category   `json:"category"`
	Author        Author     `json:"author"`
	PublishedAt   *time.Time `json:"publishedAt,omitempty"`
	ReadTime      int        `json:"readTime,omitempty"`
	CoverImageURL string     `json:"coverImageUrl,omitempty"`
	Tags          []string   `json:"tags"`
}

type BlogFilter struct {
	Page, Limit                         int
	Category, Tag, Author, Search, Sort string
}
