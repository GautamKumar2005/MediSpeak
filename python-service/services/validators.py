import os
import logging
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

class FileValidator:
    def __init__(self):
        self.allowed_extensions = {'png', 'jpg', 'jpeg', 'pdf'}
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.allowed_mimetypes = {
            'image/jpeg', 'image/jpg', 'image/png', 'application/pdf'
        }

    def validate_file(self, file):
        try:
            if not file or file.filename == '':
                return False, "No file selected"
            if not self._allowed_file(file.filename):
                return False, f"File type not allowed. Allowed types: {', '.join(self.allowed_extensions)}"
            if hasattr(file, 'content_length') and file.content_length:
                if file.content_length > self.max_file_size:
                    return False, f"File too large. Maximum size: {self.max_file_size // (1024*1024)}MB"
            if hasattr(file, 'mimetype') and file.mimetype:
                if file.mimetype not in self.allowed_mimetypes:
                    return False, f"Invalid file type: {file.mimetype}"
            secured_filename = secure_filename(file.filename)
            if not secured_filename:
                return False, "Invalid filename"
            return True, "File is valid"
        except Exception as e:
            logger.error(f"File validation error: {str(e)}")
            return False, f"Validation error: {str(e)}"

    def _allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions

    def validate_text_content(self, text):
        if not text or len(text.strip()) < 10:
            return False, "Insufficient text content extracted"
        if len(text) > 50000:
            return False, "Text content too large"
        return True, "Text content is valid"

    def validate_analysis_request(self, request_data):
        try:
            if not isinstance(request_data, dict):
                return False, "Invalid request format"
            if 'file' not in request_data:
                return False, "No file in request"
            language = request_data.get('language', 'en')
            allowed_languages = ['en', 'hi', 'es', 'fr', 'de']
            if language not in allowed_languages:
                return False, f"Unsupported language: {language}"
            return True, "Request is valid"
        except Exception as e:
            logger.error(f"Request validation error: {str(e)}")
            return False, f"Validation error: {str(e)}"