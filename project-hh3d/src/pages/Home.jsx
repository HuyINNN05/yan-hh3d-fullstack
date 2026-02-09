import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../compoment/MovieCard.jsx';
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  const daysOfWeek = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const today = new Date();
  const todayName = daysOfWeek[today.getDay()];
  const formattedDate = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const [allMovies, setAllMovies] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(todayName);
  
  const [sliderIndex, setSliderIndex] = useState(0);
  const itemsPerSlide = 6;

  useEffect(() => {
    axios.get('http://localhost:5000/api/movies')
      .then(res => {
        setAllMovies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi kết nối API:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (allMovies.length > 0) {
      const interval = setInterval(() => {
        handleNextSlide();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [sliderIndex, allMovies]);

  const handleNextSlide = () => {
    setSliderIndex((prev) => 
      prev + itemsPerSlide >= allMovies.length ? 0 : prev + 1
    );
  };

  const handlePrevSlide = () => {
    setSliderIndex((prev) => 
      prev === 0 ? allMovies.length - itemsPerSlide : prev - 1
    );
  };

  const sliderMovies = allMovies.slice(sliderIndex, sliderIndex + itemsPerSlide);
  const displayMovies = sliderMovies.length < itemsPerSlide 
    ? [...sliderMovies, ...allMovies.slice(0, itemsPerSlide - sliderMovies.length)]
    : sliderMovies;

  const filteredMovies = allMovies.filter(movie => movie.show_schedule === activeTab);

  const renderMovieItem = (movie, isSlider = false) => (
    <Link to={`/movie/${movie.id}`} key={isSlider ? `slide-${movie.id}` : `list-${movie.id}`} className="group relative block w-full">
      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl border border-gray-800 shadow-[0_4px_15px_rgba(0,0,0,0.5)] relative bg-[#1a1a1a]">
        <img 
          src={movie.image.startsWith('/') ? movie.image : `/${movie.image}`} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=YanHH3D'; }}
        />
        <div className="absolute top-0 left-0 z-20">
          <span className="bg-[#ff5722] text-white text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-br-lg shadow-md block uppercase">
            Tập {movie.episode_display || '??'}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
            <PlayCircle size={40} className="text-white opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
        <div className="absolute bottom-12 md:bottom-14 left-2 z-20">
          <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
            4K TM-VS
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black via-black/70 to-transparent">
          <h3 className="text-white text-[11px] md:text-[13px] font-bold uppercase leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {movie.title}
          </h3>
        </div>
      </div>
    </Link>
  );

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-cyan-400 font-bold uppercase italic">Đang tải dữ liệu YanHH3D...</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white font-sans overflow-x-hidden flex flex-col">
      
      <div className="flex-grow">
        {/* 1. SLIDER PHIM */}
        <div className="relative w-full px-4 py-8 bg-gradient-to-b from-[#141414] to-[#0f0f0f] mb-4">
          <button onClick={handlePrevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-cyan-500 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 group">
            <ChevronLeft size={24} />
          </button>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fadeIn">
            {displayMovies.map((movie) => renderMovieItem(movie, true))}
          </div>
          <button onClick={handleNextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-cyan-500 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 group">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* 2. THÔNG BÁO */}
        <div className="container mx-auto px-4 mb-8">
          <div className="bg-[#111] border border-gray-800 p-4 rounded-lg flex items-center gap-4 shadow-inner">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20">
                  <PlayCircle className="text-cyan-500" size={24} />
              </div>
              <div>
                <h4 className="text-cyan-400 font-bold text-sm uppercase">Thông Báo Tên Miền Mới: YanHH3D.gg</h4>
                <p className="text-gray-400 text-xs">Hãy đăng nhập để lưu lịch sử xem phim và nhận thông báo mới nhất.</p>
              </div>
          </div>
        </div>

        {/* 3. LỊCH CHIẾU & PHIM CẬP NHẬT */}
        <div className="container mx-auto px-4 pb-20">
          <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-bold text-[#26c6da] uppercase italic border-l-4 border-[#26c6da] pl-3">Lịch Phim</h2>
                <div className="bg-[#301c3d] text-[#d481ff] px-4 py-1 rounded-full text-[11px] font-bold border border-[#4a2b5e]">
                  Hôm nay: {todayName}, {formattedDate}
                </div>
              </div>
              
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2 bg-[#161616] p-2 rounded-lg border border-gray-800">
                {daysOfWeek.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => setActiveTab(day)}
                    className={`py-3 rounded-md transition-all flex flex-col items-center border border-transparent ${
                      activeTab === day 
                        ? 'bg-cyan-600 text-white shadow-lg border-cyan-400/30 scale-105 z-10' 
                        : 'bg-[#222] text-gray-500 hover:bg-[#333] hover:text-gray-300'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-black uppercase">{day}</span>
                    <span className="text-[9px] uppercase opacity-50 font-bold">{englishDays[index]}</span>
                  </button>
                ))}
              </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-6'>
              <div className='lg:w-3/4'>
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-2">
                    <h3 className="text-cyan-400 font-bold uppercase text-sm italic tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                      Phim cập nhật {activeTab}
                    </h3>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Tìm thấy: {filteredMovies.length} bộ</span>
                </div>
                <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
                    {filteredMovies.length > 0 ? (
                      filteredMovies.map((item) => renderMovieItem(item))
                    ) : (
                      <div className="col-span-full py-20 text-center text-gray-600 uppercase text-xs tracking-[2px] border border-dashed border-gray-800 rounded-lg">
                        Hiện chưa có lịch cập nhật phim cho {activeTab}
                      </div>
                    )}
                </div>
              </div>

              <div className='lg:w-1/4'>
                <div className='bg-[#161616] p-5 rounded-xl border border-gray-800 sticky top-4 shadow-2xl'>
                    <h3 className="text-orange-500 font-bold mb-6 border-b border-white/5 pb-4 text-center text-xs uppercase tracking-[4px]">Bảng Xếp Hạng</h3>
                    <div className="flex flex-col gap-4">
                      {allMovies.slice(0, 10).map((item, index) => (
                        <Link to={`/movie/${item.id}`} key={item.id} className="flex items-center gap-3 group border-b border-white/5 pb-3 last:border-0 hover:bg-white/5 p-2 rounded transition-colors">
                            <span className={`text-2xl font-black italic w-8 text-center ${index < 3 ? 'text-cyan-400' : 'text-gray-600'}`}>
                              {index + 1}
                            </span>
                            <div className="w-10 h-14 flex-shrink-0 overflow-hidden rounded border border-gray-700 bg-black">
                              <img src={item.image.startsWith('/') ? item.image : `/${item.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300" alt={item.title} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="text-[11px] font-bold text-gray-300 group-hover:text-cyan-400 uppercase truncate transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[9px] text-gray-500 mt-1 uppercase">Tập {item.episode_display}</p>
                            </div>
                        </Link>
                      ))}
                    </div>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* --- PHẦN FOOTER (THÊM MỚI THEO MẪU) --- */}
      <footer className="bg-[#1a1a1a] border-t border-gray-800 pt-10 pb-6 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8">
            {/* Logo & Domain Tags */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-black tracking-tighter italic">
                <span className="text-cyan-500">YanHH3D</span>
                <span className="text-orange-600">.GG</span>
              </h2>
              <div className="flex gap-2">
                <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded text-xs font-bold border border-gray-700">YanHH3D.net</span>
                <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded text-xs font-bold border border-gray-700">YanHH3D.gg</span>
              </div>
            </div>

            {/* Contact & Links */}
            <div className="flex flex-col gap-2 text-gray-500 text-xs md:text-right">
              <p>Liên hệ Telegrame: <span className="text-gray-300 hover:text-cyan-400 cursor-pointer">@ftmn2025</span> | Texlink: <span className="text-gray-300 hover:text-cyan-400 cursor-pointer">@lmss_plusp</span></p>
              <div className="flex flex-wrap md:justify-end gap-x-2 gap-y-1 opacity-60">
                <span>| W88</span><span>| I9BET</span><span>| G12</span><span>| MM88</span><span>| go8</span><span>| Hello88</span><span>| VN168</span><span>| BJ88</span><span>| 69vn</span><span>| hit club</span>
              </div>
              <p className="mt-2 text-[10px] opacity-40 italic">© YanHH3D 2024-2025. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;