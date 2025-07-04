# 🩺 MediSpeak – AI-Powered Medical Report Simplification Tool

MediSpeak is an advanced AI-powered web platform built to **empower patients by making complex medical information clear, actionable, and accessible**. Whether you’re facing a dense lab report, a handwritten prescription, or an unfamiliar diagnosis, MediSpeak bridges the gap between medical jargon and patient understanding.

---

## 🚀 Key Features

- **📄 Effortless Medical Report Upload**
- **🔍 Automated Extraction & Summarization**
- **🧠 Medical Jargon Simplification**
- **📊 Interactive Visualization**
- **💡 Personalized Health Suggestions**
- **🔒 Privacy-First Design**

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
| Authentication      | Google OAuth Client ID                     |
| Deployment          | Vercel / Streamlit / Docker                |

---

## ⚙️ Installation & Setup Guide

### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/medispeak.git
cd medispeak
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
# fastapi, uvicorn, paddleocr, opencv-python, google-cloud-translate, transformers, requests, python-dotenv
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
SECRET_KEY=your_secret_key_for_jwt
```

- **Get your credentials:**
    - **MongoDB URI:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    - **Google Client ID:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
    - **Google Translate API Key:** [Google Cloud Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com)
    - **HuggingFace API Token:** [HuggingFace Account](https://huggingface.co/settings/tokens)
    - **Gemini 2.5 Flash API Key:** [Google Gemini](https://aistudio.google.com/app/apikey)
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
- **Gemini 2.5 Flash**: Used for high-performance AI Q&A (replace default OpenAI endpoint in Python code).
- All API keys/tokens managed securely in `.env` and **never committed to source control**.

---

## 🐍 Example `.env` (Python backend)

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medispeak
GOOGLE_CLIENT_ID=xxxxxxxxx-xxxxx.apps.googleusercontent.com
GOOGLE_TRANSLATE_API_KEY=AIzaSyDxxxxxxx
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyB-xxxxxxxxxxxxxxxxxxxxxxxxxxx
SECRET_KEY=supersecretjwtkey
```

---

## 🏃‍♂️ Quick Start

1. Fill in `.env` in the backend with all API keys and credentials.
2. Start Python backend (`uvicorn app:app --reload`)
3. Start Node.js backend (if needed) (`npm start`)
4. Start frontend (`npm start`)
5. Open [http://localhost:3000](http://localhost:3000) and use MediSpeak!

---

## ℹ️ Troubleshooting

- Ensure Anaconda environment is activated when running Python backend.
- Double-check `.env` variables are present and correct.
- For any API errors, verify your API keys and billing status on provider dashboards.

---

## 🤝 Get Involved

- **Open Source Collaboration**: PRs welcome!
- **API Integrations**: Add support for more languages, models, or EHR integrations.
- **Feedback & Support**: Use GitHub Issues for bugs or enhancement requests.

---

> **MediSpeak: Making Medical Knowledge Truly Universal.**
