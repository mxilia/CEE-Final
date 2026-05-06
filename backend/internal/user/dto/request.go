package dto

type CreateUserByGoogleRequest struct {
	ProfileUrl string `json:"picture,omitempty"`
	Email      string `json:"email" validate:"required"`
}

type UserPatchRequest struct {
	Handler string `json:"handler,omitempty" validate:"min=3,max=16"`
	Bio     string `json:"bio,omitempty"`
	Role    string `json:"role,omitempty"`
}
