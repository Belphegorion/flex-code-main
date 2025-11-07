import React, { useState, useEffect } from 'react';
import { FiUpload, FiFile, FiCheck, FiX, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AadhaarUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentStatus, setDocumentStatus] = useState(null);

  useEffect(() => {
    fetchDocumentStatus();
  }, []);

  const fetchDocumentStatus = async () => {
    try {
      const res = await api.get('/documents/status');
      setDocumentStatus(res.document);
    } catch (error) {
      console.error('Error fetching document status:', error);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('aadhaar', file);

    try {
      await api.post('/documents/aadhaar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Aadhaar document uploaded successfully');
      setFile(null);
      await fetchDocumentStatus();
      onUploadComplete?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <FiCheck className="text-green-500" />;
      case 'rejected': return <FiX className="text-red-500" />;
      default: return <FiClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      default: return 'Pending Verification';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Aadhaar Document</h3>
      
      {documentStatus ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <FiFile size={24} className="text-gray-600" />
            <div className="flex-1">
              <p className="font-medium">Aadhaar Card</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uploaded on {new Date(documentStatus.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(documentStatus.verificationStatus)}
              <span className="text-sm font-medium">
                {getStatusText(documentStatus.verificationStatus)}
              </span>
            </div>
          </div>
          
          {documentStatus.verificationStatus === 'rejected' && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              Your document was rejected. Please upload a clear, valid Aadhaar card.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <FiUpload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Upload your Aadhaar card (PDF only)
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="aadhaar-upload"
            />
            <label
              htmlFor="aadhaar-upload"
              className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-700"
            >
              Choose File
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <FiFile size={20} />
                <span className="text-sm">{file.name}</span>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AadhaarUpload;