# Chore Champions - A Next.js & Appwrite Powered Chore Chart

Welcome to Chore Champions! This application helps families manage household chores, assign them to kids, and track their progress in a fun and engaging way.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [1. Appwrite Setup](#1-appwrite-setup)
    - [Create Appwrite Project](#create-appwrite-project)
    - [Appwrite Configuration IDs](#appwrite-configuration-ids)
    - [Database Setup](#database-setup)
    - [Storage Setup (for Profile Photos)](#storage-setup-for-profile-photos)
    - [Collection & Bucket Permissions](#collection--bucket-permissions)
  - [2. Local Development Setup](#2-local-development-setup)
    - [Clone Repository](#clone-repository)
    - [Install Dependencies](#install-dependencies)
    - [Environment Variables](#environment-variables)
    - [Update Appwrite IDs in Code](#update-appwrite-ids-in-code)
- [Running the Application](#running-the-application)
- [Seeding Sample Data (Optional)](#seeding-sample-data-optional)
- [Folder Structure Overview](#folder-structure-overview)
- [Learn More (Next.js)](#learn-more-nextjs)
- [Deploy on Vercel](#deploy-on-vercel)

## Features

*   **Kid Management:** Add, edit, and delete kid profiles. Upload custom photos or use default SVG avatars.
*   **Chore Management:** Create, edit, and delete chores with descriptions and frequency (daily/weekly).
*   **Chore Assignment:** Assign chores to multiple kids for specific dates.
*   **Chore Tracking:** Kids (or parents) can mark assigned chores as 'pending' or 'done'.
*   **Progress Indicators:** Visual progress bars on the main dashboard and individual kid's chore page to track daily completion.
*   **User-Friendly Interface:** A bright, engaging, and kid-friendly UI theme built with Tailwind CSS.
*   **Navigation:** Easy-to-use header navigation and quick action links on the dashboard.

## Technology Stack

*   **Frontend:** [Next.js](https://nextjs.org/) (React Framework)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database:** [Appwrite](https://appwrite.io/) (Self-hosted or Cloud)
    *   Appwrite Databases: For storing kid, chore, and assignment data.
    *   Appwrite Storage: For user-uploaded kid profile photos.
    *   Appwrite Web SDK: Used for client-side interaction with Appwrite services.
*   **Fonts:** [Geist](https://vercel.com/font) (via `next/font`)

## Setup Instructions

Follow these steps to get the Chore Champions application running locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   An Appwrite instance (either [Appwrite Cloud](https://cloud.appwrite.io/) or a [self-hosted](https://appwrite.io/docs/installation) version).

### 1. Appwrite Setup

#### Create Appwrite Project

1.  Log into your Appwrite Console.
2.  Create a new **Project**.
3.  Under "Platforms," add a **Web** platform.
    *   **Name:** (e.g., "Chore Champions App")
    *   **Hostname:** `localhost` (for local development). Add your deployment hostname later if needed.

#### Appwrite Configuration IDs

You will need to obtain several IDs from your Appwrite project. These are crucial for connecting the Next.js application to your Appwrite backend.

**A. Environment Variables (`.env.local`):**
These are used to initialize the Appwrite client.

*   `NEXT_PUBLIC_APPWRITE_ENDPOINT`: Your Appwrite API Endpoint.
    *   *Find it in:* Appwrite Console > Your Project > Settings > API Endpoints > Endpoint.
*   `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite Project ID.
    *   *Find it in:* Appwrite Console > Your Project > Settings > General > Project ID.

**B. JavaScript Constants (in application code):**
These IDs are used directly in the page/component files to interact with specific Appwrite resources. **You will need to replace the placeholder strings in the code with these actual IDs.**

*   `DATABASE_ID`: The ID of the database you will create/use.
    *   *Find/Create it in:* Appwrite Console > Your Project > Databases > (Create or Select Database) > Database ID (in settings).
*   `KIDS_COLLECTION_ID`: The ID for the `kids` collection.
    *   *Find/Create it in:* Appwrite Console > Your Project > Databases > Your Database > (Create Collection `kids`) > Collection ID (in settings).
*   `CHORES_COLLECTION_ID`: The ID for the `chores` collection.
    *   *Find/Create it in:* Appwrite Console > Your Project > Databases > Your Database > (Create Collection `chores`) > Collection ID (in settings).
*   `ASSIGNMENTS_COLLECTION_ID`: The ID for the `assignments` collection.
    *   *Find/Create it in:* Appwrite Console > Your Project > Databases > Your Database > (Create Collection `assignments`) > Collection ID (in settings).
*   `PROFILE_PHOTOS_BUCKET_ID`: The ID for the Storage Bucket used for kid profile photos.
    *   *Find/Create it in:* Appwrite Console > Your Project > Storage > (Create Bucket `profile_photos`) > Bucket ID (in settings).

#### Database Setup

1.  In your Appwrite Console, navigate to **Databases**.
2.  Create a new Database (e.g., name it "ChoreChartDB" or use the default). Note its `DATABASE_ID`.
3.  Inside your chosen database, create the following collections with the specified attributes:

    **`kids` Collection:**
    *   **Collection ID:** (e.g., `kids`). Note this as `KIDS_COLLECTION_ID`.
    *   **Attributes:**
        *   `kid_id` (String, Size: 255, **Required**) *(Note: This field was originally planned but Appwrite's document ID `$id` is used as the unique identifier in the code. You can omit this specific attribute if relying solely on `$id` for uniqueness, or keep it for specific mapping if your logic requires it. The current code uses `$id` primarily.)*
        *   `name` (String, Size: 255, **Required**)
        *   `photo_url` (String, Size: 1024, Optional) *(Stores Appwrite File ID for custom photos, or path for default avatars)*
        *   `default_avatar_used` (Boolean, **Required**, Default: `false`)
        *   `created_at` (Datetime, **Required**) *(Note: Appwrite provides `$createdAt` automatically. This manual field is only needed if you need to override or manage this timestamp specifically. Current code relies on `$createdAt`.)*

    **`chores` Collection:**
    *   **Collection ID:** (e.g., `chores`). Note this as `CHORES_COLLECTION_ID`.
    *   **Attributes:**
        *   `chore_id` (String, Size: 255, **Required**) *(Similar to `kid_id`, `$id` is used in code. Omit or keep based on preference.)*
        *   `title` (String, Size: 255, **Required**)
        *   `description` (String, Size: 1024, Optional)
        *   `frequency` (String, Size: 50, **Required**) *(Valid values: "daily", "weekly")*

    **`assignments` Collection:**
    *   **Collection ID:** (e.g., `assignments`). Note this as `ASSIGNMENTS_COLLECTION_ID`.
    *   **Attributes:**
        *   `assignment_id` (String, Size: 255, **Required**) *(Similar to `kid_id`, `$id` is used in code. Omit or keep based on preference.)*
        *   `kid_id` (String, Size: 255, **Required**) *(Stores the `$id` of a document from the `kids` collection)*
        *   `chore_id` (String, Size: 255, **Required**) *(Stores the `$id` of a document from the `chores` collection)*
        *   `date` (Datetime, **Required**) *(Stores the date for which the chore is assigned, in ISO 8601 format)*
        *   `status` (String, Size: 50, **Required**, Default: `"pending"`) *(Valid values: "pending", "done")*

    *Important Note on `*_id` attributes vs. `$id`*: The application code primarily uses Appwrite's auto-generated document ID (`$id`) for uniqueness and relationships. The explicitly defined `kid_id`, `chore_id`, and `assignment_id` attributes in the collection setup above are redundant if you strictly follow the current code's approach. You can simplify your collection setup by omitting them if you prefer to rely only on `$id`. If you choose to keep them, ensure your application logic populates them (e.g., with `ID.unique()` if they are meant to be Appwrite-like unique IDs, or with `$id` if they are just mirrors). The current implementation does not actively populate these custom `*_id` fields.

#### Storage Setup (for Profile Photos)

1.  In your Appwrite Console, navigate to **Storage**.
2.  Create a new **Bucket**.
    *   **Name:** `profile_photos` (or a name of your choice).
    *   **Bucket ID:** Note this down. This will be your `PROFILE_PHOTOS_BUCKET_ID`.
3.  Go to the bucket's **Settings** tab.
4.  **File Security (Optional but Recommended):** Enable "File Security" if you want Appwrite to scan uploaded files.

#### Collection & Bucket Permissions

For each Collection (`kids`, `chores`, `assignments`) and the Storage Bucket (`profile_photos`):

1.  Navigate to its **Settings** tab.
2.  Go to the **Permissions** section.
3.  For development purposes, you can grant general access. A common approach is to assign **Role: Any** the following permissions:
    *   **Collections:** Create, Read, Update, Delete.
    *   **Bucket:** Create, Read, Update, Delete.
4.  **Important for Production:** For a live application, you **must** configure more restrictive permissions (e.g., only allowing authenticated users to access their own data, specific roles for write access, etc.). Refer to the official [Appwrite Permissions Documentation](https://appwrite.io/docs/advanced/platform/permissions) and [Storage Permissions](https://appwrite.io/docs/storage#permissions).

### 2. Local Development Setup

#### Clone Repository

```bash
git clone <repository_url> # Replace <repository_url> with the actual URL
cd <repository_folder_name>
```

#### Install Dependencies

Using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

#### Environment Variables

1.  Create a new file named `.env.local` in the root of the project.
2.  Copy the contents of `.env.local.example` into `.env.local`.
3.  Fill in your Appwrite details:
    ```env
    NEXT_PUBLIC_APPWRITE_ENDPOINT="YOUR_APPWRITE_API_ENDPOINT"
    NEXT_PUBLIC_APPWRITE_PROJECT_ID="YOUR_APPWRITE_PROJECT_ID"
    ```
    Replace the placeholder values with the actual **API Endpoint** and **Project ID** you noted earlier.

#### Update Appwrite IDs in Code

Manually update the placeholder constants for Database, Collection, and Bucket IDs in the following files with the actual IDs you obtained from your Appwrite setup:

*   `app/page.js` (Dashboard - uses Kids, Assignments)
*   `app/manage-kids/page.js` (Kid management - uses Kids DB, Profile Photos Bucket)
*   `app/components/KidCard.js` (Uses Profile Photos Bucket)
*   `app/manage-chores/page.js` (Chore management - uses Chores DB)
*   `app/assign-chores/page.js` (Assigning chores - uses Kids, Chores, Assignments DBs)
*   `app/view-kid-chores/[kidId]/page.js` (Viewing kid's chores - uses Kids, Chores, Assignments DBs, Profile Photos Bucket)

**Example (in `app/manage-kids/page.js` and other files):**
Change:
```javascript
const DATABASE_ID = 'YOUR_APPWRITE_DATABASE_ID'; 
const KIDS_COLLECTION_ID = 'YOUR_KIDS_COLLECTION_ID';
const PROFILE_PHOTOS_BUCKET_ID = 'YOUR_PROFILE_PHOTOS_BUCKET_ID';
```
To (for example):
```javascript
const DATABASE_ID = '65ba5d89c070f38fcd4r'; 
const KIDS_COLLECTION_ID = '65ba5d9f8f8a868f5155';
const PROFILE_PHOTOS_BUCKET_ID = '65ba5e89z717f08fae7r';
```
**This step is crucial for the application to function correctly.**

## Running the Application

1.  Ensure you have completed all the setup steps above (Appwrite and Local).
2.  Start the Next.js development server:

    Using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```
3.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

You should now see the Chore Champions application running!

## Seeding Sample Data (Optional)

After setting up your collections and attributes, you can add some sample data directly in your Appwrite Console to test the application:

1.  Navigate to **Databases** > Your Database > Select a Collection (e.g., `kids`).
2.  Click **"Create Document"** or the "+" icon.
3.  Appwrite will auto-generate a Document ID (`$id`). Fill in the other attributes based on the collection structure.

**Sample `kids` Data:**
*   `name`: "Alex"
*   `photo_url`: "/avatars/avatar1.svg" *(Uses one of the default SVGs from `/public/avatars/`)*
*   `default_avatar_used`: `true`

*   `name`: "Bella"
*   `photo_url`: "/avatars/avatar2.svg"
*   `default_avatar_used`: `true`

**Sample `chores` Data:**
*   `title`: "Make Bed"
*   `description`: "Make your bed every morning after waking up."
*   `frequency`: "daily"

*   `title`: "Tidy Room"
*   `description`: "Clean and organize your room. Put away toys and clothes."
*   `frequency`: "weekly"

**Sample `assignments` Data:**
*(Requires `kid_id` and `chore_id` to be the `$id` values from existing documents in `kids` and `chores` collections respectively)*
*   `kid_id`: (The `$id` of "Alex" from the `kids` collection)
*   `chore_id`: (The `$id` of "Make Bed" from the `chores` collection)
*   `date`: (Today's date in ISO 8601 format, e.g., `2023-10-27T00:00:00.000Z`)
*   `status`: `"pending"`

## Folder Structure Overview

A brief overview of the key directories:

*   `app/`: Contains all the application routes, pages, and core layout.
    *   `app/lib/appwrite.js`: Initializes the Appwrite client.
    *   `app/components/`: Reusable UI components (e.g., `KidCard.js`, `ChoreForm.js`).
    *   `app/(pages)/`: Route groups for different sections like `manage-kids`, `assign-chores`, etc.
        *   `page.js`: The main UI for that route.
*   `public/`: Static assets like images (including default avatars in `public/avatars/`).
*   `.env.local.example`: Example file for environment variables.

## Learn More (Next.js)

This project is a standard Next.js application. To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. Remember to configure your Vercel project with the same environment variables found in your `.env.local` file.
