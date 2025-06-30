import cors from "cors";

// CORS middleware that allows any origin
const corsMiddleware = cors({
  origin: "*", // Allow all origins
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

// You can also create a more flexible version if needed in the future
const configurableCorsMiddleware = (options = {}) => {
  return cors({
    origin: "*",
    ...options,
  });
};

export { corsMiddleware, configurableCorsMiddleware };
export default corsMiddleware;
