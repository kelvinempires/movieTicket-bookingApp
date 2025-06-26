import React from 'react'
import { assets } from '../assets/assets';
import { ArrowRight, Calendar1Icon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
  return (
    <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
      <img
        src={assets.marvelLogo}
        className="max-h-11 lg:h-11 mt-20"
        alt="marvelLogo"
      />
      <h1 className="text-5xl md:text-[70px] md:leading-18 front-semibold max-w-110">
        Guardians <br /> of the Galaxy
      </h1>
      <div className="flex items-center gap-4 text-gray-300">
        <span>Action | Adventure | Sci-Fi</span>
        <div className="flex items-center gap-1">
          <Calendar1Icon className="w-4.5 h-4.5" />
          2018
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4.5 h-4.5" />
          2h 16m
        </div>
      </div>
      <p>
        <span className="text-yellow-400">Description:</span> Lorem ipsum dolor
        sit amet consectetur adipisicing elit. Quisquam, accusantium.
      </p>
      <button onClick={()=>navigate("/movies")} className="px-4 py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer">
        Explore Movies
        <ArrowRight className="inline ml-2 w-4 h-4" />
      </button>
    </div>
  );
}

export default HeroSection