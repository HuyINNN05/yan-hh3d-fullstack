import React, { useState } from 'react';
import { MOVIES_DATA } from '../../data'; 
import MovieCard from '../../compoment/MovieCard';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';

function Anime2D() {
  // 1. Lọc danh sách phim thuộc loại Anime 2D
  const allAnime2D = MOVIES_DATA.filter(movie => movie.category === "Anime 2D");

  // 2. Logic Phân trang (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 20; // Hiển thị 20 phim mỗi trang theo yêu cầu
  
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = allAnime2D.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(allAnime2D.length / moviesPerPage);

  // 3. Logic Bảng xếp hạng (Lấy top 5 phim 2D có id nhỏ nhất hoặc theo tiêu chí của bạn)
  const rankingMovies = [...allAnime2D].slice(0, 5);

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white p-4 lg:p-10">
      <div className="container mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* CỘT TRÁI: DANH SÁCH PHIM (75% chiều rộng) */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
            <h2 className="text-xl font-bold text-[#26c6da] uppercase italic tracking-tighter">
              Anime 2D <span className="text-white ml-2 text-sm font-normal">| Trang {currentPage}</span>
            </h2>
          </div>

          {/* Grid hiển thị 20 phim */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* NÚT CHUYỂN TRANG */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded bg-[#222] ${currentPage === 1 ? 'opacity-30' : 'hover:bg-[#333] text-[#26c6da]'}`}
              >
                <ChevronLeft size={20} />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded font-bold transition-all ${
                    currentPage === index + 1 ? 'bg-[#26c6da] text-white shadow-lg shadow-cyan-500/20' : 'bg-[#222] text-gray-500 hover:text-white'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded bg-[#222] ${currentPage === totalPages ? 'opacity-30' : 'hover:bg-[#333] text-[#26c6da]'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: BẢNG XẾP HẠNG (25% chiều rộng) */}
        <div className="w-full lg:w-80">
          <div className="bg-[#161616] rounded-xl p-5 border border-white/5 shadow-2xl">
            <h3 className="text-[#26c6da] font-black uppercase italic mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <Trophy size={18} /> Bảng Xếp Hạng 2D
            </h3>
            
            <div className="space-y-6">
              {rankingMovies.map((movie, index) => (
                <div key={movie.id} className="flex items-center gap-4 group cursor-pointer">
                  <span className={`text-2xl font-black italic ${index < 3 ? 'text-[#26c6da]' : 'text-gray-600'}`}>
                    {index + 1}
                  </span>
                  <div className="relative overflow-hidden rounded w-12 h-16 shadow-lg">
                    <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-[11px] font-bold uppercase truncate group-hover:text-[#26c6da] transition-colors">{movie.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1">{movie.episode}</p>
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
              Website xem phim Hoạt Hình Trung Quốc (HH3D) lớn nhất Việt Nam, cập nhật liên tục các bộ phim hot nhất.
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

export default Anime2D;