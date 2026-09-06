package postgres

import (
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

type Database = gorm.DB

func NewDatabase(c Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", c.Host, c.Port, c.User, c.Password, c.Name)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	sql, err := db.DB()
	if err != nil {
		return nil, err
	}
	sql.SetMaxOpenConns(10)
	sql.SetConnMaxLifetime(time.Hour)
	if err = sql.Ping(); err != nil {
		return nil, fmt.Errorf("postgres connection failed: %w", err)
	}
	return db, nil
}

func CloseDatabase(db *gorm.DB) {
	if db == nil {
		return
	}
	if sql, err := db.DB(); err == nil {
		_ = sql.Close()
	}
}
