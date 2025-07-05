const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const medicalRoutes = require('./routes/medical');
const analysisRoutes = require('./routes/analysis');

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));



app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());


// MongoDB Schema
const recordSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  recordType: { type: String, required: true },
  date: { type: Date, required: true },
  parameters: { type: Array, default: [] },
  notes: { type: String, required: true },
  image_url: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
});
const Record = mongoose.model('Record', recordSchema);
// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'medical-app-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});


app.post('/api/medical/records', async (req, res) => {
  try {
    const { title, description, recordType, date, parameters, notes, image_url } = req.body;
    console.log('Received record data:', req.body);

    // Validate required fields
    if (!title || !description || !recordType || !date || !notes) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save to MongoDB
    const record = new Record({
      title,
      description,
      recordType,
      date,
      parameters,
      notes,
      image_url
    });

    await record.save();
    console.log('Record saved to MongoDB:', record);
    res.json({ success: true, record });
  } catch (error) {
    console.error('Save record error:', error.message);
    res.status(500).json({ error: `Failed to save record: ${error.message}` });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
