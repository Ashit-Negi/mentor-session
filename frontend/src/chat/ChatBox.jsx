import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function ChatBox({ sessionId, isChatOpen, setIsChatOpen }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const currentUser = "user1";

  const chatRef = useRef();

  useEffect(() => {
    socket.emit("joinSession", sessionId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, [sessionId]);

  // click outside to close chat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isChatOpen &&
        chatRef.current &&
        !chatRef.current.contains(event.target)
      ) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen, setIsChatOpen]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      sessionId,
      message,
      senderId: currentUser,
    });

    setMessage("");
  };

  return (
    <div ref={chatRef} className="flex flex-col h-full p-2">
      {/* Messages */}
      {isChatOpen && (
        <div className="flex-1 overflow-y-auto space-y-2 mb-2">
          {messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser;

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[70%] ${
                    isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{msg.text}</p>

                  <span className="text-[10px] opacity-70 block mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none"
          placeholder="Type a message..."
          value={message}
          onFocus={() => setIsChatOpen(true)}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
