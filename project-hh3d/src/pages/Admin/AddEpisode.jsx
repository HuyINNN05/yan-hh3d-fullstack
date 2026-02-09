import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../compoment/AdminLayout';
import { Save, X, Play, List, Link as LinkIcon, Hash, ArrowLeft } from 'lucide-react';

function AddEpisode() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [episodeData, setEpisodeData] = useState({
    movie_id: '',
    episode_number: '',
    video_url: '',
    title: '' 
  });

  useEffect(() => {
    // Lấy danh sách phim để sếp chọn phim cần thêm tập
    axios.get('http://localhost:5000/api/admin/movies')
      .then(res => setMovies(res.data))
      .catch(err => console.error("Lỗi lấy danh sách phim:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/admin/episodes', episodeData);
      alert("Đã thêm tập phim mới thành công sếp ơi!");
      // Reset để sếp nhập tập tiếp theo cho nhanh
      setEpisodeData({ ...episodeData, episode_number: parseInt(episodeData.episode_number) + 1, video_url: '', title: '' });
    } catch (err) {
      alert("Lỗi rồi! Có thể tập này đã tồn tại hoặc server chưa chạy.");
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
            
            {/* Chọn bộ phim */}
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-widest flex items-center gap-2">
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
              {/* Số tập */}
              <div>
                <label className="text-[10px] font-black text-orange-500 uppercase mb-3 block flex items-center gap-2">
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

              {/* Tên tập */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block flex items-center gap-2">
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

            {/* Link Video */}
            <div className="bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/10">
              <label className="text-[10px] font-black text-cyan-400 uppercase mb-3 block flex items-center gap-2">
                <LinkIcon size={14} /> Bước 3: Link Video (Iframe/URL)
              </label>
              <textarea 
                required 
                rows="3"
                className="w-full bg-black border border-cyan-500/20 rounded-xl py-4 px-5 text-cyan-100 focus:border-cyan-500 outline-none font-mono text-xs transition-all"
                placeholder="Dán mã nhúng hoặc link video tập này..."
                value={episodeData.video_url}
                onChange={(e) => setEpisodeData({...episodeData, video_url: e.target.value})}
              ></textarea>
            </div>

            {/* Nút lưu */}
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