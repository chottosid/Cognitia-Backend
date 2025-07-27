import cors from "cors";

// CORS middleware that allows any origin
const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000" || "http://cognitiahub.me" || "http://cognitiahub.me", // Use env variable for production
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
