# CareerCraft AI - Firestore Database Schema

This document outlines the structure of the Firestore database used in the CareerCraft AI application.

## Collections

### 1. `users`

This collection stores information about individual users, their subscription status, and related metadata.

-   **Collection Path:** `/users`
-   **Document ID:** `user.uid` (The unique ID from Firebase Authentication)

#### Document Fields:

| Field             | Type      | Description                                                                                               | Example                               |
| ----------------- | --------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `email`           | `string`  | The user's email address.                                                                                 | `"user@example.com"`                  |
| `plan`            | `string`  | The user's current subscription plan. Can be `free`, `pro`, `recruiter`, `pending`, `cancellation_requested`. | `"pro"`                               |
| `credits`         | `number`  | The number of AI credits available for users on the `free` plan.                                          | `3`                                   |
| `createdAt`       | `Timestamp` | The date and time when the user account was created.                                                      | `October 26, 2023 at 10:00:00 AM UTC+0` |
| `planUpdatedAt`   | `Timestamp` | The date and time when the user's plan was last updated (e.g., when an upgrade was approved).             | `November 1, 2023 at 12:30:00 PM UTC+0` |
| `requestedPlan`   | `string`  | The plan the user requested if their status is `pending`. Can be `pro` or `recruiter`.                      | `"pro"`                               |
| `paymentProofURL` | `string`  | The URL of the uploaded payment proof screenshot in Firebase Storage.                                     | `"https://firebasestorage.googleapis.com/..."` |
| `teamId`          | `string`  | The ID of the team the user belongs to (primarily for `recruiter` plan users). Points to a doc in `teams`.  | `"T1a2b3c4d5"`                        |

---

### 2. `resumes`

This collection stores the complete resume data for each user, which is edited in the Resume Builder.

-   **Collection Path:** `/resumes`
-   **Document ID:** `user.uid` (The unique ID from Firebase Authentication)

#### Document Fields:

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

#### `experience` Object Structure:

| Field         | Type     | Description                                           |
| ------------- | -------- | ----------------------------------------------------- |
| `id`          | `number` | A unique timestamp-based ID for the entry.            |
| `title`       | `string` | The job title.                                        |
| `company`     | `string` | The name of the company.                              |
| `dates`       | `string` | The employment dates (e.g., "2020 - Present").        |
| `description` | `string` | A description of responsibilities and achievements.   |

#### `education` Object Structure:

| Field    | Type     | Description                                           |
| -------- | -------- | ----------------------------------------------------- |
| `id`     | `number` | A unique timestamp-based ID for the entry.            |
| `school` | `string` | The name of the school or university.                 |
| `degree` | `string` | The degree obtained (e.g., "B.S. in Computer Science"). |
| `dates`  | `string` | The dates of attendance (e.g., "2016 - 2020").        |

---

### 3. `teams`

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

| Field     | Type     | Description                                             |
| --------- | -------- | ------------------------------------------------------- |
| `email`   | `string` | The email address of the invited team member.           |
| `role`    | `string` | The role of the member. Can be `Admin` or `Member`.     |
| `addedBy` | `string` | The email of the user who invited this member.          |

---

### 4. `settings`

This collection is used for global application settings that can be configured by an administrator, such as payment details.

-   **Collection Path:** `/settings`
-   **Document ID:** `payment` (A singleton document)

#### Document Fields:

| Field            | Type     | Description                                        |
| ---------------- | -------- | -------------------------------------------------- |
| `upiId`          | `string` | The UPI ID to be displayed for payments.           |
| `qrCodeImageUrl` | `string` | The public URL of the QR code image for payments.  |

---

### 5. `supportRequests`

This collection stores all support requests submitted by users.

-   **Collection Path:** `/supportRequests`
-   **Document ID:** Auto-generated by Firestore.

#### Document Fields:

| Field       | Type      | Description                                               |
| ----------- | --------- | --------------------------------------------------------- |
| `userId`    | `string`  | The `user.uid` of the user who submitted the request.     |
| `userEmail` | `string`  | The email of the user who submitted the request.          |
| `subject`   | `string`  | The subject of the support request.                       |
| `message`   | `string`  | The detailed message from the user.                       |
| `category`  | `string`  | The category of the request (`billing`, `technical`, etc.). |
| `status`    | `string`  | The status of the request, e.g., `open` or `closed`.        |
| `createdAt` | `Timestamp` | The date and time the request was submitted.              |

---

## Entity Relationships (ER Diagram)

This section describes the relationships between the main collections in a text-based format.

1.  **Users ⟷ Resumes (One-to-One)**
    *   A `user` has exactly one `resume`.
    *   **Relationship:** The `users` collection and the `resumes` collection are linked by their document ID. Both use the `user.uid` from Firebase Authentication as the document key.

2.  **Users ⟷ Teams (One-to-Many)**
    *   A `user` with a `recruiter` plan can be the `owner` of one `team`.
    *   A `team` can have multiple `members` (who are also `users`).
    *   **Relationship:**
        *   The `teams` document contains an `owner` field which stores the `user.uid` of the creator.
        *   The `users` document contains a `teamId` field, which links a user to the `team` document they are a member of.

3.  **Teams ⟷ Members (One-to-Many, as a Subcollection)**
    *   A `team` document contains a `members` subcollection.
    *   Each document in the `members` subcollection represents an invited user.
    *   **Relationship:** This is a direct parent-child relationship in Firestore, where `members` documents are nested under a specific `team`.

4.  **Settings (Singleton)**
    *   The `settings` collection is not directly related to any other collection. It contains singleton documents (like `payment`) for storing global application configuration that is managed by an admin.

5.  **Users ⟷ Support Requests (One-to-Many)**
    *   A `user` can have multiple `supportRequests`.
    *   **Relationship:** The `supportRequests` document contains a `userId` field linking it back to the `users` document.

---

## Data Flow Diagram (DFD) Explanation

This section provides a text-based description of the primary data flows within the CareerCraft AI application.

### Process 1: User Registration & Authentication

-   **External Entity:** User, Admin
-   **Processes:**
    1.  **User Signup:** A new user provides `email` and `password`. The system creates an account in **Firebase Auth** and a corresponding document in the `users` collection with `plan: 'free'` and `credits: 3`.
    2.  **User Login:** A user provides `email` and `password`. The system verifies credentials against **Firebase Auth**. Upon success, it fetches user data from the `users` collection to determine their plan and permissions.
-   **Data Stores:**
    -   **`Firebase Auth`**: Stores and manages user credentials.
    -   **`users` Collection**: Stores application-specific user data like plan, credits, etc.
-   **Data Flows:**
    -   `User Credentials` -> `Login/Signup UI` -> `Firebase Auth`
    -   `User Profile Data` -> `users` Collection -> `Application UI`

### Process 2: Resume Management

-   **External Entity:** User
-   **Processes:**
    1.  **Create/Update Resume:** The user interacts with the **Resume Builder UI**. Changes to fields like `name`, `experience`, `skills`, etc., are collected.
    2.  **Save Resume:** On saving, the system upserts the entire resume object into the `resumes` collection, using the user's UID as the document ID.
    3.  **Load Resume:** When the user visits the builder, the system fetches the document from the `resumes` collection corresponding to their UID.
-   **Data Store:**
    -   **`resumes` Collection**: Stores the structured content of each user's resume.
-   **Data Flows:**
    -   `Resume Form Data` -> `Resume Builder UI` -> `resumes` Collection
    -   `Resume Document` -> `resumes` Collection -> `Resume Builder UI` & `Live Preview`

### Process 3: AI Feature Usage (e.g., Resume Analyzer)

-   **External Entity:** User
-   **Processes:**
    1.  **Submit for Analysis:** The user uploads a resume file (`.pdf`, `.docx`) via the **Resume Analyzer UI**.
    2.  **Credit Check (for 'free' plan):** The system checks if the user's `credits` in the `users` document is greater than 0.
    3.  **Call AI Flow:** The system sends the resume file to the `analyzeResume` Genkit flow.
    4.  **Decrement Credit:** If the user is on the 'free' plan, the system updates the `users` document to decrement the `credits` count.
    5.  **Display Results:** The AI-generated `strengths`, `weaknesses`, and `suggestions` are returned and displayed on the UI.
-   **Data Stores:**
    -   **`users` Collection**: Read for credit check, written to for credit decrement.
-   **Data Flows:**
    -   `Resume File` -> `AI Feature UI` -> `Genkit AI Flow`
    -   `Credits Count` -> `users` Collection -> `System Logic`
    -   `AI Analysis JSON` -> `Genkit AI Flow` -> `AI Feature UI`

### Process 4: Subscription Upgrade (User & Admin Interaction)

-   **External Entities:** User, Admin
-   **Processes:**
    1.  **Request Upgrade:** The user selects a 'Pro' or 'Recruiter' plan from the **Pricing Page**. The system shows a **Payment Dialog**.
    2.  **Fetch Payment Details:** The dialog fetches `upiId` and `qrCodeImageUrl` from the `settings` collection.
    3.  **Confirm Payment:** The user clicks "I have paid." The system updates the user's document in the `users` collection to `plan: 'pending'` and sets the `requestedPlan`.
    4.  **Upload Proof:** The user is redirected to the **Profile Page**, where they upload a payment proof image. This image is saved to **Firebase Storage**, and the URL is stored in the `paymentProofURL` field in their `users` document.
    5.  **Admin Review:** The **Admin Panel** queries the `users` collection for all users with `plan: 'pending'`. The admin reviews the `paymentProofURL`.
    6.  **Approve/Reject:** The admin approves or rejects the request. The system updates the user's document in the `users` collection to the `requestedPlan` (e.g., 'pro') or back to 'free'.
-   **Data Stores:**
    -   **`users` Collection**: Manages the user's state through the upgrade process (`free` -> `pending` -> `pro`).
    -   **`settings` Collection**: Provides payment details to the user.
    -   **`Firebase Storage`**: Stores the payment proof images.
-   **Data Flows:**
    -   `Payment Details` -> `settings` Collection -> `Payment Dialog`
    -   `Upgrade Request` -> `Pricing Page` -> `users` Collection
    -   `Payment Proof Image` -> `Profile Page` -> `Firebase Storage`
    -   `Payment Proof URL` -> `Firebase Storage` -> `users` Collection
    -   `Pending Requests` -> `users` Collection -> `Admin Panel`
    -   `Approval/Rejection` -> `Admin Panel` -> `users` Collection
