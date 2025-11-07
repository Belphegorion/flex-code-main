import { FiX, FiDownload, FiShare2, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function QRCodeModal({ qrCode, title, onClose }) {
  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const copyQRLink = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      toast.success('QR code link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy QR code link');
    }
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: 'Scan this QR code to track work hours',
          url: qrCode
        });
      } catch (error) {
        copyQRLink();
      }
    } else {
      copyQRLink();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 text-center">
          <img 
            src={qrCode} 
            alt={title} 
            className="w-full max-w-xs mx-auto mb-4 rounded-lg shadow-md"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Scan this QR code to track work hours
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={downloadQR}
              className="btn-secondary flex items-center gap-2"
            >
              <FiDownload /> Download
            </button>
            <button
              onClick={shareQR}
              className="btn-secondary flex items-center gap-2"
            >
              <FiShare2 /> Share
            </button>
            <button
              onClick={copyQRLink}
              className="btn-secondary flex items-center gap-2"
            >
              <FiCopy /> Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}