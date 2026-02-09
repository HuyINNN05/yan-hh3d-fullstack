import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

function Anime2D() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy phim theo ID thể loại 2D (Bạn đang để là 7)
    axios.get('http://localhost:5000/api/movies/category/7') 
      .then(res => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-white text-center mt-20 font-bold animate-pulse">ĐANG TẢI PHIM 2D...</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
         <h2 className="text-2xl font-bold text-[#26c6da] border-l-4 border-[#26c6da] pl-3 uppercase italic">Thế giới Hoạt Hình 2D</h2>
         <span className="text-gray-500 text-sm font-bold">{movies.length} bộ phim</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <Link to={`/movie/${movie.id}`} key={movie.id} className="group relative block transition-all hover:-translate-y-2">
              <div className="overflow-hidden rounded-xl aspect-[2/3] border border-gray-800 shadow-lg relative">
                <img 
                  src={movie.image} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {e.target.src = 'https://via.placeholder.com/300x450'}} 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-[#26c6da] p-3 rounded-full scale-50 group-hover:scale-100 transition-all">
                    <Play className="text-black w-8 h-8 fill-current" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-white font-bold truncate group-hover:text-[#26c6da] transition-colors">{movie.title}</h3>
                <div className="flex items-center justify-between mt-1">
                   <p className="text-gray-500 text-xs font-medium">{movie.category_name || "Anime 2D"}</p>
                   <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-400">Tập {movie.episode_display}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 py-20 uppercase text-xs tracking-widest">Hiện chưa có phim 2D nào.</div>
        )}
      </div>
    </div>
  );
}

export default Anime2D;