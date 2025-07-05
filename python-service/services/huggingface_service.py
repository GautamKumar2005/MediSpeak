import requests
import os
import logging
import time
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from transformers.utils import is_safetensors_available

logger = logging.getLogger(__name__)

class HuggingFaceService:
    def __init__(self):
        self.api_token = os.getenv("HF_API_TOKEN", "")
        self.api_url = "https://api-inference.huggingface.co/models/"
        # Only check if api_token is non-empty string
        self.configured = bool(self.api_token)
        self.local_pipelines = {}
        self._init_local_pipelines()
        if self.configured:
            logger.info("HuggingFace service initialized successfully")
        else:
            logger.warning("HuggingFace API token missing or invalid. API features disabled.")

    def is_configured(self):
        return self.configured

    def _init_local_pipelines(self):
        try:
            kwargs = {"use_safetensors": True} if is_safetensors_available() else {}
            # Use a classifier that is already fine-tuned!
            self.local_pipelines['medical_classifier'] = pipeline(
                "text-classification",
                model=AutoModelForSequenceClassification.from_pretrained(
                    "distilbert-base-uncased-finetuned-sst-2-english",
                    **kwargs
                ),
                tokenizer=AutoTokenizer.from_pretrained(
                    "distilbert-base-uncased-finetuned-sst-2-english"
                ),
                framework="pt",
                device=-1  # Use CPU
            )
            logger.info("Local medical classifier initialized (distilbert-base-uncased-finetuned-sst-2-english)")
        except Exception as e:
            logger.error(f"Could not initialize local pipelines: {str(e)}")
            self.local_pipelines = {}

    def generate_medical_image(self, text):
        if not self.configured:
            logger.warning("HuggingFace API not configured for image generation")
            return None
        try:
            headers = {"Authorization": f"Bearer {self.api_token}"}
            api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
            payload = {
                "inputs": f"Medical illustration for: {text[:100]}",
                "parameters": {
                    "num_inference_steps": 50,
                    "guidance_scale": 7.5
                }
            }
            for attempt in range(3):  # Retry up to 3 times
                try:
                    response = requests.post(api_url, headers=headers, json=payload, timeout=60)
                    response.raise_for_status()
                    image_filename = f"medical_image_{int(time.time())}.png"
                    image_path = os.path.join('static/generated', image_filename)
                    os.makedirs(os.path.dirname(image_path), exist_ok=True)
                    with open(image_path, 'wb') as f:
                        f.write(response.content)
                    logger.info(f"Image generated and saved at {image_path}")
                    return f"/static/generated/{image_filename}"
                except requests.RequestException as e:
                    logger.warning(f"Image generation attempt {attempt + 1} failed: {str(e)}")
                    if attempt == 2:
                        raise Exception(f"Image generation failed after 3 attempts: {str(e)}")
                    time.sleep(2)
        except Exception as e:
            logger.error(f"Image generation error: {str(e)}")
            return None

    def get_medical_insights(self, text):
        logger.debug("Getting medical insights")
        insights = {}
        try:
            insights['classification'] = self.classify_medical_text(text)
            insights['image_url'] = self.generate_medical_image(text)
            return insights
        except Exception as e:
            logger.error(f"HuggingFace insights error: {str(e)}")
            return {'error': f'Could not generate insights: {str(e)}'}

    def summarize_text(self, text):
        if not self.configured:
            logger.warning("HuggingFace API not configured for summarization")
            return None
        try:
            headers = {"Authorization": f"Bearer {self.api_token}"}
            api_url = self.api_url + "facebook/bart-large-cnn"
            payload = {
                "inputs": text[:1000],
                "parameters": {
                    "max_length": 150,
                    "min_length": 30,
                    "do_sample": False
                }
            }
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get('summary_text', '')
            logger.warning("No summary generated")
            return None
        except Exception as e:
            logger.error(f"Summarization error: {str(e)}")
            return None

    def analyze_sentiment(self, text):
        if not self.configured:
            logger.warning("HuggingFace API not configured for sentiment analysis")
            return None
        try:
            headers = {"Authorization": f"Bearer {self.api_token}"}
            api_url = self.api_url + "cardiffnlp/twitter-roberta-base-sentiment-latest"
            payload = {"inputs": text[:500]}
            response = requests.post(api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0]
            logger.warning("No sentiment analysis generated")
            return None
        except Exception as e:
            logger.error(f"Sentiment analysis error: {str(e)}")
            return None

    def extract_medical_entities(self, text):
        if not self.configured:
            logger.warning("HuggingFace API not configured for entity extraction")
            return None
        try:
            headers = {"Authorization": f"Bearer {self.api_token}"}
            api_url = self.api_url + "dmis-lab/biobert-base-cased-v1.1-squad"
            medical_questions = [
                "What are the medical conditions mentioned?",
                "What medications are mentioned?",
                "What symptoms are described?"
            ]
            entities = []
            for question in medical_questions:
                payload = {
                    "inputs": {
                        "question": question,
                        "context": text[:1000]
                    }
                }
                response = requests.post(api_url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
                result = response.json()
                if 'answer' in result and result['answer'].strip():
                    entities.append({
                        'question': question,
                        'answer': result['answer'],
                        'score': result.get('score', 0)
                    })
            return entities if entities else None
        except Exception as e:
            logger.error(f"Entity extraction error: {str(e)}")
            return None

    def classify_medical_text(self, text):
        logger.debug("Classifying medical text")
        try:
            if 'medical_classifier' not in self.local_pipelines:
                logger.warning("Medical classifier not initialized")
                return None
            result = self.local_pipelines['medical_classifier'](text[:512])
            return {
                'classification': result,
                'source': 'local_distilbert'
            }
        except Exception as e:
            logger.error(f"Medical classification error: {str(e)}")
            return None