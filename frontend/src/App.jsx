import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const sessionId = "abc123"; //

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // wait for connection
    socket.on("connect", () => {
      console.log("connected:", socket.id);

      // join room after connect
      socket.emit("joinSession", sessionId);
    });

    // receive message
    socket.on("receiveMessage", (msg) => {
      console.log("received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("sendMessage", {
      sessionId,
      message,
    });

    // // ✅ apna message bhi show karo
    // setMessages((prev) => [...prev, message]);

    setMessage("");
  };

  return (
    <div>
      <h1>Chat</h1>

      <input value={message} onChange={(e) => setMessage(e.target.value)} />

      <button onClick={sendMessage}>Send</button>

      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
    </div>
  );
}

export default App;
