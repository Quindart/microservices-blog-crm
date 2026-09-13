package models

import "time"

type BlogCategory struct {
	ID, Slug, Name, Description string
	IsActive                    bool
}

func (BlogCategory) TableName() string { return "blog_categories" }

type BlogAuthor struct {
	ID, Name, Slug, Bio, AvatarURL string
	IsActive                       bool
}

func (BlogAuthor) TableName() string { return "blog_authors" }

type BlogTag struct{ ID, Slug, Name string }

func (BlogTag) TableName() string { return "blog_tags" }

type BlogPost struct {
	ID, Slug, Title, Excerpt, Content, ContentFormat string
	CategoryID, AuthorID, Status, CoverImageURL      string
	ReadTime                                         int
	PublishedAt                                      time.Time
	CreatedAt                                        time.Time
	UpdatedAt                                        time.Time
}

func (BlogPost) TableName() string { return "blog_posts" }

type BlogPostTag struct{ PostID, TagID string }

func (BlogPostTag) TableName() string { return "blog_post_tags" }
