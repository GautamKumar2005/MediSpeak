import os
import time
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def cleanup_temp_files(directory, max_age_hours=24):
    """Clean up temporary files older than specified hours"""
    try:
        if not os.path.exists(directory):
            return
        
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        for filename in os.listdir(directory):
            filepath = os.path.join(directory, filename)
            if os.path.isfile(filepath):
                file_age = current_time - os.path.getmtime(filepath)
                if file_age > max_age_seconds:
                    os.remove(filepath)
                    logger.info(f"Cleaned up old temp file: {filename}")
    
    except Exception as e:
        logger.error(f"Error cleaning up temp files: {str(e)}")

def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f}{size_names[i]}"

def generate_unique_filename(original_filename):
    """Generate unique filename with timestamp"""
    timestamp = int(datetime.now().timestamp())
    name, ext = os.path.splitext(original_filename)
    return f"{name}_{timestamp}{ext}"

def is_medical_document(text):
    """Check if text appears to be from a medical document"""
    medical_keywords = [
        'patient', 'diagnosis', 'symptoms', 'treatment', 'medication',
        'blood', 'pressure', 'glucose', 'cholesterol', 'hemoglobin',
        'doctor', 'hospital', 'clinic', 'lab', 'test', 'result',
        'normal', 'abnormal', 'mg/dl', 'mmhg', 'g/dl'
    ]
    
    text_lower = text.lower()
    keyword_count = sum(1 for keyword in medical_keywords if keyword in text_lower)
    
    return keyword_count >= 3
