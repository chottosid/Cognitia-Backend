import cors from "cors";

// CORS middleware that allows multiple origins

const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://130.33.96.3:3000",
  "https://130.33.96.3:3000",
  "http://130.33.96.3",
  "https://130.33.96.3",
  "http://cognitiahub.me",
  "https://cognitiahub.me",
  "http://www.cognitiahub.me",
  "https://www.cognitiahub.me",
];

// Add environment variable if it exists
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
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
