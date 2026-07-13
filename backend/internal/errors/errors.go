package customError

import "errors"

var (
	ShortUsernameErr          = errors.New("short username error")
	ShortPasswordErr          = errors.New("short password error")
	TooLongBioErr             = errors.New("too long bio error")
	UsernameAlreadyExistErr   = errors.New("user ID already exist error")
	InternalErr               = errors.New("internal server error")
	InvalidCredenntialsErr    = errors.New("invalid credentials error")
	InvalidUsernameErr        = errors.New("invalid username error")
	NotFoundErr               = errors.New("not found error")
	CanNotChatWithYourselfErr = errors.New("can not chat with yourself error")
	AccessDeniedErr           = errors.New("access denied error")
	MessageDeletedErr         = errors.New("message deleted error")
	MessageNotFoundErr        = errors.New("message not found error")
	MessageAlreadyDeletedErr  = errors.New("message already deleted error")
	
	EmailAlreadyExistErr      = errors.New("email already exist error")
	EmailRequiredErr          = errors.New("email required error")
	InvalidEmailErr           = errors.New("invalid email format")

	InvalidVerificationCodeErr = errors.New("invalid verification code")
	VerificationCodeExpiredErr = errors.New("verification code expired")
	EmailAlreadyVerifiedErr    = errors.New("email already verified")
	UserNotFoundErr            = errors.New("user not found")
	EmailSendErr               = errors.New("failed to send verification email")
)
