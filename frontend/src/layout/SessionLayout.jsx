import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ChatBox from "../components/ChatBox";
import VideoCall from "../components/VideoCall";
import { socket } from "../socket/socket";
import CodeEditor from "../components/CodeEditor";

function SessionLayout() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const confirmEndSession = () => {
    socket.emit("endSession", sessionId);
    setShowConfirm(false);
  };

  useEffect(() => {
    if (!user) {
      alert("Please login first");
      navigate("/");
      return;
    }

    socket.connect();
    socket.emit("joinSession", sessionId);

    socket.on("sessionEnded", () => {
      alert("Session ended");
      navigate("/");
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="h-full flex gap-4">
        <div className="flex-1 bg-white rounded-2xl p-4 shadow flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">
              Code Editor ({user?.role})
            </h2>

            {user?.role === "mentor" && (
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                End Session
              </button>
            )}
          </div>

          <div className="flex-1 bg-gray-50 rounded-xl flex items-center justify-center">
            <CodeEditor sessionId={sessionId} />
          </div>
        </div>

        <div className="w-[350px] flex flex-col gap-4">
          <div className="flex-1 bg-white rounded-2xl p-4 shadow flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Video</h2>

            <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden">
              <VideoCall sessionId={sessionId} />
            </div>
          </div>

          <div
            className={`bg-white rounded-2xl shadow transition-all duration-300 flex flex-col ${
              isChatOpen ? "h-[300px]" : "h-[60px]"
            }`}
          >
            <ChatBox
              sessionId={sessionId}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
            />
          </div>
        </div>
      </div>

      {showConfirm && user?.role === "mentor" && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[300px] text-center">
            <p className="mb-4 font-medium">
              Are you sure you want to end the session?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmEndSession}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionLayout;
