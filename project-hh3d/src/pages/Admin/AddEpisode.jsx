import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import AdminLayout from '../../compoment/AdminLayout';
import axiosInstance from '../../api/axiosInstance';

function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url.split('&')[0];

  const ytWatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (ytWatch?.[1]) return `https://www.youtube.com/embed/${ytWatch[1]}`;

  const ytShort = url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShort?.[1]) return `https://www.youtube.com/embed/${ytShort[1]}`;

  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}`;
  return url;
}

export default function AddEpisode() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    movie_id: '',
    episode_number: '',
    title: '',
    sources: {
      '360p': '',
      '720p': '',
      '1080p': '',
      '4k': '',
    },
  });

  useEffect(() => {
    axiosInstance.get('/admin/movies')
      .then((res) => setMovies(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Lỗi lấy danh sách phim:', err));
  }, []);

  const updateSource = (quality, value) => {
    setForm((prev) => ({
      ...prev,
      sources: {
        ...prev.sources,
        [quality]: toEmbedUrl(value),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all 4 sources are filled
    const allSourcesFilled = Object.values(form.sources).every(url => url && url.trim() !== '');
    if (!allSourcesFilled) {
      alert('❌ Bạn phải nhập đầy đủ 4 link video cho từng chất lượng (360p, 720p, 1080p, 4K)');
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post('/admin/episodes', {
        movie_id: Number(form.movie_id),
        episode_number: Number(form.episode_number),
        title: form.title,
        sources: form.sources,
      });

      alert('✅ Thêm tập phim thành công!');
      setForm((prev) => ({
        ...prev,
        episode_number: Number(prev.episode_number || 0) + 1,
        title: '',
        sources: {
          '360p': '',
          '720p': '',
          '1080p': '',
          '4k': '',
        },
      }));
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi thêm tập phim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto pb-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button type="button" onClick={() => navigate('/admin/movies')} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Thêm tập phim mới</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Bộ phim</label>
            <select
              required
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500"
              value={form.movie_id}
              onChange={(e) => setForm((prev) => ({ ...prev, movie_id: e.target.value }))}
            >
              <option value="">-- Chọn phim --</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>{movie.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Số tập</label>
              <input
                required
                type="number"
                min="1"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500"
                value={form.episode_number}
                onChange={(e) => setForm((prev) => ({ ...prev, episode_number: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Tiêu đề tập (tùy chọn)</label>
              <input
                type="text"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
          </div>

          <div className="bg-[#0f172a] border border-cyan-700/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-cyan-300 font-bold uppercase">Nguồn video theo chất lượng (PHẢI ĐỦ 4 MỨC)</p>
              <div className="text-xs font-bold">
                <span className="text-cyan-400">
                  {Object.values(form.sources).filter(v => v && v.trim()).length}/4 ✓
                </span>
              </div>
            </div>
            {['360p', '720p', '1080p', '4k'].map((q) => {
              const hasUrl = form.sources[q] && form.sources[q].trim() !== '';
              return (
                <div key={q}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-gray-300">
                      {q.toUpperCase()} {q === '4k' ? '(VIP)' : ''}
                    </label>
                    <span className={`text-xs font-bold ${hasUrl ? 'text-green-400' : 'text-red-400'}`}>
                      {hasUrl ? '✓ OK' : '✗ Thiếu'}
                    </span>
                  </div>
                  <input
                    required
                    type="text"
                    className={`w-full bg-black border rounded-lg py-2.5 px-3 text-white text-sm outline-none transition ${
                      hasUrl 
                        ? 'border-green-500/50 focus:border-green-500' 
                        : 'border-white/10 focus:border-cyan-500'
                    }`}
                    value={form.sources[q]}
                    onChange={(e) => updateSource(q, e.target.value)}
                    placeholder="YouTube URL hoặc ID (ví dụ: dQw4w9WgXcQ)"
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            <Save size={16} /> {isSubmitting ? 'Đang lưu...' : 'Lưu tập phim'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
