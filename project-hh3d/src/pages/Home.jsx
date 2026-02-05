import React, { useState } from 'react';
import { MOVIES_DATA, BUTTON_DATA } from '../data.js';
import MovieCard from '../compoment/MovieCard.jsx';
import MovieButton from '../compoment/buttonn.jsx';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom'; // Thêm Link để click vào bảng xếp hạng

function Home() {
  // 1. Logic xử lý thời gian thực
  const daysOfWeek = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const today = new Date();
  const todayIndex = today.getDay(); 
  const todayName = daysOfWeek[todayIndex];
  const formattedDate = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // 2. Quản lý Tab Lịch chiếu (Mặc định là ngày hôm nay)
  const [activeTab, setActiveTab] = useState(todayName);

  // 3. Quản lý phân trang
  const [currentPage, setCurrentPage] = useState(0); 
  const moviesPerPage = 20;

  // 4. Lọc phim theo Thứ đang chọn
  const filteredMovies = MOVIES_DATA.filter(movie => movie.show_schedule === activeTab);

  const startIndexMain = currentPage * moviesPerPage;
  const currentMainMovies = filteredMovies.slice(startIndexMain, startIndexMain + moviesPerPage);

  // 5. Logic Slider 6 phim phía trên
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 6;
  const visibleSliderMovies = MOVIES_DATA.slice(startIndex, startIndex + itemsPerPage);

  const nextSlide = () => {
    if (startIndex + itemsPerPage < MOVIES_DATA.length) setStartIndex(startIndex + itemsPerPage);
    else setStartIndex(0);
  };

  const prevSlide = () => {
    if (startIndex - itemsPerPage >= 0) setStartIndex(startIndex - itemsPerPage);
    else setStartIndex(Math.max(0, MOVIES_DATA.length - itemsPerPage));
  };

  return (
    <div className="p-4 bg-[#0f0f0f] min-h-screen text-white font-sans">
      
      {/* 1. SLIDER TOP */}
      <div className='header mb-10 bg-[#1a1a1a] p-3 rounded-lg relative group shadow-2xl border border-gray-800/50'>
          <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-cyan-500 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 border border-white/10">
            <ChevronLeft size={24} />
          </button>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {visibleSliderMovies.map((item) => (
              <MovieCard key={`top-${item.id}`} movie={item} />
            ))}
          </div>
          <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-cyan-500 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 border border-white/10">
            <ChevronRight size={24} />
          </button>
      </div>

      <div className='center'>
        {/* 2. THANH LỊCH PHIM */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-green-400 uppercase italic tracking-wider border-l-4 border-green-500 pl-3">Lịch Phim</h2>
            <div className="bg-[#301c3d] text-[#d481ff] px-4 py-1 rounded-full text-[11px] font-bold border border-[#4a2b5e]">
              Hôm nay: {todayName}, {formattedDate}
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 bg-[#161616] p-2 rounded-lg border border-gray-800">
            {daysOfWeek.map((day, index) => (
              <button
                key={day}
                onClick={() => {
                  setActiveTab(day);
                  setCurrentPage(0);
                }}
                className={`py-2.5 rounded-md transition-all flex flex-col items-center justify-center ${
                  activeTab === day 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                  : 'bg-[#222] text-gray-500 hover:bg-[#282828] hover:text-gray-300'
                }`}
              >
                <span className="text-sm font-black">{day}</span>
                <span className="text-[9px] uppercase tracking-tighter opacity-60">{englishDays[index]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className='center_center flex flex-col lg:flex-row gap-6'>
          {/* 3. CỘT TRÁI - DANH SÁCH PHIM */}
          <div className='center_left lg:w-3/4 bg-[#141414] p-4 rounded-xl border border-gray-800 flex flex-col items-center min-h-[500px] shadow-2xl'>
             <div className="w-full mb-6 border-b border-gray-800 pb-3 flex justify-between items-center">
                <h3 className="text-cyan-400 font-bold uppercase text-sm tracking-widest italic">
                   Phim cập nhật {activeTab}
                </h3>
                <span className="text-[10px] text-gray-600 uppercase font-bold">Tổng: {filteredMovies.length} bộ</span>
             </div>

             <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full'>
                {currentMainMovies.length > 0 ? (
                  currentMainMovies.map((item) => (
                    <MovieCard key={`main-${item.id}`} movie={item} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-gray-600 italic uppercase text-xs tracking-[2px]">
                    Dữ liệu đang được cập nhật...
                  </div>
                )}
             </div>

             <div className="flex gap-4 mt-12 mb-6">
                {currentPage > 0 && (
                  <button 
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="flex items-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-all uppercase text-sm border border-gray-600 active:scale-95"
                  >
                    <RotateCcw size={16} /> Trở về
                  </button>
                )}

                {startIndexMain + moviesPerPage < filteredMovies.length && (
                  <button 
                    onClick={() => {
                        setCurrentPage(prev => prev + 1);
                        window.scrollTo({ top: 450, behavior: 'smooth' });
                    }}
                    className="px-10 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-lg transition-all uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95"
                  >
                    Xem thêm phim {activeTab}
                  </button>
                )}
             </div>
          </div>

          {/* 4. CỘT PHẢI - BẢNG XẾP HẠNG CẬP NHẬT MỚI */}
          <div className='center_right lg:w-1/4'>
             <div className='bg-[#161616] p-5 rounded-xl border border-gray-800 h-fit shadow-2xl sticky top-4'>
                <h3 className="text-orange-500 font-bold mb-6 border-b border-gray-800 pb-4 text-center text-xs uppercase tracking-[4px]">
                   Bảng Xếp Hạng
                </h3>
                
                <div className="flex flex-col gap-2">
                   {MOVIES_DATA.slice(0, 10).map((item, index) => (
                     <Link 
                       to={`/movie/${item.id}`} 
                       key={`rank-${item.id}`} 
                       className="flex items-center gap-4 p-2 rounded-lg hover:bg-[#222] transition-all group border-b border-gray-800/50 last:border-0 pb-3"
                     >
                        {/* Số thứ tự */}
                        <span className={`text-2xl font-black italic w-8 text-center ${index < 3 ? 'text-cyan-400' : 'text-gray-700'}`}>
                           {(index + 1).toString().padStart(2, '0')}
                        </span>

                        {/* Thumbnail nhỏ */}
                        <div className="w-12 h-14 flex-shrink-0 rounded overflow-hidden shadow-lg border border-gray-700">
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>

                        {/* Thông tin phim */}
                        <div className="flex-1 overflow-hidden">
                           <h4 className="text-[11px] font-bold text-gray-300 group-hover:text-cyan-400 transition-colors uppercase truncate tracking-tighter">
                              {item.title}
                           </h4>
                           <div className="flex items-center justify-between mt-1">
                              <span className="text-[9px] text-gray-500 font-medium">{item.episode}</span>
                              <span className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700 group-hover:border-cyan-500/30 transition-colors italic">
                                 {item.quality || '4K'}
                              </span>
                           </div>
                        </div>
                     </Link>
                   ))}
                </div>
                
                {/* Nút xem tất cả (nếu cần) */}
                <div className="mt-6 text-center">
                   <button className="text-[10px] text-gray-500 hover:text-cyan-400 uppercase tracking-widest font-bold transition-colors">
                      Xem toàn bộ xếp hạng
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <footer className='footder mt-20 py-10 border-t border-gray-900 text-center opacity-30 text-[10px] uppercase tracking-[4px]'>
          YanHH3D.GG - Thỏa mãn đam mê 3D
      </footer>
    </div>
  );
}

export default Home;