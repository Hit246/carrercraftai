# CareerCraft AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-SDK%20v11-orange?logo=firebase)](https://firebase.google.com/)
[![Genkit AI](https://img.shields.io/badge/Genkit-AI-green?logo=google-cloud)](https://firebase.google.com/docs/genkit)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?logo=shadcn-ui&logoColor=white)](https://ui.shadcn.com/)

An AI-powered platform designed to empower job seekers and recruiters. Build stunning resumes, receive intelligent feedback, discover matching job opportunities, and streamline the hiring process.

## 🌐 Live Demo

👉 [careercraftai.tech](https://careercraftai.tech)

## ✨ Key Features

### For Job Seekers:
- **📄 Intuitive Resume Builder:** Create professional resumes with a live preview and customizable sections.
- **🤖 AI Resume Analyzer:** Get instant, actionable feedback on your resume's strengths, weaknesses, and areas for improvement.
- **🤝 AI Job Matcher:** Upload your resume to discover job opportunities tailored to your skills.
- **✉️ AI Cover Letter Generator:** Automatically create compelling and personalized cover letters.
- **🔒 Secure Authentication:** Email/password and Google OAuth.
- **💎 Tiered Subscriptions:** Free, Essentials, and Pro plans with AI credit management.

### For Recruiters:
- **🎯 AI Candidate Matcher:** Upload a job description and resumes to find the top matching candidates instantly.
- **📊 Recruiter Dashboard:** Manage your shortlisted talent and view pipeline analytics.
- **📊 Admin Dashboard:** Comprehensive oversight of users, payments, and support tickets.

## 📖 Usage

1. Sign up for a free account at [careercraftai.tech](https://careercraftai.tech)
2. Upload or build your resume using the Resume Builder
3. Run the AI Analyzer to get instant ATS feedback and improvement suggestions
4. Use Job Matcher to find roles that match your skills and experience
5. Generate a tailored cover letter for any job in seconds

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Firebase Genkit with Gemini Models |
| Backend | Firebase (Auth, Firestore, Storage) |
| Payments | Razorpay (Webhooks + Manual fallback) |
| Email | Resend (onboarding drips) + Nodemailer (SMTP alerts) |
| Deployment | Vercel |

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Firebase project
- Google Gemini API key
- Razorpay account

### Installation

```bash
git clone https://github.com/Hit246/carrercraftai.git
cd carrercraftai
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

In a separate terminal, start the Genkit AI server:

```bash
npm run genkit:dev
```

### Environment Variables

Copy `.env.example` and fill in your values. Key variables:

```env
# Firebase Public Config
NEXT_PUBLIC_FIREBASE_PROJECT_ID='...'
NEXT_PUBLIC_FIREBASE_APP_ID='...'
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET='...'
NEXT_PUBLIC_FIREBASE_API_KEY='...'
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN='...'
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID='...'

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'

# AI & Payments
GEMINI_API_KEY='...'
NEXT_PUBLIC_RAZORPAY_KEY_ID='...'
RAZORPAY_KEY_SECRET='...'
RAZORPAY_WEBHOOK_SECRET='...'
NEXT_PUBLIC_APP_URL='https://careercraftai.tech'

# Email
RESEND_API_KEY='re_...'
SMTP_HOST='smtp.gmail.com'
SMTP_PORT=587
SMTP_USER='your-email@gmail.com'
SMTP_PASS='your16characterapppassword'
ADMIN_EMAIL='admin@careercraftai.tech'
```

## 📁 Project Structure

```
/app          → Next.js App Router pages and API routes
/components   → Reusable UI components
/lib          → Utilities, Firebase config, AI helpers
/public       → Static assets
```

## 📄 License

MIT © [Hitarth Chauhan](https://github.com/Hit246)

## ✍️ Author

**Hitarth Chauhan** — [github.com/Hit246](https://github.com/Hit246) · [linkedin.com/in/chauhanhitarth6](https://linkedin.com/in/chauhanhitarth6)