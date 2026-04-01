import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import { useNavigate } from "react-router-dom";

const VideoCall = ({ sessionId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // 🔹 START VIDEO
  const startVideo = async () => {
    try {
      if (peerRef.current) return;

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerRef.current = peer;

      mediaStream.getTracks().forEach((track) => {
        peer.addTrack(track, mediaStream);
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

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("offer", { sessionId, offer });
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 SOCKET LISTENERS
  useEffect(() => {
    if (!sessionId) return;

    socket.emit("joinSession", sessionId);

    socket.on("offer", async (offer) => {
      if (peerRef.current) return;

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerRef.current = peer;

      mediaStream.getTracks().forEach((track) => {
        peer.addTrack(track, mediaStream);
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

      await peer.setRemoteDescription(offer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", { sessionId, answer });
    });

    socket.on("answer", async (answer) => {
      await peerRef.current?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      if (candidate) {
        await peerRef.current?.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [sessionId]);

  // 🔹 STOP VIDEO
  const stopVideo = () => {
    stream?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    peerRef.current = null;
    setStream(null);
  };

  // 🔥 SESSION END → CLEAN + NAVIGATE
  useEffect(() => {
    socket.on("sessionEnded", () => {
      stopVideo();
      navigate("/dashboard");
    });

    return () => {
      socket.off("sessionEnded");
    };
  }, [stream]);

  // 🔹 CLEANUP
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      peerRef.current?.close();
    };
  }, [stream]);

  // 🔹 MUTE
  const toggleMute = () => {
    const track = stream?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  // 🔹 CAMERA
  const toggleCamera = () => {
    const track = stream?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setIsCameraOff(!track.enabled);
  };

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

      <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
        {!stream ? (
          <button
            onClick={startVideo}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Start
          </button>
        ) : (
          <>
            <button
              onClick={stopVideo}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Stop
            </button>

            <button onClick={toggleMute} className="bg-white px-3 py-1 rounded">
              {isMuted ? "Unmute" : "Mute"}
            </button>

            <button
              onClick={toggleCamera}
              className="bg-white px-3 py-1 rounded"
            >
              {isCameraOff ? "Camera On" : "Camera Off"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
