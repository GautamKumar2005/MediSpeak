const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Normalize email to lowercase
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    // Add password field
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  bloodGroup: {
    type: String,
  },
  allergies: [{
    type: String,
  }],
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);