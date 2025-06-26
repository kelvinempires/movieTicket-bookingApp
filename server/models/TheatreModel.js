import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: String,
    screens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Screen" }],
  },
  { timestamps: true }
);

const Theatre =
  mongoose.models.Theatre || mongoose.model("Theatre", theatreSchema);

export default Theatre;
