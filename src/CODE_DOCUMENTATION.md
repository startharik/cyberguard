# CyberGuardian: Codebase Documentation

This document provides a detailed walkthrough of the CyberGuardian application's source code. It is designed to help developers understand the structure, purpose, and interaction of the various files and directories.

## `src` Directory Structure

The `src` directory contains the core application code, organized as follows:

-   **/app**: Contains all application routes, following the Next.js App Router convention. Each folder inside `/app` maps to a URL segment.
-   **/components**: Contains all reusable React components.
-   **/lib**: Contains library functions, server-side logic (actions), and core utilities.
-   **/ai**: Contains all functionality related to Generative AI, powered by Firebase Genkit.
-   **/hooks**: Contains custom React hooks.
-   **/middleware.ts**: A single file to handle request-level logic like authentication checks.

---

## 1. Routing and Pages (`src/app`)

CyberGuardian uses the Next.js App Router. Each page is a server component by default, which improves performance by rendering on the server.

-   `layout.tsx`: The root layout for the entire application. It sets up the HTML structure, includes global CSS, and applies fonts.
-   `page.tsx`: The home page, which simply redirects authenticated users to the `/dashboard`.
-   `/login/page.tsx` & `/register/page.tsx`: These routes render the `AuthForm` component for user login and registration.
-   `/dashboard/page.tsx`: The main user dashboard. It fetches user data and quiz results to display statistics and action cards. It dynamically shows different content for regular users versus administrators.
-   `/quiz/page.tsx`: Lists all available quizzes for the user to take.
-   `/quiz/[quizId]/page.tsx`: The page where a user takes a specific quiz. It fetches the quiz questions, shuffles them, and passes them to the `QuizClient` component.
-   `/quiz/results/page.tsx`: Displays the user's score after completing a quiz.
-   `/chatbot/page.tsx`: Renders the `ChatbotClient` component, providing the interface for the AI assistant.
-   `/admin/**`: All routes under `/admin` are protected and only accessible to users with the `isAdmin` flag.
    -   `/admin/quizzes/page.tsx`: Lists all existing quizzes and provides links to create, edit, or delete them.
    -   `/admin/quizzes/new/page.tsx`: Renders the `QuizForm` for creating a new quiz.
    -   `/admin/quizzes/[quizId]/edit/page.tsx`: Renders the `QuizForm` pre-filled with an existing quiz's data for editing.
    -   `/admin/users/page.tsx`: Lists all registered users, includes a search bar, and provides options to edit or delete users.
    -   `/admin/users/[userId]/edit/page.tsx`: Renders a form to edit a user's details (name, email, role).

---

## 2. Reusable Components (`src/components`)

This directory is for components that are used across multiple pages.

-   `/auth/AuthForm.tsx`: A client component that handles both login and registration. It uses the `useActionState` hook to manage form state and display errors returned from server actions.
-   `/chatbot/ChatbotClient.tsx`: The complete UI for the AI chatbot. It manages the conversation history and calls a server action to get responses from the Genkit flow.
-   `/dashboard/*.tsx`: Components specific to the dashboard, such as `OverallStats`, `ResultsChart`, and `ResultsTable`, which are responsible for visualizing user performance data.
-   `/layout/AppLayout.tsx`: The main layout for authenticated parts of the app. It includes the sidebar navigation and the header with the user menu. It dynamically renders admin links based on the user's role.
-   `/layout/UserNav.tsx`: The user dropdown menu in the header, containing the user's name, email, and a logout button.
-   `/quiz/QuizClient.tsx`: A client component that manages the state of an active quiz session. It tracks the current question, user's answers, score, and handles the logic for submitting answers and progressing through the quiz.
-   `/ui/`: Contains all the pre-built UI components from **ShadCN UI**, such as `Button.tsx`, `Card.tsx`, `Input.tsx`, etc. These are the building blocks for the application's interface.
-   `/Logo.tsx`: A simple component that renders the CyberGuardian logo with a custom SVG gradient.

---

## 3. Core Logic & Data (`src/lib`)

This is the heart of the application's server-side logic and data handling.

-   `/actions/`: This directory contains all **Server Actions**, which are asynchronous functions that run on the server and can be called directly from client components. This avoids the need to create separate API endpoints for form submissions and data mutations.
    -   `auth.actions.ts`: Handles user registration (`registerUser`), login (`loginUser`), and logout. It interacts with the database and manages the session cookie.
    -   `quiz.actions.ts`: Contains actions for creating, updating, and deleting quizzes (`createQuiz`, `updateQuiz`, `deleteQuiz`) and for saving a user's quiz results (`saveQuizResult`).
    -   `user.actions.ts`: Contains actions for updating user details and deleting users (`updateUser`, `deleteUser`).
-   `db.ts`: Manages the SQLite database connection. Its most important export is `getDb()`, a singleton function that initializes the database and schema on the first call. It also handles seeding the initial data from the JSON files in the `/data` directory if the database is empty.
-   `session.ts`: Contains the `getCurrentUser` function. This server-only utility reads the `session-id` cookie from the incoming request, queries the database, and returns the currently logged-in user's data.
-   `types.ts`: Defines shared TypeScript interfaces (`User`, `Quiz`, `Question`, etc.) used throughout the application.
-   `utils.ts`: A utility file from ShadCN UI, primarily for merging Tailwind CSS classes.

---

## 4. Artificial Intelligence (`src/ai`)

This directory houses the Genkit configuration and AI-powered logic.

-   `genkit.ts`: Initializes and configures the main Genkit instance. It specifies the plugins to use (e.g., `googleAI`) and sets the default LLM model (`gemini-2.0-flash`).
-   `/flows/cyberguardian-chatbot.ts`: Defines the Genkit "flow" for the chatbot.
    -   It defines input (`question`) and output (`answer`) schemas using Zod for type safety and structured responses.
    -   It contains `ai.definePrompt`, which holds the master prompt (the instructions) for the Gemini model. This prompt tells the AI how to act like a friendly cybersecurity expert.
    -   The flow (`askCybersecurityQuestionFlow`) takes the user's question, sends it to the model via the prompt, and returns the structured answer.

---

## 5. Middleware (`src/middleware.ts`)

The `middleware.ts` file is a special Next.js file that runs before a request is completed. In CyberGuardian, its role is to handle authentication and protect routes.

-   It checks for the `session-id` cookie on every incoming request.
-   If a user tries to access a protected route (like `/dashboard` or `/admin`) without a session cookie, it redirects them to the `/login` page.
-   If a logged-in user tries to visit the `/login` or `/register` pages, it redirects them to their `/dashboard`.
