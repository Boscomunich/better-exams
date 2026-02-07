# 📚 Better Exams

> Turn study material into smarter exams — powered by AI.

**Better Exams** is a mobile-first learning platform that helps students **upload study files, generate AI-powered exams, and write them directly in-app**.  
Built with **React Native** on the frontend and **NestJS** on the backend, Better Exams focuses on making exam practice faster, more personalized, and more effective.

---

## ✨ What Problem Does Better Exams Solve?

Studying often means:

- Reading long PDFs or notes without knowing _what to practice_
- Creating mock exams manually
- Using generic quizzes that don’t match your material

**Better Exams fixes this** by transforming _your own files_ into **custom AI-generated exams** that actually reflect what you’re studying.

---

## 🚀 Key Features

### 📤 Upload Your Study Material

- Upload PDFs, documents, or notes
- Files are securely processed on the backend

### 🧠 AI-Powered Exam Generation

- Automatically generate exams from uploaded content
- Supports multiple question styles (MCQs, short answers, long-form)
- Questions are context-aware and content-specific

### ✍️ Write Exams In-App

- Clean, focused exam-taking experience
- Timed or untimed exams
- Realistic exam flow to improve retention

### 📊 Designed for Learning (Not Just Testing)

- Practice-oriented exam generation
- Built to help students _understand_ and _retain_ material

---

## 🏗️ Tech Stack

### 📱 Frontend (Mobile)

- **React Native**
- TypeScript
- Modern component-based architecture

### 🧩 Backend

- **NestJS**
- RESTful API design
- File handling & AI orchestration

### 🤖 AI

- AI-powered content analysis
- Exam and question generation from user-provided files

---

## 🧠 How It Works (High-Level)

1. **Student uploads a file**
2. **Backend processes and create a vector embeddings**
3. **students create exams by selecting the pdf**
4. **AI generates exam questions**
5. **Student writes the exam in the mobile app**

Simple flow. Powerful results.

---

## 📁 Project Structure (Simplified)

```text
better-exams
├── mobile/        # React Native app
├── backend/       # NestJS API
├── packages
└── README.md
```
