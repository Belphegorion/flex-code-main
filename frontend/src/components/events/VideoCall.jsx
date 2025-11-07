import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhoneOff } from 'react-icons/fi';

export default function VideoCall({ eventId, videoCallId, onEnd }) {
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000');

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream);
        if (userVideo.current) {
          userVideo.current.srcObject = currentStream;
        }

        socketRef.current.emit('join-event', eventId);

        socketRef.current.on('video-signal', (data) => {
          const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: currentStream,
          });

          peer.on('signal', signal => {
            socketRef.current.emit('video-signal', { signal, to: data.from });
          });

          peer.on('stream', peerStream => {
            setPeers(prev => [...prev, { peerId: data.from, stream: peerStream }]);
          });

          peer.signal(data.signal);
          peersRef.current.push({ peerId: data.from, peer });
        });
      })
      .catch(err => console.error('Media access error:', err));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [eventId]);

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  const endCall = () => {
    stream?.getTracks().forEach(track => track.stop());
    socketRef.current?.disconnect();
    onEnd?.();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video ref={userVideo} autoPlay muted className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
            You
          </div>
        </div>
        {peers.map((peer, idx) => (
          <PeerVideo key={idx} peer={peer} />
        ))}
      </div>

      <div className="bg-gray-900 p-4 flex justify-center gap-4">
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${videoEnabled ? 'bg-gray-700' : 'bg-red-600'}`}
        >
          {videoEnabled ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
        </button>
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${audioEnabled ? 'bg-gray-700' : 'bg-red-600'}`}
        >
          {audioEnabled ? <FiMic size={24} /> : <FiMicOff size={24} />}
        </button>
        <button onClick={endCall} className="p-4 rounded-full bg-red-600">
          <FiPhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}

function PeerVideo({ peer }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <video ref={ref} autoPlay className="w-full h-full object-cover" />
    </div>
  );
}
