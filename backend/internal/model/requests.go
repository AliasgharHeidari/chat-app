package model

type RegisterRequest struct {
	Username      string `json:"username" validate:"required, min=5, max=50"`
	FirstName     string `json:"first_name" validate:"required"`
	LastName      string `json:"last_name" validate:"required"`
	Password      string `json:"password" validate:"required,min=8"`
	Bio           string `json:"bio"`
	ProfilePicURL string `json:"profile_pic_url"`
}

type LoginRequest struct {
	Username   string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type InitChatRequest struct {
	TargetUsername string `json:"target_username" validate:"required"`
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

// فقط Request رو تغییر بده ✅
type UpdateProfileRequest struct {
    Username      *string `json:"username,omitempty"`
    FirstName     *string `json:"first_name,omitempty"`
    LastName      *string `json:"last_name,omitempty"`
    Bio           *string `json:"bio,omitempty"`        // ← pointer
    ProfilePicURL *string `json:"profile_pic_url,omitempty"`
}