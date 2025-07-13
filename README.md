# DeepDetect: AI-Powered Deepfake Detection

DeepDetect is an advanced, AI/ML-based solution designed to analyze and detect face-swap deepfake videos with high accuracy. It provides a user-friendly interface for uploading videos and receiving a comprehensive forensic analysis, helping to combat the spread of digital misinformation.

![DeepDetect Screenshot](https://placehold.co/800x400.png?text=DeepDetect+UI)

## ✨ Key Features

- **Advanced Deepfake Analysis:** Upload a video file and our AI will perform a frame-by-frame analysis to identify signs of digital manipulation.
- **Detailed Forensic Reports:** Receive a comprehensive, easy-to-understand report detailing the analysis findings, including a final assessment, confidence score, and detected abnormalities.
- **Interactive Analysis Dashboard:** Visualize the analysis with an advanced dashboard that includes:
    - **Timeline Analysis:** A frame-by-frame confidence graph across the video's duration.
    - **Multi-Modal Breakdown:** Placeholder sections for Audio-Visual Sync, Frequency Analysis, and Biometric Consistency.
    - **Explainable AI (XAI):** Understand the AI's process with a simplified workflow chart and insights into the potential creation method and sophistication level.
    - **Forensics:** Placeholder sections for Chain of Custody and report exporting.
- **Dynamic UI:** Features a clean, modern interface with both light and dark mode support for a comfortable user experience.

## 🚀 Tech Stack

This project is built with a modern, robust, and scalable technology stack:

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **AI/Backend:** [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/deep-detect.git
    cd deep-detect
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Google AI API key. You can get one from the [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```
    GOOGLE_API_KEY=YOUR_API_KEY_HERE
    ```

### Running the Application

1.  **Start the Genkit development server:**
    Open a terminal and run the following command to start the Genkit AI flows:
    ```sh
    npm run genkit:dev
    ```
    This will start the Genkit developer UI, typically on `http://localhost:4000`.

2.  **Start the Next.js development server:**
    In a separate terminal, run the following command to start the frontend application:
    ```sh
    npm run dev
    ```
    This will start the main application, typically on `http://localhost:9002`.

3.  **Open the app:**
    Navigate to `http://localhost:9002` in your browser to start using DeepDetect.
