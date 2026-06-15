package customError

import "errors"

var (
	ShortUsernameErr        = errors.New("short username error")
	ShortPasswordErr        = errors.New("short password error")
	TooLongBioErr           = errors.New("too long bio error")
	UsernameAlreadyExistErr = errors.New("user ID already exist error")
	InternalErr             = errors.New("internal server error")
	InvalidCredenntialsErr  = errors.New("invalid credentials error")
	InvalidUsernameErr      = errors.New("invalid username error")
	NotFoundErr             = errors.New("not found error")
)
