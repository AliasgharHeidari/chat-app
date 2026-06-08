package model

type RegisterRequest struct {
	UserID        string `json:"user-id" validate:"required, min=5, max=50"`
	FirstName     string `json:"first_name" validate:"required"`
	LastName      string `json:"last_name" validate:"required"`
	Password      string `json:"password" validate:"required,min=8"`
	Bio           string `json:"bio"`
	ProfilePicURL string `json:"profile_pic_url"`
}

type LoginRequest struct {
	UserID   string `json:"user_id" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type InitChatRequest struct {
	TargetUserID string `json:"target_user_id" validate:"required"`
}

type SendMessageRequest struct {
	ChatID      uint   `json:"chat_id" validate:"required"`
	MessageText string `json:"message_text" validate:"required,max=1000"`
}

type EditMessageRequest struct {
	MessageID uint   `json:"message_id" validate:"required"`
	NewText   string `json:"new_text" validate:"required,max=1000"`
}

type DeleteMessageRequest struct {
	MessageID         uint `json:"message_id" validate:"required"`
	DeleteForEveryone bool `json:"delete_for_everyone"`
}

type UpdateProfileRequest struct {
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	Bio           string `json:"bio"`
	ProfilePicURL string `json:"profile_pic_url"`
}
