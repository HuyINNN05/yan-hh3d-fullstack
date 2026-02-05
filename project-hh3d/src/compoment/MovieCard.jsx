import React from 'react'; 
import { Link } from 'react-router-dom'; 
// Dùng { movie } đại diện cho MỘT bộ phim được truyền vào
function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative group bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-orange-500/20 transition-all duration-300">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={movie.image} 
          alt={movie.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100" />
        
        {/* Sửa lại tất cả thành movie.xxx */}
        <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-600 to-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
          {movie.episode}
        </span>
        
        <span className="absolute bottom-2 left-2 bg-cyan-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
          {movie.quality}
        </span>
      </div>
      
      <div className="p-2.5">
        <h3 className="text-gray-200 text-sm font-medium truncate group-hover:text-orange-500 transition-colors">
          {movie.title}
        </h3>
      </div>
    </div>
    </Link>
  );
}

export default MovieCard;