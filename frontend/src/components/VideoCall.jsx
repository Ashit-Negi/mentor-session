import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";

const VideoCall = ({ sessionId, isMentor }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const iceQueue = useRef([]);
  const isEndingRef = useRef(false);
  const streamRef = useRef(null);

  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // ✅ 🔥 SOCKET CONNECT FIX (ADDED)
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ✅ SAFE MEDIA ACCESS
  const getMediaStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = mediaStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      return mediaStream;
    } catch (err) {
      console.error("Media error:", err);
      alert("Camera/Mic access allow karo ⚠️");
      return null;
    }
  };

  // CREATE PEER
  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peer.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          sessionId,
          candidate: event.candidate,
        });
      }
    };

    return peer;
  };

  // START (MENTOR)
  const startConnection = async () => {
    if (peerRef.current) return;

    const mediaStream = await getMediaStream();
    if (!mediaStream) return;

    const peer = createPeer();
    peerRef.current = peer;

    mediaStream.getTracks().forEach((track) => {
      peer.addTrack(track, mediaStream);
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", { sessionId, offer });
  };

  // HANDLE OFFER
  const handleOffer = async (offer) => {
    if (peerRef.current) return;

    const mediaStream = await getMediaStream();
    if (!mediaStream) return;

    const peer = createPeer();
    peerRef.current = peer;

    mediaStream.getTracks().forEach((track) => {
      peer.addTrack(track, mediaStream);
    });

    await peer.setRemoteDescription(offer);

    for (let c of iceQueue.current) {
      await peer.addIceCandidate(c);
    }
    iceQueue.current = [];

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", { sessionId, answer });
  };

  // HANDLE ANSWER
  const handleAnswer = async (answer) => {
    await peerRef.current?.setRemoteDescription(answer);

    for (let c of iceQueue.current) {
      await peerRef.current.addIceCandidate(c);
    }
    iceQueue.current = [];
  };

  // HANDLE ICE
  const handleIce = async (candidate) => {
    if (!peerRef.current) {
      iceQueue.current.push(candidate);
      return;
    }
    await peerRef.current.addIceCandidate(candidate);
  };

  // SOCKET SETUP
  useEffect(() => {
    if (!sessionId) return;

    socket.emit("joinSession", sessionId);

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIce);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIce);
    };
  }, [sessionId]);

  // ONLY MENTOR STARTS
  useEffect(() => {
    if (sessionId && isMentor) {
      startConnection();
    }
  }, [sessionId, isMentor]);

  // STOP VIDEO
  const stopVideo = () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    streamRef.current = null;
  };

  // SESSION END
  useEffect(() => {
    const handleSessionEnd = () => {
      stopVideo();
      setTimeout(() => navigate("/dashboard"), 200);
    };

    socket.on("sessionEnded", handleSessionEnd);
    return () => socket.off("sessionEnded", handleSessionEnd);
  }, []);

  // CLEANUP
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  // 🎤 MUTE
  const toggleMute = () => {
    if (!streamRef.current) return;

    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  };

  // 🎥 CAMERA
  const toggleCamera = () => {
    if (!streamRef.current) return;

    streamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {/* REMOTE */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* LOCAL */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-[120px] h-[90px] absolute bottom-3 right-3 rounded-lg border-2 border-white object-cover"
      />

      {/* CONTROLS */}
      <div className="absolute bottom-3 left-3 flex gap-2">
        <button
          onClick={toggleMute}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={toggleCamera}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          {isCameraOff ? "Camera On" : "Camera Off"}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;