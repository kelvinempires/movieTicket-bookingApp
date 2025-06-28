import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  poster_Path: { type: String, required: true },
  overview: { type: String, required: true },
  backdrop_Path: { type: String, required: true },
  original_language: { type: String },
  tagline: { type: String, required: true },
  trailer: { type: String, required: true },
  rating: { type: Number, required: true },
  genres: { type: Array, required: true },
  runtime: { type: Number },
  casts: { type: Array, required: true },
  vote_average: { type: Number, required: true },
},
  {timestamps: true}
);


const Movie =
  mongoose.models.Movie || mongoose.model("Movie", movieSchema);

export default Movie;
