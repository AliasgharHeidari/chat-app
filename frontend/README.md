# Chat App Frontend

A modern real-time chat application built with React, TypeScript, and Vite.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Real-time Messaging**: Send and receive messages instantly via WebSocket
- **User Profiles**: View and manage user profiles
- **User Search**: Find and start chats with other users
- **Message Management**: Edit and delete messages
- **Typing Indicators**: See when other users are typing
- **Online Status**: Track user online/offline status
- **Message Status**: See if messages are sent, delivered, or seen

## Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running on `http://localhost:3000`

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file:

```bash
cp .env.example .env.local
```

3. Update `VITE_API_URL` if your backend is running on a different URL

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building

Build for production:

```bash
npm run build
```

The output will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login and Register components
│   ├── chat/          # Chat-related components
│   ├── common/        # Reusable components
│   └── layout/        # Layout components
├── hooks/             # Custom React hooks
├── store/             # Zustand stores for state management
├── api/               # API integration and WebSocket
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## API Integration

The frontend integrates with the backend API for:

- Authentication (login/register)
- Chat management
- Message operations
- User search
- WebSocket for real-time updates

API base URL can be configured via `VITE_API_URL` environment variable.

## Technologies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Zustand**: State management
- **Axios**: HTTP client
- **CSS Modules**: Component styling

## Features Breakdown

### Authentication

- User registration with validation
- Login with JWT tokens
- Automatic token persistence
- Profile management

### Messaging

- Send text messages
- Edit own messages
- Delete messages (for self or everyone)
- Message status tracking (sending, sent, delivered, seen)
- Message timestamps

### Real-time Features

- WebSocket connection for live updates
- Typing indicators
- Online/offline status
- Message delivery notifications

### User Interface

- Responsive design
- Dark/light theme ready
- Smooth animations
- Loading states
- Error handling

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: `http://localhost:3000`)

## License

MIT
