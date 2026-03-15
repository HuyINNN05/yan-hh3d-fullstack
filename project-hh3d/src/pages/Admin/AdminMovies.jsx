import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../compoment/AdminLayout';
import axiosInstance from '../../api/axiosInstance';
import { createAdminEpisode, fetchAdminEpisodesByMovie } from '../../api/episodeApi';
import { Plus, Search, Edit2, Trash2, Film, X, Save } from 'lucide-react';

function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url.split('&')[0];
  const ytWatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (ytWatch && ytWatch[1]) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  const ytShort = url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShort && ytShort[1]) return `https://www.youtube.com/embed/${ytShort[1]}`;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}`;
  return url;
}

function isYoutubeLike(url) {
  if (!url) return false;
  return /^(https?:\/\/)?((www\.)?youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{6,}|^[\w-]{11}$/.test(url.trim());
}

function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [episodesByMovie, setEpisodesByMovie] = useState({});
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isSubmittingEpisode, setIsSubmittingEpisode] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const [episodeModal, setEpisodeModal] = useState({
    open: false,
    movie: null,
  });

  const [episodeForm, setEpisodeForm] = useState({
    episode_number: '',
    youtube_url: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get('/admin/movies');
      setMovies(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách phim:", err);
      setNotice({ type: 'error', message: 'Không thể tải danh sách phim' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMovies = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return movies;
    return movies.filter((movie) =>
      `${movie.title || ''} ${movie.id || ''}`.toLowerCase().includes(keyword)
    );
  }, [movies, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm("Sếp có chắc muốn xóa phim này không?")) {
      try {
        await axiosInstance.delete(`/admin/movies/${id}`);
        fetchMovies();
      } catch (err) {
        alert("Lỗi xóa phim sếp ơi!");
      }
    }
  };

  const loadMovieEpisodes = async (movieId) => {
    setIsLoadingEpisodes(true);
    try {
      const res = await fetchAdminEpisodesByMovie(movieId);
      const list = Array.isArray(res.data) ? res.data : [];
      setEpisodesByMovie((prev) => ({ ...prev, [movieId]: list }));
      return list;
    } catch (err) {
      console.error('Lỗi lấy danh sách tập:', err);
      setEpisodesByMovie((prev) => ({ ...prev, [movieId]: [] }));
      setNotice({ type: 'error', message: 'Không thể tải danh sách tập phim' });
      return [];
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const openEpisodeModal = async (movie) => {
    setFormErrors({});
    setNotice({ type: '', message: '' });
    setEpisodeModal({ open: true, movie });

    const episodes = await loadMovieEpisodes(movie.id);
    const nextEpisodeNumber = episodes.length > 0
      ? Math.max(...episodes.map((ep) => Number(ep.episode_number) || 0)) + 1
      : 1;

    setEpisodeForm({
      episode_number: String(nextEpisodeNumber),
      youtube_url: '',
    });
  };

  const closeEpisodeModal = () => {
    setEpisodeModal({ open: false, movie: null });
    setFormErrors({});
  };

  const validateEpisodeForm = () => {
    const nextErrors = {};
    const episodeNumber = Number(episodeForm.episode_number);
    const currentMovie = episodeModal.movie;

    if (!episodeForm.episode_number) {
      nextErrors.episode_number = 'Episode number là bắt buộc';
    } else if (!Number.isInteger(episodeNumber) || episodeNumber < 1) {
      nextErrors.episode_number = 'Episode number phải là số nguyên > 0';
    }

    if (!episodeForm.youtube_url.trim()) {
      nextErrors.youtube_url = 'Youtube URL là bắt buộc';
    } else if (!isYoutubeLike(episodeForm.youtube_url)) {
      nextErrors.youtube_url = 'Youtube URL không hợp lệ';
    }

    if (currentMovie) {
      const existingEpisodes = episodesByMovie[currentMovie.id] || [];
      const isDuplicate = existingEpisodes.some(
        (ep) => Number(ep.episode_number) === episodeNumber
      );
      if (isDuplicate) {
        nextErrors.episode_number = `Tập ${episodeNumber} đã tồn tại trong phim này`;
      }
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleEpisodeInputChange = (field, value) => {
    setEpisodeForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmitEpisode = async (e) => {
    e.preventDefault();
    if (!episodeModal.movie) return;

    if (!validateEpisodeForm()) {
      return;
    }

    setIsSubmittingEpisode(true);
    try {
      const payload = {
        movie_id: episodeModal.movie.id,
        episode_number: Number(episodeForm.episode_number),
        youtube_url: toEmbedUrl(episodeForm.youtube_url.trim()),
      };

      await createAdminEpisode(payload);

      setNotice({ type: 'success', message: 'Thêm tập phim thành công' });
      const refreshedEpisodes = await loadMovieEpisodes(episodeModal.movie.id);
      const nextEpisodeNumber = refreshedEpisodes.length > 0
        ? Math.max(...refreshedEpisodes.map((ep) => Number(ep.episode_number) || 0)) + 1
        : 1;

      setEpisodeForm({
        episode_number: String(nextEpisodeNumber),
        youtube_url: '',
      });
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.message;
      setNotice({ type: 'error', message: apiMessage || 'Lỗi thêm tập phim' });
    } finally {
      setIsSubmittingEpisode(false);
    }
  };

  const currentEpisodes = episodeModal.movie
    ? episodesByMovie[episodeModal.movie.id] || []
    : [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Quản lý kho phim</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Tổng cộng: {filteredMovies.length} bộ phim</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm phim trong kho..."
              className="bg-[#111] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-cyan-500 outline-none w-64 transition-all"
            />
          </div>
          <button onClick={() => navigate('/admin/movies/add')} className="bg-cyan-600 hover:bg-cyan-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20">
            <Plus size={18} /> Thêm phim mới
          </button>
        </div>
      </div>

      {notice.message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-bold ${notice.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {notice.message}
        </div>
      )}

      <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="space-y-0">
          {isLoading && (
            <div className="p-6 text-sm text-gray-400">Đang tải danh sách phim...</div>
          )}

          {!isLoading && filteredMovies.length === 0 && (
            <div className="p-6 text-sm text-gray-400">Không tìm thấy bộ phim nào phù hợp.</div>
          )}

          {filteredMovies.map((movie) => {
            const adminImg = movie.image?.startsWith('http') ? movie.image : `/image/${movie.image}`;

            return (
              <div key={movie.id} className="border-b border-white/5 last:border-b-0">
                <div className="grid grid-cols-12 gap-4 p-6 hover:bg-white/[0.02] transition-colors items-center">
                  <div className="col-span-1 text-xs font-bold text-gray-600">#{movie.id}</div>
                  
                  <div className="col-span-1">
                    <div className="w-12 h-16 rounded-lg bg-black border border-white/10 overflow-hidden shadow-lg">
                      {movie.image ? (
                        <img 
                          src={adminImg} 
                          className="w-full h-full object-cover" 
                          alt="" 
                          onError={(e) => {e.target.src = 'https://placehold.jp/24/333333/ffffff/100x150.png?text=No+Img'}}
                        />
                      ) : (
                        <Film size={16} className="m-auto mt-6 text-gray-800" />
                      )}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="font-black text-white text-sm uppercase italic">{movie.title}</div>
                    <div className="text-[10px] text-gray-500 font-bold mt-1">{Number(movie.total_episodes) || 0} Tập</div>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${movie.status === 'Hoàn thành' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {movie.status}
                    </span>
                  </div>

                  <div className="col-span-3 flex gap-2 justify-end items-center">
                    <button 
                      onClick={() => openEpisodeModal(movie)}
                      className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black rounded-lg flex items-center gap-2 transition-all shadow-sm shadow-cyan-900/30">
                      <Plus size={14} />
                      Thêm tập
                    </button>

                    <button
                      onClick={() => navigate(`/admin/episodes/${movie.id}`)}
                      className="px-3 py-2 hover:bg-yellow-500/10 rounded-lg text-gray-400 hover:text-yellow-400 transition-all"
                      title="Sửa tập phim"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button 
                      onClick={() => handleDelete(movie.id)}
                      className="px-3 py-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {episodeModal.open && episodeModal.movie && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-white font-black text-lg">Thêm tập phim</h3>
                <p className="text-xs text-gray-400 mt-1">Phim: {episodeModal.movie.title}</p>
              </div>
              <button
                onClick={closeEpisodeModal}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <form onSubmit={handleSubmitEpisode} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Episode Number *</label>
                    <input
                      type="number"
                      min="1"
                      value={episodeForm.episode_number}
                      onChange={(e) => handleEpisodeInputChange('episode_number', e.target.value)}
                      className={`w-full bg-black border rounded-lg px-3 py-2 text-white text-sm outline-none ${formErrors.episode_number ? 'border-red-500' : 'border-gray-700/50 focus:border-cyan-500'}`}
                    />
                    {formErrors.episode_number && <p className="text-red-400 text-xs mt-1">{formErrors.episode_number}</p>}
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Youtube URL *</label>
                    <input
                      type="text"
                      value={episodeForm.youtube_url}
                      onChange={(e) => handleEpisodeInputChange('youtube_url', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={`w-full bg-black border rounded-lg px-3 py-2 text-white text-sm outline-none ${formErrors.youtube_url ? 'border-red-500' : 'border-gray-700/50 focus:border-cyan-500'}`}
                    />
                    {formErrors.youtube_url && <p className="text-red-400 text-xs mt-1">{formErrors.youtube_url}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeEpisodeModal}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEpisode}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-sm font-black flex items-center gap-2"
                  >
                    {isSubmittingEpisode ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Lưu tập phim
                  </button>
                </div>
              </form>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Danh sách tập hiện có</p>
                {isLoadingEpisodes ? (
                  <p className="text-sm text-gray-500">Đang tải danh sách tập...</p>
                ) : currentEpisodes.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có tập nào.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {currentEpisodes.map((ep) => (
                      <div key={ep.id} className="flex items-center justify-between text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        <span className="text-cyan-400 font-bold">Tập {ep.episode_number}</span>
                        <span className="text-gray-300 truncate ml-2">{ep.title || `Tập ${ep.episode_number}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminMovies;