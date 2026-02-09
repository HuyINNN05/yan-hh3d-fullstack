import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MovieCard from '../../compoment/MovieCard.jsx';

function Anime2D() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API theo ID thể loại 7 (Là Anime 2D trong database của bạn)
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

  if (loading) return <div className="text-cyan-500 text-center mt-20 font-bold uppercase tracking-widest animate-pulse">Đang tải danh sách Anime 2D...</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen p-6">
      <div className="flex items-center justify-between mb-8 border-b border-gray-900 pb-4">
         <h2 className="text-2xl font-bold text-[#26c6da] border-l-4 border-[#26c6da] pl-3 uppercase italic">Thế giới Hoạt Hình 2D</h2>
         <span className="text-gray-500 text-sm font-bold uppercase">{movies.length} bộ phim</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.length > 0 ? (
          movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
        ) : (
          <div className="col-span-full text-center text-gray-600 py-20 uppercase tracking-widest text-xs italic">Chưa có phim 2D nào được cập nhật.</div>
        )}
      </div>
    </div>
  );
}

export default Anime2D;