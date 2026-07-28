package customError

import "errors"

var (
	// ============================================
	// Auth Errors
	// ============================================
	ShortUsernameErr        = errors.New("username must be at least 5 characters")
	ShortPasswordErr        = errors.New("password must be at least 8 characters")
	InvalidCredenntialsErr  = errors.New("invalid credentials")
	UsernameAlreadyExistErr = errors.New("username already exists")
	InternalErr             = errors.New("internal server error, please try again later")
	TooLongBioErr           = errors.New("bio cannot exceed 1000 characters")
	InvalidUsernameErr      = errors.New("username must be between 5 and 50 characters")
	NotFoundErr             = errors.New("resource not found")

	// ============================================
	// Chat Errors
	// ============================================
	CanNotChatWithYourselfErr = errors.New("you cannot chat with yourself")
	AccessDeniedErr           = errors.New("access denied")
	MessageDeletedErr         = errors.New("message has been deleted")
	MessageNotFoundErr        = errors.New("message not found")
	MessageAlreadyDeletedErr  = errors.New("message is already deleted")

	// ============================================
	// Email Errors
	// ============================================
	EmailRequiredErr     = errors.New("email is required")
	InvalidEmailErr      = errors.New("invalid email format")
	EmailAlreadyExistErr = errors.New("email already exists")
	InvalidEmailDomain   = errors.New("only Gmail addresses are allowed")

	// ============================================
	// Email Verification Errors
	// ============================================
	InvalidVerificationCodeErr = errors.New("invalid verification code")
	VerificationCodeExpiredErr = errors.New("verification code has expired")
	EmailAlreadyVerifiedErr    = errors.New("email is already verified")
	UserNotFoundErr            = errors.New("user not found")
	EmailSendErr               = errors.New("failed to send verification email")

	// ============================================
	// Profile Errors
	// ============================================
	InvalidFirstNameErr = errors.New("first name cannot exceed 50 characters")
	InvalidLastNameErr  = errors.New("last name cannot exceed 50 characters")
)