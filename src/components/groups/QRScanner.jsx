import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiX, FiCamera } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function QRScanner({ onClose, onSuccess, title = 'Join Group Chat', onScanSuccess: customOnScanSuccess }) {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (scanning && scannerRef.current) {
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      qrScanner.render(onScanSuccess, onScanFailure);
      setScanner(qrScanner);

      return () => {
        if (qrScanner) {
          qrScanner.clear().catch(() => {});
        }
      };
    }
  }, [scanning]); // eslint-disable-line react-hooks/exhaustive-deps

  const onScanSuccess = async (decodedText) => {
    try {
      setScanning(false);
      if (scanner) {
        scanner.clear();
      }

      if (customOnScanSuccess) {
        customOnScanSuccess(decodedText);
        return;
      }

      const response = await api.post('/groups/join-qr', {
        qrData: decodedText
      });

      toast.success(response.message);
      onSuccess(response.group);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join group');
      setScanning(true);
    }
  };

  const onScanFailure = (error) => {
    // Ignore scan failures
  };

  const startScanning = () => {
    setScanning(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>

        {!scanning ? (
          <div className="text-center py-8">
            <FiCamera className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Scan the QR code shared by the organizer to join the group chat
            </p>
            <button
              onClick={startScanning}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <FiCamera />
              Start Scanning
            </button>
          </div>
        ) : (
          <div>
            <div id="qr-reader" ref={scannerRef} className="mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Point your camera at the QR code
            </p>
          </div>
        )}
      </div>
    </div>
  );
}