import express from "express";
import { getNowPlyingMovies } from "../controllers/showController.js";

const ShowRouter = express.Router();

ShowRouter.get("/now-playing", getNowPlyingMovies);

export default ShowRouter;
