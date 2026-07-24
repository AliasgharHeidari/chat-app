package model

type RegisterRequest struct {
	Username  string `json:"username" binding:"required"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	Bio       string `json:"bio"`
}

type VerifyEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
}

type ResendVerificationRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
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
	NewText string `json:"new_text" validate:"required,max=1000"`
}

type DeleteMessageRequest struct {
	DeleteForEveryone bool `json:"delete_for_everyone"`
}

// فقط Request رو تغییر بده ✅
type UpdateProfileRequest struct {
	Username      *string `json:"username,omitempty"`
	FirstName     *string `json:"first_name,omitempty"`
	LastName      *string `json:"last_name,omitempty"`
	Bio           *string `json:"bio,omitempty"` // ← pointer
	ProfilePicURL *string `json:"profile_pic_url,omitempty"`
}


type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
}