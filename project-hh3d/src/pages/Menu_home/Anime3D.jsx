import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Đã thêm axios để gọi dữ liệu từ Backend
// import { MOVIES_DATA } from '../../data'; // Dòng này không dùng nữa vì lấy từ MySQL
import MovieCard from '../../compoment/MovieCard'; 
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

function Anime3D() {
  // --- PHẦN CHỈNH SỬA: Lấy dữ liệu từ Backend ---
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API từ Server Node.js
    axios.get('http://localhost:5000/api/movies')
      .then(res => {
        // Lọc danh sách phim Anime 3D (category_id = 6 như trong file SQL)
        const allAnime3D = res.data.filter(movie => movie.category_id === 6);
        setMovies(allAnime3D);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi kết nối API:", err);
        setLoading(false);
      });
  }, []);

  // Tự động cuộn lên đầu trang khi người dùng bấm chuyển trang
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  // ----------------------------------------------

  // 2. Logic Phân trang (Sử dụng state movies từ API)
  const moviesPerPage = 20; 
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  // 3. Logic Bảng xếp hạng (Lấy top 5 phim từ danh sách API)
  const ranking3D = [...movies].slice(0, 5);

  if (loading) return <div className="bg-[#0f0f0f] min-h-screen text-white p-10 text-center">Đang tải dữ liệu từ Database...</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white p-4 lg:p-10">
      <div className="container mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* CỘT TRÁI: DANH SÁCH PHIM (75% chiều rộng) */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
            <h2 className="text-xl font-bold text-[#26c6da] uppercase italic tracking-tighter">
              Hoạt Hình 3D <span className="text-white ml-2 text-sm font-normal">| Trang {currentPage}</span>
            </h2>
          </div>

          {/* Grid hiển thị phim */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* HỆ THỐNG PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded bg-[#222] transition-colors ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#333] text-[#26c6da]'}`}
              >
                <ChevronLeft size={20} />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded font-bold transition-all ${
                    currentPage === index + 1 
                    ? 'bg-[#26c6da] text-white shadow-lg shadow-cyan-500/20' 
                    : 'bg-[#222] text-gray-500 hover:text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded bg-[#222] transition-colors ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#333] text-[#26c6da]'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: BẢNG XẾP HẠNG (25% chiều rộng) */}
        <div className="w-full lg:w-80">
          <div className="bg-[#161616] rounded-xl p-5 border border-white/5 shadow-2xl sticky top-24">
            <h3 className="text-[#26c6da] font-black uppercase italic mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <Trophy size={18} /> Bảng Xếp Hạng
            </h3>
            
            <div className="space-y-6">
              {ranking3D.map((movie, index) => (
                <div key={movie.id} className="flex items-center gap-4 group cursor-pointer">
                  <span className={`text-2xl font-black italic ${index < 3 ? 'text-[#26c6da]' : 'text-gray-600'}`}>
                    {index + 1}
                  </span>
                  <div className="relative overflow-hidden rounded w-12 h-16 shadow-lg shadow-black/50">
                    <img 
                      src={movie.image} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[11px] font-bold uppercase truncate group-hover:text-[#26c6da] transition-colors tracking-tighter">
                      {movie.title}
                    </h4>
                    {/* Chỉnh lại thành episode_display cho khớp database */}
                    <p className="text-[10px] text-gray-500 mt-1">{movie.episode_display}</p>
                    <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                       <div className="bg-[#26c6da] h-full" style={{ width: `${100 - index * 15}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-20 pt-10 border-t border-gray-800 container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="text-2xl font-black italic tracking-tighter">
              <span className="text-[#26c6da]">Yan</span><span className="text-white">HH3D</span><span className="text-[#ff5722]">.GG</span>
            </div>
            <p className="text-[10px] text-gray-500 max-w-sm uppercase tracking-wider leading-relaxed">
              Website xem phim Hoạt Hình Trung Quốc (HH3D) miễn phí.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-[#222] hover:bg-[#26c6da] hover:text-white text-gray-400 px-4 py-1.5 text-[10px] font-bold rounded border border-gray-700 transition-all uppercase">YanHH3D.net</button>
            <button className="bg-[#222] hover:bg-[#26c6da] hover:text-white text-gray-400 px-4 py-1.5 text-[10px] font-bold rounded border border-gray-700 transition-all uppercase">YanHH3D.gg</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Anime3D;