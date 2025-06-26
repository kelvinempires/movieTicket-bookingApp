import express from "express";
import {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  getTrendingMovies,
  uploadMoviePoster,
  getNowPlayingMovies,
  getComingSoonMovies,
  syncWithTMDB,
} from "../controllers/movie.controller.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const movieRouter = express.Router();

movieRouter.post("/create",adminAuth, createMovie);
movieRouter.get("/get-all",authUser, getAllMovies);
movieRouter.get("/get/:movieId",authUser, getMovieById);
movieRouter.put("/update/:movieId",adminAuth, updateMovie);
movieRouter.delete("/delete/:movieId",adminAuth, deleteMovie);

movieRouter.get("/trending",getTrendingMovies);
movieRouter.get("/now-playing", getNowPlayingMovies);
movieRouter.get("/coming-soon", getComingSoonMovies);
movieRouter.post("/sync-tmdb", adminAuth, syncWithTMDB);

// Upload poster
movieRouter.post(
  "/:movieId/upload-poster",
  adminAuth,
  upload.single("poster"),
  uploadMoviePoster
);


export default movieRouter;





