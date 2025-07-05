import re
import logging
from datetime import datetime
from typing import Dict, List, Any
from gtts import gTTS
import os

logger = logging.getLogger(__name__)

class MedicalAnalyzer:
    def __init__(self):
        self.medical_patterns = self.load_medical_patterns()
        self.normal_ranges = self.load_normal_ranges()

    def load_medical_patterns(self):
        return {
            'hemoglobin': [
                r'h[ae]moglobin[:\s]*(\d+\.?\d*)\s*g/dl',
                r'hb[:\s]*(\d+\.?\d*)\s*g/dl'
            ],
            'glucose': [
                r'glucose[:\s]*(\d+\.?\d*)\s*mg/dl',
                r'sugar[:\s]*(\d+\.?\d*)\s*mg/dl',
                r'blood\s+sugar[:\s]*(\d+\.?\d*)\s*mg/dl'
            ],
            'cholesterol': [
                r'cholesterol[:\s]*(\d+\.?\d*)\s*mg/dl',
                r'total\s+cholesterol[:\s]*(\d+\.?\d*)\s*mg/dl'
            ],
            'blood_pressure': [
                r'bp[:\s]*(\d+)/(\d+)\s*mmhg',
                r'blood\s+pressure[:\s]*(\d+)/(\d+)\s*mmhg'
            ],
            'creatinine': [
                r'creatinine[:\s]*(\d+\.?\d*)\s*mg/dl',
                r'serum\s+creatinine[:\s]*(\d+\.?\d*)\s*mg/dl'
            ],
            'urea': [
                r'urea[:\s]*(\d+\.?\d*)\s*mg/dl',
                r'blood\s+urea[:\s]*(\d+\.?\d*)\s*mg/dl'
            ],
            'bilirubin': [
                r'bilirubin[:\s]*(\d+\.?\d*)\s*mg/dl',
                r'total\s+bilirubin[:\s]*(\d+\.?\d*)\s*mg/dl'
            ]
        }

    def load_normal_ranges(self):
        return {
            'hemoglobin': {'min': 12.0, 'max': 16.0, 'unit': 'g/dL'},
            'glucose': {'min': 70, 'max': 100, 'unit': 'mg/dL'},
            'cholesterol': {'min': 0, 'max': 200, 'unit': 'mg/dL'},
            'systolic_bp': {'min': 90, 'max': 120, 'unit': 'mmHg'},
            'diastolic_bp': {'min': 60, 'max': 80, 'unit': 'mmHg'},
            'creatinine': {'min': 0.6, 'max': 1.2, 'unit': 'mg/dL'},
            'urea': {'min': 15, 'max': 40, 'unit': 'mg/dL'},
            'bilirubin': {'min': 0.2, 'max': 1.2, 'unit': 'mg/dL'}
        }

    def analyze_medical_content(self, text: str, language: str = 'en') -> Dict[str, Any]:
        logger.debug(f"Analyzing medical content, language: {language}")
        try:
            parameters = self.extract_medical_parameters(text)
            abnormalities = self.identify_abnormalities(parameters)
            summary = self.generate_summary(parameters, abnormalities)
            risk_level = self.assess_risk_level(abnormalities)
            recommendations = self.generate_recommendations(abnormalities, language)
            return {
                'parameters': parameters,
                'abnormalities': abnormalities,
                'summary': summary,
                'risk_level': risk_level,
                'recommendations': recommendations,
                'analysis_date': self.get_current_timestamp()
            }
        except Exception as e:
            logger.error(f"Medical analysis error: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'error': f'Analysis failed: {str(e)}',
                'parameters': [],
                'abnormalities': [],
                'summary': 'Analysis could not be completed',
                'risk_level': 'unknown',
                'recommendations': []
            }

    def extract_medical_parameters(self, text: str) -> List[Dict[str, Any]]:
        logger.debug("Extracting medical parameters")
        parameters = []
        text_lower = text.lower()
        for param_name, patterns in self.medical_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text_lower, re.IGNORECASE)
                for match in matches:
                    if param_name == 'blood_pressure':
                        try:
                            systolic = float(match.group(1))
                            diastolic = float(match.group(2))
                            parameters.append({
                                'name': 'Systolic BP',
                                'value': systolic,
                                'unit': 'mmHg',
                                'status': self.get_parameter_status('systolic_bp', systolic),
                                'normal_range': f"{self.normal_ranges['systolic_bp']['min']}-{self.normal_ranges['systolic_bp']['max']} mmHg"
                            })
                            parameters.append({
                                'name': 'Diastolic BP',
                                'value': diastolic,
                                'unit': 'mmHg',
                                'status': self.get_parameter_status('diastolic_bp', diastolic),
                                'normal_range': f"{self.normal_ranges['diastolic_bp']['min']}-{self.normal_ranges['diastolic_bp']['max']} mmHg"
                            })
                        except ValueError:
                            logger.warning(f"Invalid blood pressure value in match: {match.group(0)}")
                    else:
                        try:
                            value = float(match.group(1))
                            parameters.append({
                                'name': param_name.replace('_', ' ').title(),
                                'value': value,
                                'unit': self.normal_ranges.get(param_name, {}).get('unit', ''),
                                'status': self.get_parameter_status(param_name, value),
                                'normal_range': self.get_normal_range_string(param_name)
                            })
                        except ValueError:
                            logger.warning(f"Invalid value for {param_name}: {match.group(1)}")
        logger.debug(f"Extracted {len(parameters)} parameters")
        return parameters

    def get_parameter_status(self, param_name: str, value: float) -> str:
        if param_name not in self.normal_ranges:
            return 'normal'
        ranges = self.normal_ranges[param_name]
        min_val = ranges['min']
        max_val = ranges['max']
        if value < min_val:
            return 'critical' if value < min_val * 0.7 else 'low'
        elif value > max_val:
            return 'critical' if value > max_val * 1.3 else 'high'
        return 'normal'

    def get_normal_range_string(self, param_name: str) -> str:
        if param_name not in self.normal_ranges:
            return 'N/A'
        ranges = self.normal_ranges[param_name]
        return f"{ranges['min']}-{ranges['max']} {ranges['unit']}"

    def identify_abnormalities(self, parameters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        logger.debug("Identifying abnormalities")
        abnormalities = []
        for param in parameters:
            if param['status'] in ['high', 'low', 'critical']:
                abnormalities.append({
                    'name': param['name'],
                    'value': param['value'],
                    'unit': param['unit'],
                    'status': param['status'],
                    'normal_range': param['normal_range'],
                    'severity': self.get_severity_level(param['status'])
                })
        logger.debug(f"Found {len(abnormalities)} abnormalities")
        return abnormalities

    def get_severity_level(self, status: str) -> int:
        severity_map = {
            'normal': 0,
            'low': 1,
            'high': 2,
            'critical': 3
        }
        return severity_map.get(status, 0)

    def generate_summary(self, parameters: List[Dict[str, Any]], abnormalities: List[Dict[str, Any]]) -> str:
        logger.debug("Generating summary")
        total_params = len(parameters)
        normal_params = len([p for p in parameters if p['status'] == 'normal'])
        abnormal_params = total_params - normal_params
        if abnormal_params == 0:
            return f"All {total_params} parameters are within normal ranges."
        return f"Out of {total_params} parameters, {normal_params} are normal and {abnormal_params} require attention."

    def assess_risk_level(self, abnormalities: List[Dict[str, Any]]) -> str:
        logger.debug("Assessing risk level")
        if not abnormalities:
            return 'low'
        critical_count = len([a for a in abnormalities if a['status'] == 'critical'])
        high_count = len([a for a in abnormalities if a['status'] == 'high'])
        if critical_count > 0:
            return 'critical'
        elif high_count > 2:
            return 'high'
        elif high_count > 0:
            return 'medium'
        return 'low'

    def generate_recommendations(self, abnormalities: List[Dict[str, Any]], language: str = 'en') -> List[str]:
        logger.debug("Generating recommendations")
        recommendations = []
        if not abnormalities:
            recommendations.append("All parameters are within normal ranges. Continue maintaining a healthy lifestyle.")
            return recommendations
        for abnormality in abnormalities:
            param_name = abnormality['name'].lower()
            status = abnormality['status']
            if 'hemoglobin' in param_name:
                if status in ['low', 'critical']:
                    recommendations.append("Consider iron-rich foods like spinach, red meat, and lentils. Consult a doctor for potential anemia.")
                elif status == 'high':
                    recommendations.append("High hemoglobin may indicate dehydration or other conditions. Consult your doctor.")
            elif 'glucose' in param_name:
                if status in ['high', 'critical']:
                    recommendations.append("Monitor blood sugar levels. Consider reducing sugar intake and consult an endocrinologist.")
                elif status == 'low':
                    recommendations.append("Low blood sugar detected. Have a quick source of glucose and monitor levels.")
            elif 'cholesterol' in param_name:
                if status in ['high', 'critical']:
                    recommendations.append("Reduce saturated fats, increase fiber intake, and consider regular exercise.")
            elif 'bp' in param_name:
                if status in ['high', 'critical']:
                    recommendations.append("Monitor blood pressure regularly. Reduce sodium intake and manage stress.")
                elif status == 'low':
                    recommendations.append("Low blood pressure detected. Stay hydrated and consult your doctor.")
        recommendations.append("Consult with your healthcare provider for proper interpretation and treatment plan.")
        recommendations.append("Maintain regular health checkups and follow prescribed medications.")
        return recommendations[:5]

    def generate_voice_explanation(self, text: str, language: str = 'en') -> str:
        logger.debug(f"Generating audio for text (length: {len(text)}): {text[:50]}..., language: {language}")
        try:
            text = text[:1000]
            tts = gTTS(text=text, lang=language, slow=False)
            audio_filename = f"audio_{int(datetime.now().timestamp())}.mp3"
            audio_path = os.path.join('static/audio', audio_filename)
            os.makedirs(os.path.dirname(audio_path), exist_ok=True)
            tts.save(audio_path)
            logger.info(f"Audio generated and saved at {audio_path}")
            return f"/static/audio/{audio_filename}"
        except Exception as e:
            logger.error(f"Voice generation error: {str(e)}")
            raise

    def get_current_timestamp(self):
        return datetime.utcnow().isoformat() + 'Z'