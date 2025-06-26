import React, { useEffect, useState } from "react";
import Loading from "../../component/Loading";
import Title from "../../component/admin/Title";
import { CheckIcon, StarIcon, XIcon } from "lucide-react";
import { dummyShowsData } from "../../assets/assets";
import { KConverter } from "../../lib/kConverter";

const AddShow = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");

  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData); // simulate API call
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, timeFull] = dateTimeInput.split("T");
    const time = timeFull?.slice(0, 5); // trim to HH:MM

    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time].sort() };
      }
      return prev;
    });

    setDateTimeInput(""); // clear input
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  const handleAddShow = () => {
    if (
      !selectedMovie ||
      !showPrice ||
      Object.keys(dateTimeSelection).length === 0
    ) {
      alert("Please complete all fields (movie, price, and time)");
      return;
    }

    const payload = {
      movieId: selectedMovie,
      showPrice: parseFloat(showPrice),
      showTimes: dateTimeSelection,
    };

    console.log("Submitting show data:", payload);
    // You can now send this `payload` to your backend API
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="shows" />
      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">
          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie.id)}
              className={`relative max-w-40 cursor-pointer transition duration-300 ${
                selectedMovie === movie.id
                  ? "ring-2 ring-primary rounded"
                  : "group-hover:not-hover:opacity-40 hover:translate-y-1"
              }`}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={movie.poster_path}
                  alt=""
                  className="w-full object-cover brightness-90"
                />
                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">
                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                  <p className="text-gray-300">
                    {KConverter(movie.vote_count)} Votes
                  </p>
                </div>
              </div>
              {selectedMovie === movie.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}
              <p className="font-medium truncate">{movie.title}</p>
              <p className="text-gray-400 text-sm">{movie.release_date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Show Price Input */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">Show Price</label>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
          <p className="text-gray-400 text-sm">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show Price"
            className="outline-none bg-transparent text-white"
          />
        </div>
      </div>

      {/* Date & Time Input */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Select Date and Time
        </label>
        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">
          <input
            type="datetime-local"
            placeholder="Select Date and Time"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="outline-none rounded-md bg-transparent text-white"
          />
          <button
            onClick={handleDateTimeAdd}
            disabled={!dateTimeInput}
            className={`text-white px-3 py-2 text-sm rounded-lg transition ${
              dateTimeInput
                ? "bg-primary/80 hover:bg-primary"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            Add Time
          </button>
        </div>
      </div>

      {/* Display Selected Times */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 font-semibold">Selected Date-Time</h2>
          <ul className="space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <div className="font-medium text-gray-200">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="border border-primary px-2 py-1 flex items-center rounded"
                    >
                      <span>{time}</span>
                      <div
                        onClick={() => handleRemoveTime(date, time)}
                        className="ml-2 cursor-pointer p-1 rounded hover:bg-red-700 transition"
                      >
                        <XIcon className="text-red-500" width={15} />
                      </div>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleAddShow}
        className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
      >
        Add Show
      </button>
    </>
  ) : (
    <Loading />
  );
};

export default AddShow;
