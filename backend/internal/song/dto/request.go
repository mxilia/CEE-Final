package dto

type SongCreateRequest struct {
	UserID     uint   `json:"user_id"`
	YoutubeURL string `json:"youtube_url"`
	Title      string `json:"title"`
	Artist     string `json:"artist"`
}
