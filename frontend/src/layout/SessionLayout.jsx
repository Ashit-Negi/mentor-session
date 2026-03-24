import { useState } from "react";
import ChatBox from "../chat/ChatBox";

function SessionLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sessionId = "abc123";

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="h-full flex gap-4">
        {/* Editor */}
        <div className="flex-1 bg-white rounded-2xl p-4 shadow flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Editor</h2>
          <div className="flex-1 bg-gray-50 rounded-xl flex items-center justify-center">
            Editor Area
          </div>
        </div>

        {/* Right */}
        <div className="w-[350px] flex flex-col gap-4">
          {/* Video */}
          <div className="flex-1 bg-white rounded-2xl p-4 shadow flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Video</h2>
            <div className="flex-1 bg-gray-50 rounded-xl flex items-center justify-center">
              Video Area
            </div>
          </div>

          {/* Chat */}
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
    </div>
  );
}

export default SessionLayout;
