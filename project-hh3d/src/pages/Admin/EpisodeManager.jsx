import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, List, Save, Trash2, X } from 'lucide-react';
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

function toSourceMap(ep) {
  const map = { '360p': '', '720p': '', '1080p': '', '4k': '' };
  (ep?.sources || []).forEach((s) => {
    const quality = (s?.quality || '').toLowerCase();
    if (map[quality] !== undefined) map[quality] = s.video_url || '';
  });
  if (!map['720p']) map['720p'] = ep?.video_url || '';
  return map;
}

export default function EpisodeManager() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    episode_number: '',
    sources: { '360p': '', '720p': '', '1080p': '', '4k': '' },
  });

  const sortedEpisodes = useMemo(
    () => [...episodes].sort((a, b) => Number(a.episode_number) - Number(b.episode_number)),
    [episodes]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [movieRes, epRes] = await Promise.all([
        axiosInstance.get(`/movies/${movieId}`),
        axiosInstance.get(`/admin/episodes/${movieId}`),
      ]);
      setMovie(movieRes.data || null);
      setEpisodes(Array.isArray(epRes.data) ? epRes.data : []);

      if (!editing) {
        const maxEp = Math.max(0, ...((epRes.data || []).map((e) => Number(e.episode_number) || 0)));
        setForm({
          episode_number: maxEp + 1,
          sources: { '360p': '', '720p': '', '1080p': '', '4k': '' },
        });
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi tải dữ liệu episode');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [movieId]);

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

    const payload = {
      movie_id: Number(movieId),
      episode_number: Number(form.episode_number),
      sources: form.sources,
    };

    try {
      if (editing?.id) {
        await axiosInstance.put(`/admin/episodes/${editing.id}`, payload);
        alert('Cập nhật tập thành công');
      } else {
        await axiosInstance.post('/admin/episodes', payload);
        alert('Thêm tập thành công');
      }
      setEditing(null);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể lưu tập phim');
    }
  };

  const startEdit = (ep) => {
    setEditing(ep);
    setForm({
      episode_number: Number(ep.episode_number),
      sources: toSourceMap(ep),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditing(null);
    const maxEp = Math.max(0, ...episodes.map((e) => Number(e.episode_number) || 0));
    setForm({
      episode_number: maxEp + 1,
      sources: { '360p': '', '720p': '', '1080p': '', '4k': '' },
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tập phim này?')) return;
    try {
      await axiosInstance.delete(`/admin/episodes/${id}`);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Lỗi xóa tập phim');
    }
  };

  if (loading) {
    return <AdminLayout><div className="p-10 text-center text-white">Đang tải...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <button type="button" onClick={() => navigate('/admin/movies')} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic">Quản lý tập phim</h2>
            {movie && <p className="text-sm text-gray-400">{movie.title}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4 sticky top-6">
              <p className="text-xs font-bold uppercase text-cyan-300">{editing ? 'Sửa tập phim' : 'Thêm tập mới'}</p>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Số tập</label>
                <input
                  required
                  min="1"
                  type="number"
                  value={form.episode_number}
                  onChange={(e) => setForm((prev) => ({ ...prev, episode_number: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-3 text-white outline-none focus:border-cyan-500"
                />
              </div>

              {['360p', '720p', '1080p', '4k'].map((q) => (
                <div key={q}>
                  <label className="block text-xs text-gray-300 mb-1">{q.toUpperCase()} {q === '4k' ? '(VIP)' : ''}</label>
                  <input
                    required
                    type="text"
                    value={form.sources[q]}
                    onChange={(e) => updateSource(q, e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm outline-none focus:border-cyan-500"
                    placeholder="YouTube URL hoặc ID"
                  />
                </div>
              ))}

              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase py-2.5 rounded-lg flex items-center justify-center gap-2">
                <Save size={15} /> {editing ? 'Cập nhật tập' : 'Thêm tập'}
              </button>

              {editing && (
                <button type="button" onClick={cancelEdit} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold uppercase py-2.5 rounded-lg flex items-center justify-center gap-2">
                  <X size={15} /> Hủy chỉnh sửa
                </button>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-black text-orange-400 uppercase mb-4 flex items-center gap-2">
              <List size={16} /> Danh sách tập ({sortedEpisodes.length})
            </h3>

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {sortedEpisodes.map((ep) => {
                const map = toSourceMap(ep);
                return (
                  <div key={ep.id} className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-cyan-400 font-bold">Tập {ep.episode_number}</p>
                        <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                          {['360p', '720p', '1080p', '4k'].map((q) => (
                            <span key={q} className={`px-2 py-1 rounded ${map[q] ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                              {q.toUpperCase()}: {map[q] ? 'OK' : 'Thiếu'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(ep)} className="p-2 rounded-lg text-yellow-400 hover:bg-yellow-500/10" title="Sửa">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(ep.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sortedEpisodes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-10">Chưa có tập nào.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
