# CyberGuardian: AI-Powered Cybersecurity Education Platform

CyberGuardian is a web application built with Next.js designed to make learning about cybersecurity engaging and interactive. It features AI-driven conversations, dynamic quizzes, and a comprehensive dashboard for users to track their progress. It also includes a full administrative panel for managing application content like quizzes and users.

## Key Features

-   **User Authentication**: Secure login and registration system. The first user to register automatically becomes an administrator.
-   **Interactive Quizzes**: Users can test their knowledge with multiple-choice quizzes on various cybersecurity topics. Questions are randomized for replayability.
-   **AI Chatbot**: An integrated AI assistant, powered by Google's Gemini model via Genkit, to answer any cybersecurity-related questions in a simple and understandable way.
-   **User Dashboard**: A personalized dashboard displaying performance statistics, including an overall summary, a chart of recent quiz scores, and a detailed history of all completed quizzes.
-   **Admin Panel**: A protected area for administrators to:
    -   **Manage Quizzes**: Create, read, update, and delete quizzes and their questions.
    -   **Manage Users**: View a list of all users, search for specific users, edit user details (name, email, role), and delete users.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with [Google's Gemini API](https://ai.google.dev/)
-   **Database**: [SQLite](https://www.sqlite.org/index.html) for local data persistence.
-   **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation.
-   **Charts**: [Recharts](https://recharts.org/)

---

## Local Setup on Windows

Follow these steps to get a local copy of CyberGuardian up and running on your Windows machine.

### Prerequisites

Before you begin, ensure you have the following software installed:

1.  **Node.js**: Required to run the JavaScript-based application. Download it from [nodejs.org](https://nodejs.org/en/download). The LTS (Long-Term Support) version is recommended.
2.  **Git**: A version control system needed to clone the project repository. Download it from [git-scm.com](https://git-scm.com/download/win).
3.  **Code Editor**: A source-code editor like [Visual Studio Code](https://code.visualstudio.com/download) is highly recommended for development.

### Installation Steps

**Step 1: Clone the Repository**

Open a terminal (like Command Prompt, PowerShell, or the integrated terminal in VS Code) and run the following command to download the project files:

```bash
git clone https://github.com/your-username/cyberguardian.git
```

Navigate into the newly created project directory:

```bash
cd cyberguardian
```

**Step 2: Install Project Dependencies**

Once inside the project folder, run the following command. This will read the `package.json` file and install all the necessary libraries and packages for the project to run.

```bash
npm install
```

**Step 3: Set Up Environment Variables**

The AI features of this application rely on the Google Gemini API, which requires an API key.

1.  **Get a Google AI API Key**:
    -   Visit [Google AI Studio](https://aistudio.google.com/).
    -   Sign in with your Google account.
    -   Click on "**Get API key**" and then "**Create API key**".
    -   Copy the generated key to your clipboard.

2.  **Create the `.env` file**:
    -   In the root of your project folder, create a new file named `.env`.
    -   Open the `.env` file and add the following line, pasting your API key where indicated:

    ```
    GOOGLE_API_KEY="YOUR_API_KEY_HERE"
    ```

**Step 4: Run the Development Server**

You are now ready to start the application. Run the following command in your terminal:

```bash
npm run dev
```

This command starts the Next.js development server. You should see output in your terminal indicating that the server is running, usually on `http://localhost:9002`.

Open your web browser and navigate to `http://localhost:9002` to see the application in action!

---

## How It Works: Application Architecture

### 1. Project Structure

The codebase is organized into several key directories within the `src` folder:

-   `src/app`: Contains all the application's routes and pages, following the Next.js App Router convention.
-   `src/components`: Home to all reusable React components, such as UI elements (`button`, `card`), layouts, and forms.
-   `src/lib`: A collection of library functions, including database connection (`db.ts`), server actions (`actions/`), user session management (`session.ts`), and utility functions.
-   `src/ai`: Contains all the logic for the Generative AI features, powered by Genkit. Flows are defined in the `flows/` subdirectory.
-   `data`: Holds the SQLite database file (`cyberguardian.db`) and the initial seed data (`quizzes.json`, `users.json`).

### 2. Data and Database

-   **SQLite Database**: The application uses a local SQLite database (`data/cyberguardian.db`) to store all data.
-   **Initialization (`lib/db.ts`)**: When the application first starts, the `initializeDb` function checks if the database tables exist. If not, it creates them (`users`, `quizzes`, `questions`, `quiz_results`).
-   **Seeding**: After creating the tables, it checks if any data exists. If the database is empty, it populates the `users` and `quizzes` tables with the initial data found in `data/users.json` and `data/quizzes.json`. This ensures the app has content to work with on the first run.

### 3. Authentication Flow

-   **Middleware (`src/middleware.ts`)**: This file intercepts incoming requests to protect routes. It ensures that unauthenticated users cannot access the dashboard or admin pages and redirects logged-in users away from the login/register pages.
-   **Session Management (`lib/session.ts`)**: User sessions are managed via an HTTP-only cookie named `session-id`. When a user logs in, their unique user ID is stored in this cookie. The `getCurrentUser` function reads this cookie to identify the logged-in user for subsequent requests.
-   **Server Actions (`lib/actions/auth.actions.ts`)**: The `loginUser`, `registerUser`, and `logout` functions handle the core authentication logic, interacting with the database and managing the session cookie.

### 4. Admin vs. User Roles

-   The **first user** who registers is automatically assigned the `isAdmin` role.
-   The UI dynamically adjusts based on the user's role. For example, the `AppLayout` component shows or hides the "Admin" section in the navigation, and the `Dashboard` page displays different cards for users and admins.

### 5. Quiz and Results Logic

-   **Taking a Quiz**: When a user starts a quiz, the questions are fetched from the database and shuffled (`src/app/quiz/[quizId]/page.tsx`).
-   **Client-Side State**: The `QuizClient.tsx` component manages the state of the active quiz, including the current question, selected answers, and score.
-   **Saving Results**: Upon completion, the `saveQuizResult` server action is called to record the user's score, the quiz ID, and a timestamp in the `quiz_results` table.
-   **Displaying Statistics**: The dashboard fetches all results for the logged-in user from the `quiz_results` table and uses this data to render the `OverallStats` cards, the `ResultsChart`, and the `ResultsTable`.

### 6. AI Chatbot with Genkit

-   **Genkit Flow (`ai/flows/cyberguardian-chatbot.ts`)**: This file defines the core logic for the AI chatbot.
    -   `ai.definePrompt`: Configures the prompt that is sent to the Gemini model, including instructions on how to behave as a helpful cybersecurity expert.
    -   `ai.defineFlow`: Wraps the prompt in a "flow," which is Genkit's way of defining a reusable AI-powered task.
-   **Chat Interface (`components/chatbot/ChatbotClient.tsx`)**: This client component provides the UI for the chat. It uses a server action (`chatAction`) to send the user's message to the Genkit flow and stream the AI's response back to the interface.