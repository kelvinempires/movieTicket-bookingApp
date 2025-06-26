import Cinema from "../models/CinemaModel.js";
import Theater from "../models/TheatreModel.js";

// Create a new cinema
export const createCinema = async (req, res) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json(cinema);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create cinema",
      error: error.message,
    });
  }
};

// Get all cinemas
export const getAllCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find().populate("theatres");
    res.status(200).json(cinemas);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cinemas",
      error: error.message,
    });
  }
};

// Get single cinema by ID
export const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id).populate("theatres");
    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }
    res.status(200).json(cinema);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cinema",
      error: error.message,
    });
  }
};

// Update cinema
export const updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }
    res.status(200).json(cinema);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cinema",
      error: error.message,
    });
  }
};

// Delete cinema
export const deleteCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }
    res.status(200).json({ message: "Cinema deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete cinema",
      error: error.message,
    });
  }
};

// Add theater to cinema
export const addTheaterToCinema = async (req, res) => {
  try {
    const { cinemaId } = req.params;
    const { theaterId } = req.body;

    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }

    const theaterExists = await Theater.findById(theaterId);
    if (!theaterExists) {
      return res.status(404).json({ message: "Theater not found" });
    }

    const alreadyAdded = cinema.theatres.some(
      (id) => id.toString() === theaterId
    );
    if (!alreadyAdded) {
      cinema.theatres.push(theaterId);
      await cinema.save();
    }

    res.status(200).json({ message: "Theater added to cinema", cinema });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add theater",
      error: error.message,
    });
  }
};

// Remove theater from cinema
export const removeTheaterFromCinema = async (req, res) => {
  try {
    const { cinemaId, theaterId } = req.params;

    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }

    cinema.theatres = cinema.theatres.filter(
      (id) => id.toString() !== theaterId
    );
    await cinema.save();

    res.status(200).json({ message: "Theater removed from cinema", cinema });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove theater",
      error: error.message,
    });
  }
};

// Search cinemas by name/location
export const searchCinemas = async (req, res) => {
  try {
    const { name, location } = req.query;

    const query = {};
    if (name) query.name = { $regex: name, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };

    const cinemas = await Cinema.find(query).populate("theatres");
    res.status(200).json(cinemas);
  } catch (error) {
    res.status(500).json({
      message: "Failed to search cinemas",
      error: error.message,
    });
  }
};
