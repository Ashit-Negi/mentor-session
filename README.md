# 1-on-1 Mentor–Student Platform

A real-time collaborative platform where a mentor and a student can interact through code, chat, and video.

---

# Features

## Authentication

- User Signup and Login
- Password hashing using bcrypt
- JWT-based authentication
- Role-based access (Mentor / Student)

## Session System

- Mentor can create a session
- Student can join via session link
- Unique session ID for each session
- Session end functionality (mentor-controlled)

## Real-time Code Editor

- Built using Monaco Editor
- Integrated with Yjs for real-time collaboration
- Multi-user cursor support
- Live code syncing

## Chat System

- Real-time messaging using Socket.io
- Room-based communication
- Enter key to send message
- Optimized message handling

## Video Calling (WebRTC)

- 1-on-1 peer-to-peer video call
- Signaling via Socket.io:
  - Offer
  - Answer
  - ICE candidates
- Features:
  - Camera on/off
  - Mic mute/unmute
  - Local and remote video streams

## Session Lifecycle Management

- End session for both users in real-time
- Cleanup:
  - Media tracks stopped
  - Peer connection closed
- Auto redirect after session ends

---

# Tech Stack

## Frontend

- React (Vite)
- Tailwind CSS
- Monaco Editor

## Backend

- Node.js
- Express.js
- Socket.io
- WebRTC

## Database

- MongoDB

---

# Development Timeline

## Day 1

- Project setup (Frontend and Backend)
- MongoDB connection

## Day 2

- User model
- Signup and Login APIs
- Password hashing (bcrypt)
- JWT authentication
- Auth middleware
- Role-based access

## Day 3–4

- Session model
- Mentor creates session
- Student joins session

## Day 5–6

- Socket.io integration
- Real-time chat system
- Room-based communication

## Day 7–8

- WebRTC video calling
- Peer connection setup
- Signaling implementation
- Media controls

## Day 9

- Session end logic
- Cleanup (video and sockets)
- Redirect handling

## Day 10

- Chat optimizations
- Removed duplicate messages
- Improved stability
