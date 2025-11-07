import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiSend, FiUsers } from 'react-icons/fi';
import api from '../../services/api';

export default function SendWorkQRButton({ eventId, eventTitle }) {
  const [sending, setSending] = useState(false);

  const sendWorkQR = async () => {
    setSending(true);
    try {
      const res = await api.post(`/work-schedule/${eventId}/send-qr`);
      toast.success(`Work QR code sent to ${res.workersNotified} workers!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send QR code');
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={sendWorkQR}
      disabled={sending}
      className="btn-primary flex items-center gap-2"
    >
      {sending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Sending...
        </>
      ) : (
        <>
          <FiSend size={16} />
          Send Work QR to Workers
        </>
      )}
    </button>
  );
}