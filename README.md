# CareerCraft AI

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
- **🤝 AI Job Matcher:** Upload your resume to discover fictional, yet plausible, job opportunities tailored to your skills and experience.
- **✉️ AI Cover Letter Generator:** Automatically create compelling and personalized cover letters for specific job descriptions.
- **🔒 Secure Authentication:** Standard email/password authentication to manage your profile and resumes.
- **💎 Tiered Subscriptions:** Free access with limited AI credits and Pro plans for unlimited AI-powered assistance.

### For Recruiters:
- **🎯 AI Candidate Matcher:** Upload a job description and a file of resumes to instantly find the top matching candidates with scores and justifications.
- **👥 Team Management:** Invite and manage team members under a single recruiter account.
- **📊 Admin Dashboard:** A comprehensive dashboard for administrators to view user statistics, manage users, and monitor platform activity.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **AI Integration:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google AI (Gemini)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** Ready for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 🛠️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### 1. Clone the Repository

```bash
git clone https://github.com/Hit246/careercraftai.git
cd careercraftai
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

This project requires a connection to a Firebase project to function.

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Add a Web App:** In your project settings, add a new Web App to get your Firebase configuration keys.
3.  **Enable Services:**
    -   Enable **Authentication** with the "Email/Password" sign-in method.
    -   Enable **Firestore Database**.
4.  **Set up Environment File:**
    -   Create a `.env` file in the root of the project.
    -   Copy the contents of `.env.example` into `.env`.
    -   Fill in the values with your Firebase project's configuration keys.
    -   You will also need a `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/) for the AI features to work.

Your `.env` file should look like this:

```
# Firebase Web App Config
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
# ... (and so on for all firebase keys)

# Genkit AI
GEMINI_API_KEY=your-google-ai-api-key
```

### 4. Run the Development Server

The application uses two concurrent development servers: one for the Next.js frontend and one for the Genkit AI flows.

- **Start the Next.js app:**
  ```bash
  pnpm run dev
  ```
- **In a separate terminal, start the Genkit server:**
  ```bash
  pnpm run genkit:dev
  ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. The Genkit server will run on a different port and will be proxied by the Next.js server.

## ⚙️ Firestore Security Rules

For the application to interact with Firestore securely, you must deploy the provided security rules.

1.  Open the `firestore.rules` file in the project root.
2.  Copy its contents.
3.  In the Firebase Console, navigate to **Firestore Database > Rules**.
4.  Paste the content into the editor, replacing any existing rules.
5.  Click **Publish**.

## ✍️ Author

- **Your Name**
- **GitHub:** [your-username](https://github.com/your-username)
- **LinkedIn:** [Your Name](https://www.linkedin.com/in/your-profile/)
- **Twitter:** [@your-handle](https://twitter.com/your-handle)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
