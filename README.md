# 1-on-1 Mentor–Student Platform

# MVP Scope

The application allows:

- User authentication (Signup / Login)
- Mentor can create a session
- Student can join session via a link
- Real-time collaborative code editor (planned with Yjs)
- Chat between mentor and student
- Basic video calling using WebRTC

# Tech Stack

## Frontend

- React (Vite)
- Tailwind CSS

## Backend

- Node.js
- Express.js
- Socket.io
- WebRTC (for video calling)

## Database

- MongoDB

## Day 1

- Setup frontend and backend
- Connected MongoDB database

## Day 2

- Created user model
- Implemented signup/login
- Password hashing using bcrypt
- JWT-based authentication
- Built authentication APIs
- Created auth middleware (protected routes + req.user)
- Role-based access control (mentor / student)
- Tested APIs using Postman

# Session System

- Created session model
- Mentor can create sessions
- Student can join via session ID
- Session end functionality

## Day 3–4

# Real-time Communication

- Integrated Socket.io
- Built real-time chat system
- Implemented session-based room logic
- Ensured stable communication

## Day 5–6

### Frontend Development

- Built UI using React (Vite)
- Component-based architecture
- Designed session layout (Editor + Video + Chat)
- Integrated chat with Socket.io
- Expandable chat UI
- Message alignment (left/right)
- Click outside to close chat
- Styled using Tailwind CSS

## Day 7–8

### Video Calling (WebRTC)

- Implemented 1-on-1 video calling using WebRTC
- Built peer-to-peer connection using RTCPeerConnection
- Implemented signaling using Socket.io:
  - Offer
  - Answer
  - ICE candidates
- Added:
  - Start / Stop video
  - Mute / Unmute microphone
  - Camera on/off toggle
- Displayed:
  - Local video (self view)
  - Remote video (other user)
- Handled:
  - Media stream management
  - Peer connection lifecycle

## Day 9

# Session Lifecycle & Cleanup

- Implemented "End Session" functionality
- Real-time session termination using sockets
- Ensured:
  - Video call stops for both users
  - Media tracks are cleaned up properly
  - Peer connection is closed
- Redirected users to dashboard after session end
- Prevented camera/mic leaks after navigation

## Day 10

### Chat System Improvements

- Fixed duplicate message issue
- Implemented single source of truth via server
- Added:
  - Enter key to send message
  - Optimized socket listeners (no memory leaks)
  - Clean message handling
- Improved UX:
  - Smooth chat interaction
  - Stable real-time updates
