import cv2
import numpy as np
from PIL import Image
import fitz  # PyMuPDF
import logging
import os
import easyocr

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        """Initialize EasyOCR Reader (English)"""
        try:
            self.reader = easyocr.Reader(['en'], gpu=False)
            logger.info("EasyOCR initialized successfully")
        except Exception as e:
            logger.error(f"EasyOCR initialization failed: {str(e)}")
            raise

    def extract_text(self, file_path):
        """Extract text from image or PDF file using EasyOCR or PDF text layer"""
        logger.debug(f"Extracting text from file: {file_path}")
        try:
            if not os.path.exists(file_path):
                logger.error(f"File does not exist: {file_path}")
                return ""

            # Check file extension
            file_ext = os.path.splitext(file_path)[1].lower()
            
            if file_ext in ['.pdf']:
                return self.extract_from_pdf(file_path)
            elif file_ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff']:
                return self.extract_from_image(file_path)
            else:
                logger.error(f"Unsupported file format: {file_ext}")
                return ""

        except Exception as e:
            logger.error(f"Text extraction error: {str(e)}")
            return ""

    def extract_from_image(self, image_path):
        """Extract text from image using EasyOCR"""
        logger.debug(f"Processing image: {image_path}")
        try:
            # Read image with OpenCV
            image = cv2.imread(image_path)
            if image is None:
                logger.debug("OpenCV failed to load image, trying PIL")
                pil_image = Image.open(image_path)
                image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

            # Resize image if too large (max height 1000px)
            if image.shape[0] > 1000:
                logger.debug(f"Resizing image from {image.shape[0]}px to 1000px height")
                scale = 1000 / image.shape[0]
                image = cv2.resize(image, (int(image.shape[1] * scale), 1000), interpolation=cv2.INTER_AREA)

            # Preprocess image
            processed_image = self.preprocess_image(image)

            # Extract text with EasyOCR
            result = self.reader.readtext(processed_image, detail=0, paragraph=True)
            extracted_text = " ".join(result)
            logger.info(f"Extracted text length: {len(extracted_text)}")
            return extracted_text.strip() if extracted_text else ""

        except Exception as e:
            logger.error(f"Image OCR error: {str(e)}")
            return ""

    def extract_from_pdf(self, pdf_path):
        """Extract text from PDF using EasyOCR on rendered pages"""
        logger.debug(f"Processing PDF: {pdf_path}")
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page_num in range(min(1, len(doc))):  # Process only the first page
                page = doc.load_page(page_num)
                pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
                img_data = pix.tobytes("png")
                img_array = np.frombuffer(img_data, dtype=np.uint8)
                img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                if img is None:
                    logger.error(f"Failed to decode image for page {page_num}")
                    continue
                result = self.reader.readtext(img, detail=0, paragraph=True)
                text += " ".join(result) + "\n"
            doc.close()
            logger.info(f"Extracted text length from PDF: {len(text)}")
            return text.strip() if text else ""
        except Exception as e:
            logger.error(f"PDF OCR error: {str(e)}")
            return ""
        finally:
            if 'doc' in locals():
                doc.close()

    def preprocess_image(self, image):
        """Preprocess image for better OCR"""
        logger.debug("Preprocessing image")
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            # Denoise
            denoised = cv2.fastNlMeansDenoising(gray)
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            # Morphological transformation
            kernel = np.ones((1, 1), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            return cleaned
        except Exception as e:
            logger.error(f"Image preprocessing error: {str(e)}")
            return image