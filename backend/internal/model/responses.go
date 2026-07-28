package model

type SearchUsersResponse struct {
	ID            uint   `json:"id"`
	Username      string `json:"username"`
	FirstName     string `json:"first_name"`
	LastName      string `json:"last_name"`
	Bio           string `json:"bio"`
	ProfilePicURL string `json:"profile_pic_url" gorm:"column:profile_pic_url"`
	IsOnline      bool   `json:"is_online"`
}
