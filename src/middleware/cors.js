import cors from "cors";

// CORS middleware that allows any origin
const corsMiddleware = cors({
  //origin: process.env.FRONTEND_URL, // Allow specific origin
  // Allow all local development origins
  // Uncomment the line below to allow specific frontend URL in produ
  origin: "http://localhost:3000", // For local development
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

export { corsMiddleware };
export default corsMiddleware;
