import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// Middleware
app.use(cors({
  origin: ['https://flex-code-cba7.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['worker', 'organizer', 'sponsor', 'admin'], required: true },
  profileCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EVENTFLEX API is running' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, name, email, role, profileCompleted: false }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        profileCompleted: user.profileCompleted 
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default function handler(req, res) {
  return app(req, res);
}