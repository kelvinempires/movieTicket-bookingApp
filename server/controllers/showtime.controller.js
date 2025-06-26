import mongoose from "mongoose";
import Showtime from "../models/ShowtimeModel.js";
import { checkTimeConflict } from "../services/showtime.service.js";
import { validateShowtime } from "../utils/validators.js";
import axios from "axios";
import dotenv from "dotenv";
import NodeCache from "node-cache";

dotenv.config();

const movieCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 250; // ms between TMDB requests

// Helper function to delay requests for rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch movie details from TMDB with caching and rate limiting
async function fetchMovieDetails(tmdbId) {
  // Validate input
  if (!tmdbId || !/^\d+$/.test(tmdbId)) {
    console.warn(`Invalid TMDB ID: ${tmdbId}`);
    return {
      id: tmdbId,
      error: "Invalid movie ID",
    };
  }

  // Check cache first
  const cached = movieCache.get(tmdbId);
  if (cached) {
    console.log(`Cache hit for movie ${tmdbId}`);
    return cached;
  }
  console.log(`Cache miss for movie ${tmdbId}`);

  // Rate limiting
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLast);
  }

  try {
    lastRequestTime = Date.now();
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}`,
      {
        headers: {
          Authorization: process.env.TMDB_API_KEY,
          Accept: "application/json",
        },
        timeout: 5000,
        params: {
          language: "en-US",
        },
      }
    );

    const movieData = {
      id: response.data.id,
      title: response.data.title,
      overview: response.data.overview,
      posterUrl: response.data.poster_path
        ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}`
        : null,
      backdropUrl: response.data.backdrop_path
        ? `https://image.tmdb.org/t/p/original${response.data.backdrop_path}`
        : null,
      releaseDate: response.data.release_date,
      runtime: response.data.runtime,
      genres: response.data.genres?.map((g) => g.name) || [],
      voteAverage: response.data.vote_average,
    };

    movieCache.set(tmdbId, movieData);
    return movieData;
  } catch (error) {
    console.error("TMDB API Error:", {
      tmdbId,
      status: error.response?.status,
      message: error.message,
    });

    return {
      id: tmdbId,
      title: `Movie ${tmdbId}`,
      error: "Failed to fetch details",
    };
  }
}

// Batch fetch movie details for optimization
async function fetchMultipleMovieDetails(tmdbIds) {
  const uniqueIds = [...new Set(tmdbIds.filter((id) => /^\d+$/.test(id)))];
  if (uniqueIds.length === 0) return {};

  const results = await Promise.all(
    uniqueIds.map((id) => fetchMovieDetails(id))
  );

  return Object.fromEntries(
    results.filter((m) => m && !m.error).map((movie) => [movie.id, movie])
  );
}

// CREATE a new showtime
export const createShowtime = async (req, res) => {
  try {
    const { error } = validateShowtime(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (!/^\d+$/.test(req.body.movie)) {
      return res.status(400).json({ message: "Invalid movie ID format" });
    }

    const conflict = await checkTimeConflict(
      req.body.screen,
      req.body.showDate,
      req.body.startTime,
      req.body.endTime
    );

    if (conflict) {
      return res.status(409).json({
        message: "Time conflict with existing showtime",
        conflictingShowtime: conflict,
      });
    }

    const showtime = new Showtime({
      ...req.body,
      movieRef: null, // Can reference internal Movie model if needed
    });

    const savedShowtime = await showtime.save();
    const populated = await Showtime.findById(savedShowtime._id)
      .populate("theatre", "name location")
      .populate("screen", "name seatLayout");

    const movieDetails = await fetchMovieDetails(req.body.movie);

    res.status(201).json({
      ...populated.toObject(),
      movieDetails: movieDetails || {
        id: req.body.movie,
        error: "Could not fetch details",
      },
    });
  } catch (err) {
    console.error("Error creating showtime:", err);
    res.status(500).json({
      message: "Error creating showtime",
      error: err.message,
    });
  }
};

// GET available seats for a showtime
export const getAvailableSeats = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate(
      "screen",
      "seatLayout name"
    );

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    const allSeats = showtime.screen.seatLayout || [];
    const bookedSeats = showtime.bookedSeats || [];
    const availableSeats = allSeats.filter(
      (seat) => !bookedSeats.includes(seat)
    );

    res.status(200).json({
      totalSeats: allSeats.length,
      bookedSeats,
      availableSeats,
      availableCount: availableSeats.length,
      screenName: showtime.screen.name,
      movieId: showtime.movie,
    });
  } catch (err) {
    console.error("Error fetching seats:", err);
    res.status(500).json({
      message: "Error fetching seat availability",
      error: err.message,
    });
  }
};

// Check seat availability
export const checkSeatsAvailability = async (req, res) => {
  try {
    const { seats } = req.body;
    const { id } = req.params;

    if (!seats || !Array.isArray(seats)) {
      return res.status(400).json({
        message: "Seats must be provided as an array",
      });
    }

    const showtime = await Showtime.findById(id);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    const unavailableSeats = seats.filter((seat) =>
      showtime.bookedSeats.includes(seat)
    );

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        message: "Some seats are already booked",
        unavailableSeats,
        available: false,
      });
    }

    res.status(200).json({
      message: "Seats are available",
      available: true,
      showtimeId: id,
      requestedSeats: seats,
    });
  } catch (err) {
    console.error("Error checking seats:", err);
    res.status(500).json({
      message: "Error checking seat availability",
      error: err.message,
    });
  }
};

// GET all showtimes with pagination and filtering
export const getAllShowtimes = async (req, res) => {
  try {
    const { movie, theatre, date, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (movie) filter.movie = movie;
    if (theatre) filter.theatre = theatre;

    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
      filter.showDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [showtimes, total] = await Promise.all([
      Showtime.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("theatre", "name location")
        .populate("screen", "name seatLayout")
        .sort({ showDate: 1, startTime: 1 }),
      Showtime.countDocuments(filter),
    ]);

    // Batch fetch movie details for all showtimes
    const movieDetailsMap = await fetchMultipleMovieDetails(
      showtimes.map((st) => st.movie)
    );

    const showtimesWithMovies = showtimes.map((st) => ({
      ...st.toObject(),
      movieDetails: movieDetailsMap[st.movie] || {
        id: st.movie,
        title: `Movie ${st.movie}`,
      },
    }));

    res.status(200).json({
      showtimes: showtimesWithMovies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + showtimes.length < total,
      },
    });
  } catch (err) {
    console.error("Error fetching showtimes:", err);
    res.status(500).json({
      message: "Error fetching showtimes",
      error: err.message,
    });
  }
};

// GET showtimes by movie ID
export const getShowtimesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    // First try by TMDB ID (string)
    let showtimes = await Showtime.find({ movie: movieId })
      .populate("theatre", "name location")
      .populate("screen", "name")
      .sort({ showDate: 1 });

    // If no results, try by ObjectId (backward compatibility)
    if (showtimes.length === 0 && mongoose.Types.ObjectId.isValid(movieId)) {
      showtimes = await Showtime.find({ movieRef: movieId })
        .populate("theatre", "name location")
        .populate("screen", "name")
        .sort({ showDate: 1 });
    }

    if (showtimes.length === 0) {
      return res
        .status(404)
        .json({ message: "No showtimes found for this movie" });
    }

    const movieDetails = await fetchMovieDetails(movieId);
    const response = showtimes.map((st) => ({
      ...st.toObject(),
      movieDetails: movieDetails || {
        id: movieId,
        error: "Could not fetch details",
      },
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching showtimes by movie:", err);
    res.status(500).json({
      message: "Error fetching showtimes",
      error: err.message,
    });
  }
};

// GET showtimes by theatre ID
export const getShowtimesByTheatre = async (req, res) => {
  try {
    const showtimes = await Showtime.find({ theatre: req.params.theatreId })
      .populate("screen", "name")
      .sort({ showDate: 1 });

    const movieDetailsMap = await fetchMultipleMovieDetails(
      showtimes.map((st) => st.movie)
    );

    const showtimesWithMovies = showtimes.map((st) => ({
      ...st.toObject(),
      movieDetails: movieDetailsMap[st.movie] || {
        id: st.movie,
        title: `Movie ${st.movie}`,
      },
    }));

    res.status(200).json(showtimesWithMovies);
  } catch (err) {
    console.error("Error fetching showtimes by theatre:", err);
    res.status(500).json({
      message: "Error fetching showtimes",
      error: err.message,
    });
  }
};

// GET showtimes by date
export const getShowtimesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    const showtimes = await Showtime.find({
      showDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("theatre", "name location")
      .populate("screen", "name seatLayout")
      .sort({ startTime: 1 });

    const movieDetailsMap = await fetchMultipleMovieDetails(
      showtimes.map((st) => st.movie)
    );

    const showtimesWithMovies = showtimes.map((st) => ({
      ...st.toObject(),
      movieDetails: movieDetailsMap[st.movie] || {
        id: st.movie,
        title: `Movie ${st.movie}`,
      },
    }));

    res.status(200).json(showtimesWithMovies);
  } catch (err) {
    console.error("Error fetching showtimes by date:", err);
    res.status(500).json({
      message: "Error fetching showtimes by date",
      error: err.message,
    });
  }
};
// GET single showtime by ID
export const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate("theatre", "name location")
      .populate("screen", "name seatLayout");

    if (!showtime) {
      return res.status(404).json({ 
        success: false,
        message: "Showtime not found",
        showtimeId: req.params.id
      });
    }

    // Fetch movie details with caching
    const movieDetails = await fetchMovieDetails(showtime.movie);

    res.status(200).json({
      success: true,
      data: {
        ...showtime.toObject(),
        movieDetails: movieDetails || {
          id: showtime.movie,
          error: "Could not fetch movie details"
        }
      }
    });
  } catch (err) {
    console.error(`Error fetching showtime ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch showtime",
      error: err.message,
      showtimeId: req.params.id
    });
  }
};
// UPDATE existing showtime
export const updateShowtime = async (req, res) => {
  try {
    const { error } = validateShowtime(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        details: error.details
      });
    }

    // Check for time conflicts (excluding current showtime)
    const conflict = await checkTimeConflict(
      req.body.screen,
      new Date(req.body.showDate),
      req.body.startTime,
      req.body.endTime,
      req.params.id // Exclude current showtime
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Time conflict with existing showtime",
        conflictDetails: {
          existingShowtimeId: conflict._id,
          existingMovieId: conflict.movie,
          existingScreen: conflict.screen,
          existingTime: `${conflict.startTime}-${conflict.endTime}`
        }
      });
    }

    const updatedShowtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
    .populate("theatre", "name location")
    .populate("screen", "name seatLayout");

    if (!updatedShowtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime not found",
        showtimeId: req.params.id
      });
    }

    // Get fresh movie details
    const movieDetails = await fetchMovieDetails(updatedShowtime.movie);

    res.status(200).json({
      success: true,
      message: "Showtime updated successfully",
      data: {
        ...updatedShowtime.toObject(),
        movieDetails: movieDetails || {
          id: updatedShowtime.movie,
          error: "Could not fetch updated movie details"
        }
      }
    });
  } catch (err) {
    console.error(`Error updating showtime ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      message: "Failed to update showtime",
      error: err.message,
      showtimeId: req.params.id
    });
  }
};
// DELETE a showtime
export const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: "Showtime not found",
        showtimeId: req.params.id
      });
    }

    res.status(200).json({
      success: true,
      message: "Showtime deleted successfully",
      deletedData: {
        id: showtime._id,
        movieId: showtime.movie,
        date: showtime.showDate,
        screen: showtime.screen,
        theatre: showtime.theatre
      }
    });
  } catch (err) {
    console.error(`Error deleting showtime ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      message: "Failed to delete showtime",
      error: err.message,
      showtimeId: req.params.id
    });
  }
};
// POST check for showtime conflicts
export const checkShowtimeConflict = async (req, res) => {
  try {
    const { screen, showDate, startTime, endTime, excludeShowtimeId } = req.body;

    // Validate required fields
    if (!screen || !showDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["screen", "showDate", "startTime", "endTime"],
        received: Object.keys(req.body)
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format",
        expectedFormat: "HH:MM",
        received: { startTime, endTime }
      });
    }

    const conflict = await checkTimeConflict(
      screen,
      new Date(showDate),
      startTime,
      endTime,
      excludeShowtimeId
    );

    if (conflict) {
      return res.status(200).json({  // Using 200 OK because conflict check is successful
        success: true,
        hasConflict: true,
        message: "Time conflict detected",
        conflictingShowtime: {
          id: conflict._id,
          movieId: conflict.movie,
          screenId: conflict.screen,
          theatreId: conflict.theatre,
          date: conflict.showDate,
          timeRange: `${conflict.startTime}-${conflict.endTime}`
        }
      });
    }

    res.status(200).json({
      success: true,
      hasConflict: false,
      message: "No time conflicts detected",
      checkedTimeRange: {
        screen,
        date: showDate,
        startTime,
        endTime
      }
    });
  } catch (err) {
    console.error("Error checking showtime conflict:", err);
    res.status(500).json({
      success: false,
      message: "Failed to check for conflicts",
      error: err.message,
      requestBody: req.body
    });
  }
};
// services/showtime.service.js
// export async function checkTimeConflict(screenId, date, startTime, endTime, excludeId = null) {
//   try {
//     const conflictQuery = {
//       screen: screenId,
//       showDate: date,
//       $or: [
//         // Existing showtime starts before but ends during proposed time
//         { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
//         // Existing showtime starts during proposed time
//         { startTime: { $gte: startTime, $lt: endTime } }
//       ]
//     };

//     if (excludeId) {
//       conflictQuery._id = { $ne: excludeId };
//     }

//     return await Showtime.findOne(conflictQuery)
//       .populate("screen", "name")
//       .populate("theatre", "name");
//   } catch (error) {
//     console.error("Error in checkTimeConflict:", {
//       screenId,
//       date,
//       startTime,
//       endTime,
//       error: error.message
//     });
//     throw error;
//   }
// }
// Other controller methods (getShowtimeById, updateShowtime, deleteShowtime, checkShowtimeConflict)
// would follow the same pattern - remove .populate("movie") and add movieDetails as needed
