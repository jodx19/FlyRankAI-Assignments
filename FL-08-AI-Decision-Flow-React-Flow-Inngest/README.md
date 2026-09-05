# AI Decision Flow Builder

Visual AI decision-flow builder built with Next.js, React Flow, and Inngest.

## Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
GROQ_API_KEY="your-groq-api-key-here"
INNGEST_DEV=1 # Tells the Inngest SDK to bypass signature verification when communicating with the local dev server
```

## Running the Development Server

1. Start the Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running Inngest Dev Server

To run the Inngest local development server, run the following command in a separate terminal:

```bash
npx inngest-cli dev
```

The Inngest dev server will automatically find your Next.js app and run on `http://localhost:8288`.
