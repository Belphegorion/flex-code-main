import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Allowed file types with their MIME types and extensions
const ALLOWED_FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  documents: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  aadhaar: {
    mimeTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    extensions: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSize: 5 * 1024 * 1024 // 5MB
  }
};

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100); // Limit filename length
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const sanitizedName = sanitizeFilename(path.parse(file.originalname).name);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${sanitizedName}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  try {
    const fieldName = file.fieldname;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();
    
    // Determine file category
    let category = 'images'; // default
    if (fieldName === 'aadhaar') {
      category = 'aadhaar';
    } else if (fieldName === 'document' || fieldName === 'resume') {
      category = 'documents';
    } else if (fieldName === 'profilePhoto' || fieldName === 'image') {
      category = 'images';
    }
    
    const allowedTypes = ALLOWED_FILE_TYPES[category];
    
    if (!allowedTypes) {
      return cb(new Error(`Unsupported field: ${fieldName}`), false);
    }
    
    // Check MIME type
    if (!allowedTypes.mimeTypes.includes(mimeType)) {
      return cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.mimeTypes.join(', ')}`), false);
    }
    
    // Check file extension
    if (!allowedTypes.extensions.includes(fileExtension)) {
      return cb(new Error(`Invalid file extension. Allowed extensions: ${allowedTypes.extensions.join(', ')}`), false);
    }
    
    // Additional security checks
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      return cb(new Error('Invalid filename'), false);
    }
    
    cb(null, true);
  } catch (error) {
    cb(new Error('File validation error'), false);
  }
};

// Create different upload configurations
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 5, // Max 5 files per request
    fieldSize: 1024 * 1024, // 1MB field size
    fieldNameSize: 100, // 100 bytes field name
    headerPairs: 2000
  }
});

// Specific upload configurations
export const imageUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ALLOWED_FILE_TYPES.images;
    const mimeType = file.mimetype.toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedTypes.mimeTypes.includes(mimeType) || !allowedTypes.extensions.includes(extension)) {
      return cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: ALLOWED_FILE_TYPES.images.maxSize,
    files: 1
  }
});

export const documentUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ALLOWED_FILE_TYPES.documents;
    const mimeType = file.mimetype.toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedTypes.mimeTypes.includes(mimeType) || !allowedTypes.extensions.includes(extension)) {
      return cb(new Error('Only document files (PDF, DOC, DOCX) are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: ALLOWED_FILE_TYPES.documents.maxSize,
    files: 1
  }
});

// Error handler for multer errors
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ message: 'Too many files. Maximum is 5 files.' });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ message: 'Unexpected file field.' });
      default:
        return res.status(400).json({ message: 'File upload error.' });
    }
  }
  
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
};