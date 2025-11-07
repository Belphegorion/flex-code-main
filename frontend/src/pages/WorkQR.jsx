import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiDownload, FiShare2, FiClock, FiCalendar } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import WorkHoursTracker from '../components/work/WorkHoursTracker';
import api from '../services/api';

export default function WorkQR() {
  const { eventId } = useParams();
  const [qrData, setQrData] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRData();
  }, [eventId]);

  const fetchQRData = async () => {
    try {
      const res = await api.get(`/work-schedule/${eventId}/qr`);
      setQrData(res);
      setEvent(res.event);
    } catch (error) {
      toast.error('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `work-hours-${event?.title || 'event'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded!');
  };

  const shareQR = async () => {
    if (!qrData?.qrCode) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(qrData.qrCode);
      const blob = await response.blob();
      const file = new File([blob], `work-qr-${event?.title || 'event'}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Work Hours QR - ${event?.title}`,
          text: 'Scan this QR code to track your work hours',
          files: [file]
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('QR page link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share QR code');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!qrData) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="card p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">QR Code Not Found</h1>
            <p className="text-gray-600">The work hours QR code for this event is not available.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Work Hours QR Code</h1>
              <p className="text-gray-600">{event?.title}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadQR}
                className="btn-secondary flex items-center gap-2"
              >
                <FiDownload size={16} />
                Download
              </button>
              <button
                onClick={shareQR}
                className="btn-primary flex items-center gap-2"
              >
                <FiShare2 size={16} />
                Share
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <img
                src={qrData.qrCode}
                alt="Work Hours QR Code"
                className="w-64 h-64 mx-auto"
              />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <FiClock className="text-primary-600" />
                <span>Scan to check in/out for work hours</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <FiCalendar className="text-primary-600" />
                <span>
                  Valid until: {new Date(qrData.expiryTime).toLocaleDateString()}
                </span>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2">How to use:</h3>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>1. Open your camera app or QR scanner</li>
                  <li>2. Point camera at the QR code</li>
                  <li>3. Tap the notification to open the tracker</li>
                  <li>4. Select your job and check in/out</li>
                </ol>
              </div>

              {qrData.jobs && qrData.jobs.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Your Jobs:</h3>
                  <div className="space-y-2">
                    {qrData.jobs.map(job => (
                      <div key={job._id} className="text-sm">
                        <span className="font-medium">{job.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Work Hours Tracker */}
        <WorkHoursTracker eventId={eventId} />
      </div>
    </Layout>
  );
}