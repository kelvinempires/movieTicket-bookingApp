import Screen from "../models/ScreenModel.js";

// CREATE a new screen
export const createScreen = async (req, res) => {
  try {
    const { name, theatre, totalSeats, seatLayout } = req.body;

    const screen = new Screen({ name, theatre, totalSeats, seatLayout });
    const savedScreen = await screen.save();

    res.status(201).json({ message: "Screen created", screen: savedScreen });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating screen", error: err.message });
  }
};

// GET all screens (optionally filter by theatre)
export const getAllScreens = async (req, res) => {
  try {
    const { theatreId } = req.query;

    const query = theatreId ? { theatre: theatreId } : {};

    const screens = await Screen.find(query).populate("theatre");
    res.status(200).json(screens);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching screens", error: err.message });
  }
};

// GET screen by ID
export const getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id).populate("theatre");
    if (!screen) return res.status(404).json({ message: "Screen not found" });
    res.status(200).json(screen);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching screen", error: err.message });
  }
};

// UPDATE a screen
export const updateScreen = async (req, res) => {
  try {
    const updated = await Screen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Screen not found" });
    res.status(200).json({ message: "Screen updated", screen: updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating screen", error: err.message });
  }
};

// DELETE a screen
export const deleteScreen = async (req, res) => {
  try {
    const deleted = await Screen.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Screen not found" });
    res.status(200).json({ message: "Screen deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting screen", error: err.message });
  }
};

// UPDATE seat layout for a screen (seat map management)
export const updateSeatLayout = async (req, res) => {
  try {
    const { screenId } = req.params;
    const { seatLayout } = req.body; // seatLayout could be a 2D array or JSON describing seats

    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).json({ message: "Screen not found" });

    screen.seatLayout = seatLayout;
    await screen.save();

    res.status(200).json({ message: "Seat layout updated", screen });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating seat layout", error: err.message });
  }
};

// GET showtimes for a screen (screen-specific showtimes)
export const getScreenShowtimes = async (req, res) => {
  try {
    const { screenId } = req.params;

    // Assuming you have a ShowtimeModel and showtimes store screen references
    // import ShowtimeModel from "../models/ShowtimeModel.js";
    // const showtimes = await ShowtimeModel.find({ screen: screenId }).sort("startTime");

    // Placeholder return for now:
    const showtimes = []; // Replace with actual DB query

    res.status(200).json({ screenId, showtimes });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching showtimes", error: err.message });
  }
};
