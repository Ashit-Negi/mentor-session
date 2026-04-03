import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";

const VideoCall = ({ sessionId, isMentor }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const iceQueue = useRef([]);
  const isEndingRef = useRef(false);
  const streamRef = useRef(null); // 🔥 FIX

  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

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

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = mediaStream;
    setStream(mediaStream);
    streamRef.current = mediaStream; // 🔥 FIX

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

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = mediaStream;
    setStream(mediaStream);
    streamRef.current = mediaStream; // 🔥 FIX

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

  // 🔥 FIXED STOP
  const stopVideo = () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    const currentStream = streamRef.current;

    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    streamRef.current = null;
    setStream(null);
  };

  // SESSION END LISTENER
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
    const currentStream = streamRef.current;
    if (!currentStream) return;

    currentStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted(!isMuted);
  };

  // 🎥 CAMERA
  const toggleCamera = () => {
    const currentStream = streamRef.current;
    if (!currentStream) return;

    currentStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff(!isCameraOff);
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
