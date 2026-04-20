# CareerCraft AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-SDK%20v11-orange?logo=firebase)](https://firebase.google.com/)
[![Genkit AI](https://img.shields.io/badge/Genkit-AI-green?logo=google-cloud)](https://firebase.google.com/docs/genkit)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B?logo=razorpay)](https://razorpay.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://careercraftai.tech)

An AI-powered career platform built for Indian students and job seekers. Build professional resumes, receive intelligent ATS feedback, discover matching job opportunities, and streamline your hiring process — all in one place.

---

## 🌐 Live Demo

👉 **[careercraftai.tech](https://careercraftai.tech)**

---

## 1. Features Overview

### 1.1 For Job Seekers

- **📄 Resume Builder:** Create professional resumes with a live preview, customizable sections, and ATS-friendly templates.
- **🤖 AI Resume Analyzer:** Get instant, actionable feedback on your resume's strengths, weaknesses, and keyword gaps.
- **🎯 ATS Score Engine:** Receive a detailed ATS compatibility score with section-by-section breakdown.
- **🤝 AI Job Matcher:** Upload your resume to discover curated job opportunities tailored to your skill set.
- **✉️ AI Cover Letter Generator:** Automatically create compelling, personalized cover letters for any job description.
- **📥 DOCX Download:** Export your resume as a formatted `.docx` file ready for submission.
- **🔗 Shareable Resume URLs:** Generate a public link to share your resume with recruiters.
- **🔒 Secure Authentication:** Email/password and Google OAuth via Firebase Auth.
- **💎 Tiered Subscriptions:** Free, Essentials, and Pro plans with AI credit management via Razorpay.

### 1.2 For Recruiters

- **🎯 AI Candidate Matcher:** Upload a job description and multiple resumes to instantly rank the best-fit candidates.
- **📊 Recruiter Dashboard:** Manage shortlisted candidates and view pipeline analytics.
- **📊 Admin Dashboard:** Comprehensive oversight of users, payments, subscriptions, and support tickets.

---

## 2. Demo

> Live at **[careercraftai.tech](https://careercraftai.tech)** — sign up for a free account to try all features.

<!-- Add screenshots here once available -->
<!-- ![Resume Builder](./docs/screenshots/builder.png) -->
<!-- ![ATS Score](./docs/screenshots/ats-score.png) -->

---

## 3. Project Structure

```
carrercraftai/
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
├── README.md                 # This file
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS config
├── tsconfig.json             # TypeScript config
│
├── app/                      # Next.js 15 App Router
│   ├── (auth)/               # Auth pages (login, signup)
│   ├── (app)/                # Protected app pages
│   │   ├── resume-builder/   # Resume builder UI
│   │   ├── resume-analyzer/  # AI Feedback interface
│   │   ├── ats-optimizer/    # ATS scoring results
│   │   ├── job-matcher/      # Job matching interface
│   │   └── cover-letter-generator/ # Cover letter generator
│   ├── admin/                # Admin dashboard
│   ├── api/                  # API route handlers
│   │   ├── razorpay/         # Payment webhook + order creation
│   │   └── admin/            # Admin-only endpoints (broadcast, etc.)
│   └── layout.tsx            # Root layout
│
├── components/               # Reusable UI components
│   ├── ui/                   # shadcn/ui base components
│   ├── admin/                # Admin-specific components
│   └── icons.tsx             # Custom icon components
│
├── lib/                      # Core utilities and helpers
│   ├── firebase.ts           # Firebase client config
│   ├── genkit.ts             # Genkit AI config
│   ├── razorpay.ts           # Payment logic
│   └── actions.ts            # Server actions
│
└── public/                   # Static assets
```

---

## 4. Architecture & Workflows

### 4.1 AI Resume Analysis Flow

*How a resume goes from upload to ATS score.*

```
User Uploads Resume (PDF)
        ↓
Data URI generated (client-side)
        ↓
Genkit Flow triggered (Server Action)
        ↓
Gemini Pro parses resume content
        ↓
ATS scoring engine runs (keyword match, format check, section detection)
        ↓
Results persisted to Firestore (optional history)
        ↓
Score + feedback rendered in dashboard
```

### 4.2 Payment & Subscription Flow

*How credit purchases and plan upgrades work.*

```
User selects plan
        ↓
Server Action creates Razorpay Payment Link
        ↓
User completes payment on Razorpay
        ↓
Razorpay sends webhook to /api/razorpay/webhook
        ↓
Signature verified + logic check
        ↓
Firestore user document updated (plan + credits)
        ↓
User gains access to premium features
```

### 4.3 Authentication Flow

```
Email/Password OR Google OAuth
        ↓
Firebase Auth (client SDK)
        ↓
onAuthStateChanged listener in use-auth hook
        ↓
User document created/synced in Firestore
        ↓
Session persisted via client-side SDK
        ↓
Middleware protects dashboard routes
```

---

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Firebase Genkit with Gemini 1.5 Pro |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Email + Google OAuth) |
| Storage | Firebase Storage |
| Payments | Razorpay (Webhooks + Manual fallback) |
| Email (Onboarding) | Resend |
| Email (Alerts) | Nodemailer (SMTP) |
| Deployment | Vercel |

---

## 6. API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/send-welcome-email` | POST | Trigger onboarding email sequence via Resend |
| `/api/razorpay/webhook` | POST | Handle Razorpay payment status updates |
| `/api/admin/send-broadcast` | POST | Send batch emails to selected user segments |

---

## 7. Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (Auth + Firestore + Storage enabled)
- Google Gemini API key
- Razorpay account (for payments)
- Resend account (for email)

### Installation

```bash
git clone https://github.com/Hit246/carrercraftai.git
cd carrercraftai
npm install
cp .env.example .env
# Fill in your environment variables (see Section 8)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

In a separate terminal, start the Genkit AI development server:

```bash
npm run genkit:dev
```

---

## 8. Environment Variables

Copy `.env.example` and fill in your values:

```env
# ── Firebase Client (Public) ──────────────────────────────
NEXT_PUBLIC_FIREBASE_PROJECT_ID_NEW='your-project-id'
NEXT_PUBLIC_FIREBASE_APP_ID_NEW='your-app-id'
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_NEW='your-bucket.appspot.com'
NEXT_PUBLIC_FIREBASE_API_KEY_NEW='your-api-key'
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_NEW='your-project.firebaseapp.com'
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_NEW='your-sender-id'

# ── Firebase Admin (Server) ───────────────────────────────
FIREBASE_SERVICE_ACCOUNT_KEY_NEW='{"type":"service_account",...}'

# ── AI ────────────────────────────────────────────────────
GEMINI_API_KEY_NEW='your-gemini-key'

# ── Payments ──────────────────────────────────────────────
NEXT_PUBLIC_RAZORPAY_KEY_ID_NEW_NEW='rzp_live_...'
RAZORPAY_KEY_SECRET_NEW='your-secret'
RAZORPAY_WEBHOOK_SECRET_NEW='your-webhook-secret'

# ── Email ─────────────────────────────────────────────────
RESEND_API_KEY_NEW='re_...'
SMTP_HOST_NEW='smtp.gmail.com'
SMTP_PORT=587
SMTP_USER_NEW='your-email@gmail.com'
SMTP_PASS_NEW='your-16-char-app-password'
ADMIN_EMAIL='support@careercraftai.tech'

# ── App ───────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL='https://careercraftai.tech'
```

---

## 9. Usage Guide

### Build a Resume
1. Go to **Dashboard → Resume Builder**
2. Fill in your details across sections (Personal, Experience, Education, Skills)
3. Preview updates in real-time on the right panel
4. Download as `.docx` or generate a shareable link

### Get Your ATS Score
1. Go to **Dashboard → ATS Optimizer**
2. Upload your resume PDF or use your built resume
3. Paste the job description you're targeting
4. Review your score, keyword gaps, and improvement suggestions

### Match Jobs to Your Profile
1. Go to **Dashboard → Job Matcher**
2. Upload your resume
3. Browse AI-curated job recommendations ranked by fit percentage

### Generate a Cover Letter
1. Go to **Dashboard → Cover Letter Generator**
2. Paste the job description
3. Review and edit the AI-generated letter
4. Copy the final version for your application

---

## 10. Subscription Plans

| Feature | Free | Essentials | Pro |
|---------|------|-----------|-----|
| Resume Builder | ✅ | ✅ | ✅ |
| AI Credits | 5/month | 50 + Previous | Unlimited |
| Job Matches | Credits | Credits | Unlimited |
| ATS Optimization | Credits | Credits | Unlimited |
| DOCX Export | ✅ | ✅ | ✅ |
| Shareable URL | ✅ | ✅ | ✅ |
| Candidate Matcher | ❌ | ❌ | Recruiter Only |

---

## 11. Deployment

The app is deployed on **Vercel** with automatic deployments on every push to `main`.

```bash
# Production build
npm run build
npm run start

# Deploy via Vercel CLI
vercel --prod
```

Add all variables from Section 8 under Vercel → Project → Settings → Environment Variables.

---

## 12. Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit using conventional commits (`git commit -m "feat: add X"`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 13. Legal

This platform is built for legitimate career assistance. All AI-generated content (resumes, cover letters) is a starting point — users are responsible for the accuracy and truthfulness of their applications.

---

## 14. License

MIT © [Hitarth Chauhan](https://github.com/Hit246)

---

## ✍️ Author

**Hitarth Chauhan**
[github.com/Hit246](https://github.com/Hit246) · [linkedin.com/in/chauhanhitarth6](https://linkedin.com/in/chauhanhitarth6) · [careercraftai.tech](https://careercraftai.tech)

---

*Last Updated: March 2026*