import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';
import api from '../../services/api';

export default function QRScanner({ onScanSuccess, onClose }) {
  const [scanMode, setScanMode] = useState('camera');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scanMode === 'camera') {
      startCameraScanner();
    }
    return () => stopScanner();
  }, [scanMode]);

  const startCameraScanner = () => {
    if (scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleQRScan(decodedText);
          scanner.clear();
        },
        (error) => {
          console.log('QR scan error:', error);
        }
      );

      scannerRef.current = scanner;
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
  };

  const handleQRScan = async (qrData) => {
    setScanning(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch {
        toast.error('Invalid QR code format');
        return;
      }

      if (parsedData.type === 'work-hours') {
        await processWorkHoursQR(parsedData);
      } else {
        toast.error('This QR code is not for work hours tracking');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process QR code');
    } finally {
      setScanning(false);
    }
  };

  const processWorkHoursQR = async (qrData) => {
    const { eventId, token } = qrData;
    
    // Get available jobs for this event
    const jobsRes = await api.get(`/events/${eventId}/jobs`);
    const userJobs = jobsRes.jobs?.filter(job => 
      job.hiredPros?.some(worker => worker._id === localStorage.getItem('userId'))
    ) || [];

    if (userJobs.length === 0) {
      toast.error('You are not assigned to any jobs in this event');
      return;
    }

    onScanSuccess({ qrData, jobs: userJobs });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('file-qr-reader');
      const qrCodeMessage = await html5QrCode.scanFile(file, true);
      handleQRScan(qrCodeMessage);
      html5QrCode.clear();
    } catch (error) {
      toast.error('No QR code found in image');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold">Scan Work Hours QR</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setScanMode('camera')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                scanMode === 'camera'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiCamera size={18} />
              Camera
            </button>
            <button
              onClick={() => setScanMode('upload')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                scanMode === 'upload'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiUpload size={18} />
              Upload
            </button>
          </div>

          {scanMode === 'camera' ? (
            <div>
              <div id="qr-reader" className="w-full"></div>
              {scanning && (
                <div className="text-center mt-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <p className="text-sm text-gray-600 mt-2">Processing QR code...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div id="file-qr-reader" className="hidden"></div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center gap-2 mx-auto"
              >
                <FiUpload size={20} />
                Select QR Image
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Upload a screenshot or photo of the QR code
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}