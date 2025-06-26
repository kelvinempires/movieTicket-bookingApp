import Movie from "../models/MovieModel.js";
import axios from "axios";
import NodeCache from "node-cache";
import fs from "fs";

const movieCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

// CREATE a new movie
export const createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    const saved = await movie.save();
    res.status(201).json({ message: "Movie created", movie: saved });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating movie", error: err.message });
  }
};

// GET all movies (with filters)
export const getAllMovies = async (req, res) => {
  const { genre, language, search } = req.query;
  const filter = {};
  if (genre) filter.genre = genre;
  if (language) filter.language = language;
  if (search) filter.title = { $regex: search, $options: "i" };

  try {
    const movies = await Movie.find(filter).sort({ releaseDate: -1 });
    res.status(200).json(movies);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching movies", error: err.message });
  }
};

// GET single movie
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json(movie);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching movie", error: err.message });
  }
};

// UPDATE movie
export const updateMovie = async (req, res) => {
  try {
    const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({ message: "Movie updated", movie: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating movie", error: err.message });
  }
};

// DELETE movie
export const deleteMovie = async (req, res) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({ message: "Movie deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting movie", error: err.message });
  }
};

// Trending from TMDB
export const getTrendingMovies = async (req, res) => {
  try {
    const cacheKey = "trending_movies";
    const cached = movieCache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get(
      "https://api.themoviedb.org/3/trending/all/week",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );

    movieCache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error("TMDB error:", error.message);
    res.status(500).json({ error: "Failed to fetch trending movies" });
  }
};

// Now Playing from TMDB
export const getNowPlayingMovies = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("TMDB error:", error.message);
    res.status(500).json({ error: "Failed to fetch now playing movies" });
  }
};

// Coming Soon from TMDB
export const getComingSoonMovies = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/upcoming",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );
    res.json(response.data.results);
  } catch (error) {
    console.error("TMDB error:", error.message);
    res.status(500).json({ error: "Failed to fetch coming soon movies" });
  }
};

// Upload movie poster
export const uploadMoviePoster = async (req, res) => {
  try {
    const { movieId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No poster file uploaded" });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    // Optional: delete old poster file if it exists
    if (movie.posterPath && fs.existsSync(movie.posterPath)) {
      fs.unlinkSync(movie.posterPath);
    }

    movie.posterPath = file.path;
    await movie.save();

    res.status(200).json({ message: "Poster uploaded", path: file.path });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading poster", error: error.message });
  }
};

// Sync movies from TMDB (e.g., popular or manually specified)
export const syncWithTMDB = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/popular",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );

    const synced = await Promise.all(
      data.results.map(async (tmdb) => {
        const movieExists = await Movie.findOne({ tmdbId: tmdb.id });
        if (movieExists) return null;

        return Movie.create({
          tmdbId: tmdb.id,
          title: tmdb.title,
          overview: tmdb.overview,
          language: tmdb.original_language,
          releaseDate: tmdb.release_date,
          posterUrl: `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`,
        });
      })
    );

    res.status(201).json({ message: "Movies synced from TMDB", synced });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error syncing from TMDB", error: error.message });
  }
};
