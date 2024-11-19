import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./database";
import { loginHandler, signupHandler } from "./controllers/auth.controller";
import verifyAuth from "./middlewares/verifyAuth";
import { createEvent, getEvents } from "./controllers/event.controller";
import cors from "cors";
import {
  getGoogleAuthUrl,
  googleAuthCallback,
  resetGoogleSyncFlag,
} from "./controllers/googleAuth.controller";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import { FRONTEND_URL } from "./constants";
const options = {
  customCss:
    ".swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }",
  customCssUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css",
};

dotenv.config();
const allowedOrigins = [FRONTEND_URL, "https://calendarevents-backend.vercel.app"];

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

connectToDatabase();
const swaggerDocument = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "public", "swagger-output.json"),
    "utf-8"
  )
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);

app.get("/", (req, res) => res.send("Welcome to Calendar Events"));
app.post("/signup", signupHandler);
app.post("/login", loginHandler);
app.post("/events", verifyAuth, createEvent);
app.get("/events", verifyAuth, getEvents);
app.get("/google-auth-url", getGoogleAuthUrl);
app.get("/google-auth-callback", googleAuthCallback);
app.post("/reset-google-sync-flag", verifyAuth, resetGoogleSyncFlag);

export default app;
