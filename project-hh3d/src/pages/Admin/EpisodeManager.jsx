import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../compoment/AdminLayout';
import { Save, Trash2, Plus, ArrowLeft, Clock, Play, AlertCircle, CheckCircle, Edit2, List } from 'lucide-react';

// Converter YouTube URLs para embed
function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url.split('&')[0];
  if (url.includes('drive.google.com/file/')) return url;
  
  const ytWatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (ytWatch && ytWatch[1]) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  
  const ytShort = url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShort && ytShort[1]) return `https://www.youtube.com/embed/${ytShort[1]}`;
  
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}`;
  
  const gdrive = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gdrive && gdrive[1]) return `https://drive.google.com/file/d/${gdrive[1]}/preview`;
  
  return url;
}

// Định dạng thời gian phút:giây
function formatDuration(minutes) {
  if (!minutes || minutes === 0) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export default function EpisodeManager() {
  const navigate = useNavigate();
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'info' });
  
  const [newEpisode, setNewEpisode] = useState({
    episode_number: '',
    title: '',
    duration: '',
    video_url: '',
    server_type: 'Thuyết Minh',
    is_end: false
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [movieRes, episodesRes] = await Promise.all([
          axiosInstance.get(`/movies/${movieId}`),
          axiosInstance.get(`/admin/episodes/${movieId}`)
        ]);
        
        setMovie(movieRes.data);
        setEpisodes(Array.isArray(episodesRes.data) ? episodesRes.data : []);
        
        if (Array.isArray(episodesRes.data) && episodesRes.data.length > 0) {
          const maxEp = Math.max(...episodesRes.data.map(e => parseInt(e.episode_number) || 0));
          setNewEpisode(prev => ({ ...prev, episode_number: maxEp + 1 }));
        } else {
          setNewEpisode(prev => ({ ...prev, episode_number: 1 }));
        }
      } catch (err) {
        console.error("Lỗi load data:", err);
        showSnackbar('Lỗi tải dữ liệu', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [movieId]);

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => setSnackbar({ show: false, message: '', type: 'info' }), 3000);
  };

  const handleAddEpisode = async (e) => {
    e.preventDefault();
    if (!newEpisode.episode_number || !newEpisode.video_url) {
      showSnackbar('Vui lòng nhập Episode số và Video URL!', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const embedUrl = toEmbedUrl(newEpisode.video_url);
      
      if (editingId) {
        // Update episode
        await axiosInstance.put(`/admin/episodes/${editingId}`, {
          movie_id: movieId,
          ...newEpisode,
          video_url: embedUrl,
          duration: parseInt(newEpisode.duration) || null
        });
        showSnackbar('✅ Cập nhật tập phim thành công!', 'success');
      } else {
        // Add new episode
        await axiosInstance.post('/admin/episodes', {
          movie_id: movieId,
          ...newEpisode,
          video_url: embedUrl,
          duration: parseInt(newEpisode.duration) || null
        });
        showSnackbar('✅ Thêm tập phim thành công!', 'success');
      }
      
      const res = await axiosInstance.get(`/admin/episodes/${movieId}`);
      setEpisodes(Array.isArray(res.data) ? res.data : []);
      
      const maxEp = Math.max(...episodes.map(e => parseInt(e.episode_number) || 0), parseInt(newEpisode.episode_number) || 0);
      setNewEpisode({
        episode_number: editingId ? newEpisode.episode_number : maxEp + 1,
        title: '',
        duration: '',
        video_url: '',
        server_type: 'Thuyết Minh',
        is_end: false
      });
      setEditingId(null);
    } catch (err) {
      console.error('Lỗi:', err);
      showSnackbar('❌ ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEpisode = async (id) => {
    if (!window.confirm('Xác nhận xóa tập phim này?')) return;
    
    try {
      await axiosInstance.delete(`/admin/episodes/${id}`);
      setEpisodes(episodes.filter(ep => ep.id !== id));
      showSnackbar('✅ Xóa tập phim thành công!', 'success');
    } catch (err) {
      showSnackbar('❌ ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleEditEpisode = (episode) => {
    setEditingId(episode.id);
    setNewEpisode({
      episode_number: episode.episode_number,
      title: episode.title || '',
      duration: episode.duration || '',
      video_url: episode.video_url || '',
      server_type: episode.server_type || 'Thuyết Minh',
      is_end: episode.is_end || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    const maxEp = Math.max(...episodes.map(e => parseInt(e.episode_number) || 0), 0);
    setNewEpisode({
      episode_number: maxEp + 1,
      title: '',
      duration: '',
      video_url: '',
      server_type: 'Thuyết Minh',
      is_end: false
    });
  };

  if (isLoading) return <AdminLayout><div className="p-10 text-white text-center">Đang load...</div></AdminLayout>;

  const sortedEpisodes = [...episodes].sort((a, b) => a.episode_number - b.episode_number);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-10 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button type="button" onClick={() => navigate('/admin/movies')} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic">Quản lý tập phim</h2>
            {movie && <p className="text-sm text-gray-400 mt-1">Bộ phim: {movie.title} ({episodes.length}/{movie.total_episodes || '?'} tập)</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thêm/Sửa tập */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sticky top-10">
              <h3 className="text-sm font-black text-cyan-400 uppercase mb-6 flex items-center gap-2">
                {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                {editingId ? 'Sửa tập phim' : 'Thêm tập mới'}
              </h3>

              <form onSubmit={handleAddEpisode} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Episode số *</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500"
                    value={newEpisode.episode_number}
                    onChange={(e) => setNewEpisode(prev => ({ ...prev, episode_number: parseInt(e.target.value) || '' }))}
                    disabled={!!editingId}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Tiêu đề</label>
                  <input 
                    type="text" 
                    placeholder="VD: Hành Trình Bắt Đầu..."
                    className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500 text-xs"
                    value={newEpisode.title}
                    onChange={(e) => setNewEpisode(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Thời lượng (phút)</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="VD: 24, 45..."
                    className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500 text-xs"
                    value={newEpisode.duration}
                    onChange={(e) => setNewEpisode(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Video URL *</label>
                  <input 
                    type="text" 
                    placeholder="YouTube/GDrive link..."
                    required
                    className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500 text-xs"
                    value={newEpisode.video_url}
                    onChange={(e) => setNewEpisode(prev => ({ ...prev, video_url: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Server</label>
                  <select 
                    className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500 text-xs"
                    value={newEpisode.server_type}
                    onChange={(e) => setNewEpisode(prev => ({ ...prev, server_type: e.target.value }))}
                  >
                    <option value="Thuyết Minh">Thuyết Minh</option>
                    <option value="Lồng Tiếng">Lồng Tiếng</option>
                    <option value="HD">HD</option>
                    <option value="4K">4K</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/5"
                    checked={newEpisode.is_end}
                    onChange={(e) => setNewEpisode(prev => ({ ...prev, is_end: e.target.checked }))}
                  />
                  Đây là tập cuối?
                </label>

                <div className="space-y-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${
                      isSubmitting || !newEpisode.episode_number || !newEpisode.video_url
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-cyan-600 hover:bg-cyan-500 text-black'
                    }`}
                  >
                    <Save size={14} /> {isSubmitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm tập'}
                  </button>
                  {editingId && (
                    <button 
                      type="button"
                      onClick={handleCancel}
                      className="w-full py-3 rounded-xl font-black text-xs uppercase bg-gray-700 hover:bg-gray-600 text-white transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Danh sách tập phim */}
          <div className="lg:col-span-2">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-black text-orange-400 uppercase mb-6 flex items-center gap-2">
                <List size={16} /> Danh sách tập ({episodes.length})
              </h3>

              {episodes.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={32} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400 text-sm">Chưa có tập phim nào. Thêm tập mới ở bên cạnh!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[700px] overflow-y-auto">
                  {sortedEpisodes.map((ep) => (
                    <div key={ep.id} className="bg-black/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-black text-cyan-400">Tập {ep.episode_number}</p>
                          {ep.title && <p className="text-sm text-gray-300 font-semibold">{ep.title}</p>}
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ep.video_url}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-400">{ep.server_type}</span>
                            {ep.duration && (
                              <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                                <Clock size={10} /> {formatDuration(ep.duration)}
                              </span>
                            )}
                            {ep.is_end && <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-[10px] font-bold">Tập cuối</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditEpisode(ep)}
                            className="p-2 hover:bg-yellow-500/10 rounded-lg text-yellow-400 transition-all"
                            title="Sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEpisode(ep.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-all"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center gap-2 ${
          snackbar.type === 'success' ? 'bg-green-600' :
          snackbar.type === 'error' ? 'bg-red-600' :
          snackbar.type === 'warning' ? 'bg-yellow-600' :
          'bg-blue-600'
        }`}>
          {snackbar.type === 'success' && <CheckCircle size={20} />}
          {snackbar.type === 'error' && <AlertCircle size={20} />}
          {snackbar.type === 'warning' && <AlertCircle size={20} />}
          {snackbar.message}
        </div>
      )}
    </AdminLayout>
  );
}
