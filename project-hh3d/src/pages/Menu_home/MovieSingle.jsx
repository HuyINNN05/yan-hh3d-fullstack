import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Play, Calendar, Clock, Star, AlertCircle } from 'lucide-react'; // Thêm icon Alert cho chuyên nghiệp

function MoviesSingle() {
  const { id } = useParams(); 
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Gọi API lấy chi tiết 1 bộ phim từ Backend của bạn
    axios.get(`http://localhost:5000/api/movies/${id}`)
      .then(res => {
        setMovie(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi kết nối API:", err);
        setError("Không thể tải thông tin phim. Vui lòng kiểm tra Server!");
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="bg-[#0f0f0f] min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#26c6da]"></div>
    </div>
  );

  if (error || !movie) return (
    <div className="bg-[#0f0f0f] min-h-screen flex flex-col items-center justify-center text-white">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <p className="text-xl">{error || "Không tìm thấy phim này!"}</p>
    </div>
  );

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white pb-10">
      {/* 1. MÀN HÌNH PLAYER - Hiển thị video minh họa từ video_url */}
      <div className="w-full bg-black relative">
        <div className="container mx-auto aspect-video md:aspect-[21/9] bg-[#1a1a1a] flex items-center justify-center overflow-hidden border-b border-gray-800 shadow-2xl">
           {movie.video_url ? (
             <iframe 
               src={movie.video_url} 
               title={movie.title}
               className="w-full h-full border-0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             ></iframe>
           ) : (
             <div className="text-gray-500 flex flex-col items-center">
               <Play size={64} className="mb-4 opacity-20 text-[#26c6da] animate-pulse"/>
               <p className="text-lg">Link phim minh họa đang được cập nhật...</p>
             </div>
           )}
        </div>
      </div>

      {/* 2. THÔNG TIN PHIM CHI TIẾT */}
      <div className="container mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        {/* Poster phim */}
        <div className="w-full md:w-72 flex-shrink-0">
          <img 
            src={movie.image} 
            alt={movie.title} 
            className="w-full rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-gray-800 transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Thông tin chữ */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl md:text-5xl font-bold text-[#26c6da] mb-3 leading-tight">{movie.title}</h1>
            <h2 className="text-gray-400 text-xl font-medium mb-4">{movie.other_name || "YanHH3D Exclusive"}</h2>
            
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <span className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-gray-800 text-gray-300">
                <Calendar size={18} className="text-[#26c6da]" /> {movie.year || "2024"}
              </span>
              <span className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-gray-800 text-gray-300">
                <Clock size={18} className="text-[#26c6da]" /> {movie.duration || "24 Phút"}
              </span>
              <span className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-gray-800 text-gray-300">
                <Star size={18} className="text-yellow-500" /> {movie.views?.toLocaleString() || 0} Lượt xem
              </span>
            </div>
          </div>

          <div className="bg-[#161616] p-8 rounded-2xl border border-gray-800 shadow-inner">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-4">
               <div className="w-1 h-6 bg-[#26c6da] rounded-full"></div>
               <h3 className="text-2xl font-bold italic">Nội dung cốt truyện</h3>
            </div>
            <p className="text-gray-300 leading-loose text-lg">
              {movie.description || "Nội dung đang được đội ngũ YanHH3D biên soạn. Vui lòng quay lại sau!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoviesSingle;