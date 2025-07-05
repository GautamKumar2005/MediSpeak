import google.generativeai as genai
import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = ""
        self.configured = False
        self.model = None
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')  # Corrected model name
                self.configured = True
                logger.info("Gemini AI initialized successfully with model gemini-2.5-flash")
            except Exception as e:
                logger.error(f"Gemini AI initialization error: {str(e)}")
        else:
            logger.warning("GEMINI_API_KEY not found. Gemini AI features disabled.")

    def is_configured(self):
        return self.configured

    def get_medical_insights(self, text, analysis_result):
        if not self.configured:
            logger.error("Gemini AI not configured: API key missing or invalid")
            return {"error": "Gemini AI not configured"}

        try:
            prompt = f"""
            As a medical AI assistant, analyze this medical report and provide insights in JSON format:

            Medical Report Text:
            {text[:1000]}  # Limit text to avoid API restrictions

            Current Analysis:
            Parameters: {json.dumps(analysis_result.get('parameters', []))}
            Summary: {analysis_result.get('summary', '')}

            Return a JSON object with:
            {{
                "summary": "Clear summary of findings",
                "disease": "Identified disease or condition",
                "recommendations": ["Recommendation 1", "Recommendation 2", ...],
                "when_to_seek_help": ["Condition 1", "Condition 2", ...],
                "follow_up": ["Follow-up action 1", "Follow-up action 2", ...]
            }}
            """
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            logger.info("Gemini insights generated successfully")
            return {
                "raw_response": response_text,
                "source": "gemini-2.5-flash"
            }
        except Exception as e:
            logger.error(f"Gemini insights error: {str(e)}")
            return {
                "error": f"Failed to get Gemini insights: {str(e)}",
                "raw_response": "",
                "source": "gemini-2.5-flash"
            }
    def generate_symptom_insights(self, symptoms, age, gender, medical_history):
        if not self.configured:
            return {"error": "Gemini AI not configured"}

        try:
            prompt = f"""
            As a medical AI assistant, analyze these health details in JSON format:

            Symptoms: {', '.join(symptoms) if symptoms else 'None provided'}
            Age: {age if age else 'Not specified'}
            Gender: {gender if gender else 'Not specified'}
            Medical History: {', '.join([h.get('title', '') for h in medical_history]) if medical_history else 'None provided'}

            Return a JSON object with:
            {{
                "insights": "Detailed analysis",
                "possible_causes": ["Cause 1", "Cause 2", ...],
                "recommended_actions": ["Action 1", "Action 2", ...],
                "warning_signs": ["Sign 1", "Sign 2", ...],
                "lifestyle_modifications": ["Modification 1", "Modification 2", ...]
            }}
            """
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            insights = json.loads(response_text) if response_text.startswith('{') else {
                'insights': response_text,
                'possible_causes': [],
                'recommended_actions': [],
                'warning_signs': [],
                'lifestyle_modifications': []
            }
            insights['disclaimer'] = 'This information is for educational purposes only. Consult a healthcare professional for medical advice.'
            insights['source'] = 'gemini-2.5-flash'
            return insights
        except Exception as e:
            logger.error(f"Symptom insights error: {str(e)}")
            return {"error": f"Failed to generate symptom insights: {str(e)}"}

    def explain_medical_terms(self, terms):
        if not self.configured:
            return {"error": "Gemini AI not configured"}

        try:
            prompt = f"""
            Explain these medical terms in simple, patient-friendly language in JSON format:

            Terms: {', '.join(terms)}

            Return a JSON object with:
            {{
                "terms": [
                    {{
                        "term": "term1",
                        "definition": "Simple definition",
                        "implications": "What it means for the patient",
                        "ranges": "Normal vs abnormal ranges (if applicable)"
                    }},
                    ...
                ]
            }}
            """
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            return {
                'explanations': json.loads(response_text) if response_text.startswith('{') else {'terms': []},
                'source': 'gemini-2.5-flash'
            }
        except Exception as e:
            logger.error(f"Medical terms explanation error: {str(e)}")
            return {"error": f"Failed to explain medical terms: {str(e)}"}