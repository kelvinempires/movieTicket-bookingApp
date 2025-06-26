import React from 'react'
import { FaFilm } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminNavbar = () => {
  return (
    <div className='flex items-center justify-between px-6 py-5 md:px-10 h-6 border-b border-gray-300/30'>
      <Link to="/" className="flex items-center space-x-2">
        <FaFilm className="text-2xl text-yellow-400 " />
        <span className="text-xl font-bold">CineBook</span>
      </Link>
    </div>
  );
}

export default AdminNavbar