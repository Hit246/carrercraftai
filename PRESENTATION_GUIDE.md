# CareerCraft AI: College Presentation Guide

This guide provides a detailed, slide-by-slide outline for your project presentation. You can copy this content directly into your presentation software (like PowerPoint or Google Slides) and apply a clean, blue-white theme with gradient accents.

---

### **Slide 1: Title Slide**

-   **Title:** CareerCraft AI: An AI-Powered Career Platform
-   **Subtitle:** Craft Your Future with Artificial Intelligence
-   **Your Name:** CHAUHAN HITARTH
-   **College Name:** INSB Institute of BCA & PGDCA
-   **Project Guide:** [Your Guide's Name]
-   **(Footer):** `[Date of Presentation]`

---

### **Slide 2: The Problem**

-   **Title:** The Modern Job Hunt is Broken
-   **Key Statistic (Large Font):** "Over 75% of resumes are rejected by ATS before a human ever reads them."
-   **For Job Seekers:**
    -   Struggling to stand out in a crowded market.
    -   Difficulty tailoring resumes for Applicant Tracking Systems (ATS).
    -   Uncertainty about what recruiters are truly looking for.
-   **For Recruiters:**
    -   Overwhelmed by the high volume of applications.
    -   Time-consuming manual screening process.
    -   Risk of human bias affecting candidate selection.

---

### **Slide 3: Our Solution: CareerCraft AI**

-   **Title:** An Intelligent Platform for Everyone
-   **Content:** CareerCraft AI is a unified platform that leverages AI to bridge the gap between job seekers and recruiters.
-   **For Job Seekers (Icon: User):**
    -   Build professional, ATS-friendly resumes.
    -   Receive instant, AI-driven feedback.
    -   Discover perfectly matched job opportunities.
-   **For Recruiters (Icon: Briefcase):**
    -   Automate candidate screening and ranking.
    -   Reduce bias and identify top talent faster.
    -   Streamline team collaboration and workflow.

---

### **Slide 4: Project Objectives**

-   **Title:** What We Set Out to Build
-   **Content:**
    1.  **Intuitive Resume Builder:** A live-preview editor for creating and managing multiple resume versions.
    2.  **AI-Powered Tools:** A suite of tools including a Resume Analyzer, Job Matcher, and Candidate Matcher.
    3.  **Secure Firebase Backend:** For scalable user authentication, data storage (Firestore), and file management.
    4.  **Tiered Subscription Model:** Free, Pro, and Recruiter plans to serve diverse user needs.
    5.  **Admin Panel:** A dashboard for user management, subscription approvals, and platform oversight.
    6.  **Modern UI/UX:** A clean, responsive interface built with Next.js and Tailwind CSS.

---

### **Slide 5: System Architecture**

-   **Title:** How It's Built: A Scalable Architecture
-   **(Simple 3-Layer Diagram):**
    -   **Presentation Layer (Frontend):**
        -   *Technology:* Next.js, React, Tailwind CSS, shadcn/ui
        -   *Description:* Handles all user interaction and renders the interface.
    -   **Logic Layer (Backend & AI):**
        -   *Technology:* Genkit for Firebase, Google AI (Gemini)
        -   *Description:* Executes AI flows for analysis, matching, and generation. Manages business logic.
    -   **Data Layer (Database):**
        -   *Technology:* Firebase (Firestore, Authentication, Storage)
        -   *Description:* Securely stores all user data, resume versions, and application settings.

---

### **Slide 6: Database Design**

-   **Title:** Structuring Our Data with Firestore
-   **Content:** We used Firestore, a flexible NoSQL database, to model our application's data for scalability and real-time access. Our schema is designed to be efficient and secure.
-   **(Show a small table snippet of key collections from DB_SCHEMA.md):**
| Collection | Document ID | Description |
| :--- | :--- | :--- |
| `users` | `{userId}` | Stores user profiles, subscription plan, and AI credits. |
| `resumeVersions` | `{autoId}` | A subcollection under a user document for each unique resume. |
| `teams` | `{teamId}` | Manages recruiter teams and their members. |
| `settings` | `payment` | A singleton document for storing global payment settings like UPI ID. |
| `supportRequests` | `{autoId}` | Stores user-submitted support tickets and conversation history. |


---

### **Slide 7: Live Demo - The Job Seeker**

-   **Action:** (Switch to the live application and demonstrate the user flow)
-   **Demo Points:**
    1.  Show the resume builder with its live preview.
    2.  Run the **AI Resume Analyzer** and explain the feedback.
    3.  Use the **AI Job Matcher** to discover tailored opportunities.
    4.  Export the final resume to PDF.
-   **(Footer):** `Demo Mode: User`

---

### **Slide 8: Live Demo - The Recruiter**

-   **Action:** (Log in as a recruiter and showcase the recruiter-specific tools)
-   **Demo Points:**
    1.  Use the **AI Candidate Matcher** by uploading a job description and several resumes.
    2.  Show the ranked list of candidates with match scores and AI-generated justifications.
    3.  Briefly show the Team Management page.
-   **(Footer):** `Demo Mode: Recruiter`

---

### **Slide 9: Live Demo - The Admin**

-   **Action:** (Log in as an admin to show the backend management panel)
-   **Demo Points:**
    1.  Display the Admin Dashboard with user statistics.
    2.  Show the User Management table and how to change a user's plan.
    3.  Demonstrate the Upgrade Requests page where admins approve payments.
-   **(Footer):** `Demo Mode: Admin`

---

### **Slide 10: Conclusion & Achievements**

-   **Title:** Project Success & Impact
-   **Content:**
    -   Successfully developed a feature-rich, AI-powered platform that meets all project objectives.
    -   Created a scalable and maintainable application using a modern tech stack (Next.js, Firebase, Genkit).
    -   Delivered a valuable tool that empowers job seekers and streamlines the hiring process for recruiters.
-   **Key Success Metric (Large Font):** "AI analysis under 3 seconds per resume."
-   **Deployment Note:** "Live application hosted on **Vercel** with a **Firebase** backend."

---

### **Slide 11: Future Enhancements**

-   **Title:** What's Next for CareerCraft AI?
-   **Content:**
    -   **Automated Payment Gateway:** Integrate **Stripe** to fully automate the subscription and payment process.
    -   **AI Mock Interviews:** Develop an interactive AI agent to simulate job interviews and provide performance feedback.
    -   **Live Job Board Integration:** Connect with APIs from platforms like LinkedIn or Indeed to show real-time job listings.
    -   **Advanced Analytics:** Provide a dashboard for users to track resume views and application success rates.

---

### **Slide 12: Q&A**

-   **Title:** Thank You!
-   **Subtitle:** Questions & Answers
-   **(Footer with Contact Info):**
    -   `careercraftai.vercel.app`
    -   `hitarth0236@gmail.com`
    -   `+91-98987-60325`

---
