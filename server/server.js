import express from "express";
import cors from "cors";
import "dotenv/config";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import { inngest, functions } from "./inngest/index.js";

import connectMongoDB from "./config/database/mongodb.js";
import ShowRouter from "./routes/showRoute.js";

const app = express();
await connectMongoDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());



// Routes
app.get("/", (req, res) => {res.status(200).json({ message: "MovieTicket API is running 🎬" });});

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", ShowRouter)


export default app;

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>console.log(`Local server running on http://localhost:${PORT}`) );
