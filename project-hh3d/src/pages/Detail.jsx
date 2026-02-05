import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MOVIES_DATA } from '../data';
import MovieCard from '../compoment/MovieCard';
import MovieButton from '../compoment/buttonn'; // Đảm bảo đúng tên file của bạn
import { Plus, MessageCircle, Play } from 'lucide-react';

function Detail() {
  const { id } = useParams();
  
  // Tìm dữ liệu phim dựa trên ID từ URL
  const movie = MOVIES_DATA.find(m => m.id === parseInt(id)) || MOVIES_DATA[0];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-300">
      {/* 1. PHẦN ĐẦU TRANG: BANNER MỜ VÀ THÔNG TIN CHÍNH */}
      <div className="relative h-[450px] w-full overflow-hidden">
        {/* Lớp nền mờ ảo phía sau */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110"
          style={{ backgroundImage: `url(${movie.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f0f]" />
        
        <div className="container mx-auto relative z-10 h-full flex items-end pb-10 px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start w-full">
            {/* Poster & Nút Yêu thích (Sử dụng MovieButton của bạn) */}
            <div className="w-52 flex-shrink-0 shadow-2xl rounded-lg overflow-hidden border border-white/10">
              <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
              <MovieButton 
                title="Yêu thích" 
                icon={Plus} 
                className="w-full rounded-none py-3 border-none" 
              />
            </div>

            {/* Thông tin chữ */}
            <div className="flex-1">
              <nav className="text-[10px] text-gray-500 mb-2 flex gap-2 uppercase tracking-[2px]">
                <span>Trang chủ</span> / <span className="text-cyan-500">Hoạt Hình 3D</span>
              </nav>
              <h1 className="text-4xl font-black text-white mb-6 uppercase italic tracking-tighter">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {/* Các nút điều hướng sử dụng component của bạn */}
                <MovieButton title="Xem Thuyết Minh" />
                <MovieButton title="Xem Vietsub" variant="secondary" />
              </div>

              <p className="text-sm text-gray-400 leading-relaxed max-w-2xl italic line-clamp-3">
                {movie.description || "Nội dung phim đang được cập nhật. Đây là một bộ phim hoạt hình 3D đỉnh cao với đồ họa sắc nét và cốt truyện hấp dẫn..."}
              </p>
            </div>

            {/* Thông số phụ bên phải (Chỉ hiện trên màn hình lớn) */}
            <div className="hidden lg:block w-72 bg-black/40 p-5 rounded-xl border border-white/5 backdrop-blur-md">
               <div className="text-[11px] space-y-3 uppercase font-bold">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500">Số tập:</span> <span>{movie.episode}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500">Trạng thái:</span> <span className="text-green-500">Đang chiếu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lịch chiếu:</span> <span className="text-orange-400">{movie.show_schedule}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PHẦN THÂN TRANG: BÌNH LUẬN VÀ GỢI Ý */}
      <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          {/* Khu vực Bình luận */}
          <div className="mb-16">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase italic border-l-4 border-cyan-500 pl-3">
              <MessageCircle className="text-cyan-400" size={20} /> 2084 bình luận
            </h3>
            <div className="bg-[#161616] p-12 rounded-2xl border border-white/5 flex flex-col items-center text-center shadow-inner">
                <Link to="/Login">
                    <MovieButton title="Đăng nhập để bình luận" className="mb-4 px-10" />
                </Link>
                <MovieButton title="Xem toàn bộ bình luận" variant="secondary" icon={MessageCircle} />
            </div>
          </div>

          {/* Phim gợi ý (Sử dụng lại MovieCard) */}
          <div>
            <h3 className="text-lg font-bold text-cyan-400 mb-8 uppercase italic tracking-widest">Có Thể Bạn Thích</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
               {MOVIES_DATA.slice(0, 10).map(m => (
                 <MovieCard key={`rel-${m.id}`} movie={m} />
               ))}
            </div>
          </div>
        </div>

        {/* 3. SIDEBAR: BẢNG XẾP HẠNG */}
        <aside className="lg:w-80">
          <div className="bg-[#161616] rounded-2xl p-6 border border-white/5 sticky top-5 shadow-xl">
            <h3 className="text-orange-500 font-bold mb-8 text-center border-b border-white/5 pb-4 uppercase tracking-[4px] text-xs">Bảng Xếp Hạng</h3>
            <div className="space-y-5">
               {MOVIES_DATA.slice(0, 10).map((m, index) => (
                 <div key={`rank-${m.id}`} className="flex items-center gap-4 group cursor-pointer border-b border-white/5 pb-4 last:border-0">
                    <span className={`text-2xl font-black italic ${index < 3 ? 'text-cyan-400' : 'text-gray-700'}`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="w-12 h-14 flex-shrink-0 overflow-hidden rounded shadow-lg">
                      <img src={m.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold group-hover:text-cyan-400 transition-colors uppercase line-clamp-1 tracking-tight">
                        {m.title}
                      </h4>
                      <p className="text-[9px] text-gray-600 mt-1 font-medium">{m.episode}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </aside>
      </div>
      <footer className='footder mt-20 py-10 border-t border-gray-900 text-center opacity-30 text-[10px] uppercase tracking-[4px]'>
          YanHH3D.GG - Thỏa mãn đam mê 3D
      </footer>
    </div>
  );
}

export default Detail;