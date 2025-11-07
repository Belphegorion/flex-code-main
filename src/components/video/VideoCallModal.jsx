import { useState, useEffect } from 'react';
import { FiVideo, FiVideoOff, FiMic, FiMicOff, FiX, FiUsers, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function VideoCallModal({ eventId, onClose }) {
  const [callActive, setCallActive] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [callId, setCallId] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  const startCall = async () => {
    try {
      const res = await api.post(`/events/${eventId}/video-call/start`);
      setCallActive(true);
      setCallId(res.videoCallId);
      setQrCode(res.qrCode);
      toast.success('Video call started');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start call');
    }
  };

  const endCall = async () => {
    try {
      await api.post(`/events/${eventId}/video-call/end`);
      setCallActive(false);
      setCallId(null);
      setQrCode(null);
      toast.success('Video call ended');
    } catch (error) {
      toast.error('Failed to end call');
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Event Video Call</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <FiX size={20} />
          </button>
        </div>

        {!callActive ? (
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="w-64 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FiVideo size={48} className="text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400">Ready to start video call?</p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${videoEnabled ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}
              >
                {videoEnabled ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
              </button>
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${audioEnabled ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}
              >
                {audioEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />}
              </button>
            </div>

            <button onClick={startCall} className="btn-primary px-8 py-3">
              Start Video Call
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
              <div className="text-white text-center">
                <FiVideo size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Video Call Active</p>
                <p className="text-sm opacity-75">Call ID: {callId}</p>
              </div>

              <div className="absolute top-4 right-4 space-y-2">
                {participants.map((participant, idx) => (
                  <div key={idx} className="w-24 h-18 bg-gray-700 rounded flex items-center justify-center text-white text-xs">
                    {participant.name}
                  </div>
                ))}
              </div>
            </div>

            {qrCode && (
              <div className="absolute top-4 left-4 bg-white p-2 rounded">
                <img src={qrCode} alt="Join QR" className="w-24 h-24" />
                <p className="text-xs text-center mt-1">Scan to Join</p>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${videoEnabled ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'}`}
              >
                {videoEnabled ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
              </button>
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${audioEnabled ? 'bg-gray-600 text-white' : 'bg-red-600 text-white'}`}
              >
                {audioEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />}
              </button>
              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                <FiPhone size={20} />
              </button>
            </div>

            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <FiUsers size={16} />
              {participants.length} participants
            </div>
          </div>
        )}
      </div>
    </div>
  );
}