# KaraOkay backend
This is the backend service for KaraOkay website.
## Tech Stack
 - Go
 - Fiber
## Prerequisites
 - Docker
 - Docker Compose
## Usage
Clone this repository:
```bash
git clone https://github.com/mxilia/CEE-Final.git
```
Then change root to backend folder:
```bash
cd backend
```
Then build Go backend service image:
```bash
docker build --platform linux/amd64 -t symoney/cee-backend:latest .
```
Fill in .env.dev like this:

```bash
ENV="dev"
DOMAIN=localhost

DB_HOST=postgres or localhost (if running without Docker)
DB_PORT=5432
DB_NAME=db_name
DB_USER=db_user
DB_PASSWORD=db_password

JWT_SECRET=your_jwt_secret_key

FRONTEND_URL=http://localhost:3000
FRONTEND_OAUTH_REDIRECT_URL=http://localhost:3000/home

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URL=
```
(Make sure to fill in your values and not blindly paste this)

Then docker compose to get the service running:
```bash
docker compose up -d
```

To add new songs:

1. Use karaoke-generator, follow the [documentation](../karaoke-generator/README.md) step by step.
2. After that, make new folder named after the id of your song inside [./backend/asset/songs](./backend/asset/songs).
3. Copy pitch.json, lyrics.json, instrumental.mp3 (Make sure to change .flac to .mp3) into the newly made folder.
4. Go to [./backend/internal/app/app.go](./backend/internal/app/app.go), fill the new song struct into this part of the code:
```go
func setUpSongs(db *gorm.DB) error {
	songs := []entities.Song{
		{ID: NEW_ID (uint), Title: "NEW_TITLE", Artist: "NEW_ARTIST"},
	}
	return db.
		Clauses(clause.OnConflict{DoNothing: true}).
		Create(&songs).Error
}
```

After that run these commands:

```bash
docker compose down
docker compose up -d
```