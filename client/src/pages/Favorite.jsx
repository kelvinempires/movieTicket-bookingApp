import React from "react";
import { dummyShowsData } from "../assets/assets";
import MovieCard from "../component/MovieCard";
import BlurCircle from "../component/BlurCircle";

const Favorites = () => {
  return dummyShowsData.length > 0 ? (
    <div className="relative my-24 mb-60 px-6 md:px-16 lg:px-24  overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="-0px" />
      <BlurCircle bottom="50px" right="50px" />
      <h1 className="text-lg font-medium my-4">Your Favorite Movies</h1>
      <div className="flex flex-wrap max-sm:justify-center gap-4 ">
        {dummyShowsData.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-300">No movies available</p>
    </div>
  );
};

export default Favorites;
