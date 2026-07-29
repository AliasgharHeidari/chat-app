package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/config"
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	auth "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/auth"
	"github.com/golang-jwt/jwt"
	"google.golang.org/api/idtoken"
)

type GoogleAuthService struct{}

type GoogleUserInfo struct {
	ID            string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

// VerifyGoogleToken
// ✅ قبلاً این تابع دستی JWT رو parse می‌کرد و kid رو پیدا می‌کرد ولی
// هیچ‌وقت امضای واقعی رو با کلید عمومی گوگل verify نمی‌کرد - یعنی از نظر
// امنیتی هر توکن جعلی با aud/iss درست قبول می‌شد. پکیج رسمی
// google.golang.org/api/idtoken این کار رو کامل و درست انجام می‌ده:
// امضا (signature)، issuer، audience و expiry رو واقعاً چک می‌کنه.
func (s *GoogleAuthService) VerifyGoogleToken(idTokenStr string) (*GoogleUserInfo, error) {
	clientID := config.AppConfig.GoogleClientID

	payload, err := idtoken.Validate(context.Background(), idTokenStr, clientID)
	if err != nil {
		// 🔍 لاگ موقت برای دیباگ - دقیقاً می‌گه کدوم چک شکست خورده
		// (audience mismatch، signature نامعتبر، expired و ...).
		// بعد از پیدا کردن علت اصلی می‌تونید این لاگ رو بردارید یا
		// به یه سیستم لاگ‌گیری مناسب‌تر منتقلش کنید.
		log.Printf("[GoogleAuth] token validation failed: %v", err)
		return nil, fmt.Errorf("google token validation failed: %w", err)
	}

	email, _ := payload.Claims["email"].(string)
	if email == "" {
		return nil, errors.New("email claim missing from google token")
	}
	emailVerified, _ := payload.Claims["email_verified"].(bool)
	name, _ := payload.Claims["name"].(string)
	givenName, _ := payload.Claims["given_name"].(string)
	familyName, _ := payload.Claims["family_name"].(string)
	picture, _ := payload.Claims["picture"].(string)

	userInfo := &GoogleUserInfo{
		ID:            payload.Subject,
		Email:         email,
		EmailVerified: emailVerified,
		Name:          name,
		GivenName:     givenName,
		FamilyName:    familyName,
		Picture:       picture,
	}

	return userInfo, nil
}

func (s *GoogleAuthService) HandleGoogleLogin(idToken string) (*model.User, string, error) {
	googleUser, err := s.VerifyGoogleToken(idToken)
	if err != nil {
		return nil, "", customError.InvalidCredenntialsErr
	}

	existingUser, err := auth.GetUserByGoogleID(googleUser.ID)
	if err != nil {
		return nil, "", customError.InternalErr
	}
	if existingUser != nil {
		token, err := generateJWT(existingUser)
		if err != nil {
			return nil, "", customError.InternalErr
		}
		return existingUser, token, nil
	}

	userByEmail, err := auth.GetUserByEmail(googleUser.Email)
	if err != nil {
		return nil, "", customError.InternalErr
	}
	if userByEmail != nil {
		// 🔥 فقط Google ID رو اضافه کن (عکس رو تغییر نده!)
		err := auth.UpdateUserGoogleID(userByEmail.ID, googleUser.ID)
		if err != nil {
			return nil, "", customError.InternalErr
		}
		token, err := generateJWT(userByEmail)
		if err != nil {
			return nil, "", customError.InternalErr
		}
		return userByEmail, token, nil
	}

	username := strings.Split(googleUser.Email, "@")[0]
	baseUsername := username
	counter := 1
	for {
		existing, _ := auth.GetUserByUsernameForRegister(username)
		if existing == nil {
			break
		}
		username = fmt.Sprintf("%s%d", baseUsername, counter)
		counter++
	}

	newUser := &model.User{
		Username:      username,
		FirstName:     googleUser.GivenName,
		LastName:      googleUser.FamilyName,
		Email:         googleUser.Email,
		GoogleID:      &googleUser.ID,
		ProfilePicURL: "", // 🔥 خالی، کاربر خودش لینک رو اضافه میکنه
		Bio:           "",
		PasswordHash:  "",
		IsOnline:      false,
	}

	if err := auth.CreateUserWithGoogle(newUser); err != nil {
		return nil, "", customError.InternalErr
	}

	token, err := generateJWT(newUser)
	if err != nil {
		return nil, "", customError.InternalErr
	}

	return newUser, token, nil
}

func generateJWT(user *model.User) (string, error) {
	cfg := config.AppConfig

	claims := jwt.MapClaims{
		"id":  float64(user.ID),
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	t, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		return "", err
	}

	return t, nil
}

func GetUserByUsernameForRegister(username string) (*model.User, error) {
	return auth.GetUserByUsernameForRegister(username)
}