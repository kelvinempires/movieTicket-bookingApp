import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true }, // Connects to TMDB API
    title: String, // Optional: useful for admin panel
    isActive: { type: Boolean, default: true }, // for internal usage
  },
  { timestamps: true }
);


const Movie =
  mongoose.models.Movie || mongoose.model("Movie", movieSchema);

export default Movie;
