import express from 'express';
import multer from 'multer';
import {
  createOrUpdateProfile,
  getMyProfile,
  getProfile,
  uploadVideo,
  searchTalent,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  addCertification,
  updateCertification,
  deleteCertification,
  uploadProfilePhoto,
  getMyFullProfile,
  updateMyProfile
} from '../controllers/profileController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// --- Main Profile Routes ---
router.get('/my-profile', authenticate, getMyProfile);
router.get('/me', authenticate, getMyFullProfile);
router.put('/me', authenticate, updateMyProfile);
router.post('/photo', authenticate, uploadProfilePhoto);
router.post('/', authenticate, authorize('worker'), createOrUpdateProfile);
router.get('/search', authenticate, authorize('organizer'), searchTalent);
router.post('/video', authenticate, authorize('worker'), upload.single('video'), uploadVideo);

// --- Work Experience Routes ---
router.post('/work-experience', authenticate, authorize('worker'), addWorkExperience);
router.put('/work-experience/:id', authenticate, authorize('worker'), updateWorkExperience);
router.delete('/work-experience/:id', authenticate, authorize('worker'), deleteWorkExperience);

// --- Education Routes ---
router.post('/education', authenticate, authorize('worker'), addEducation);
router.put('/education/:id', authenticate, authorize('worker'), updateEducation);
router.delete('/education/:id', authenticate, authorize('worker'), deleteEducation);

// --- Portfolio Routes ---
router.post('/portfolio', authenticate, authorize('worker'), addPortfolioItem);
router.put('/portfolio/:id', authenticate, authorize('worker'), updatePortfolioItem);
router.delete('/portfolio/:id', authenticate, authorize('worker'), deletePortfolioItem);

// --- Certification Routes ---
router.post('/certifications', authenticate, authorize('worker'), addCertification);
router.put('/certifications/:id', authenticate, authorize('worker'), updateCertification);
router.delete('/certifications/:id', authenticate, authorize('worker'), deleteCertification);

// --- Public Profile Route ---
router.get('/:id', authenticate, getProfile);

export default router;
