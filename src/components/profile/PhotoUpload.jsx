import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiCamera, FiUpload, FiLoader } from 'react-icons/fi';
import api from '../../services/api';

export default function PhotoUpload({ currentPhoto, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration missing. Please check your .env file.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      
      if (!cloudinaryRes.ok) {
        const error = await cloudinaryRes.json();
        throw new Error(error.error?.message || 'Upload failed');
      }
      
      const data = await cloudinaryRes.json();
      
      await api.post('/profiles/photo', { photoUrl: data.secure_url });
      
      toast.success('Photo uploaded successfully!');
      onUploadSuccess?.(data.secure_url);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      setPreview(currentPhoto);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
              <FiCamera />
            </div>
          )}
        </div>
        <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-3 rounded-full cursor-pointer hover:bg-primary-700 transition-colors shadow-lg group-hover:scale-110 transform">
          {uploading ? (
            <FiLoader className="animate-spin" size={20} />
          ) : (
            <FiUpload size={20} />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        {uploading ? 'Uploading...' : 'Click to upload photo'}
      </p>
    </div>
  );
}
