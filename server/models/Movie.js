import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    overview: { type: String, required: true },
    poster_Path: { type: String, required: true },
    backdrop_Path: { type: String, required: true },
    release_date: { type: Date, required: true },
    original_language: { type: String },
    tagline: { type: String },
    genres: { type: Array, required: true },
    casts: { type: Array, required: true },
    vote_average: { type: Number, required: true },
    runtime: { type: Number, required: true },

    crew: { type: Array, required: true },
    tagline: { type: String },
    
    
  },
  { timestamps: true }
);


const Movie = mongoose.model("Movie", movieSchema);

export default Movie;
