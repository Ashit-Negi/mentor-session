import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [createdId, setCreatedId] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const createMeeting = async () => {
    try {
      const res = await axios.post("/session/create");
      const id = res.data.sessionId;

      setCreatedId(id);

      const link = `${window.location.origin}/session/${id}`;
      setMeetingLink(link);
    } catch (err) {
      alert("Something went wrong");
    }
  };

  const joinMeeting = () => {
    if (!sessionId.trim()) return;

    let id = sessionId.trim();

    if (id.includes("/session/")) {
      id = id.split("/session/")[1];
    }

    navigate(`/session/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">MeetX 🚀</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Hi, <span className="font-semibold">{user?.name}</span>
          </span>

          <button
            onClick={handleLogout}
            className="text-sm bg-slate-800 text-white px-4 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="grid md:grid-cols-2 gap-18 w-full max-w-3xl">
          {/*  CREATE MEETING CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 hover:translate-y-2 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-slate-800">
              Create Meeting
            </h2>

            <p className="text-sm text-gray-500 text-center">
              Start a new session and share the link
            </p>

            <button
              onClick={createMeeting}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl transition"
            >
              + New Meeting
            </button>
          </div>

          {/* JOIN MEETING CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col gap-4 hover:translate-y-2 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-slate-800 text-center">
              Join Meeting
            </h2>

            <p className="text-sm text-gray-500 text-center">
              Enter code or paste meeting link
            </p>

            <input
              type="text"
              placeholder="Enter code or link"
              className="px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-slate-400"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") joinMeeting();
              }}
            />

            <button
              onClick={joinMeeting}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/*  POPUP */}
      {meetingLink && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[350px] text-center animate-fadeIn">
            <h2 className="text-xl font-bold mb-3">Meeting Created 🎉</h2>

            <p className="text-sm text-gray-500 mb-2">Share this link</p>

            <div className="bg-gray-100 p-3 rounded-lg text-sm break-all mb-4">
              {meetingLink}
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(meetingLink);

                  setTimeout(() => {
                    setMeetingLink("");
                  }, 1000);
                }}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900"
              >
                Copy
              </button>

              <button
                onClick={() => navigate(`/session/${createdId}`)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Join Now
              </button>

              <button
                onClick={() => setMeetingLink("")}
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
