import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../compoment/AdminLayout';
import { Save, X, Play, List, Link as LinkIcon, Hash, ArrowLeft } from 'lucide-react';

// Tự động chuyển YouTube/GDrive URL sang dạng embed
function toEmbedUrl(url) {
  if (!url) return '';
  
  // Nếu đã là embed URL rồi, trả về luôn
  if (url.includes('youtube.com/embed/')) {
    // Remove any parameters from embed URLs
    return url.split('&')[0];
  }
  if (url.includes('drive.google.com/file/')) return url;
  
  // Kiểm tra YouTube full URL: https://www.youtube.com/watch?v=ID hoặc https://youtube.com/watch?v=ID
  const ytWatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (ytWatch && ytWatch[1]) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  
  // Kiểm tra YouTube short URL: https://youtu.be/ID
  const ytShort = url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShort && ytShort[1]) return `https://www.youtube.com/embed/${ytShort[1]}`;
  
  // Kiểm tra nếu là chỉ video ID (11 ký tự alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}`;
  
  // Kiểm tra Google Drive
  const gdrive = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdrive && gdrive[1]) return `https://drive.google.com/file/d/${gdrive[1]}/preview`;
  
  return url;
}

function AddEpisode() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [episodeData, setEpisodeData] = useState({
    movie_id: '',
    episode_number: '',
    video_url: '',
    title: '',
    server_type: 'Thuyết Minh' 
  });

  useEffect(() => {
    axiosInstance.get('/admin/movies')
      .then(res => setMovies(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Lỗi lấy danh sách phim:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/admin/episodes', episodeData);
      alert("Đã thêm tập phim mới thành công sếp ơi!");
      setEpisodeData({ ...episodeData, episode_number: parseInt(episodeData.episode_number) + 1, video_url: '', title: '' });
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Không xác định được lỗi';
      alert(`Lỗi thêm tập: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/admin/movies')} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Thêm tập phim mới</h2>
          </div>
          <button type="button" onClick={() => navigate('/admin/movies')} className="text-gray-500 hover:text-white flex items-center gap-2 font-bold uppercase text-[10px]">
            <X size={16} /> Hủy bỏ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 gap-8 relative z-10">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                <List size={12} /> Bước 1: Chọn bộ phim
              </label>
              <select 
                required 
                className="w-full bg-black border border-white/5 rounded-xl py-4 px-5 text-white focus:border-cyan-500 outline-none font-bold appearance-none transition-all"
                value={episodeData.movie_id}
                onChange={(e) => setEpisodeData({...episodeData, movie_id: e.target.value})}
              >
                <option value="">-- Click để chọn phim từ kho --</option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id}>{movie.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-orange-500 uppercase mb-3 flex items-center gap-2">
                  <Hash size={12} /> Bước 2: Số tập
                </label>
                <input 
                  type="number" 
                  required 
                  className="w-full bg-black border border-white/5 rounded-xl py-4 px-5 text-white focus:border-orange-500 outline-none font-bold"
                  placeholder="VD: 1, 2, 3..."
                  value={episodeData.episode_number}
                  onChange={(e) => setEpisodeData({...episodeData, episode_number: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <Play size={12} /> Tên tập (Tùy chọn)
                </label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-white/5 rounded-xl py-4 px-5 text-white focus:border-cyan-500 outline-none"
                  placeholder="VD: Khởi đầu mới..."
                  value={episodeData.title}
                  onChange={(e) => setEpisodeData({...episodeData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/10">
              <label className="text-[10px] font-black text-cyan-400 uppercase mb-3 flex items-center gap-2">
                <LinkIcon size={14} /> Bước 3: Link Video (Iframe/URL)
              </label>
              <textarea 
                required 
                rows="3"
                className="w-full bg-black border border-cyan-500/20 rounded-xl py-4 px-5 text-cyan-100 focus:border-cyan-500 outline-none font-mono text-xs transition-all"
                placeholder="YouTube, Google Drive... (tự động convert sang embed)"
                value={episodeData.video_url}
                onChange={(e) => setEpisodeData({...episodeData, video_url: toEmbedUrl(e.target.value)})}
              ></textarea>
            </div>

            <div className="mt-4 pt-6 border-t border-white/5">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full ${isSubmitting ? 'bg-gray-700' : 'bg-cyan-600 hover:bg-cyan-500'} text-black font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-cyan-500/20`}
              >
                {isSubmitting ? 'Đang xử lý...' : <><Save size={20} /> Lưu và đăng tập phim</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddEpisode;