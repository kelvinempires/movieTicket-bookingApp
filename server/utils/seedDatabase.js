// utils/seedDatabase.js
import mongoose from "mongoose";
import dotenv from "dotenv";
// import User from "../models/UserModel.js";
import Movie from "../models/MovieModel.js";
import Cinema from "../models/CinemaModel.js";
import Theatre from "../models/TheatreModel.js";
import Screen from "../models/ScreenModel.js";
import Showtime from "../models/ShowtimeModel.js";
import UserModel from "../models/userModel.js";

dotenv.config();

const generateSeatLayout = (rows, seatsPerRow) => {
  const layout = [];
  for (let row = 1; row <= rows; row++) {
    const rowLetter = String.fromCharCode(64 + row); // A, B, C...
    for (let seat = 1; seat <= seatsPerRow; seat++) {
      layout.push(`${rowLetter}${seat}`);
    }
  }
  return layout;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await mongoose.connection.dropDatabase();

    // 1. Create admin user
    const admin = await UserModel.create({
      name: "Admin",
      email: "admin@cinema.com",
      password: "securepassword",
      isAccountVerified: true,
    });

    // 2. Create movies
    const movies = await Movie.insertMany([
      {
        title: "Dune: Part Two",
        description: "Follow the mythic journey of Paul Atreides...",
        genre: ["Sci-Fi", "Adventure"],
        duration: 166,
        releaseDate: new Date("2024-03-01"),
        posterUrl: "/dune2.jpg",
        rating: 8.5,
      },
      {
        title: "The Batman",
        description: "When a sadistic serial killer begins murdering...",
        genre: ["Action", "Crime"],
        duration: 176,
        releaseDate: new Date("2024-03-04"),
        posterUrl: "/batman.jpg",
        rating: 7.9,
      },
    ]);

    // 3. Create cinema chain
    const cinema = await Cinema.create({
      name: "Cineplex",
      headquarters: "New York, USA",
      logoUrl: "/cineplex-logo.png",
    });

    // 4. Create theatres
    const theatres = await Theatre.insertMany([
      {
        name: "Cineplex Downtown",
        location: "123 Main St, New York",
        cinema: cinema._id,
      },
      {
        name: "Cineplex Riverside",
        location: "456 River Rd, New York",
        cinema: cinema._id,
      },
    ]);

    // 5. Create screens for each theatre
    const screens = await Screen.insertMany([
      {
        name: "Screen 1",
        theatre: theatres[0]._id,
        totalSeats: 150,
        seatLayout: generateSeatLayout(10, 15),
      },
      {
        name: "Screen 2",
        theatre: theatres[0]._id,
        totalSeats: 200,
        seatLayout: generateSeatLayout(10, 20),
      },
    ]);

    // 6. Create showtimes
    const showtimes = await Showtime.insertMany([
      {
        movie: movies[0]._id,
        theatre: theatres[0]._id,
        screen: screens[0]._id,
        showDate: new Date("2024-05-20"),
        startTime: "14:00",
        endTime: "16:46",
        price: 12.99,
      },
      {
        movie: movies[1]._id,
        theatre: theatres[0]._id,
        screen: screens[1]._id,
        showDate: new Date("2024-05-20"),
        startTime: "19:00",
        endTime: "21:56",
        price: 14.99,
      },
    ]);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
