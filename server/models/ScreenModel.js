import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    name: String,
    theatre: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre" },
    totalSeats: Number,
    seatLayout: [
      {
        row: String,
        seats: [
          {
            number: String,
            type: {
              type: String,
              enum: ["regular", "premium", "vip"],
              default: "regular",
            },
            price: Number,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const Screen =
  mongoose.models.Screen || mongoose.model("Screen", screenSchema);

export default Screen;
