
#CareerCraft AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-SDK%20v11-orange?logo=firebase)](https://firebase.google.com/)
[![Genkit AI](https://img.shields.io/badge/Genkit-AI-green?logo=google-cloud)](https://firebase.google.com/docs/genkit)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?logo=shadcn-ui&logoColor=white)](https://ui.shadcn.com/)

An AI-powered platform designed to empower job seekers and recruiters. Build stunning resumes, receive intelligent feedback, discover matching job opportunities, and streamline the hiring process.

![CareerCraft AI Screenshot](./user_image.png)

## ✨ Key Features

### For Job Seekers:
- **📄 Intuitive Resume Builder:** Create professional resumes with a live preview and customizable sections.
- **🤖 AI Resume Analyzer:** Get instant, actionable feedback on your resume's strengths, weaknesses, and areas for improvement.
- **🤝 AI Job Matcher:** Upload your resume to discover job opportunities tailored to your skills.
- **✉️ AI Cover Letter Generator:** Automatically create compelling and personalized cover letters.
- **🔒 Secure Authentication:** Standard email/password authentication.
- **💎 Tiered Subscriptions:** Free, Essentials, and Pro plans with AI credit management.

### For Recruiters:
- **🎯 AI Candidate Matcher:** Upload a job description and resumes to find the top matching candidates instantly.
- **📊 Recruiter Dashboard:** Manage your shortlisted talent and view pipeline analytics.
- **📊 Admin Dashboard:** Comprehensive oversight of users, payments, and support tickets.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI Integration:** Firebase Genkit with Gemini Models
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Payments:** Razorpay (Webhooks + Manual fallback)
- **Notifications:** Nodemailer (SMTP)

## 🛠️ Getting Started

### 1. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Public Config
NEXT_PUBLIC_FIREBASE_PROJECT_ID='...'
NEXT_PUBLIC_FIREBASE_APP_ID='...'
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET='...'
NEXT_PUBLIC_FIREBASE_API_KEY='...'
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN='...'
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID='...'

# Firebase Admin (CRITICAL for account deletion)
# Generate this in Firebase Console > Project Settings > Service Accounts
# Wrap the entire JSON content in SINGLE QUOTES.
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'

# AI & Payments
GEMINI_API_KEY='...'
NEXT_PUBLIC_RAZORPAY_KEY_ID='...'
RAZORPAY_KEY_SECRET='...'
RAZORPAY_WEBHOOK_SECRET='...'
NEXT_PUBLIC_APP_URL='http://localhost:9002'

# Admin Email Notifications (SMTP)
# For Gmail: Use 'smtp.gmail.com'
# IMPORTANT: Remove all spaces from your 16-character App Password.
SMTP_HOST='smtp.gmail.com'
SMTP_PORT=587
SMTP_USER='your-email@gmail.com'
SMTP_PASS='your16characterapppassword'
ADMIN_EMAIL='admin@careercraft.ai'
```

### 2. Run the Development Server

```bash
pnpm install
pnpm run dev
# In a separate terminal:
pnpm run genkit:dev
```

## ⚙️ Admin Setup

1. **Service Account**: The `FIREBASE_SERVICE_ACCOUNT_KEY` is required to allow the Admin Panel to delete user authentication accounts.
2. **SMTP**: Use a "Google App Password" if using Gmail. Do not use your regular password. Ensure `SMTP_PASS` has no spaces.
3. **Webhooks**: Set your Razorpay webhook URL to `https://your-domain.com/api/razorpay/webhook` and enable the `payment_link.paid` event.

## ✍️ Author
- **CHAUHAN HITARTH**
