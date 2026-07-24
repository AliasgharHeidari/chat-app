package service

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/config"
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	auth "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/auth"
	"github.com/golang-jwt/jwt"
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

type GooglePublicKeys struct {
	Keys []struct {
		Kid string `json:"kid"`
		N   string `json:"n"`
		E   string `json:"e"`
	} `json:"keys"`
}

func (s *GoogleAuthService) VerifyGoogleToken(idToken string) (*GoogleUserInfo, error) {
	resp, err := http.Get("https://www.googleapis.com/oauth2/v3/certs")
	if err != nil {
		return nil, errors.New("failed to fetch Google public keys")
	}
	defer resp.Body.Close()

	var keys GooglePublicKeys
	if err := json.NewDecoder(resp.Body).Decode(&keys); err != nil {
		return nil, errors.New("failed to parse Google public keys")
	}

	parts := strings.Split(idToken, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token format")
	}

	headerBytes, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, errors.New("invalid token header")
	}
	var header map[string]interface{}
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return nil, errors.New("invalid token header")
	}

	kid, ok := header["kid"].(string)
	if !ok {
		return nil, errors.New("kid not found in token header")
	}

	var n, e string
	for _, key := range keys.Keys {
		if key.Kid == kid {
			n = key.N
			e = key.E
			break
		}
	}
	if n == "" || e == "" {
		return nil, errors.New("public key not found")
	}

	claimsBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("invalid token claims")
	}
	var claims map[string]interface{}
	if err := json.Unmarshal(claimsBytes, &claims); err != nil {
		return nil, errors.New("invalid token claims")
	}

	iss, ok := claims["iss"].(string)
	if !ok || (iss != "https://accounts.google.com" && iss != "accounts.google.com") {
		return nil, errors.New("invalid issuer")
	}

	aud, ok := claims["aud"].(string)
	if !ok || aud != config.AppConfig.GoogleClientID {
		return nil, errors.New("invalid audience")
	}

	exp, ok := claims["exp"].(float64)
	if !ok || int64(exp) < time.Now().Unix() {
		return nil, errors.New("token expired")
	}

	userInfo := &GoogleUserInfo{
		ID:            claims["sub"].(string),
		Email:         claims["email"].(string),
		EmailVerified: claims["email_verified"].(bool),
		Name:          claims["name"].(string),
		GivenName:     claims["given_name"].(string),
		FamilyName:    claims["family_name"].(string),
		Picture:       claims["picture"].(string),
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