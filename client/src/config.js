// Vite detects if you are running 'npm run dev' (development) or built for Vercel (production)
export const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3001"
    : "https://cry-out-backend.onrender.com" 
