# CareerCraft AI - Project Report

**Author:** CHAUHAN HITARTH  
**Date:** October 26, 2023

---

## Index

| Sr No. | Index                                     |
|--------|-------------------------------------------|
| 1.     | **Introductions**                         |
|        | 1.1 Acknowledgement                       |
|        | 1.2 About College                         |
|        | 1.3 About Organization                    |
|        | 1.4 Project Profile                       |
| 2.     | **Literature Survey**                     |
|        | 2.1 Overview of Project                   |
|        | 2.2 Existing System                       |
|        | 2.3 Need for New System                   |
| 3.     | **Analysis**                              |
|        | 3.1 Software & Hardware Requirement       |
|        | 3.2 Objective                             |
|        | 3.3 Feasibility Study                     |
| 4.     | **Experimental or Material Method**       |
|        | 4.1 Design Methodology (System Architecture)|
|        | 4.2 DFD (Data Flow Diagram)               |
|        | 4.3 ER (Entity Relationship Diagram)      |
|        | 4.4 Data Dictionary (Database Schema)     |
| 5.     | **Result & Performance Analysis**         |
|        | 5.1 Process Description (Implementation)  |
|        | 5.2 Input Design (UI/UX)                  |
| 6.     | **Conclusion & Future Enhancement**       |
|        | 6.1 Conclusion                            |
|        | 6.2 Future Enhancement                    |
| 7.     | **Testing & Bibliography**                |
|        | 7.1 Testing                               |
|        | 7.2 Bibliography                          |

---

## 1. Introductions

### 1.1 Acknowledgement

I would like to express my sincere gratitude to my project guide and mentor for their invaluable guidance and support throughout this project. Their expertise and encouragement were instrumental in the successful completion of CareerCraft AI. I am also thankful to the faculty and staff of the department for providing the necessary resources and a conducive learning environment.

### 1.2 About College

(Placeholder) As a student of [Your College Name], I have been provided with a strong academic foundation and a spirit of innovation. The college's focus on practical learning and modern technology has been a major source of inspiration for this project.

### 1.3 About Organization

(Placeholder) This project was undertaken as an academic endeavor and is not affiliated with any specific organization. It is designed as a proof-of-concept to showcase the application of modern web technologies and artificial intelligence in solving real-world challenges in the recruitment industry.

### 1.4 Project Profile

*   **1. Project Title**
    *   CareerCraft AI – An AI-Powered Career Platform

*   **2. Objective**
    *   The objective of CareerCraft AI is to deliver a modern, intelligent platform that empowers job seekers with AI-driven tools for resume building and career planning, while also streamlining the recruitment process for hiring managers.
    *   Key goals include:
        *   Providing a seamless resume building and management experience.
        *   Supporting secure authentication and tiered subscription plans.
        *   Offering an intuitive and responsive UI for both job seekers and recruiters.
        *   Leveraging Firebase for a scalable, serverless backend and Genkit for AI integration.

*   **3. Developed By**
    *   CHAUHAN HITARTH

*   **4. Project Guide**
    *   (Placeholder for Project Guide Name)

*   **5. Frontend Technologies**
    *   **Next.js (React):** A modern framework for building performant, server-rendered web applications.
    *   **TypeScript:** For strong typing and improved code quality.
    *   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
    *   **shadcn/ui:** A collection of beautifully designed, accessible UI components.

*   **6. Backend Technologies**
    *   **Firebase:** Provides authentication, a NoSQL Firestore database for data storage, and file storage.
    *   **Genkit (Google AI):** Used for integrating powerful generative AI models (like Gemini) for all intelligent features.

---

## 2. Literature Survey

### 2.1 Overview of Project

CareerCraft AI is an innovative, AI-powered platform designed to revolutionize the job application and recruitment process. For job seekers, it offers a suite of intelligent tools to help them craft compelling applications and stand out in a competitive market. For recruiters, the platform provides an AI Candidate Matcher to streamline the screening process, saving time and improving the quality of hires.

Built with a full-stack approach, the application uses:
*   **Next.js (React):** For a component-based, responsive frontend.
*   **Tailwind CSS & shadcn/ui:** For clean, utility-first styling and a modern UI.
*   **Firebase:** As a serverless backend for authentication, database (Firestore), and storage.
*   **Genkit (Google AI):** For all AI-driven features, including resume analysis and candidate matching.

Key Features Include:
*   **Intuitive Resume Builder:** Create and manage multiple resume versions with a live preview.
*   **AI Resume Analyzer:** Get instant feedback on strengths, weaknesses, and keyword optimization.
*   **AI Candidate Matcher:** For recruiters to score and rank resumes against a job description.
*   **Tiered Subscription Model:** Offering 'Free', 'Pro', and 'Recruiter' plans with varying levels of access.
*   **Admin & User Dashboards:** Separate interfaces for user management and application functionality.

The main goal of CareerCraft AI is to combine a user-friendly design with powerful AI functionality—creating a seamless, responsive experience for both job seekers and hiring managers. It serves as a practical demonstration of:
*   Real-time, serverless backend integration.
*   Scalable architecture using modern cloud services.
*   The application of generative AI in a real-world use case.

### 2.2 Existing System

Popular platforms like LinkedIn, Indeed, and traditional resume builders dominate the job market but are often generic, ad-driven, and fail to provide deep, personalized guidance for job seekers.

**Limitations of Current Platforms:**
*   **Generic Templates and Feedback:** Offer basic templates and superficial advice, lacking personalized, AI-driven analysis.
*   **Fragmented User Experience:** Job seekers must use separate tools for resume building, job searching, and application tracking.
*   **Inefficient for Recruiters:** Manual screening of hundreds of resumes is time-consuming and prone to bias.
*   **Lack of Actionable Insights:** Fail to provide users with clear, data-driven steps to improve their resume's effectiveness.

**Need for a Better Alternative:**
An intelligent, all-in-one platform that empowers both job seekers and recruiters with:
*   An integrated resume builder with version control.
*   AI-powered analysis for resumes, cover letters, and job matching.
*   A streamlined, serverless architecture for a fast and reliable experience.
*   Dedicated tools for recruiters to automate and enhance candidate screening.

**Solution: CareerCraft AI**
Designed for modern professionals, CareerCraft AI fills this gap with an intelligent, cohesive platform that simplifies career advancement and streamlines recruitment.

### 2.3 Need for New System

(This section is intentionally left blank for now.)

---

## 3. Analysis

### 3.1 Software & Hardware Requirement

*   **Software Requirements:**
    *   **Operating System:** Windows, macOS, or Linux
    *   **Web Browser:** Modern browsers like Google Chrome, Firefox, or Safari
    *   **Development Environment:** Node.js (v18+), pnpm, Firebase CLI, Git
*   **Hardware Requirements:**
    *   A standard computer with an internet connection. No special hardware is needed.

### 3.2 Objective

The objective of CareerCraft AI is to deliver a modern, intelligent platform to empower job seekers and streamline the recruitment process. The system provides a suite of AI-driven tools for resume building, analysis, and job matching, alongside a dedicated feature set for recruiters to efficiently screen candidates.

Key goals include:
*   Providing a seamless resume building and management experience.
*   Offering AI-powered analysis and optimization for resumes and cover letters.
*   Supporting secure user authentication and tiered subscription plans.
*   Delivering an intuitive and responsive user interface for both job seekers and recruiters.
*   Leveraging Firebase and Genkit for a scalable, serverless backend and AI integration.

### 3.3 Feasibility Study

*   **Technical Feasibility:** The project is technically feasible. The chosen technology stack (Next.js, Firebase, Genkit) is modern, well-documented, and widely used for building scalable web applications. These technologies integrate well and are suitable for the project's requirements.
*   **Economic Feasibility:** The development cost is minimal, primarily involving time and the use of free-tier services from Firebase and Google AI. The operational costs are low due to the serverless nature of the architecture, making it economically viable.
*   **Operational Feasibility:** The system is designed to be user-friendly and requires minimal training. The automated nature of the AI tools makes it operationally efficient for both job seekers and recruiters.

---

## 4. Experimental or Material Method

### 4.1 Design Methodology (System Architecture)

CareerCraft AI is built on a modern, serverless architecture that separates the frontend, backend, and AI services.
*   **Frontend (Client-Side):** A Next.js application using the App Router. It leverages Server Components for performance and Client Components for interactivity.
*   **Backend (Server-Side):** Firebase serves as the primary backend, providing Authentication, Firestore (NoSQL Database), and Storage.
*   **AI Layer (Genkit Flows):** All generative AI functionality is encapsulated in server-side TypeScript "flows" managed by Firebase Genkit.

### 4.2 DFD (Data Flow Diagram)

*   **Process 1: User Registration & Resume Management:** Users sign up/log in via Firebase Auth. User data and resume versions are stored in Firestore. Users interact with the Resume Builder UI, which reads from and writes to the `/users/{userId}/resumeVersions` subcollection.
*   **Process 2: AI Feature Usage:** The user submits a resume and/or job description from the UI. The request is sent to a Next.js Server Action, which calls the relevant Genkit AI flow (e.g., `analyzeResume`, `candidateMatcher`). The AI flow processes the data, returns a result, and the UI displays it.
*   **Process 3: Subscription Upgrade:** A user requests a plan upgrade from the UI. The system updates their status to 'pending' in Firestore. An admin reviews the request in the Admin Panel and approves/rejects it, which updates the user's document in Firestore.

### 4.3 ER (Entity Relationship Diagram)

*   **Users ⟷ Resume Versions (One-to-Many):** A `user` can have multiple `resumeVersions`. This is implemented as a subcollection in Firestore.
*   **Users ⟷ Teams (One-to-Many):** A `user` with a 'recruiter' plan can own a `team`. A `team` can have multiple `members` (who are also `users`).
*   **Users ⟷ Support Requests (One-to-Many):** A `user` can have multiple `supportRequests`.

### 4.4 Data Dictionary (Database Schema)

The database schema is defined in Firestore with the following main collections:
*   **`users`**: Stores user profiles, subscription plans, AI credits, and contains a `resumeVersions` subcollection.
*   **`teams`**: For recruiter accounts, storing team ownership and containing a `members` subcollection.
*   **`settings`**: A singleton collection for storing global app settings like payment details.
*   **`supportRequests`**: Stores user support tickets, with a `history` subcollection for conversation threads.
(For a detailed schema, refer to `DB_SCHEMA.md`)

---

## 5. Result & Performance Analysis

### 5.1 Process Description (Implementation)

*   **Authentication:** Handled by Firebase Authentication for secure email/password login.
*   **Database Operations:** All data is stored and retrieved from Firestore. Firestore Security Rules are implemented to ensure users can only access their own data.
*   **AI Integration:** AI features are built as Firebase Genkit flows using Google's Gemini models. These flows are called securely from the frontend via Next.js Server Actions.
*   **Frontend Development:** The UI is built with Next.js and React, using `shadcn/ui` for components and Tailwind CSS for styling.

### 5.2 Input Design (UI/UX)

The user interface is designed to be clean, intuitive, and responsive.
*   **Resume Builder:** Features a two-panel layout with an editable form on the left and a live, real-time preview of the resume on the right.
*   **AI Tools:** Each AI tool has a dedicated page with a simple form for input (e.g., file uploads, text areas) and a clearly formatted results display area.
*   **Navigation:** A collapsible sidebar provides easy access to all features of the application, including the admin panel for authorized users.

---

## 6. Conclusion & Future Enhancement

### 6.1 Conclusion

CareerCraft AI successfully demonstrates the potential of generative AI to transform the career and recruitment landscape. By providing intelligent, accessible, and user-friendly tools, the platform empowers job seekers to create superior application materials and helps recruiters to identify top talent efficiently. The serverless architecture ensures scalability and low operational overhead.

### 6.2 Future Enhancement

*   **Automated Payment Gateway:** Integrate Stripe or a similar service to fully automate the subscription process.
*   **AI Mock Interviews:** Develop an AI agent that simulates a job interview based on a user's resume.
*   **Job Board Integration:** Connect with live job boards (e.g., Indeed, LinkedIn APIs) to provide real job listings.
*   **Advanced Analytics:** Provide users with analytics on resume performance and recruiters with insights into their hiring funnels.

---

## 7. Testing & Bibliography

### 7.1 Testing

*   **Unit Testing:** (Planned) Use Jest and React Testing Library to test individual UI components and utility functions.
*   **Integration Testing:** (Planned) Test the integration between frontend components and Firebase services (e.g., data writes, auth flows).
*   **Manual Testing:** The application was manually tested across all key user flows, including user registration, resume building, AI feature usage, and subscription requests.

### 7.2 Bibliography

*   Official documentation for Next.js, React, Firebase, and Genkit.
*   Articles and best practices on UI/UX design for web applications.
*   Resources on prompt engineering for large language models.

