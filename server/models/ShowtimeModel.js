import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: String, // Changed from ObjectId to String for TMDB IDs
      required: true,
    },
    movieRef: {
      // New field for internal Movie references
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: false,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    showDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // "14:00"
    endTime: { type: String, required: true },
    price: { type: Number, required: true },
    bookedSeats: [{ type: String }], // e.g. ["A1", "A2"]
  },
  { timestamps: true }
);

// Index for faster queries
showtimeSchema.index({ movie: 1, showDate: 1 });

const Showtime =
  mongoose.models.Showtime || mongoose.model("Showtime", showtimeSchema);

export default Showtime;
