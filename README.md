# 🩺 MediSpeak – AI-Powered Medical Report Simplification Tool

MediSpeak is an advanced AI-powered web platform built to **empower patients by making complex medical information clear, actionable, and accessible**. Whether you’re facing a dense lab report, a handwritten prescription, or an unfamiliar diagnosis, MediSpeak bridges the gap between medical jargon and patient understanding.

---

## 🚀 Key Features

- **📄 Effortless Medical Report Upload**
  - Supports PDFs, images, and scans of prescriptions, lab results, or discharge summaries.
  - Handles handwritten and printed documents with robust OCR.
- **🔍 Automated Extraction & Summarization**
  - Uses state-of-the-art OCR (PaddleOCR) and NLP to extract crucial health indicators and findings.
  - Summarizes lengthy, complex information into concise, patient-friendly insights.
- **🧠 Medical Jargon Simplification**
  - Translates technical terms and abbreviations into plain English.
  - Context-aware explanations for diagnoses, medications, and recommendations.
  - Multilingual support for regional languages via Google Translate API & IndicTrans.
- **📊 Interactive Visualization**
  - Transforms report metrics and trends into easy-to-understand charts and graphs (Chart.js/D3.js).
  - Highlights abnormal values, reference ranges, and changes over time for clarity.
  - Enables comparison of past and present reports.
- **💡 Personalized Health Suggestions**
  - Offers actionable tips, lifestyle recommendations, and follow-up questions tailored to the user’s report.
  - Flags urgent findings and suggests when to seek medical attention.
  - Provides educational resources for deeper understanding.
- **🔒 Privacy-First Design**
  - All uploads are encrypted and processed securely.
  - No personal data stored without explicit consent.
  - Complies with local and global health data regulations.
- **🤖 Telegram Bot Integration**
  - Access MediSpeak via Telegram for instant, on-the-go health report simplification.
  - Uses Telegram Bot API for secure, interactive messaging and report processing.

---

## 🌟 What Makes MediSpeak Unique?

- **Inclusive Design**: Tailored for non-English speakers, low-literacy users, and rural communities.
- **Multi-Modal Input**: Accepts voice notes (converted to text), images, and typed queries.
- **Seamless User Experience**: Clean, intuitive interface for quick uploads and instant results.
- **AI-Powered Insights**: Combines OCR, NLP, and domain-specific AI models for maximum accuracy.
- **Action-Oriented**: Doesn’t just explain – guides users towards healthier choices and next steps.
- **Accessible Anywhere**: Optimized for mobile, low-bandwidth environments, and available via web and messaging bots (e.g., Telegram integration).

---

## 🛠️ Tech Stack

| Domain              | Technology Used                            |
|---------------------|--------------------------------------------|
| Frontend (Web)      | React.js, Tailwind CSS, JavaScript (MERN)  |
| Backend/API         | Node.js, Express.js, MongoDB (MERN)        |
| AI/NLP Models       | Python (FastAPI/Flask), HuggingFace, OpenAI GPT-4, Gemini 2.5 Flash |
| OCR & Image Parsing | PaddleOCR, OpenCV                          |
| Visualization       | Chart.js, D3.js                            |
| Language Support    | Google Translate API, IndicTrans           |
| Messaging Bot       | Telegram Bot API                           |
| Authentication      | Google OAuth Client ID                     |
| Security            | HTTPS, AES encryption, JWT                 |
| Deployment          | Vercel / Streamlit / Docker                |

---

## 🛠️ How MediSpeak Works

1. **Upload or Capture Medical Report**
   - Drag & drop, snap a photo, or upload a PDF/image.
2. **AI-Driven Processing**
   - OCR extracts text from even poor-quality scans or handwritten notes.
   - NLP models (HuggingFace, OpenAI, Gemini) identify and summarize key findings, diagnoses, and test results.
3. **Plain-Language Explanation**
   - Technical terms are broken down into everyday language.
   - Visual cues and tooltips clarify unfamiliar concepts.
4. **Insightful Visualization**
   - Interactive charts display trends in blood counts, sugar levels, cholesterol, and more.
   - Visual warnings for out-of-range values.
5. **Personalized Guidance**
   - Suggestions based on individual metrics and patterns.
   - Follow-up questions to ask your doctor.
   - Lifestyle and wellness tips.
6. **Download, Share, or Continue Chat**
   - Save your simplified report, share with family, or ask further questions via integrated chat or Telegram bot.

---

## 🔗 Example Use Cases

- **Patients**: Understand your test results without medical background.
- **Families**: Help elderly relatives decipher hospital paperwork.
- **Clinics/NGOs**: Support rural or low-literacy patients at community health camps.
- **Telemedicine Platforms**: Integrate as a value-add for remote consultations.

---

## 📈 Impact

- **Reduces anxiety and confusion** for patients facing medical paperwork.
- **Improves health literacy** and engagement.
- **Bridges the urban-rural healthcare divide** with technology.
- **Empowers proactive health management** through instant, actionable knowledge.

---

## ⚙️ Installation & Setup Guide

### 1. **Clone the Repository**

```bash
git clone https://github.com/GautamKumar2005/MediSpeak.git
cd MediSpeak
```

---

### 2. **Install Python & Anaconda (recommended for AI backend)**

- [Download Anaconda](https://www.anaconda.com/products/distribution) and install for Python 3.x.
- Create and activate the environment:

```bash
conda create -n medispeak python=3.10
conda activate medispeak
```

---

### 3. **Install Python Dependencies**

```bash
cd backend
pip install -r requirements.txt
# Example requirements.txt includes:
# fastapi, uvicorn, paddleocr, opencv-python, google-cloud-translate, transformers, requests, python-dotenv, python-telegram-bot
```

---

### 4. **Install Node.js & JavaScript Dependencies**

- Install Node.js (v16+ recommended)
- Setup the frontend:

```bash
cd ../frontend
npm install
```

- Setup the backend (if using Node/Express for API):

```bash
cd ../backend
npm install
```

---

### 5. **Setup Environment Variables**

#### **Create a `.env` file in the backend directory with the following:**

```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
HUGGINGFACE_API_TOKEN=your_huggingface_api_token
GEMINI_API_KEY=your_gemini_25_flash_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
SECRET_KEY=your_secret_key_for_jwt
```

- **Get your credentials:**
    - **MongoDB URI:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    - **Google Client ID:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
    - **Google Translate API Key:** [Google Cloud Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com)
    - **HuggingFace API Token:** [HuggingFace Account](https://huggingface.co/settings/tokens)
    - **Gemini 2.5 Flash API Key:** [Google Gemini](https://aistudio.google.com/app/apikey)
    - **Telegram Bot Token:** [BotFather on Telegram](https://core.telegram.org/bots#6-botfather)

---

### 6. **How to Run**

#### **Python AI Backend**
```bash
# In backend directory
conda activate medispeak
uvicorn app:app --reload  # Replace 'app' with your FastAPI/Flask main file
```

#### **Node.js/Express Backend**
```bash
# In backend directory (if using Express for APIs)
npm start
```

#### **Frontend (React)**
```bash
cd frontend
npm start
# Open http://localhost:3000
```

#### **Telegram Bot**
```bash
# In telegram-bot directory (if separate)
python index.py
```

---

### 7. **Optional: Run with Docker**

```bash
# (If Dockerfile and docker-compose.yml provided)
docker-compose up --build
```

---

## 🔑 API Integration Notes

- **Google Translate API**: Used for multilingual support.
- **HuggingFace API**: Used for advanced NLP (summarization, explanation).
- **Gemini 2.5 Flash**: Used for high-performance AI Q&A.
- **Telegram Bot API**: Enables chatbot interactions on Telegram.
- All API keys/tokens managed securely in `.env` and **never committed to source control**.

---

## 🐍 Example `.env` (Python backend)

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medispeak
GOOGLE_CLIENT_ID=xxxxxxxxx-xxxxx.apps.googleusercontent.com
GOOGLE_TRANSLATE_API_KEY=AIzaSyDxxxxxxx
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyB-xxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
SECRET_KEY=supersecretjwtkey
```

---

## 🏃‍♂️ Quick Start

1. Fill in `.env` in the backend with all API keys and credentials.
2. Start Python backend (`uvicorn app:app --reload`)
3. Start Node.js backend (if needed) (`npm start`)
4. Start frontend (`npm start`)
5. Start Telegram bot (`python index.py`)
6. Open [http://localhost:3000](http://localhost:3000) and use MediSpeak!

---

## ℹ️ Troubleshooting

- Ensure Anaconda environment is activated when running Python backend.
- Double-check `.env` variables are present and correct.
- For any API errors, verify your API keys and billing status on provider dashboards.
- Make sure Telegram bot token is valid and not shared publicly.

---

## 🔮 Future Roadmap

- [ ] Voice-to-text medical queries and hands-free operation.
- [ ] Support for more regional languages and dialects.
- [ ] Integration with wearable health devices.
- [ ] Automated appointment & follow-up reminders.
- [ ] AI-driven risk prediction & triage suggestions.

---

## 🛡️ Data Privacy & Ethics

- **Encryption**: All uploads and results are encrypted in transit and at rest.
- **Consent-Based Storage**: User data is not retained unless explicitly allowed.
- **Transparency**: Clear explanations of AI limitations and recommendations to consult healthcare professionals.

---

## 🤝 Get Involved

- **Open Source Collaboration**: Contributions welcome!
- **API Partnerships**: Integrate MediSpeak’s engine into your health platform.
- **Feedback & Support**: Use GitHub Issues for bugs or enhancement requests.

---

## 📬 Contact & Demo

- **GitHub:** [github.com/GautamKumar2005/MediSpeak](https://github.com/GautamKumar2005/MediSpeak)
- **Telegram Bot:** [@MediSpeakBot](https://t.me/MediSpeakBot) *(replace with your bot link)*
  
---

> **MediSpeak: Making Medical Knowledge Truly Universal.**
