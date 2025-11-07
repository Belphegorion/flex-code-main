import { useState, useEffect } from 'react';
import { FiDownload, FiShare2, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function WorkQRDisplay({ eventId }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRCode();
  }, [eventId]);

  const fetchQRCode = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}/qr`);
      setQrData(res);
    } catch (error) {
      console.error('Error fetching QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `work-hours-qr-${qrData.event?.title || 'event'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const copyQRLink = async () => {
    if (!qrData?.qrCode) return;
    
    try {
      await navigator.clipboard.writeText(qrData.qrCode);
      toast.success('QR code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy QR code');
    }
  };

  const shareQR = async () => {
    if (!qrData?.qrCode) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Work Hours QR - ${qrData.event?.title}`,
          text: 'Scan this QR code to track your work hours',
          url: qrData.qrCode
        });
      } catch (error) {
        copyQRLink();
      }
    } else {
      copyQRLink();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No work schedule QR code available for this event</p>
        <button onClick={fetchQRCode} className="btn-secondary mt-4 flex items-center gap-2 mx-auto">
          <FiRefreshCw /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold mb-4">Work Hours QR Code</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Scan this QR code to check in/out for work hours tracking
      </p>
      
      <div className="bg-white p-4 rounded-lg border inline-block mb-4">
        <img 
          src={qrData.qrCode} 
          alt="Work Hours QR Code" 
          className="mx-auto"
          style={{ maxWidth: '200px', maxHeight: '200px' }}
        />
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        <p className="font-medium">{qrData.event?.title}</p>
        <p>Available Jobs: {qrData.jobs?.map(job => job.title).join(', ')}</p>
      </div>
      
      <div className="flex gap-2 justify-center">
        <button
          onClick={downloadQR}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <FiDownload size={16} />
          Download
        </button>
        <button
          onClick={copyQRLink}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <FiCopy size={16} />
          Copy
        </button>
        <button
          onClick={shareQR}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <FiShare2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}