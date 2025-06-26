import express from "express";
import {
  createShowtime,
  getAllShowtimes,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
  getShowtimesByMovie,
  getShowtimesByTheatre,
  checkSeatsAvailability,
  getAvailableSeats,
  getShowtimesByDate,
  checkShowtimeConflict,
} from "../controllers/showtime.controller.js";
import adminAuth from "../middleware/adminAuth.js";
import { validateShowtime } from "../utils/validators.js";
import authUser from "../middleware/auth.js";
import managerAuth from "../middleware/managerAuth.js";

const router = express.Router();

// Admin routes
router.post("/", adminAuth, validateShowtime, createShowtime);
router.put("/:id", adminAuth, validateShowtime, updateShowtime);
router.delete("/:id", adminAuth, deleteShowtime);
router.post("/check-conflict", adminAuth, checkShowtimeConflict);


// Manager routes
router.get("/theatre/:theatreId", managerAuth, getShowtimesByTheatre);

// Public routes
router.get("/", getAllShowtimes);
router.get("/movie/:movieId", getShowtimesByMovie);
router.get("/:showtimeId", getShowtimeById);
router.get("/date/:date", getShowtimesByDate); // YYYY-MM-DD format


// Seat-related routes
router.get("/:id/seats", getAvailableSeats);
router.post("/:id/check-availability", authUser, checkSeatsAvailability);


export default router;
