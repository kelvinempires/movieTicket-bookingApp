import express from "express";
import { addShow, getNowPlyingMovies, getShow, getShows } from "../controllers/showController.js";
import { protectAdmin } from "../middleware/Auth.js";

const ShowRouter = express.Router();

ShowRouter.get("/now-playing",protectAdmin, getNowPlyingMovies);
ShowRouter.post("/add",protectAdmin, addShow)
ShowRouter.get("/all", getShows);
ShowRouter.get("/:movie", getShow);

export default ShowRouter;
