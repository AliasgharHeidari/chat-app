<div align="center">

# 💬 Chat App

**A modern, real-time chat application built with Go (Fiber) and React (TypeScript)**

Telegram-inspired UI · WebSocket-powered · Production-ready security

[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go&logoColor=white)](https://go.dev/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [WebSocket Events](#-websocket-events)
- [UI Features](#-ui-features)
- [Security](#-security)

---

## ✨ Features

<table>
<tr><td width="160"><b>🔐 Auth</b></td><td>

Register · Login · Google OAuth · Email Verification · JWT (HttpOnly Cookie) · Password Change · Rate Limiting

</td></tr>
<tr><td><b>💬 Chat</b></td><td>

Real-time WebSocket · Typing Indicator · Message Status (sent/delivered/seen) · Edit/Delete · Link Preview · Emoji Picker · Infinite Scroll

</td></tr>
<tr><td><b>👤 UX</b></td><td>

Dark/Light Mode · Custom Chat Backgrounds · User Profiles · Online/Offline Status · Search Users · Responsive Design

</td></tr>
<tr><td><b>🛡️ Security</b></td><td>

XSS Protection · CSRF (SameSite) · SQL Injection Protection (GORM) · bcrypt · Input Sanitization · Gmail-only Signup · Account Soft Delete

</td></tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Backend**

| | |
|---|---|
| Language | Go 1.22+ |
| Framework | Fiber 2.50+ |
| ORM | GORM |
| Database | PostgreSQL 16+ |
| Auth | JWT (golang-jwt) |
| Realtime | Gorilla WebSocket |
| Hashing | bcrypt |
| Link Preview | goquery |

</td>
<td valign="top" width="50%">

**Frontend**

| | |
|---|---|
| Library | React 18+ |
| Language | TypeScript 5+ |
| Build Tool | Vite 5+ |
| State | Zustand |
| Routing | React Router 6 |
| HTTP Client | Axios |
| Styling | CSS Modules + Tailwind |
| OAuth | Google OAuth |

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Backend

```bash
cd backend
cp .env-sample .env
go mod download
go run cmd/main.go
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Environment Variables

<details>
<summary><b>Backend (<code>.env</code>)</b></summary>

```env
HOST=127.0.0.1
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=chat_db

JWT_SECRET=your-secret-key

GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URL=http://localhost:3000/api/v1/auth/google/callback

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com

APP_URL=http://localhost:5173
```

</details>

<details>
<summary><b>Frontend (<code>.env</code>)</b></summary>

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-client-id
```

</details>

---

## 🔌 API Endpoints

**Auth**

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `POST` | `/auth/register` | Register user |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/google` | Google login |
| `POST` | `/auth/verify-email` | Verify email |
| `POST` | `/auth/resend-verification` | Resend code |

**Chat**

| Method | Endpoint | Description |
|:------:|----------|-------------|
| `GET` | `/ws/chat` | WebSocket connection |
| `GET` | `/chat/me` | Get profile |
| `PUT` | `/chat/me` | Update profile |
| `PUT` | `/chat/change-password` | Change password |
| `GET` | `/chat/users/search` | Search users |
| `POST` | `/chat/chats/init` | Start chat |
| `GET` | `/chat/chats` | Get chats |
| `GET` | `/chat/chats/:id/messages` | Get messages |
| `POST` | `/chat/messages` | Send message |
| `PUT` | `/chat/messages/:id` | Edit message |
| `DELETE` | `/chat/messages/:id` | Delete message |

---

## 🔌 WebSocket Events

| Client → Server | Server → Client |
|------------------|------------------|
| `new_message` | `new_message` |
| `typing` | `typing` |
| `message_status` | `message_status` |
| — | `user_status` |

---

## 🎨 UI Features

- 🌫️ Glassmorphism design
- 🌙 Dark Mode (default) / ☀️ Light Mode
- 🖼️ 4 Chat Backgrounds (Default, Blue Gradient, Purple Gradient, Dark)
- ⌨️ Typing indicator with glow animation
- 🟢 Online / Offline status dots

---

## 🔒 Security

| Threat | Mitigation |
|--------|------------|
| XSS | Input sanitization + React escaping + CSP |
| CSRF | `SameSite=Strict` cookies |
| SQL Injection | GORM parameterized queries |
| Brute Force | Rate limiting on auth endpoints |
| Password Storage | bcrypt hashing |
| Token Theft | HttpOnly cookies |
| Email Spam | Gmail.com addresses only |

---

<div align="center">

Made with ☕ and Go + React

</div>