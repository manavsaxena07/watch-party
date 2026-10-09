# 🎬 YouTube Watch Party

A real-time YouTube Watch Party application where users can create or join rooms and watch YouTube videos together in sync.

## Features

- Create and join watch party rooms
- Real-time video synchronization
- Host, Moderator and Participant roles
- Role management
- Remove users
- Transfer host privileges

- ## Architecture Overview

The application follows a client-server architecture.

- The React frontend connects to the Node.js backend using Socket.IO.
- When a user creates or joins a room, a WebSocket connection is established.
- The backend manages room information, users, roles, and the current video state.
- When the Host or Moderator performs an action such as play, pause, seek, or changing the video, the frontend emits a Socket.IO event.
- The backend validates the user's role, updates the room state, and broadcasts the event to all users in the room.
- Every connected client receives the event and updates its YouTube player, ensuring synchronized playback across all participants.
- MongoDB stores persistent application data, while Socket.IO handles real-time communication.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Socket.IO Client
- YouTube IFrame API

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB

## Installation

### Clone repository

```bash
git clone <repository-url>
cd WatchParty
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:8000
```

## Live Demo

Frontend:
https://watchpartyfrontend.vercel.app


Backend:
https://watch-party-backend-kdua.onrender.com
