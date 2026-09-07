# Campus Companion - Smart Student Dashboard

A full-stack, enterprise-grade web application designed to centralize student productivity, academic tracking, and studying workflows into a single cohesive platform.

## Overview
Campus Companion provides a modern interface built with React and Tailwind CSS, backed by a robust Node.js and Express API. It solves common campus life problems by integrating robust note-taking alongside file attachments, real-time assignment tracking, analytical attendance monitoring, and a fully integrated AI study assistant powered by Google Gemini.

## Core Features

- **Authentication System**
  - Secure Login and Signup routing.
  - JWT-based authentication and Bcrypt password hashing.
  - State management through React Context API.

- **Notes Management System**
  - Create, view, search, and delete categorized class notes.
  - **Native File Uploads**: Attach study materials natively (powered by Multer). Uploaded files are served directly from the backend to the UI with one-click download access.

- **Task & Assignment Tracker**
  - Interactive dashboard to manage upcoming assignments and deadlines.
  - Automated visual highlighting for overdue tasks.
  - Single-click completion toggles.

- **Attendance Analytics**
  - Dynamic monitoring system for recording classes attended versus total classes.
  - Automated mathematical progression bars.
  - Visual danger indicators for subjects dropping below the universal 75% attendance threshold.

- **AI Study Assistant**
  - Dedicated chat interface integrating Google's Generative AI API (Gemini 2.5).
  - Designed to generate concept summaries, solve problems, and structure study plans.
  - **Image Generation Engine**: The AI model is uniquely instructed to act as a prompt engineer for image requests, automatically constructing valid image generation endpoints (via pollinations.ai) that render natively in the chat interface as standard markdown images.

- **UI/UX Design**
  - Fully responsive, glassmorphism-inspired components.
  - Custom brand color palette mapped natively in Tailwind configuration.
  - Integrated system-wide Dark Mode toggle capabilities.

## Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Axios, Lucide React, React Router Dom.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose ORM.
- **AI Integration**: @google/generative-ai (Gemini 2.5 Flash).
- **Storage**: Disk-based static file serving (Multer).

## Environment Configuration

A `.env` file is required in the `backend` directory to map sensitive operational data:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus-companion
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key

# Password reset email delivery
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password_or_app_password
SMTP_FROM=Campus Companion <your_email@example.com>

# Optional SMS delivery through Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number
```

## Setup Instructions

Ensure Node.js and MongoDB are installed on the host system prior to execution.

1. **Start the Backend Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend will bootstrap on `http://localhost:5000` and confirm its connection to the local MongoDB instance.

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The Vite development server will mount the user interface on `http://localhost:5173`.

## Architecture Details
The project utilizes a monorepo-style structure separating `frontend/` and `backend/` concerns. The React application exclusively interacts through the REST API endpoints governed by the Express router, with protected routes enforcing valid JWT Bearer tokens attached to all state-mutating requests. File uploads are sanitized and stored locally within `/backend/uploads`.
