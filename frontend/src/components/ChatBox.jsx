import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket"; // 🔥 use global socket

function ChatBox({ sessionId, isChatOpen, setIsChatOpen }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const currentUser = "user1";
  const chatRef = useRef();

  // 🔹 RECEIVE MESSAGES
  useEffect(() => {
    if (!sessionId) return;

    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [sessionId]);

  // 🔹 CLICK OUTSIDE CLOSE
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

  // 🔹 SEND MESSAGE
  const sendMessage = () => {
    if (!message.trim() || !sessionId) return;

    const msgData = {
      sessionId,
      message,
      senderId: currentUser,
    };

    socket.emit("sendMessage", msgData);

    setMessage("");
  };

  return (
    <div ref={chatRef} className="flex flex-col h-full p-2">
      {/* 🔹 Messages */}
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

      {/* 🔹 Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none"
          placeholder="Type a message..."
          value={message}
          onFocus={() => setIsChatOpen(true)}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
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
