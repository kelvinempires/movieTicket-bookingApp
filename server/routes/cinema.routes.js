import express from "express";
import {
  createCinema,
  getAllCinemas,
  getCinemaById,
  updateCinema,
  deleteCinema,
  addTheaterToCinema,
  removeTheaterFromCinema,
  searchCinemas,
} from "../controllers/cinema.controller.js";
import adminAuth from "../middleware/adminAuth.js";

const cinemaRouter = express.Router();

cinemaRouter.post("/createCinema", adminAuth, createCinema);
cinemaRouter.get("/getAllCinemas", getAllCinemas);
cinemaRouter.get("/get/:cinemaId", getCinemaById);
cinemaRouter.put("/update/:cinemaId", adminAuth, updateCinema);
cinemaRouter.delete("/delete/:cinemaId", adminAuth, deleteCinema);
cinemaRouter.post("/:cinemaId/add-theater", adminAuth, addTheaterToCinema);
cinemaRouter.delete("/:cinemaId/remove-theater/:theaterId", adminAuth, removeTheaterFromCinema);
cinemaRouter.get("/search", searchCinemas);

export default cinemaRouter;
