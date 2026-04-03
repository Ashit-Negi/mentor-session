import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";

const VideoCall = ({ sessionId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const iceQueue = useRef([]);

  const navigate = useNavigate();

  const [stream, setStream] = useState(null);

  // 🔥 CREATE PEER
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
      console.log("REMOTE STREAM RECEIVED");
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

  // 🔥 START CONNECTION
  const startConnection = async () => {
    if (peerRef.current) return;

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = mediaStream;
    setStream(mediaStream);

    const peer = createPeer();
    peerRef.current = peer;

    mediaStream.getTracks().forEach((track) => {
      peer.addTrack(track, mediaStream);
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", { sessionId, offer });
  };

  // 🔥 HANDLE OFFER
  const handleOffer = async (offer) => {
    if (peerRef.current) return;

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current.srcObject = mediaStream;
    setStream(mediaStream);

    const peer = createPeer();
    peerRef.current = peer;

    mediaStream.getTracks().forEach((track) => {
      peer.addTrack(track, mediaStream);
    });

    await peer.setRemoteDescription(offer);

    // 🔥 process queued ICE
    iceQueue.current.forEach(async (c) => {
      await peer.addIceCandidate(c);
    });
    iceQueue.current = [];

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", { sessionId, answer });
  };

  // 🔥 HANDLE ANSWER
  const handleAnswer = async (answer) => {
    await peerRef.current?.setRemoteDescription(answer);

    // process ICE queue
    iceQueue.current.forEach(async (c) => {
      await peerRef.current.addIceCandidate(c);
    });
    iceQueue.current = [];
  };

  // 🔥 HANDLE ICE
  const handleIce = async (candidate) => {
    if (!peerRef.current) {
      iceQueue.current.push(candidate);
      return;
    }
    await peerRef.current.addIceCandidate(candidate);
  };

  // 🔥 SOCKET SETUP
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

  // 🔥 AUTO START
  useEffect(() => {
    if (sessionId) {
      startConnection();
    }
  }, [sessionId]);

  // 🔥 STOP
  const stopVideo = () => {
    stream?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();

    peerRef.current = null;
    setStream(null);

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  // 🔥 SESSION END
  useEffect(() => {
    socket.on("sessionEnded", () => {
      stopVideo();
      navigate("/dashboard");
    });

    return () => socket.off("sessionEnded");
  }, []);

  // 🔥 CLEANUP
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-[120px] h-[90px] absolute bottom-3 right-3 rounded-lg border-2 border-white object-cover"
      />

      <button
        onClick={stopVideo}
        className="absolute bottom-3 left-3 bg-red-500 text-white px-3 py-1 rounded"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCall;
