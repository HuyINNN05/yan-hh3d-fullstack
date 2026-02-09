import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../compoment/MovieCard.jsx';
import { ChevronLeft, ChevronRight, RotateCcw, PlayCircle } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(0); 

  useEffect(() => {
    // Gọi API từ Backend cổng 5000
    axios.get('http://localhost:5000/api/movies')
      .then(res => {
        setAllMovies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Không thể kết nối API:", err);
        setLoading(false);
      });
  }, []);

  // Lọc phim: Khớp chính xác chữ "Chủ nhật" trong Database
  const filteredMovies = allMovies.filter(movie => movie.show_schedule === activeTab);
  const currentMainMovies = filteredMovies.slice(currentPage * 12, (currentPage + 1) * 12);

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-cyan-400 font-bold uppercase italic">Đang tải dữ liệu YanHH3D...</div>;

  return (
    <div className="p-4 bg-[#0f0f0f] min-h-screen text-white font-sans">
      {/* LỊCH CHIẾU PHIM */}
      <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-green-400 uppercase italic border-l-4 border-green-500 pl-3">Lịch Phim</h2>
            <div className="bg-[#301c3d] text-[#d481ff] px-4 py-1 rounded-full text-[11px] font-bold border border-[#4a2b5e]">
              Hôm nay: {todayName}, {formattedDate}
            </div>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2 bg-[#161616] p-2 rounded-lg border border-gray-800">
            {daysOfWeek.map((day, index) => (
              <button
                key={day}
                onClick={() => { setActiveTab(day); setCurrentPage(0); }}
                className={`py-2.5 rounded-md transition-all flex flex-col items-center ${
                  activeTab === day ? 'bg-cyan-500 text-white shadow-lg' : 'bg-[#222] text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-sm font-black">{day}</span>
                <span className="text-[9px] uppercase opacity-50">{englishDays[index]}</span>
              </button>
            ))}
          </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-6'>
          {/* CỘT PHIM CẬP NHẬT */}
          <div className='lg:w-3/4 bg-[#141414] p-4 rounded-xl border border-gray-800 shadow-2xl min-h-[500px]'>
             <div className="w-full mb-6 border-b border-gray-800 pb-3 flex justify-between items-center">
                <h3 className="text-cyan-400 font-bold uppercase text-sm italic">Phim cập nhật {activeTab}</h3>
                <span className="text-[10px] text-gray-600 font-bold uppercase">Tìm thấy: {filteredMovies.length} bộ</span>
             </div>

             <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
                {currentMainMovies.length > 0 ? (
                  currentMainMovies.map((item) => <MovieCard key={item.id} movie={item} />)
                ) : (
                  <div className="col-span-full py-20 text-center text-gray-700 uppercase text-xs tracking-widest italic border border-dashed border-gray-800 rounded-lg">
                    Hiện chưa có lịch cập nhật phim cho {activeTab}
                  </div>
                )}
             </div>
          </div>

          {/* BẢNG XẾP HẠNG (BXH) */}
          <div className='lg:w-1/4'>
             <div className='bg-[#161616] p-5 rounded-xl border border-gray-800 sticky top-4 shadow-2xl'>
                <h3 className="text-orange-500 font-bold mb-6 border-b border-gray-800 pb-4 text-center text-xs uppercase tracking-[4px]">Bảng Xếp Hạng</h3>
                <div className="flex flex-col gap-4">
                   {allMovies.slice(0, 8).map((item, index) => (
                     <Link to={`/movie/${item.id}`} key={item.id} className="flex items-center gap-3 group">
                        <span className={`text-xl font-black italic w-6 text-center ${index < 3 ? 'text-cyan-400' : 'text-gray-700'}`}>{index + 1}</span>
                        <img 
                          src={item.image.startsWith('/') ? item.image : `/${item.image}`} 
                          className="w-10 h-12 object-cover rounded border border-gray-700 group-hover:border-cyan-500 transition-all" 
                          alt="" 
                        />
                        <div className="flex-1 overflow-hidden">
                           <h4 className="text-[11px] font-bold text-gray-300 group-hover:text-cyan-400 uppercase truncate transition-colors">{item.title}</h4>
                           <p className="text-[9px] text-gray-500">Tập {item.episode_display}</p>
                        </div>
                     </Link>
                   ))}
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}

export default Home;