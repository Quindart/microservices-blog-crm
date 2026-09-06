package persistence

import (
	"fmt"
	"golang-crm/internal/config"
	"golang-crm/internal/domain/customer"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"time"
)

func NewDatabase(c config.DatabaseConfig) (*gorm.DB, error) {
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
	if db != nil {
		if sql, err := db.DB(); err == nil {
			_ = sql.Close()
		}
	}
}

type customerModel struct {
	ID    uint `gorm:"primaryKey"`
	Name  string
	Email string `gorm:"uniqueIndex"`
}

func (customerModel) TableName() string { return "customers" }

type CustomerRepository struct{ db *gorm.DB }

func NewCustomerRepository(db *gorm.DB) CustomerRepository { return CustomerRepository{db} }
func (r CustomerRepository) List() ([]customer.Customer, error) {
	var rows []customerModel
	if err := r.db.Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]customer.Customer, len(rows))
	for i, v := range rows {
		out[i] = customer.Customer{v.ID, v.Name, v.Email}
	}
	return out, nil
}
