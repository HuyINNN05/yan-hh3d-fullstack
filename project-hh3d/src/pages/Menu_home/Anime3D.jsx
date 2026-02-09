import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react'; // Đảm bảo bạn đã cài: npm install lucide-react

function Anime3D() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy danh sách phim
    axios.get('http://localhost:5000/api/movies')
      .then(res => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-white text-center mt-20">Đang tải danh sách phim...</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen p-6">
      <h2 className="text-2xl font-bold text-[#26c6da] mb-6 border-l-4 border-[#26c6da] pl-3">
        Phim Hoạt Hình 3D Mới Cập Nhật
      </h2>
      
      {/* Grid hiển thị phim */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="group relative block">
            {/* Ảnh Poster */}
            <div className="overflow-hidden rounded-xl aspect-[2/3] border border-gray-800 shadow-lg">
              <img 
                src={movie.image} 
                alt={movie.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                // Nếu ảnh lỗi thì hiện ảnh placeholder
                onError={(e) => {e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'}} 
              />
              {/* Nút Play hiện ra khi hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="text-white w-12 h-12 fill-current" />
              </div>
            </div>

            {/* Tên phim */}
            <div className="mt-3">
              <h3 className="text-white font-semibold truncate group-hover:text-[#26c6da] transition-colors">
                {movie.title}
              </h3>
              <p className="text-gray-500 text-sm">{movie.category_name || "Hành động"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Anime3D;