const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  recordType: {
    type: String,
    enum: ['lab_report', 'prescription', 'diagnosis', 'imaging', 'vaccination', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  doctor: {
    name: String,
    specialty: String,
    hospital: String
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  parameters: [{
    name: String,
    value: String,
    unit: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'high', 'low', 'critical']
    }
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  symptoms: [{
    type: String
  }],
  diagnosis: {
    primary: String,
    secondary: [String],
    icd10Code: String
  },
  notes: {
    type: String
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
