import Theatre from "../models/TheatreModel.js";
import Screen from "../models/ScreenModel.js";
import Showtime from "../models/ShowtimeModel.js"; // Assuming you have this model for stats

// CREATE a new theatre
export const createTheatre = async (req, res) => {
  try {
    const { name, location } = req.body;

    const theatre = new Theatre({ name, location });
    const savedTheatre = await theatre.save();

    res.status(201).json({ message: "Theatre created", theatre: savedTheatre });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating theatre", error: err.message });
  }
};

// GET all theatres
export const getAllTheatres = async (req, res) => {
  try {
    const theatres = await Theatre.find().populate("screens");
    res.status(200).json(theatres);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching theatres", error: err.message });
  }
};

// GET theatre by ID
export const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id).populate("screens");
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });
    res.status(200).json(theatre);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching theatre", error: err.message });
  }
};

// UPDATE a theatre
export const updateTheatre = async (req, res) => {
  try {
    const updated = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Theatre not found" });
    res.status(200).json({ message: "Theatre updated", theatre: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating theatre", error: err.message });
  }
};

// DELETE a theatre
export const deleteTheatre = async (req, res) => {
  try {
    const deleted = await Theatre.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Theatre not found" });
    res.status(200).json({ message: "Theatre deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting theatre", error: err.message });
  }
};

// Add a screen to a theatre
export const addScreenToTheatre = async (req, res) => {
  try {
    const { theatreId } = req.params;
    const { screenId } = req.body;

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).json({ message: "Screen not found" });

    if (theatre.screens.includes(screenId)) {
      return res
        .status(409)
        .json({ message: "Screen already added to theatre" });
    }

    theatre.screens.push(screenId);
    await theatre.save();

    res.status(200).json({ message: "Screen added to theatre", theatre });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding screen", error: err.message });
  }
};

// Remove a screen from a theatre
export const removeScreenFromTheatre = async (req, res) => {
  try {
    const { theatreId, screenId } = req.params;

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    if (!theatre.screens.includes(screenId)) {
      return res.status(404).json({ message: "Screen not found in theatre" });
    }

    theatre.screens = theatre.screens.filter(
      (id) => id.toString() !== screenId
    );
    await theatre.save();

    res.status(200).json({ message: "Screen removed from theatre", theatre });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing screen", error: err.message });
  }
};

// Get theatre statistics
export const getTheatreStats = async (req, res) => {
  try {
    const { theatreId } = req.params;
    const theatre = await Theatre.findById(theatreId).populate("screens");

    if (!theatre) return res.status(404).json({ message: "Theatre not found" });

    // Calculate total seats by summing seatLayout lengths (assuming each screen has seatLayout array)
    const totalSeats = theatre.screens.reduce((acc, screen) => {
      return acc + (screen.seatLayout ? screen.seatLayout.length : 0);
    }, 0);

    // Count upcoming showtimes (assuming showDate and theatre field exist)
    const upcomingShowtimesCount = await Showtime.countDocuments({
      theatre: theatreId,
      showDate: { $gte: new Date() },
    });

    res.status(200).json({
      theatreId,
      theatreName: theatre.name,
      totalScreens: theatre.screens.length,
      totalSeats,
      upcomingShowtimes: upcomingShowtimesCount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching theatre stats", error: err.message });
  }
};
