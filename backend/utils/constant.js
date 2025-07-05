const MEDICAL_CONSTANTS = {
  NORMAL_RANGES: {
    'hemoglobin': {
      male: { min: 13.5, max: 17.5, unit: 'g/dL' },
      female: { min: 12.0, max: 15.5, unit: 'g/dL' }
    },
    'glucose': {
      fasting: { min: 70, max: 100, unit: 'mg/dL' },
      random: { min: 70, max: 140, unit: 'mg/dL' }
    },
    'cholesterol': {
      total: { min: 0, max: 200, unit: 'mg/dL' },
      ldl: { min: 0, max: 100, unit: 'mg/dL' },
      hdl: { min: 40, max: 999, unit: 'mg/dL' }
    },
    'blood_pressure': {
      systolic: { min: 90, max: 120, unit: 'mmHg' },
      diastolic: { min: 60, max: 80, unit: 'mmHg' }
    }
  },
  
  REPORT_TYPES: [
    'blood_test',
    'urine_test',
    'imaging',
    'ecg',
    'xray',
    'mri',
    'ct_scan',
    'other'
  ],
  
  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  
  LANGUAGES: {
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  }
};

module.exports = MEDICAL_CONSTANTS;
