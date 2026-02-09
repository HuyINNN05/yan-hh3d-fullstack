import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../compoment/MovieCard';
import MovieButton from '../compoment/buttonn';
import { Plus, MessageCircle, PlayCircle, Heart } from 'lucide-react';

function Detail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // --- GIỮ NGUYÊN STATE CHO TẬP PHIM ---
  const [episodes, setEpisodes] = useState([]); 
  const [currentEpisode, setCurrentEpisode] = useState(null); 
  const [serverType, setServerType] = useState('Thuyết Minh'); 

  useEffect(() => {
    const fetchMovieDetail = axios.get(`http://localhost:5000/api/movies/${id}`);
    const fetchAllMovies = axios.get('http://localhost:5000/api/movies');
    const fetchEpisodes = axios.get(`http://localhost:5000/api/episodes/${id}`); 

    Promise.all([fetchMovieDetail, fetchAllMovies, fetchEpisodes])
      .then(([detailRes, allRes, epRes]) => {
        const movieData = detailRes.data;
        setMovie(movieData);
        setAllMovies(allRes.data);
        
        setEpisodes(epRes.data);
        if (epRes.data.length > 0) {
          const defaultEp = epRes.data.find(e => e.server_type === 'Thuyết Minh') || epRes.data[0];
          setCurrentEpisode(defaultEp);
        }

        setLoading(false);
        window.scrollTo(0, 0);

        // --- GIỮ NGUYÊN LOGIC LƯU LỊCH SỬ ---
        const history = JSON.parse(localStorage.getItem('viewing_history')) || [];
        const filteredHistory = history.filter(item => item.id !== movieData.id);
        const newHistory = [{
          id: movieData.id,
          title: movieData.title,
          image: movieData.image?.startsWith('/') ? movieData.image : `/${movieData.image}`,
          episode_display: movieData.episode_display,
          time: new Date().toLocaleTimeString('vi-VN')
        }, ...filteredHistory].slice(0, 20);
        localStorage.setItem('viewing_history', JSON.stringify(newHistory));

        // --- GIỮ NGUYÊN LOGIC KIỂM TRA YÊU THÍCH ---
        const favorites = JSON.parse(localStorage.getItem('favorite_movies')) || [];
        setIsFavorite(favorites.some(item => item.id === movieData.id));
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu:", err);
        setLoading(false);
      });
  }, [id]);

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorite_movies')) || [];
    let updatedFavorites;
    if (isFavorite) {
      updatedFavorites = favorites.filter(item => item.id !== movie.id);
      setIsFavorite(false);
    } else {
      const favoriteItem = {
        id: movie.id,
        title: movie.title,
        image: movie.image?.startsWith('/') ? movie.image : `/${movie.image}`,
        episode_display: movie.episode_display
      };
      updatedFavorites = [favoriteItem, ...favorites];
      setIsFavorite(true);
    }
    localStorage.setItem('favorite_movies', JSON.stringify(updatedFavorites));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-cyan-500 font-bold uppercase tracking-widest">
      <PlayCircle className="animate-spin mr-2" /> Đang tải thông tin phim...
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-red-500 uppercase font-bold">
      Không tìm thấy phim yêu cầu!
    </div>
  );

  const filteredEpisodes = episodes.filter(ep => ep.server_type === serverType);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-300 font-sans">
      <div className="container mx-auto px-4 py-6">
        
        {/* Breadcrumb */}
        <nav className="text-[10px] text-gray-500 mb-4 flex gap-2 uppercase tracking-widest">
          <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link> / 
          <span className="text-cyan-500">{movie.title} {currentEpisode ? `- Tập ${currentEpisode.episode_number}` : ''}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* CỘT TRÁI: PLAYER */}
          <div className="flex-1">
            <div className="relative bg-black rounded-lg overflow-hidden border border-white/5 aspect-video shadow-2xl">
              {currentEpisode ? (
                <iframe
                  src={currentEpisode.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title="Movie Player"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 italic">
                   Vui lòng chọn tập phim bên dưới...
                </div>
              )}
            </div>

            {/* Chọn Server & Tập */}
            <div className="mt-6 bg-[#161616] rounded-xl border border-white/5 overflow-hidden shadow-lg">
              <div className="flex border-b border-white/5 bg-black/20">
                {['Thuyết Minh', 'Vietsub'].map(type => (
                  <button
                    key={type}
                    onClick={() => setServerType(type)}
                    className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                      serverType === type ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="p-4 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {filteredEpisodes.length > 0 ? (
                  filteredEpisodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => setCurrentEpisode(ep)}
                      className={`py-2 text-[11px] font-bold rounded-sm border transition-all ${
                        currentEpisode?.id === ep.id 
                        ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-900/40' 
                        : 'bg-[#222] border-gray-800 text-gray-400 hover:border-cyan-500'
                      }`}
                    >
                      {ep.episode_number} {ep.is_end ? 'End' : ''}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full p-4 text-center text-xs italic text-gray-600">
                    Hiện chưa có tập phim nào cho server này.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: INFO */}
          <div className="lg:w-80 flex-shrink-0">
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight">
              {movie.title}
            </h1>
            
            <button 
              onClick={handleToggleFavorite}
              className={`w-full py-3 mb-6 rounded-lg flex items-center justify-center gap-2 text-[11px] font-black uppercase transition-all shadow-lg ${
                isFavorite ? 'bg-orange-600 text-white shadow-orange-900/20' : 'bg-cyan-600 text-white shadow-cyan-900/20'
              }`}
            >
              {isFavorite ? <Heart size={14} fill="white" /> : <Plus size={14} />}
              {isFavorite ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
            </button>

            <div className="bg-[#161616] p-5 rounded-xl border border-white/5 space-y-4 shadow-md">
               <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight border-b border-white/5 pb-2">
                  <span className="text-gray-500">Thời lượng:</span> <span>{movie.episode_display}</span>
               </div>
               <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight border-b border-white/5 pb-2">
                  <span className="text-gray-500">Trạng thái:</span> <span className="text-green-500 uppercase tracking-widest">{movie.status}</span>
               </div>
               <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight border-b border-white/5 pb-2">
                  <span className="text-gray-500">Năm:</span> <span>2024</span>
               </div>
               <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                  <span className="text-gray-500">Lịch chiếu:</span> <span className="text-orange-400">{movie.show_schedule}</span>
               </div>
            </div>

            <p className="mt-6 text-[12px] text-gray-500 leading-relaxed italic border-l-2 border-gray-800 pl-3">
              {movie.description || "Nội dung phim đang được cập nhật..."}
            </p>
          </div>
        </div>

        {/* --- PHẦN ĐỀ XUẤT ĐÃ SỬA LỖI HIỂN THỊ --- */}
        <div className="mt-12 flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase italic border-l-4 border-cyan-500 pl-3">
               <MessageCircle className="text-cyan-400" size={20} /> Bình luận
             </h3>
             <div className="bg-[#161616] p-10 rounded-2xl border border-white/5 text-center shadow-inner">
                <Link to="/Login"><MovieButton title="Đăng nhập để bình luận" className="mb-4 px-10" /></Link>
                <p className="text-gray-600 text-[10px] uppercase tracking-widest">Tuân thủ nội quy cộng đồng</p>
             </div>

             <div className="mt-12">
               <h3 className="text-lg font-bold text-cyan-400 mb-8 uppercase italic tracking-widest border-b border-white/5 pb-4">Có Thể Bạn Thích</h3>
               {/* Grid 5 cột chuẩn đẹp */}
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
                  {allMovies
                    .filter(m => m.id !== movie.id)
                    .slice(0, 10)
                    .map(m => (
                      <MovieCard key={`rel-${m.id}`} movie={m} />
                    ))}
               </div>
             </div>
          </div>

          {/* Sidebar Phim Xem Nhiều */}
          <aside className="lg:w-80">
            <div className="bg-[#161616] rounded-2xl p-6 border border-white/5 sticky top-5 shadow-xl">
              <h3 className="text-orange-500 font-bold mb-8 text-center border-b border-white/5 pb-4 uppercase tracking-[4px] text-[10px]">Phim Xem Nhiều</h3>
              <div className="space-y-5">
                 {allMovies.slice(0, 8).map((m, index) => (
                   <Link to={`/movie/${m.id}`} key={`rank-${m.id}`} className="flex items-center gap-4 group border-b border-white/5 pb-4 last:border-0">
                      <span className={`text-2xl font-black italic ${index < 3 ? 'text-cyan-400' : 'text-gray-700'}`}>{(index + 1).toString().padStart(2, '0')}</span>
                      <div className="w-12 h-14 flex-shrink-0 overflow-hidden rounded border border-gray-800">
                        <img src={m.image?.startsWith('/') ? m.image : `/${m.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-[11px] font-bold group-hover:text-cyan-400 uppercase truncate transition-colors">{m.title}</h4>
                        <p className="text-[9px] text-gray-600 mt-1 italic font-bold">Tập {m.episode_display}</p>
                      </div>
                   </Link>
                 ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Detail;