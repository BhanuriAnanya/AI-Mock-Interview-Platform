# 🤖 AI Mock Interview Platform

An AI-powered mock interview platform that helps candidates prepare for technical interviews through **resume-based question generation, AI-driven interviews, and personalized performance evaluation**.

## ✨ Features

- 📄 **Resume Analysis** — Upload a PDF resume and extract relevant candidate information.
- 🧠 **AI-Generated Questions** — Generates personalized interview questions based on the candidate's resume.
- 💻 **Technical Interview** — Includes resume-based, DSA, coding, and software-engineering questions.
- 🎤 **Interview Interaction** — Answer questions through the interview interface.
- 📊 **AI Evaluation** — Evaluates candidate responses and provides scores and detailed feedback.
- 🔐 **Secure Authentication** — User registration and login using JWT authentication.
- 🗄️ **Persistent Data** — User and interview information stored in PostgreSQL.
- ☁️ **Cloud Deployment** — Fully deployed frontend, backend, and database.

## 🧠 How It Works


User
  ↓
Register / Login
  ↓
Upload Resume
  ↓
Resume Text Extraction
  ↓
AI Resume Analysis
  ↓
10 Personalized Interview Questions
  ↓
Technical Interview
  ↓
AI Evaluation
  ↓
Score + Feedback

## 🚀 Clone & Run Locally
1. Clone the Repository
git clone https://github.com/BhanuriAnanya/AI-Mock-Interview-Platform.git
cd AI-Mock-Interview-Platform
2. Setup the Backend

Open a terminal and navigate to the backend:

cd backend
npm install

Create a .env file inside the backend folder:

DB_USER=your_database_user
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key

Start the backend:
node server.js
The backend will run on:
http://localhost:5000

Setup the Frontend
Open another terminal from the project root:
cd frontend
npm install
npm run dev

Vite will provide a local development URL, usually:
http://localhost:5173
Open that URL in your browser.


## ⚙️Environment Variables
  The backend requires the following environment variables:
   Variable	Description
DB_USER	PostgreSQL database username
DB_HOST	PostgreSQL database host
DB_NAME	PostgreSQL database name
DB_PASSWORD	PostgreSQL database password
DB_PORT	PostgreSQL database port
JWT_SECRET	Secret used for JWT authentication
OPENROUTER_API_KEY	API key used for AI services


## 🧪 API Overview
Authentication
POST /api/auth/register
POST /api/auth/login

Resume
POST /api/resume/upload

Interview
GET /api/interview/:id

Evaluation
POST /api/evaluation/evaluate

Protected Profile
GET /api/profile


## 🔮 Future Improvements
🎙️ Real-time voice interview interaction
📈 Advanced interview analytics
🎯 Difficulty-based interviews
📝 Interview history and progress tracking
🤖 Improved AI evaluation
👨‍💻 Support for additional programming languages
📊 Personalized preparation recommendations
⏱️ Timed interview sessions
📚 Question bank and practice mode

## 👩‍💻 Author
Bhanuri Ananya
AI Mock Interview Platform — an AI-powered technical interview preparation system designed to help candidates practice, evaluate, and improve their interview performance.

