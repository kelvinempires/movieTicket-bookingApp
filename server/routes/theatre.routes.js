// routes/theatre.routes.js

import express from "express";
import {
  createTheatre,
  getAllTheatres,
  getTheatreById,
  updateTheatre,
  deleteTheatre,
  addScreenToTheatre,
  removeScreenFromTheatre,
  getTheatreStats,
} from "../controllers/theatre.controller.js";
import adminAuth from "../middleware/adminAuth.js";
import managerAuth from "../middleware/managerAuth.js";

const theatreRouter = express.Router();

theatreRouter.post("/create",adminAuth, createTheatre);
theatreRouter.get("/get", getAllTheatres);
theatreRouter.get("/get/:theatreId", getTheatreById);
theatreRouter.put("/update/:theatreId",adminAuth, updateTheatre);
theatreRouter.delete("/delete/:theatreId",adminAuth, deleteTheatre);
theatreRouter.post("/:theatreId/add-screen", adminAuth, addScreenToTheatre);
theatreRouter.delete("/:theatreId/remove-screen/:screenId", adminAuth, removeScreenFromTheatre);
theatreRouter.get("/:theatreId/stats", managerAuth, getTheatreStats);

export default theatreRouter;
