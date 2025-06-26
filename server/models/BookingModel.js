import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: {
      type: [String], // Example: ["A1", "A2"]
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },

    // 🟡 Payment + Reservation Status
    status: {
      type: String,
      enum: ["pending", "reserved", "paid", "cancelled", "expired"],
      default: "pending",
    },

    // ⏳ Auto-expire unpaid bookings after 15 minutes
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from creation
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// 📌 Index to support auto-cleanup of expired, unpaid bookings
bookingSchema.index({ status: 1, expiresAt: 1 });

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
