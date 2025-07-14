# CyberGuardian: AI-Powered Cybersecurity Education Platform

CyberGuardian is a web application built with Next.js designed to make learning about cybersecurity engaging and interactive. It features AI-driven conversations, dynamic quizzes, and a comprehensive dashboard for users to track their progress. It also includes a full administrative panel for managing application content like quizzes and users.

A detailed explanation of the codebase can be found in [`src/CODE_DOCUMENTATION.md`](./src/CODE_DOCUMENTATION.md).

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

-   `src/app`: Contains all the application's routes and pages, following the Next.js App Router convention. This is where the user-facing parts of the site are defined.
-   `src/components`: Home to all reusable React components, such as UI elements (`button`, `card`), layouts (`AppLayout`), and complex interactive forms (`QuizForm`).
-   `src/lib`: A collection of core logic, including database connection (`db.ts`), server-side operations (`actions/`), user session management (`session.ts`), and type definitions (`types.ts`).
-   `src/ai`: Contains all the logic for the Generative AI features, powered by Genkit. Flows are defined in the `flows/` subdirectory.
-   `data`: Holds the SQLite database file (`cyberguardian.db`) and the initial seed data (`quizzes.json`, `users.json`).

### 2. Data and Database Flow

-   **Database File**: The application uses a local SQLite database stored in `data/cyberguardian.db`. This single file holds all user, quiz, and results data.
-   **Initialization (`lib/db.ts`)**: When the application first starts, the `getDb` function is called. It checks if a database connection already exists. If not, it establishes one.
-   **Schema Creation**: The `initializeDb` function is then run. It executes SQL commands to create the necessary tables (`users`, `quizzes`, `questions`, `quiz_results`) if they don't already exist.
-   **Data Seeding**: After ensuring the tables exist, the function checks if the `users` table is empty. If it is, the app assumes this is the very first run and populates the database with initial data from `data/users.json` and `data/quizzes.json`. This ensures the application has content to work with from the start.

### 3. Authentication Flow

-   **User Interaction**: The user enters their credentials into the `AuthForm` component (`src/components/auth/AuthForm.tsx`).
-   **Server Action**: The form submission calls a **Server Action** (`loginUser` or `registerUser` from `lib/actions/auth.actions.ts`).
-   **Database Check**: The server action securely communicates with the database to verify credentials or create a new user.
-   **Session Cookie**: Upon successful login, the server action uses the `cookies()` function from Next.js to set an HTTP-only cookie named `session-id`. This cookie contains the user's unique ID and is sent with every subsequent request to the server.
-   **Middleware Protection (`src/middleware.ts`)**: The middleware intercepts all incoming requests. It checks for the presence of the `session-id` cookie. If a user tries to access a protected page (e.g., `/dashboard`) without a valid cookie, they are redirected to `/login`.
-   **User Retrieval (`lib/session.ts`)**: On protected pages, server components call `getCurrentUser()` to read the cookie, query the database, and retrieve the full details of the logged-in user, making their data available for rendering.

### 4. Admin vs. User Roles

-   **First User is Admin**: The `registerUser` action checks if the new user is the first one being created. If so, it sets the `isAdmin` boolean flag to `true` for that user in the database.
-   **Dynamic UI**: The application's UI adapts based on the `isAdmin` property of the `user` object.
    -   `AppLayout` shows or hides the "Admin" section in the navigation.
    -   The `Dashboard` page displays different cards and a different welcome message for users versus admins.
    -   The `/admin` routes are protected by checking `user.isAdmin` at the top of each page component, redirecting if the user is not an admin.

### 5. Quiz and Results Logic

-   **Taking a Quiz**: When a user navigates to `/quiz/[quizId]`, the server component fetches the quiz questions from the database and uses a `shuffle` function to randomize their order.
-   **Client-Side State (`QuizClient.tsx`)**: The shuffled questions are passed to this client component, which manages the state of the active quiz. It keeps track of the current question index, the answers the user has selected, and the running score.
-   **Saving Results**: When the final question is answered, the `saveQuizResult` server action is called. This action records the `userId`, `quizId`, `score`, `totalQuestions`, and a timestamp into the `quiz_results` table in the database.
-   **Displaying Statistics**: The dashboard page (`/dashboard/page.tsx`) fetches all results for the logged-in user from the `quiz_results` table. This data is then passed as props to the `OverallStats`, `ResultsChart`, and `ResultsTable` components to render the user's performance metrics.

### 6. AI Chatbot with Genkit

-   **Genkit Flow (`ai/flows/cyberguardian-chatbot.ts`)**: This file is the "brain" of the AI.
    -   `ai.definePrompt`: This configures the instructions sent to the Gemini model. It tells the AI its persona (a friendly cybersecurity expert) and how it should format its answers.
    -   `ai.defineFlow`: This wraps the prompt in a "flow," which is Genkit's term for a reusable, server-side AI task.
-   **Chat Interface (`components/chatbot/ChatbotClient.tsx`)**: This client component provides the UI. When a user sends a message, it calls the `chatAction` server action.
-   **Server Action Bridge**: The `chatAction` (defined within the client component file for collocation) calls the exported `askCybersecurityQuestion` function from the Genkit flow file, passing the user's message.
-   **Response Stream**: The Genkit flow communicates with the Google Gemini API, gets the response, and sends it back to the client component, which then updates the chat history on the screen.
