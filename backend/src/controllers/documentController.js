import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const uploadAadhaar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExt = req.file.originalname.toLowerCase().slice(req.file.originalname.lastIndexOf('.'));
    
    if (!allowedTypes.includes(req.file.mimetype) || !allowedExtensions.includes(fileExt)) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Only PDF and image files (JPG, PNG) are allowed' });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File size must be less than 5MB' });
    }

    // Validate file content (basic check)
    if (req.file.size < 100) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File appears to be corrupted or empty' });
    }

    // Upload to Cloudinary
    const uploadOptions = {
      folder: 'eventflex/documents',
      bytes_limit: maxSize
    };
    
    // Set resource type based on file type
    if (req.file.mimetype === 'application/pdf') {
      uploadOptions.resource_type = 'raw';
      uploadOptions.format = 'pdf';
    } else {
      uploadOptions.resource_type = 'image';
    }
    
    const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

    // Clean up temp file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    // Update user document
    await User.findByIdAndUpdate(req.userId, {
      aadhaarDocument: {
        url: result.secure_url,
        uploadedAt: new Date(),
        verificationStatus: 'pending'
      }
    });

    res.json({ 
      message: 'Aadhaar document uploaded successfully',
      documentUrl: result.secure_url
    });
  } catch (error) {
    // Clean up temp file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

export const getDocumentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('aadhaarDocument');
    res.json({ document: user.aadhaarDocument || null });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document status', error: error.message });
  }
};