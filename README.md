# MVP scope

the app allows:

- user authentication(signup/login)
- mentor can create a session
- student can join session via a link
- read-time code editor
- chat between mentor and student
- basic video calling(webrtc)

# day1

- setup frontend and backend with connecting mongodb database.

# day2

- created user model
- implemented authentication
- password hashing using bcrypt
- jwt-based authentication for secure login
- build auth apis.
- create authentication middleware(protect routes and req.user)
- implemented role-based access control(student / mentor)
- tested apis using the postman

  part 2

- created session system
- mentor can create sessions
- strudent can join session via id
- session can be ended

# day 3-4

- implemented socket.io for real-time communication
- built real-time chat system
- added session-based room logic
- ensure stable communication

# day 5-6

- built frontend layout using react-vite.
- created component-based architecture (chat , layout , etc.)
- designed session layout(editor , video , chat)
- integrated real-time chat with socket.io in frontend
- implemented expandable chat UI
- added message UI with left/right alignment
- improved chat UI by click outside to close the chat
- and used TailwindCSS for designed and making responsive UI
