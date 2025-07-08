import axios from "axios";
import Movie from "../models/Movie";

// api to get now playing movies
export const getNowPlyingMovies = async (req, res) => {
try {
    const { data } = await axios.get(
      ` https://api.themoviedb.org/3/movie/now_playing`,
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      });
      const movies = data.results;
      res.json({success: true, movies: movies});
    
} catch (error) {
    console.log(error);
    res.json({success: false, error: error.message});
}    
};

// api to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const {movieId, showsInput, showPrice} = req.body
    let movie = await Movie.findById(movieId);
    if(!movie){
      //fetch movie detail and credits from IMDB API
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },}),
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },}),
        ]);

        const movieApiData = movieDetailsResponse.data;
        const movieCreditsData = movieCreditsResponse.data;
     
       const movieDetails = {
         _id: movieId,
         title: movieApiData.title,
         overview: movieApiData.overview,
         poster_path: movieApiData.poster_path,
         backdrop_path: movieApiData.backdrop_path,
         genres: movieApiData.genres.map((genre) => genre.name),
         cast: movieCreditsData.cast.map((actor) => actor.name),
         release_date: movieApiData.release_date,
         original_language: movieApiData.original_language,

         crew: movieCreditsData.crew.map((crewMember) => crewMember.name),
         tagline: movieApiData.tagline,
         vote_average: movieApiData.vote_average,
         runtime: movieApiData.runtime,
       };

    movie = await Movie.create(movieDetails);
    }

    if (movie) {
      const newShow = new Show({
        movie: movie._id,
        showDateTime: showsInput,
        showPrice: showPrice,
      });
      const savedShow = await newShow.save();
      if (savedShow) {
        res.json({ success: true, show: savedShow });
    }
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, error: error.message });
  }
};
