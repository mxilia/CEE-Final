package dto

import (
	"github.com/mxilia/CEE-Final/internal/entities"
)

func FromSongCreateRequest(req *SongCreateRequest) *entities.Song {
	return &entities.Song{
		Title:  req.Title,
		Artist: req.Artist,
	}
}
