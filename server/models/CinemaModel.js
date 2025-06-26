import mongoose from "mongoose";

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    headquarters: String,
    logoUrl: String,
    theatres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Theatre" }],
  },
  { timestamps: true }
);

const Cinema =
  mongoose.models.Cinema || mongoose.model("Cinema", cinemaSchema);

export default Cinema;
