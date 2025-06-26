import express from "express";
import cors from "cors";
import "dotenv/config";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import { clerkMiddleware } from "@clerk/express";

import connectCloudinary from "./config/cloudinary/index.js";
import connectMongoDB from "./config/database/mongodb.js";
import rateLimit from "express-rate-limit";

import bookingRouter from "./routes/booking.routes.js";
import userRouter from "./routes/user.route.js";
import cinemaRouter from "./routes/cinema.routes.js";
import movieRouter from "./routes/movie.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import paymentRouter from "./routes/payment.route.js";
import screenRouter from "./routes/screen.routes.js";
import showtimeRouter from "./routes/showtime.routes.js";
import theatreRouter from "./routes/theatre.routes.js";

// App setup
const app = express();
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Ensure DB/Cloudinary connections on cold starts
let isInitialized = false;
app.use(async (req, res, next) => {
  if (!isInitialized) {
    await connectMongoDB();
    await connectCloudinary();
    isInitialized = true;
  }
  next();
});

// Rate limiter
const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: "Too many booking attempts. Try again later.",
});

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "MovieTicket API is running 🎬" });
});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);
app.use("/api/cinema", cinemaRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/movie", movieRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/screen", screenRouter);
app.use("/api/showtime", showtimeRouter);
app.use("/api/theater", theatreRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ✅ ✅ THIS IS THE KEY: Export the app instead of listening
export default app;

// 🧪 Optional for local dev
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Local server running on http://localhost:${PORT}`)
  );
}
