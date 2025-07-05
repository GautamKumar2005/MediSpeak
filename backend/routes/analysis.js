const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/analyze-and-generate', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No document provided in request');
      return res.status(400).json({
        success: false,
        error: 'No document provided'
      });
    }

    console.log('Received file:', req.file.originalname, 'Size:', req.file.size, 'MIME:', req.file.mimetype);

    const formData = new FormData();
    formData.append('document', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('language', req.body.language || 'en');

    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    console.log('Calling Python service at:', `${pythonServiceUrl}/analyze-and-generate`);

    const response = await axios.post(`${pythonServiceUrl}/analyze-and-generate`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 180000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Python service response:', JSON.stringify(response.data, null, 2));

    res.json({
      success: true,
      analysis: response.data,
      userId: 'test-user'
    });
  } catch (error) {
    console.error('Analyze-and-generate error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Analysis and generation failed: ' + (error.response?.data?.error || error.message)
    });
  }
});

router.post('/generate-voice', async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      console.error('No text provided for voice generation');
      return res.status(400).json({
        success: false,
        error: 'No text provided'
      });
    }

    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    console.log('Calling Python service at:', `${pythonServiceUrl}/generate-voice`);

    const response = await axios.post(`${pythonServiceUrl}/generate-voice`, { text, language }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    res.json({
      success: true,
      audio_file: response.data.audio_file,
      userId: 'test-user'
    });
  } catch (error) {
    console.error('Voice generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Voice generation failed: ' + (error.response?.data?.error || error.message)
    });
  }
});

router.post('/health-insights', async (req, res) => {
  try {
    const { symptoms, age, gender, medicalHistory } = req.body;
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    console.log('Calling Python service at:', `${pythonServiceUrl}/health-insights`);

    const response = await axios.post(`${pythonServiceUrl}/health-insights`, {
      symptoms,
      age,
      gender,
      medicalHistory
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    res.json({
      success: true,
      analysis: response.data,
      userId: 'test-user'
    });
  } catch (error) {
    console.error('Health insights error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to get health insights: ' + (error.response?.data?.error || error.message)
    });
  }
});

router.post('/debug-upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No document provided in debug-upload');
      return res.status(400).json({
        success: false,
        error: 'No document provided'
      });
    }

    console.log('Debug-upload file:', req.file.originalname, 'Size:', req.file.size, 'MIME:', req.file.mimetype);

    const formData = new FormData();
    formData.append('document', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${pythonServiceUrl}/debug-upload`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });

    res.json({
      success: true,
      result: response.data
    });
  } catch (error) {
    console.error('Debug-upload error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Debug upload failed: ' + (error.response?.data?.error || error.message)
    });
  }
});

module.exports = router;