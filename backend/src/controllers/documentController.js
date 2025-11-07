import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const uploadAadhaar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'eventflex/documents',
      format: 'pdf'
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

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