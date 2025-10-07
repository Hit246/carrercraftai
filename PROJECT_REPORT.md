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
|        | 4.1 Design Methodology                    |
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

While platforms like LinkedIn and Indeed offer a wide reach, they lack the focused, intelligent tools needed for effective career development and modern recruitment.

**Key Limitations of Existing Platforms:**
1.  **Generic Guidance** - Offer one-size-fits-all advice, not personalized AI analysis.
2.  **Inefficient for Recruiters** - Manual screening is slow, biased, and resource-intensive.
3.  **Fragmented Experience** - Users need separate tools for building, analyzing, and matching.
4.  **Cluttered and Distracting** - Often filled with ads and irrelevant social features.
5.  **Lack of Deep Insights** - Fail to provide actionable steps for resume improvement.
6.  **Poor Skill-Job Alignment** - Basic keyword matching often misses true candidate potential.

**Why CareerCraft AI?**
CareerCraft AI provides a clean, focused, and intelligent alternative—ideal for targeted job seeking, skill enhancement, and efficient, unbiased recruitment.

---

## 3. Analysis

### 3.1 Software & Hardware Requirement

*   **Software Requirements (Development Environment):**
    *   **Operating System:** Windows, macOS, or Linux
    *   **Web Browser:** Modern browsers like Google Chrome, Firefox, or Safari for development and testing.
    *   **Development Tools:**
        *   Node.js (v18 or later)
        *   pnpm (or a compatible package manager like npm/yarn)
        *   Firebase CLI
        *   Git for version control
        *   A code editor like Visual Studio Code

*   **Hardware Requirements (Development Environment):**
    *   A standard computer capable of running Node.js and a modern web browser.
    *   A stable internet connection for installing packages and interacting with Firebase services.

*   **Software Requirements (End-User/Client):**
    *   Any modern web browser (e.g., Google Chrome, Mozilla Firefox, Safari, Microsoft Edge) with JavaScript enabled.
    *   No other software installation is required.

*   **Hardware Requirements (End-User/Client):**
    *   Any device (desktop, laptop, tablet, or smartphone) with an internet connection and a web browser.

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

### 4.1 Design Methodology

The design methodology used in the development of the CareerCraft AI system is primarily based on **Data Flow Diagrams (DFDs)**, which illustrate the logical flow of data through the application. These diagrams help in mapping out how data is processed, transferred, and stored within the system—independent of the physical or technical implementation.

*   **Purpose of Using DFDs**
    *   To identify system inputs, outputs, and processing components.
    *   To visualize user interaction with the system.
    *   To understand how data moves and transforms through different stages.
    *   To separate logical design from the physical architecture, ensuring a clearer view of how features are structured.

*   **DFD Levels Used in CareerCraft AI**
    1.  **Level 0: Context-Level DFD**
        *   Provides a high-level overview of the entire system.
        *   Shows main external entities such as Users, Admins, and Recruiters interacting with the CareerCraft AI system.
        *   Highlights the general input-output relationship of major system functions.
    2.  **Level 1: First-Level DFD**
        *   Breaks down major system functions into sub-processes such as:
            *   User Authentication
            *   Resume Management
            *   AI Feature Usage (e.g., Resume Analyzer, Job Matcher)
            *   Subscription Management
        *   Helps visualize internal data flow and sub-process dependencies.

### 4.2 DFD (Data Flow Diagram)

*   **Process 1: User Registration & Resume Management:** Users sign up/log in via Firebase Auth. User data and resume versions are stored in Firestore. Users interact with the Resume Builder UI, which reads from and writes to the `/users/{userId}/resumeVersions` subcollection.
*   **Process 2: AI Feature Usage:** The user submits a resume and/or job description from the UI. The request is sent to a Next.js Server Action, which calls the relevant Genkit AI flow (e.g., `analyzeResume`, `candidateMatcher`). The AI flow processes the data, returns a result, and the UI displays it.
*   **Process 3: Subscription Upgrade:** A user requests a plan upgrade from the UI. The system updates their status to 'pending' in Firestore. An admin reviews the request in the Admin Panel and approves/rejects it, which updates the user's document in Firestore.

### 4.3 ER (Entity Relationship Diagram)

An Entity-Relationship (ER) Diagram is a visual representation that outlines how data entities relate to one another within a database system. It helps in understanding the structure of the application's backend and serves as a guide for designing the database schema.

The ER diagram of CareerCraft AI demonstrates how `users` interact with `resumeVersions`, `teams`, and `supportRequests`.

*   **Building Blocks of the E-R Diagram**

    **Entities (Rectangles)**
    Entities are real-world objects that store data.
    *   `users`: Stores individual user profiles and subscription data.
    *   `resumeVersions`: A subcollection storing different versions of a user's resume.
    *   `teams`: For recruiter accounts, containing team data.
    *   `members`: A subcollection storing team member information.
    *   `supportRequests`: Stores user-submitted support tickets.
    *   `history`: A subcollection for the conversation history of a support ticket.

    **Attributes (Ovals)**
    Attributes define the properties of each entity.
    *   `user`: `uid`, `displayName`, `email`, `plan`, `credits`, `teamId`.
    *   `resumeVersion`: `versionName`, `updatedAt`, `resumeData` (a map object).
    *   `team`: `owner`, `createdAt`.
    *   `member`: `uid`, `email`, `role`, `name`.
    *   `supportRequest`: `userId`, `subject`, `status`, `lastMessageAt`.
    *   `history`: `message`, `sender`, `timestamp`.

*   **Relationships (Diamonds)**
    Relationships explain how entities are connected.
    *   A `user` → has → many `resumeVersions`.
    *   A `user` → submits → many `supportRequests`.
    *   A `supportRequest` → has → many `history` entries.
    *   A `user` (recruiter) → owns → a `team`.
    *   A `team` → has → many `members`.

*   **Types of Relationships**

    **One-to-Many**
    *   One `user` can have multiple `resumeVersions`.
    *   One `user` can submit multiple `supportRequests`.
    *   One `team` can have many `members`.

*   **Purpose of the ER Diagram**
    *   **Data Modeling:** Defines how data is structured and related in the application.
    *   **Communication Tool:** Acts as a shared understanding between developers, designers, and stakeholders.
    *   **Database Design:** Lays the foundation for database schema creation and relationships in Firestore.

### 4.4 Data Dictionary (Database Schema)

A **Data Dictionary**, also known as a metadata repository, is a structured collection of definitions and information about the data used in a system or application. It acts as a reference guide for developers, analysts, and stakeholders, ensuring everyone understands what data exists, how it is structured, and how it should be used.

For CareerCraft AI, the Data Dictionary includes:
*   **Data Object Definitions:** Descriptions of Firestore collections and their fields.
*   **Data Types:** Specifies the format of each field (e.g., `string`, `number`, `Timestamp`).
*   **Relationships:** Describes how collections and subcollections are connected.

The detailed Data Dictionary for this project, outlining every collection, field, and data type, is maintained in the `DB_SCHEMA.md` file.

This document outlines the structure of the Firestore database used in the CareerCraft AI application.

## Collections

### 1. `users`

This collection stores information about individual users, their subscription status, and related metadata.

-   **Collection Path:** `/users`
-   **Document ID:** `user.uid` (The unique ID from Firebase Authentication)

#### Document Fields:

| Field                    | Type      | Description                                                                                               | Example                               |
| ------------------------ | --------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `displayName`            | `string`  | The user's full name.                                                                                     | `"Jane Doe"`                          |
| `photoURL`               | `string`  | The URL of the user's profile picture in Firebase Storage.                                                | `"https://firebasestorage.googleapis.com/..."` |
| `email`                  | `string`  | The user's email address.                                                                                 | `"user@example.com"`                  |
| `plan`                   | `string`  | The user's current subscription plan. Can be `free`, `essentials`, `pro`, `recruiter`, `pending`, `cancellation_requested`. | `"pro"`                               |
| `credits`                | `number`  | The number of AI credits available. Free: 5, Essentials: 50, Pro/Recruiter: Unlimited.                       | `50`                                  |
| `createdAt`              | `Timestamp` | The date and time when the user account was created.                                                      | `October 26, 2023 at 10:00:00 AM UTC+0` |
| `planUpdatedAt`          | `Timestamp` | The date and time when the user's plan was last updated (e.g., when an upgrade was approved).             | `November 1, 2023 at 12:30:00 PM UTC+0` |
| `requestedPlan`          | `string`  | The plan the user requested if their status is `pending`. Can be `essentials`, `pro` or `recruiter`.        | `"pro"`                               |
| `paymentProofURL`        | `string`  | The URL of the uploaded payment proof screenshot in Firebase Storage.                                     | `"https://firebasestorage.googleapis.com/..."` |
| `teamId`                 | `string`  | The ID of the team the user belongs to (primarily for `recruiter` plan users). Points to a doc in `teams`.  | `"T1a2b3c4d5"`                        |
| `hasCompletedOnboarding` | `boolean` | Set to `true` after the user has completed the initial guided tour. Defaults to `false`.                  | `true`                                |


#### Subcollection: `resumeVersions`

Each user document contains a subcollection of their resume versions. The number of versions a user can store is limited by their plan (Free: 2, Essentials: 10, Pro/Recruiter: Unlimited).

-   **Collection Path:** `/users/{userId}/resumeVersions`
-   **Document ID:** Auto-generated by Firestore.

##### Resume Version Document Fields:

| Field         | Type      | Description                                               |
|---------------|-----------|-----------------------------------------------------------|
| `versionName` | `string`  | The user-defined or AI-suggested name for this version.   |
| `updatedAt`   | `Timestamp` | The date and time this version was last saved.            |
| `resumeData`  | `Map`     | The complete, structured resume data for this version.      |


#### `resumeData` Object Structure:

The `resumeData` map contains the full content of a specific resume version.

| Field       | Type                 | Description                                                               |
| ----------- | -------------------- | ------------------------------------------------------------------------- |
| `name`      | `string`             | The full name of the user.                                                |
| `title`     | `string`             | The user's professional title (e.g., "Software Engineer").                |
| `phone`     | `string`             | The user's phone number.                                                  |
| `email`     | `string`             | The user's contact email.                                                 |
| `linkedin`  | `string`             | A link to the user's LinkedIn profile.                                    |
| `summary`   | `string`             | A professional summary or objective statement.                            |
| `skills`    | `string`             | A comma-separated list of skills.                                         |
| `experience`| `Array<Map>`         | An array of objects, where each object represents a work experience entry.|
| `education` | `Array<Map>`         | An array of objects, where each object represents an education entry.     |
| `projects`  | `Array<Map>`         | An array of objects, where each object represents a project showcase entry. |

##### `experience` Object Structure:

| Field         | Type     | Description                                           |
| ------------- | -------- | ----------------------------------------------------- |
| `id`          | `number` | A unique timestamp-based ID for the entry.            |
| `title`       | `string` | The job title.                                        |
| `company`     | `string` | The name of the company.                              |
| `dates`       | `string` | The employment dates (e.g., "2020 - Present").        |
| `description` | `string` | A description of responsibilities and achievements.   |

##### `education` Object Structure:

| Field    | Type     | Description                                           |
| -------- | -------- | ----------------------------------------------------- |
| `id`     | `number` | A unique timestamp-based ID for the entry.            |
| `school` | `string` | The name of the school or university.                 |
| `degree` | `string` | The degree obtained (e.g., "B.S. in Computer Science"). |
| `dates`  | `string` | The dates of attendance (e.g., "2016 - 2020").        |
| `cgpa`   | `string` | The Cumulative Grade Point Average (e.g., "8.5/10").  |

##### `projects` Object Structure:

| Field         | Type     | Description                                              |
| ------------- | -------- | -------------------------------------------------------- |
| `id`          | `number` | A unique timestamp-based ID for the entry.               |
| `name`        | `string` | The name of the project.                                 |
| `description` | `string` | A brief description of the project.                      |
| `url`         | `string` | A URL to the project (e.g., GitHub, live demo).          |
| `technologies`| `string` | Comma-separated list of technologies used in the project.|

---

### 2. `teams`

This collection stores information about teams created by users on the `recruiter` plan.

-   **Collection Path:** `/teams`
-   **Document ID:** Auto-generated by Firestore.

#### Document Fields:

| Field       | Type      | Description                                            |
| ----------- | --------- | ------------------------------------------------------ |
| `owner`     | `string`  | The `user.uid` of the user who owns/created the team.  |
| `createdAt` | `Timestamp` | The date and time the team was created.                |

#### Subcollection: `members`

Each team document contains a subcollection of its members.

-   **Collection Path:** `/teams/{teamId}/members`
-   **Document ID:** Auto-generated by Firestore.

##### Member Document Fields:

| Field     | Type     | Description                                                          |
| --------- | -------- | -------------------------------------------------------------------- |
| `uid`     | `string` | The `user.uid` of the team member, added after they sign up.         |
| `name`    | `string` | The display name of the team member, added after they sign up.       |
| `email`   | `string` | The email address of the invited team member.                        |
| `role`    | `string` | The role of the member. Can be `Admin` or `Member`.                  |
| `addedBy` | `string` | The email of the user who invited this member.                       |

---

### 3. `settings`

This collection is used for global application settings that can be configured by an administrator, such as payment details.

-   **Collection Path:** `/settings`
-   **Document ID:** `payment` (A singleton document)

#### Document Fields:

| Field            | Type     | Description                                        |
| ---------------- | -------- | -------------------------------------------------- |
| `upiId`          | `string` | The UPI ID to be displayed for payments.           |
| `qrCodeImageUrl` | `string` | The public URL of the QR code image for payments.  |

---

### 4. `supportRequests`

This collection stores all support requests submitted by users.

-   **Collection Path:** `/supportRequests`
-   **Document ID:** Auto-generated by Firestore.

#### Document Fields:

| Field           | Type      | Description                                                               |
| --------------- | --------- | ------------------------------------------------------------------------- |
| `userId`        | `string`  | The `user.uid` of the user who submitted the request.                     |
| `userEmail`     | `string`  | The email of the user who submitted the request.                          |
| `subject`       | `string`  | The subject of the support request.                                       |
| `category`      | `string`  | The category of the request (`billing`, `technical`, etc.).                 |
| `status`        | `string`  | The status of the request: `open`, `in-progress`, `closed`.               |
| `createdAt`     | `Timestamp` | The date and time the request was submitted.                              |
| `lastMessageAt` | `Timestamp` | The timestamp of the last message sent by either user or admin. For sorting. |

#### Subcollection: `history`

Each support request contains a subcollection for the conversation history.

-   **Collection Path:** `/supportRequests/{requestId}/history`
-   **Document ID:** Auto-generated by Firestore.

##### History Document Fields:

| Field       | Type      | Description                                               |
| ----------- | --------- | --------------------------------------------------------- |
| `message`   | `string`  | The content of the message.                               |
| `sender`    | `string`  | Who sent the message: `user` or `admin`.                  |
| `timestamp` | `Timestamp` | When the message was sent.                                |

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
