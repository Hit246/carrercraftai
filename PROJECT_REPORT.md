# CareerCraft AI - Project Report

**Author:** CHAUHAN HITARTH  
**Date:** October 26, 2023

---

## 1. Introduction

### Project Profile

*   **1. Project Title**
    CareerCraft AI – An AI-Powered Career Platform

*   **2. Objective**
    The objective of CareerCraft AI is to deliver a modern, intelligent platform to empower job seekers and streamline the recruitment process. The system provides a suite of AI-driven tools for resume building, analysis, and job matching, alongside a dedicated feature set for recruiters to efficiently screen candidates.

    Key goals include:
    *   Providing a seamless resume building and management experience.
    *   Offering AI-powered analysis and optimization for resumes and cover letters.
    *   Supporting secure user authentication and tiered subscription plans.
    *   Delivering an intuitive and responsive user interface for both job seekers and recruiters.
    *   Leveraging Firebase and Genkit for a scalable, serverless backend and AI integration.

*   **3. Developed By**
    *   CHAUHAN HITARTH

*   **4. Frontend Technologies**
    *   **Next.js (React):** A component-based framework for building fast, server-rendered applications.
    *   **Tailwind CSS:** A utility-first CSS framework for rapid and responsive UI development.
    *   **shadcn/ui:** A collection of accessible and reusable UI components.
    *   **TypeScript:** For static typing and improved code quality.

*   **5. Backend Technologies**
    *   **Firebase:** Provides authentication, Firestore (NoSQL database), and file storage.
    *   **Genkit (Google AI):** A framework for building production-ready AI flows with Gemini models.
    *   **Node.js:** The underlying runtime environment for the server-side logic.

### Overview of Project

*   **Project Name:** CareerCraft AI
*   **Technology Used:** Next.js (React), Firebase, Genkit (Google AI), Tailwind CSS, shadcn/ui, TypeScript.
*   **Database:** Firestore (NoSQL)
*   **Project Goal:** To create an intelligent, AI-powered platform that empowers job seekers in their career journey and streamlines the candidate screening process for recruiters.
*   **Features:**
    *   **For Job Seekers:** An intuitive resume builder with live preview, AI-driven resume analysis for feedback, an ATS optimizer, a smart job matcher, and an automated cover letter generator.
    *   **For Recruiters:** An AI Candidate Matcher to rank multiple resumes against a job description and a tool to summarize candidate profiles.
    *   **General:** Secure user authentication, tiered subscription plans with manual payment verification, team management for recruiters, and a dedicated admin panel.

---

## Abstract / Executive Summary

CareerCraft AI is an innovative, AI-powered platform designed to revolutionize the job application and recruitment process. For job seekers, it offers a suite of intelligent tools—including an intuitive resume builder, AI-driven resume analysis, and a cover letter generator—to help them craft compelling applications and stand out in a competitive market. For recruiters, the platform provides an AI Candidate Matcher to streamline the screening process, saving time and improving the quality of hires. Built on a modern tech stack featuring Next.js, Firebase, and Google's Gemini models via Genkit, CareerCraft AI provides a seamless, data-driven, and user-centric experience for all users. The project successfully meets its objectives of empowering job seekers and optimizing recruitment workflows through the strategic implementation of generative AI.

---

## Table of Contents

1.  **Introduction**
    *   Project Profile
    *   Overview of Project
2.  **Requirement Analysis**
    *   Functional Requirements
    *   Non-functional Requirements
3.  **System Architecture & Design**
    *   Overall Architecture
    *   Modules / Components
    *   Technology Stack
4.  **Implementation**
    *   Frontend
    *   Backend / APIs / Integrations
    *   AI / ML Components
    *   Database / Data Storage
    *   Security, Authentication, Authorization
5.  **Testing & Quality Assurance**
    *   Test Strategy
    *   Bug Tracking
6.  **Deployment & Hosting**
    *   Hosting Platform
    *   CI/CD Pipeline
7.  **Evaluation & Results**
    *   Meeting Objectives
    *   User Feedback
8.  **Challenges & Limitations**
    *   Technical Challenges
    *   Limitations
9.  **Future Work & Extensions**
10. **Conclusion**

---

## Existing System

Popular job platforms like LinkedIn, Indeed, and Glassdoor dominate the market but are often overwhelming for job seekers and inefficient for recruiters. They can be cluttered with ads, generic listings, and lack personalized, actionable feedback for applicants.

### Limitations of Current Platforms:

*   **Lack of Actionable Feedback:** Users rarely receive feedback on why their application was rejected.
*   **Generic Tools:** Resume builders are often basic and lack AI-driven optimization features.
*   **Time-Consuming for Recruiters:** Sifting through hundreds of applications is manual and inefficient.
*   **Limited Personalization:** Job recommendations are often based on simple keyword matching, not a deep understanding of a candidate's profile.

### Need for a Better Alternative:

There is a need for a focused, intelligent solution that empowers both job seekers and recruiters with AI. This includes:

*   **AI-Powered Resume Optimization:** Tools to analyze and improve resumes against specific job descriptions.
*   **Automated Application Materials:** Generation of tailored cover letters to save time.
*   **Efficient Candidate Screening:** AI-driven tools to rank and summarize candidates for recruiters.
*   **An Integrated, User-Friendly Experience:** A single platform for building, analyzing, and matching.

### Solution: CareerCraft AI

Designed for modern job seekers and recruiters, CareerCraft AI fills this gap by providing a suite of powerful, AI-driven tools on a clean, intuitive, and flexible platform.

---

## 2. Requirement Analysis

### Functional Requirements

*   **User Management:** Secure user registration, login, and profile management.
*   **Resume Builder:** Users must be able to create, edit, save multiple versions, and export resumes as PDFs.
*   **AI Tools for Job Seekers:**
    *   **Resume Analyzer:** Analyze an uploaded resume and provide feedback.
    *   **ATS Optimizer:** Score a resume against a job description.
    *   **Job Matcher:** Suggest fictional jobs based on a resume.
    *   **Cover Letter Generator:** Create a cover letter from a resume and job description.
*   **AI Tools for Recruiters:**
    *   **Candidate Matcher:** Rank multiple resumes against a job description.
    *   **Candidate Summarizer:** Generate a 3-sentence summary of a resume.
*   **Subscription & Payments:** A tiered subscription model (Free, Essentials, Pro, Recruiter) with manual payment verification.
*   **Admin Panel:** A dashboard for admins to manage users, approve upgrades, and handle support tickets.

### Non-functional Requirements

*   **Performance:** The application must be responsive, with fast page loads and quick AI processing times.
*   **Scalability:** The architecture (Firebase) must support a growing number of users and data.
*   **Security:** User data must be protected. All interactions with the database must be governed by strict security rules.
*   **Usability:** The interface must be intuitive and easy to navigate for non-technical users.
*   **Reliability:** The system should be highly available with minimal downtime.

---

## 3. System Architecture & Design

### Overall Architecture

CareerCraft AI is built on a modern, serverless architecture that separates the frontend, backend, and AI services.

*   **Frontend (Client-Side):** A Next.js application using the App Router. It leverages Server Components for performance and Client Components for interactivity. All UI and state management are handled within the React ecosystem.
*   **Backend (Server-Side):** Firebase serves as the primary backend, providing authentication, database, and storage.
*   **AI Layer (Genkit Flows):** All generative AI functionality is encapsulated in server-side TypeScript "flows" managed by Firebase Genkit. These flows interact with Google's Gemini models and are called from the Next.js frontend via server actions.

### Modules / Components

*   **Authentication Module:** Handles user sign-up and login.
*   **Resume Management Module:** Manages the creation, storage, and versioning of user resumes.
*   **AI Services Module:** A set of Genkit flows for all AI-powered features.
*   **Subscription Module:** Manages user plans and manual payment verification.
*   **Admin Module:** Provides a dedicated interface for platform administration.
*   **Support Module:** A ticketing system for user support requests.

### Technology Stack

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS & shadcn/ui
*   **AI Integration:** Firebase Genkit with Google AI (Gemini Models)
*   **Backend & Database:** Firebase (Authentication, Firestore, Storage)
*   **Forms & Validation:** React Hook Form & Zod
*   **Icons:** Lucide React

---

## 4. Implementation

### Frontend

The frontend is built with Next.js and React. Key implementation details include:
*   **Component Library:** Utilizes `shadcn/ui` for a consistent and accessible set of UI components.
*   **State Management:** Primarily uses React Hooks (`useState`, `useEffect`, `useContext`) for local and global state management, including a custom `useAuth` hook.
*   **Routing:** Employs the Next.js App Router for file-based routing and layouts.

### Backend / APIs / Integrations

The backend is fully powered by Firebase services:
*   **Firebase Authentication:** For secure email/password-based user sign-up and login.
*   **Firestore:** A NoSQL database used for storing all application data.
*   **Firebase Storage:** Used for storing user-uploaded files, such as payment proof screenshots and profile pictures.
*   **Server Actions:** Next.js Server Actions are used to securely call the Genkit AI flows from the client-side, acting as the API layer.

### AI / ML Components

All AI features are implemented as Firebase Genkit flows:
*   **`analyzeResume`:** Takes a resume PDF and provides strengths, weaknesses, and suggestions.
*   **`candidateMatcher`:** Accepts a job description and multiple resumes, returning a ranked list of candidates.
*   **`generateCoverLetter`:** Creates a personalized cover letter from a resume and job description.
*   Other flows include `atsOptimizer`, `jobMatcher`, `summarizeCandidate`, and `suggestResumeVersionName`.

### Database / Data Storage

Firestore is the primary data store, with a schema designed for scalability and security. Key collections include:
*   **`users`**: Stores user profiles, subscription plans, and credits. Contains a `resumeVersions` subcollection.
*   **`teams`**: For recruiter accounts, containing a `members` subcollection.
*   **`settings`**: A singleton collection for storing global app settings like payment details.
*   **`supportRequests`**: Stores user support tickets, with a `history` subcollection for conversation threads.
(For a complete schema, see `DB_SCHEMA.md`)

### Security, Authentication, Authorization

*   **Authentication:** Handled by Firebase Authentication.
*   **Authorization:**
    *   Firestore Security Rules are used to protect data, ensuring users can only access and modify their own data.
    *   Admin access is restricted based on a predefined list of admin emails, enforced in the frontend and through security rules where applicable.

---

## 5. Testing & Quality Assurance

### Test Strategy

The QA strategy focuses on a combination of manual and (planned) automated testing to ensure a high-quality product.
*   **Unit Testing:** Use Jest and React Testing Library to test individual components and utility functions.
*   **Integration Testing:** Test the integration between frontend components and Firebase services (e.g., ensuring data is correctly written to Firestore).
*   **End-to-End (E2E) Testing:** Use a framework like Cypress or Playwright to simulate user flows from login to resume creation and AI analysis.

### Bug Tracking

A formal bug tracking system (like Jira or GitHub Issues) would be used to report, prioritize, and track bugs throughout the development lifecycle.

---

## 6. Deployment & Hosting

### Hosting Platform

The application is designed for and deployed on **Firebase App Hosting**, which provides a seamless, fully-managed hosting solution with built-in CI/CD, SSL, and a global CDN.

### CI/CD Pipeline

Firebase App Hosting automatically sets up a CI/CD pipeline that connects to a GitHub repository. Every `git push` to the main branch triggers a new build and deployment, ensuring that the latest stable version is always live.

---

## 7. Evaluation & Results

### Meeting Objectives

The platform successfully meets its primary objectives by providing a robust set of tools for both job seekers and recruiters. The AI-powered features are functional and provide tangible value, while the Firebase backend ensures a scalable and secure foundation.

### User Feedback

Initial usability testing and feedback would focus on the intuitiveness of the resume builder and the clarity of the AI-generated feedback. Based on this, iterations would be made to improve the user experience.

---

## 8. Challenges & Limitations

### Technical Challenges

*   **AI Prompt Engineering:** Crafting effective prompts for the Gemini models to ensure consistent, accurate, and well-formatted JSON output was a significant challenge.
*   **PDF Generation:** Generating a pixel-perfect PDF from structured resume data required careful handling of layouts, fonts, and dynamic content to ensure a professional result.
*   **State Management:** Ensuring consistent state across the application, especially with real-time updates from Firestore, required careful implementation of React hooks and effects.

### Limitations

*   **Manual Payments:** The subscription upgrade process is manual, requiring admin verification. This is not scalable for a large user base.
*   **No Live Job Data:** The Job Matcher uses fictional job data. Integrating with a live job board API would provide more value.
*   **Limited Analytics:** The platform currently lacks detailed analytics on resume performance or recruiter success rates.

---

## 9. Future Work & Extensions

*   **Automated Payment Gateway:** Integrate Stripe or Razorpay to automate the subscription process.
*   **Resume Performance Analytics:** Track which resume versions perform best to provide users with data-driven insights.
*   **AI Mock Interviews:** Develop an AI agent that simulates a job interview based on a user's resume and a job description.
*   **Job Board Integration:** Connect with live job boards (e.g., Indeed, LinkedIn) to show real job listings.
*   **Advanced Team Analytics:** Provide recruiters with detailed analytics on their hiring pipelines and candidate trends.

---

## 10. Conclusion

CareerCraft AI demonstrates the immense potential of generative AI in the career and recruitment space. By providing intelligent, accessible, and user-friendly tools, the platform successfully empowers job seekers to advance their careers and helps recruiters find the best talent more efficiently. While there are limitations in the current version, its strong architectural foundation makes it well-positioned for future growth and the addition of even more advanced features.
