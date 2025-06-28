import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema(
  {
    movie: { type: String, required: true, ref: "Movie" },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Array, default: [] },
  },
  { minimize: false }
);
    

const Show =
  mongoose.models.Showtime || mongoose.model("Show", showtimeSchema);

export default Show;
