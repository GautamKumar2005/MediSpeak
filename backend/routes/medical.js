const express = require('express');
const multer = require('multer');
const MedicalRecord = require('../models/MedicalRecord');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// Get all medical records for user
router.get('/records', auth, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(50);
    
    res.json({
      success: true,
      records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single medical record
router.get('/records/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new medical record
router.post('/records', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const recordData = {
      user: req.user.id,
      title: req.body.title,
      description: req.body.description,
      recordType: req.body.recordType,
      date: new Date(req.body.date),
      doctor: req.body.doctor ? JSON.parse(req.body.doctor) : undefined,
      parameters: req.body.parameters ? JSON.parse(req.body.parameters) : [],
      medications: req.body.medications ? JSON.parse(req.body.medications) : [],
      symptoms: req.body.symptoms ? JSON.parse(req.body.symptoms) : [],
      diagnosis: req.body.diagnosis ? JSON.parse(req.body.diagnosis) : undefined,
      notes: req.body.notes,
      isPrivate: req.body.isPrivate === 'true'
    };
    
    // Add file attachments
    if (req.files && req.files.length > 0) {
      recordData.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }));
    }
    
    const record = new MedicalRecord(recordData);
    await record.save();
    
    res.status(201).json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update medical record
router.put('/records/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete medical record
router.delete('/records/:id', auth, async (req, res) => {
  try {
    const record = await MedicalRecord.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
