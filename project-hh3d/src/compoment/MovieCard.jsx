import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

function MovieCard({ movie }) {
  if (!movie) return null;
  const imageUrl = movie.image?.startsWith('/') ? movie.image : `/${movie.image}`;

  return (
    <Link to={`/movie/${movie.id}`} className="group relative block transition-all hover:-translate-y-2">
      {/* Phần ảnh Poster */}
      <div className="overflow-hidden rounded-xl aspect-[2/3] border border-gray-800 shadow-lg relative bg-[#161616]">
        <img 
          src={imageUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {e.target.src = 'https://via.placeholder.com/300x450'}} 
        />
        
        {/* Lớp phủ khi hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-[#26c6da] p-3 rounded-full scale-50 group-hover:scale-100 transition-all shadow-lg shadow-[#26c6da]/50">
            <Play className="text-black w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Tag số tập góc trên */}
        <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-md uppercase italic">
          Tập {movie.episode_display}
        </div>
      </div>

      {/* Phần chữ bên dưới */}
      <div className="mt-3 px-1">
        <h3 className="text-gray-200 font-bold text-sm truncate group-hover:text-[#26c6da] transition-colors uppercase italic tracking-tighter">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
           <p className="text-gray-600 text-[10px] font-medium uppercase tracking-widest">
             {movie.category_name || "Hoạt Hình"}
           </p>
           <span className="text-[9px] text-cyan-500 font-bold border border-cyan-500/30 px-1 rounded">4K</span>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;