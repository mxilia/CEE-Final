package dto

import (
	"github.com/mxilia/CEE-Final/internal/entities"
)

func ToUserResponse(user *entities.User) *UserResponse {
	return &UserResponse{
		ID:      user.ID,
		Handler: user.Handler,
		// Email:       user.Email,
		ProfileUrl: user.ProfileUrl,
		CreatedAt:  user.CreatedAt,
	}
}

func ToUserResponseList(users []*entities.User) []*UserResponse {
	res := make([]*UserResponse, 0, len(users))
	for _, t := range users {
		res = append(res, ToUserResponse(t))
	}
	return res
}

func FromCreateUserByGoogleRequest(req *CreateUserByGoogleRequest) *entities.User {
	return &entities.User{
		Email:      req.Email,
		ProfileUrl: req.ProfileUrl,
	}
}

func FromUserPatchRequest(req *UserPatchRequest) *entities.User {
	return &entities.User{
		Handler: req.Handler,
	}
}
