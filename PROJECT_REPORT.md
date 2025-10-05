
# CareerCraft AI: Project Report

**Author:** CHAUHAN HITARTH  
**Date:** October 26, 2023

---

## 1. Project Overview

### 1.1 Introduction

CareerCraft AI is an advanced, AI-powered platform designed to bridge the gap between job seekers and recruiters. In today's competitive job market, creating a standout resume and finding the right fit for a role are significant challenges. CareerCraft AI addresses these challenges by providing intelligent tools for resume building, analysis, and job matching, empowering users to navigate their career paths with confidence.

### 1.2 Vision & Goals

The vision behind CareerCraft AI is to democratize career coaching and recruitment assistance through the power of generative AI. The primary goals are:

-   **For Job Seekers:** To provide tools that help them craft professional, effective resumes, receive actionable feedback, and discover relevant job opportunities.
-   **For Recruiters:** To streamline the hiring process by offering intelligent tools for matching candidates to job descriptions, saving time and improving the quality of hires.
-   **Overall:** To create a seamless, intuitive, and data-driven ecosystem for career development and talent acquisition.

---

## 2. Key Features

The platform is divided into two main user categories: Job Seekers and Recruiters, with a suite of features tailored for each.

### 2.1 For Job Seekers

-   **📄 Intuitive Resume Builder:** A user-friendly interface with a live preview for creating and managing multiple versions of a professional resume.
-   **🤖 AI Resume Analyzer:** Provides instant, detailed feedback on a resume's strengths, weaknesses, formatting, and keyword optimization, along with actionable suggestions for improvement.
-   **🎯 ATS Optimizer:** Compares a resume against a specific job description to calculate an ATS (Applicant Tracking System) match score and identify missing keywords.
-   **🤝 AI Job Matcher:** Analyzes a user's resume to suggest a list of fictional, yet plausible, job opportunities that align with their skills and experience.
-   **✉️ AI Cover Letter Generator:** Automatically generates a personalized and compelling cover letter based on the user's resume and a target job description.
-   **💎 Tiered Subscription Model:**
    -   **Free:** Basic access with limited AI credits for entry-level users.
    -   **Essentials & Pro:** Advanced features, unlimited AI credits, and more resume storage for active job seekers and professionals.

### 2.2 For Recruiters

-   **🎯 AI Candidate Matcher:** Uploads a job description and multiple resume files to instantly receive a ranked list of the most suitable candidates, complete with match scores and justifications.
-   **✍️ AI Candidate Summarizer:** Generates a concise, 3-sentence summary for any uploaded resume, highlighting key skills, achievements, and potential concerns.
-   **👥 Team Management:** Allows users on the Recruiter plan to create a team, invite members via email, and manage them under a single account.

### 2.3 Administrative Features

-   **📊 Admin Dashboard:** A comprehensive panel for administrators to monitor user statistics (total users, plan distribution), view recent sign-ups, and manage the platform.
-   **⚙️ User & Subscription Management:** Admins can view all users, manage their subscription plans, and approve or reject upgrade requests.
-   **🎫 Support Ticket System:** A built-in system for users to submit support requests and for admins to manage and respond to them.
-   **💳 Payment Settings:** Admins can configure the UPI ID and QR code used for subscription payments.

---

## 3. Tech Stack

CareerCraft AI is built on a modern, robust, and scalable technology stack:

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **AI Integration:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google AI (Gemini Models)
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, and Storage)
-   **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **Icons:** [Lucide React](https://lucide.dev/)

---

## 4. System Architecture

The application is architected with a clear separation of concerns between the frontend, backend, and AI services.

-   **Frontend (Client-Side):** The user interface is built as a Next.js application. It uses Server Components for performance and Client Components for interactivity. All UI, state management, and user interactions are handled within the React ecosystem.
-   **Backend (Server-Side):** Firebase serves as the primary backend, providing:
    -   **Firebase Authentication:** For secure user registration and login (Email/Password).
    -   **Firestore:** A NoSQL database for storing all application data, including user profiles, resumes, teams, and support tickets.
    -   **Firebase Storage:** For storing user-uploaded files like payment proofs and profile pictures.
-   **AI Layer (Genkit Flows):** All generative AI functionality is encapsulated in server-side "flows" managed by Firebase Genkit. These flows are TypeScript functions that interact with the Google Gemini API to perform tasks like resume analysis, job matching, and text generation. The Next.js frontend communicates with these flows via server actions.

---

## 5. Database Schema

The Firestore database is structured around several core collections.

-   **`users`**: Stores individual user data, including `email`, `plan`, `credits`, `teamId`, and `hasCompletedOnboarding` status. It also contains the `resumeVersions` subcollection.
-   **`users/{userId}/resumeVersions`**: A subcollection where each document represents a complete, structured version of a user's resume, including all sections like experience, education, and projects.
-   **`teams`**: Stores information about teams created by users on the "Recruiter" plan, including the `owner`'s UID. It contains a `members` subcollection.
-   **`teams/{teamId}/members`**: A subcollection where each document represents an invited team member, storing their `email`, `role`, and `uid` (once they sign up).
-   **`settings`**: A collection for global application settings. It contains a singleton document named `payment` which stores the `upiId` and `qrCodeImageUrl` for subscription payments.
-   **`supportRequests`**: Stores all support tickets submitted by users, including metadata like `userId`, `subject`, `status`, and `category`. It contains a `history` subcollection for the conversation thread.

---

## 6. Data Flow Diagrams (DFD)

This section describes the primary data flows for key application processes.

### 6.1 User Registration & Subscription Upgrade

1.  **User Signup:** A new user signs up. The system creates a user in Firebase Auth and a corresponding document in the `users` collection with a `free` plan.
2.  **Request Upgrade:** The user selects a paid plan. The UI displays payment details fetched from the `settings/payment` document.
3.  **Confirm Payment:** The user uploads a payment proof screenshot to Firebase Storage and confirms. The system updates their `users` document to `plan: 'pending'` and stores the `paymentProofURL`.
4.  **Admin Approval:** An admin reviews pending requests from the Admin Panel. Upon approval, the admin updates the user's `plan` in Firestore to the requested tier (`pro` or `recruiter`).

### 6.2 Resume Management

1.  **Load Resume:** When the user opens the resume builder, the application fetches all documents from the `users/{userId}/resumeVersions` subcollection.
2.  **Edit & Preview:** The user edits the resume form fields on the left. The state is updated in real-time, and the live preview on the right reflects the changes.
3.  **Save Version:** When "Save" is clicked, the system updates the current resume version document in Firestore with the new data.
4.  **Save as New:** When "Save as New" is clicked, the system creates a new document in the `resumeVersions` subcollection. An AI flow (`suggestResumeVersionName`) is called to generate a descriptive name for the new version.

### 6.3 AI Feature Usage (e.g., Resume Analyzer)

1.  **Submit for Analysis:** The user uploads a resume PDF via the Resume Analyzer page.
2.  **Credit Check:** The system checks if the user has sufficient `credits` or an unlimited plan by reading their `users` document.
3.  **Call AI Flow:** The frontend calls the `analyzeResumeAction`, which executes the `analyzeResume` Genkit flow, sending the resume data to the Gemini model.
4.  **Decrement Credit:** If the user is on a limited plan, their `credits` count in the `users` document is decremented.
5.  **Display Results:** The AI-generated analysis (strengths, weaknesses, suggestions) is returned to the frontend and displayed to the user.

---

## 7. Future Scope & Potential Enhancements

CareerCraft AI has a strong foundation that can be extended with additional features:

-   **Automated Payment Gateway:** Integrate a payment gateway like Stripe or Razorpay to automate the subscription process and eliminate the need for manual payment verification.
-   **Resume Performance Analytics:** Track which resume versions get more views or "matches" to provide users with data-driven insights.
-   **Mock Interviews:** An AI agent that simulates a job interview based on the user's resume and a job description, providing feedback on their answers.
-   **Job Board Integration:** Integrate with real job boards to show actual job listings instead of fictional ones.
-   **Advanced Team Analytics:** Provide recruiters with more detailed analytics on their team's performance, candidate pipelines, and hiring trends.
-   **Social Profile Integration:** Allow users to import data from LinkedIn to auto-fill their resumes.
