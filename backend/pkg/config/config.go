package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Domain string
	Env    string

	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DatabaseDSN string

	JWTSecret string

	FRONTEND_URL                string
	FRONTEND_OAUTH_REDIRECT_URL string

	GOOGLE_CLIENT_ID          string
	GOOGLE_CLIENT_SECRET      string
	GOOGLE_OAUTH_REDIRECT_URL string

	SUPABASE_URL string
	SUPABASE_KEY string
	BucketName   string

	RedisAddr     string
	RedisPassword string
}

func GetConfig(env string) *Config {
	envFile := ".env"
	if env != "" {
		envFile = ".env." + env
	}
	if err := godotenv.Load(envFile); err != nil {
		log.Printf("Warning: could not load .env file: %v", err)
	}

	cfg := &Config{
		Env:    getEnv("ENV", "dev"),
		Domain: getEnv("DOMAIN", ""),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBName:     getEnv("DB_NAME", "test"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", ""),

		JWTSecret: getEnv("JWT_SECRET", "doodoo123doodoo12123doo3doodoo123"),

		FRONTEND_URL:                getEnv("FRONTEND_URL", "http://localhost:3000"),
		FRONTEND_OAUTH_REDIRECT_URL: getEnv("FRONTEND_OAUTH_REDIRECT_URL", "http://localhost:3000"),

		GOOGLE_CLIENT_ID:          getEnv("GOOGLE_CLIENT_ID", ""),
		GOOGLE_CLIENT_SECRET:      getEnv("GOOGLE_CLIENT_SECRET", ""),
		GOOGLE_OAUTH_REDIRECT_URL: getEnv("GOOGLE_OAUTH_REDIRECT_URL", ""),

		SUPABASE_URL: getEnv("SUPABASE_URL", ""),
		SUPABASE_KEY: getEnv("SUPABASE_KEY", ""),
		BucketName:   getEnv("BUCKET_NAME", ""),

		RedisAddr:     getEnv("REDIS_ADDR", ""),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
	}

	cfg.DatabaseDSN = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	return cfg
}

func getEnv(key string, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
