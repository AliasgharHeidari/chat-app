package customError

import "errors"

var (
	ShortUserIDErr         = errors.New("short user ID error")
	ShortPasswordErr       = errors.New("short password error")
	TooLongBioErr          = errors.New("too long bio error")
	UserIDAlreadyExistErr  = errors.New("user ID already exist error")
	InternalErr            = errors.New("internal server error")
	InvalidCredenntialsErr = errors.New("invalid credentials error")
)
