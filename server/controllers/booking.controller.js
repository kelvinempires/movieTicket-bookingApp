
import mongoose from "mongoose";
import Showtime from "../models/ShowtimeModel.js";
import Booking from "../models/BookingModel.js";
import Screen from "../models/ScreenModel.js";

const isSeatValid = (seat, screenLayout) => {
  return screenLayout.some((row) => row.seats.includes(seat));
};
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, showtime, seats, totalPrice } = req.body;

    // Step 1: Fetch showtime within session
    const selectedShowtime = await Showtime.findById(showtime).session(session);
    if (!selectedShowtime) {
      throw new Error("Showtime not found");
    }

    // Step 2: Check if any of the selected seats are already booked
    const alreadyBooked = selectedShowtime.bookedSeats.filter((seat) =>
      seats.includes(seat)
    );

    if (alreadyBooked.length > 0) {
      await session.abortTransaction();
      return res.status(409).json({
        message: "Some seats are already booked",
        seats: alreadyBooked,
      });
    }
    // Step 3: Check if any of the selected seats are valid
    const screen = await Screen.findById(selectedShowtime.screen);
    const invalidSeats = seats.filter(
      (seat) => !isSeatValid(seat, screen.seatLayout)
    );
   if (invalidSeats.length > 0) {
     await session.abortTransaction();
     session.endSession();
     return res.status(400).json({
       message: `Invalid seats: ${invalidSeats.join(", ")}`,
       invalidSeats,
     });
   }

    // Step 4: Save the booking
    const booking = new Booking({
      user,
      showtime,
      seats,
      totalPrice,
      paymentStatus: "pending",
    });

    const savedBooking = await booking.save({ session });

    // Step 4: Update the showtime’s booked seats
    selectedShowtime.bookedSeats.push(...seats);
    await selectedShowtime.save({ session });

    // Step 5: Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Booking created", booking: savedBooking });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Booking error:", err.message);
    res
      .status(500)
      .json({ message: "Error creating booking", error: err.message });
  }
};

// GET all bookings (optionally by user or showtime)
export const getAllBookings = async (req, res) => {
  const { user, showtime } = req.query;
  let filter = {};
  if (user) filter.user = user;
  if (showtime) filter.showtime = showtime;

  try {
    const bookings = await Booking.find(filter)
      .populate("user showtime")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
};

export const getUserBookings = async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await Booking.find({ user: userId })
      .populate("showtime")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user bookings", error: err.message });
  }
};
export const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentStatus === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // Remove seats from showtime
    const showtime = await Showtime.findById(booking.showtime);
    showtime.bookedSeats = showtime.bookedSeats.filter(
      (seat) => !booking.seats.includes(seat)
    );
    await showtime.save();

    // Mark booking as cancelled (soft delete)
    booking.paymentStatus = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: err.message });
  }
};
export const handlePaymentConfirmation = async (req, res) => {
  try {
    const { bookingId, paymentRef, status } = req.body;

    if (!bookingId || !paymentRef || status !== "success") {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update payment status if successful
    booking.paymentStatus = "paid";
    booking.paymentReference = paymentRef;
    await booking.save();

    res.status(200).json({ message: "Payment confirmed", booking });
  } catch (err) {
    console.error("Payment webhook error:", err.message);
    res
      .status(500)
      .json({ message: "Webhook processing failed", error: err.message });
  }
};

// GET booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "user showtime"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching booking", error: err.message });
  }
};

// UPDATE booking (e.g., mark payment status as "paid")
export const updateBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking updated", booking: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating booking", error: err.message });
  }
};

// DELETE booking (optional: free up seats)
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Free up seats in showtime
    const showtime = await Showtime.findById(booking.showtime);
    showtime.bookedSeats = showtime.bookedSeats.filter(
      (seat) => !booking.seats.includes(seat)
    );
    await showtime.save();

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Booking canceled and seats released" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting booking", error: err.message });
  }
};
