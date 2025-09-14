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
