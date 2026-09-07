package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type (
	DatabaseConfig struct{ Host, Port, User, Password, Name string }
	Config         struct {
		Port     string
		Database DatabaseConfig
	}
)

func Load() (Config, error) {
	_ = godotenv.Load(".env")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	keys := []string{"DB_HOST", "DB_PORT", "DB_USERNAME", "DB_PASSWORD", "DB_NAME"}
	for _, k := range keys {
		if os.Getenv(k) == "" {
			return Config{}, fmt.Errorf("missing required environment variable %s", k)
		}
	}
	return Config{port, DatabaseConfig{os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME")}}, nil
}
