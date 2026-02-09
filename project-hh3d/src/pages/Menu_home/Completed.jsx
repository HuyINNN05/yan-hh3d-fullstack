import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../../compoment/MovieCard.jsx';

function Completed() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy phim có status là 'Hoàn thành'
    axios.get('http://localhost:5000/api/movies/status/Hoàn thành')
      .then(res => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-cyan-500 text-center mt-20 font-bold">ĐANG TẢI PHIM BỘ...</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen p-6">
      <h2 className="text-2xl font-bold text-orange-500 mb-8 border-l-4 border-orange-500 pl-3 uppercase italic">Phim Đã Hoàn Thành</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </div>
  );
}

export default Completed;