import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function QRScanner({ onSuccess, onCancel }) {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        try {
          setScanning(true);
          const res = await axios.post('/api/events/video-call/verify', { qrData: decodedText });
          toast.success('Access granted!');
          onSuccess?.(res.data);
          scanner.stop();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Invalid QR code');
          setScanning(false);
        }
      }
    ).catch(err => {
      console.error('QR Scanner error:', err);
      toast.error('Camera access denied');
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Scan QR Code to Join</h3>
        <div id="qr-reader" className="mb-4"></div>
        {scanning && <p className="text-center text-sm">Verifying access...</p>}
        <button onClick={onCancel} className="btn-secondary w-full mt-4">
          Cancel
        </button>
      </div>
    </div>
  );
}
