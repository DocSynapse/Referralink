# Sentra Referral OS (Referralink)

## Project Overview

**Sentra Referral OS** is a "Cognitive Referral System" designed to assist healthcare professionals in Indonesia. It functions as a "Referral Assistant" that processes initial medical diagnoses to provide structured outputs including ICD-10 codes, red flags, and referral recommendations (FKTP to FKTL).

The application leverages **Google Gemini** (specifically utilizing the `Gemini 3 Flash` model capabilities) to reason through synthetic customer data and chat transcripts, unifying them into structured records. It features a polished "Material" design interface with real-time processing logs.

## Tech Stack

*   **Frontend Framework:** React 19
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (inferred), Material Web Components (`@material/web`)
*   **AI Integration:** `@google/genai` (Google Gemini API)
*   **Icons:** Lucide React

## Key Features

*   **Medical Diagnosis Analysis:** Input structured or unstructured diagnosis text.
*   **AI Processing:** Uses Gemini to identify ICD-10 codes, medical red flags, and referral pathways.
*   **Real-time Feedback:** Displays a "Log Terminal" showing the reasoning steps of the AI.
*   **History Tracking:** Maintains a session-based history of queries and results.
*   **Visual Design:** High-fidelity UI with animations ("welcome screen"), glassmorphism effects, and a dark/cyan color scheme suited for a professional "Command Center" feel.

## Building and Running

**Prerequisites:**
*   Node.js (v18+ recommended)
*   A Google Gemini API Key

**Setup:**

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

3.  **Run Development Server:**
    Start the local development server (default port: 3000):
    ```bash
    npm run dev
    ```

4.  **Build for Production:**
    Generate the production-ready bundle in the `dist` folder:
    ```bash
    npm run build
    ```

5.  **Preview Production Build:**
    Serve the built application locally:
    ```bash
    npm run preview
    ```

## Project Structure

*   **`App.tsx`**: The main application component containing the layout, state management (history, search input), and the "Welcome Screen".
*   **`services/geminiService.ts`**: Handles interactions with the Google Gemini API (`searchICD10Code`).
*   **`components/`**:
    *   `DataCard.tsx`: Displays the structured output (ICD-10, Red Flags, etc.).
    *   `LogTerminal.tsx`: Visualizes the AI's processing logs.
    *   `SentraLogo.tsx`: The project's logo component.
*   **`types.ts`**: TypeScript definitions for `MedicalQuery`, `ProcessedResult`, etc.
*   **`constants.ts`**: Contains mock queries and configuration constants.

## Development Conventions

*   **Component Architecture:** Functional React components with Hooks (`useState`, `useEffect`, `useRef`).
*   **Styling:** Utility-first CSS (Tailwind) combined with Material Web Components for interactive elements (buttons, icons).
*   **State Management:** Local component state (finding no evidence of Redux/Zustand in the main file).
*   **Type Safety:** Strict TypeScript usage for data models (e.g., `MedicalQuery`).
