# YouTube Watch Party System - Intern Assignment

### Live Demo
Frontend: https://watch-party-theta-five.vercel.app
Test Room: https://watch-party-theta-five.vercel.app/room/PWTHWW
Backend (Socket.IO): https://watch-party-backend-9k8x.onrender.com

### Core Requirements Done
- Real-time sync: play/pause, seek, change_video (Socket.IO)
- Room model: unique code/link - join via code
- YouTube IFrame API integration
- Role-based: Host (auto creator), Moderator (Host assigns), Participant (default watch-only)
- Host Capabilities: assign_role, remove_participant, transfer_host
- Role Enforcement: Backend validates - Participant cannot control

### WebSocket Events (As per PDF page 4)
join_room, leave_room, sync_state, play, pause, seek, change_video, assign_role, remove_participant, user_joined, user_left, role_assigned, participant_removed

### Architecture Overview
Client (React + YT Player) -> emits video_action -> Server (Node+Express+Socket.IO with Room/Participant Class OOP) validates role -> io.to(roomCode).emit to all. sync_state sent to new joiner.

### Tech Stack
Frontend: React + Vite, Backend: Node.js + Express, Real-time: Socket.IO, Video: YouTube IFrame API, Deploy: Vercel + Render

### How to Run Locally
cd backend -> npm install -> npm start (port 3000)
cd frontend -> npm install -> VITE_BACKEND_URL set -> npm run dev
