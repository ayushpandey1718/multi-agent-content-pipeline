# Multi-Agent Content Pipeline 🤖✍️🔍✨

This project is a multi-agent content generation pipeline built with Next.js and powered by the Google Gemini API. It takes a Product Requirements Document (PRD) as input and orchestrates a team of specialized AI agents to research, write, fact-check, and polish a final blog post.

The entire process is logged to a Supabase Postgres database, demonstrating a Data Ops approach to managing AI-generated content.

---

## 🚀 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (React), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** Next.js API Routes (Serverless Functions)
- **AI / LLM:** [Google Gemini API](https://ai.google.dev/)
- **Database:** [Supabase](https://supabase.io/) (Postgres) for logging agent outputs.
- **Deployment:** Vercel (recommended)

---

## ✨ Features

-   **Multi-Agent System:** A sequential pipeline of four distinct AI agents collaborating to produce content.
    -   **Researcher Agent:** Gathers key factual points based on the PRD.
    -   **Writer Agent:** Drafts an initial blog post using the PRD and research.
    -   **Fact-Checker Agent:** Verifies claims in the draft against the source research, with a built-in revision loop.
    -   **Style-Polisher Agent:** Refines the final draft for tone, style, and clarity.
-   **Data Ops & Logging:** Every agent's input and output is logged to a Supabase database for traceability and debugging.
-   **Simple UI:** A clean and straightforward interface to input a PRD and view the generated content.

---

## 🛠️ Getting Started: Local Setup

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later recommended)
-   [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/ayushpandey1718/multi-agent-content-pipeline)
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    -   Create a copy of the example environment file:
        ```bash
        cp .env.example .env.local
        ```
    -   Open the newly created `.env.local` file and add your secret keys from Google AI Studio and Supabase.

    ```env
    # .env.local

    # Supabase Credentials
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL_HERE"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY_HERE"

    # Google AI API Key
    GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY_HERE"
    ```

4.  **Set up the Supabase database:**
    -   Log in to your Supabase account and create a new project.
    -   Go to the **SQL Editor**.
    -   Run the following SQL query to create the `agent_logs` table:
        ```sql
        CREATE TABLE agent_logs (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          run_id UUID DEFAULT gen_random_uuid(),
          agent TEXT NOT NULL,
          input_data TEXT,
          output_data TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

##  flowchart Architectural Overview

The project follows a linear pipeline where the output of one agent becomes the input for the next.

**PRD Input** → **[Researcher Agent]** → **[Writer Agent]** → **[Fact-Checker Agent]** ↺ *(Revision Loop)* → **[Style-Polisher Agent]** → **Final Blog Post**

Each step is logged to Supabase to provide a complete audit trail of the content generation process.

## 🌟 Future Improvements

-   **Visual Timeline:** Implement a UI component to visualize the step-by-step progress of the agent pipeline for a given run.
-   **Metrics Dashboard:** Create a dashboard to display aggregated metrics from the Supabase logs, such as average generation time, fact-check failure rates, etc.
-   **More Complex Agent Interaction:** Explore frameworks like LangGraph to allow for more complex interactions, such as allowing the Fact-Checker to send the draft back to the Researcher for more information.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
