import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export const fetchTMDBMovie = async (tmdbId) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
    );
    return response.data;
  } catch (err) {
    console.error("TMDB fetch failed:", err.message);
    return null;
  }
};
