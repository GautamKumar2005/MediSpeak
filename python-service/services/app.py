from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
import logging
import traceback
import time
import json
from ocr_service import OCRService
from medical_analyzer import MedicalAnalyzer
from gemini_service import GeminiService
from huggingface_service import HuggingFaceService as HFService

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

ocr_service = OCRService()
medical_analyzer = MedicalAnalyzer()
gemini_service = GeminiService()
hf_service = HFService()

# @app.route('/static/<path:path>')
# def serve_static(path):
#     return send_from_directory('static', path)

@app.route('/analyze-and-generate', methods=['POST'])
def analyze_and_generate():
    if 'document' not in request.files:
        logger.error("No document provided in request.files")
        return jsonify({'error': 'No document provided'}), 400

    file = request.files['document']
    language = request.form.get('language', 'en')
    logger.info(f"Processing file: {file.filename}, Language: {language}")

    temp_path = os.path.join("static/uploads", file.filename)
    os.makedirs(os.path.dirname(temp_path), exist_ok=True)
    file.save(temp_path)

    def generate():
        try:
            yield json.dumps({"status": "starting", "message": "Starting analysis..."}) + "\n"

            extracted_text = ocr_service.extract_text(temp_path)
            yield json.dumps({"status": "ocr_complete", "extracted_text": extracted_text}) + "\n"

            analysis_result = medical_analyzer.analyze_medical_content(extracted_text, language)
            yield json.dumps({"status": "analysis_complete", "analysis_result": analysis_result}) + "\n"

            gemini_insights = gemini_service.get_medical_insights(extracted_text, analysis_result)
            yield json.dumps({"status": "gemini_complete", "gemini_insights": gemini_insights}) + "\n"

            hf_insights = hf_service.get_medical_insights(extracted_text)
            hf_image_url = hf_insights.get('image_url', None)
            yield json.dumps({"status": "hf_complete", "hf_insights": hf_insights}) + "\n"

            response_data = {
                'success': True,
                'gemini_raw_response': gemini_insights.get('raw_response', 'No Gemini response available.'),
                'image_url': hf_image_url,
                'extracted_text': extracted_text,
                'parameters': analysis_result.get('parameters', []),
                'timestamp': medical_analyzer.get_current_timestamp(),
                'gemini_insights': gemini_insights
            }
            yield json.dumps({"status": "complete", "response": response_data}) + "\n"
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            yield json.dumps({"status": "error", "message": f"Streaming failed: {str(e)}"}) + "\n"

    return Response(generate(), mimetype='application/x-ndjson')
@app.route('/generate-voice', methods=['POST'])
def generate_voice():
    logger.debug("Received request to /generate-voice")
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            logger.error("No text provided in request")
            return jsonify({'error': 'No text provided'}), 400

        text = data['text'][:1000]
        language = data.get('language', 'en')
        logger.info(f"Generating voice for text (length: {len(text)}): {text[:50]}...")

        start_time = time.time()
        audio_file = medical_analyzer.generate_voice_explanation(text, language)
        elapsed_time = time.time() - start_time
        logger.info(f"Voice generation completed in {elapsed_time:.2f} seconds")

        return jsonify({
            'success': True,
            'audio_file': audio_file
        })
    except Exception as e:
        logger.error(f"Voice generation error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': f'Voice generation failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)