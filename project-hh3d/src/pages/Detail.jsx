import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, ChevronLeft, Eye, Heart, MessageCircle, Clock, Tag, Star } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const API = import.meta.env.VITE_API_URL || '';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeEp, setActiveEp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expandDesc, setExpandDesc] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [mRes, epRes, cmRes] = await Promise.all([
          axios.get(`${API}/api/movies/${id}`),
          axios.get(`${API}/api/episodes/${id}`),
          axios.get(`${API}/api/comments/${id}`).catch(() => ({ data: [] })),
        ]);
        const m = mRes.data;
        setMovie(m);
        const eps = Array.isArray(epRes.data) ? epRes.data : [];
        setEpisodes(eps);
        setActiveEp(eps.length > 0 ? eps[0] : null);
        setComments(Array.isArray(cmRes.data) ? cmRes.data : []);

        // Related movies by same category
        if (m.category_id) {
          const relRes = await axios.get(`${API}/api/movies/category/${m.category_id}`);
          const relData = Array.isArray(relRes.data) ? relRes.data : (relRes.data?.data || []);
          setRelated(relData.filter(r => String(r.id) !== String(id)).slice(0, 12));
        }

        // Check liked
        const likes = JSON.parse(localStorage.getItem('liked_movies') || '[]');
        setLiked(likes.includes(Number(id)));

        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const toggleLike = () => {
    const likes = JSON.parse(localStorage.getItem('liked_movies') || '[]');
    let updated;
    if (liked) updated = likes.filter(l => l !== Number(id));
    else updated = [...likes, Number(id)];
    localStorage.setItem('liked_movies', JSON.stringify(updated));
    setLiked(!liked);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    try {
      await axios.post(`${API}/api/comments`, { user_id: user.id, movie_id: Number(id), content: commentText.trim() });
      const cmRes = await axios.get(`${API}/api/comments/${id}`);
      setComments(Array.isArray(cmRes.data) ? cmRes.data : []);
      setCommentText('');
    } catch (e) { console.error(e); }
  };

  const selectEp = (ep) => {
    setActiveEp(ep);
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] pt-16 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Đang tải phim...</p>
      </div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-[#0d1117] pt-16 flex flex-col items-center justify-center gap-4">
      <p className="text-gray-400 text-lg">Không tìm thấy phim</p>
      <Link to="/" className="text-orange-400 hover:text-orange-300 underline">Quay về trang chủ</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] pt-14 md:pt-16">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden bg-[#111827]" style={{ height: 'clamp(200px, 40vw, 380px)' }}>
        {movie.image && (
          <img src={movie.image} alt={movie.title}
            className="w-full h-full object-cover object-top blur-sm opacity-30 scale-105"
            onError={e => { e.target.style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-center px-4 md:px-8 max-w-7xl mx-auto left-0 right-0">
          <div className="flex gap-5 items-start">
            {/* Poster */}
            <div className="shrink-0 w-28 md:w-40 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl shadow-black/70">
              {movie.image ? (
                <img src={movie.image} alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                  onError={e => { e.target.src = 'https://placehold.co/200x300/111827/374151?text=No+Image'; }} />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-900 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">No Image</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {movie.quality && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{movie.quality}</span>}
                {movie.status === 'Completed' && <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">FULL</span>}
                {movie.status === 'Ongoing' && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">ĐANG CHIẾU</span>}
              </div>
              <h1 className="text-white text-lg md:text-3xl font-bold leading-tight line-clamp-2">{movie.title}</h1>
              <p className="text-orange-300 text-sm mt-1 font-medium">{Number(movie.total_episodes) || 0} Tập</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-400 text-xs md:text-sm">
                {movie.views > 0 && <span className="flex items-center gap-1"><Eye size={12} /> {movie.views?.toLocaleString() || 0} lượt xem</span>}
                {movie.category_name && <span className="flex items-center gap-1"><Tag size={12} /> {movie.category_name}</span>}
              </div>
              {episodes.length > 0 && (
                <button onClick={() => selectEp(episodes[0])}
                  className="mt-4 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-900/40 hover:scale-105">
                  <Play size={16} fill="white" /> Xem Ngay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Player + Episodes + Comments */}
          <div className="flex-1 min-w-0">
            {/* Video Player */}
            {activeEp && (
              <div ref={playerRef} className="mb-6">
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl shadow-black/60">
                  {activeEp.video_url ? (
                    <iframe src={activeEp.video_url} className="w-full h-full" allowFullScreen
                      title={activeEp.episode_number} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  ) : movie.video_url ? (
                    <iframe src={movie.video_url} className="w-full h-full" allowFullScreen
                      title={movie.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-3">
                      <Play size={48} className="opacity-20" />
                      <p className="text-sm">Video chưa có sẵn</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-gray-300 text-sm font-medium">
                    Tập {activeEp.episode_number}
                    {activeEp.is_end ? <span className="ml-2 text-green-400 text-xs">(Kết thúc)</span> : null}
                  </p>
                  <button onClick={toggleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${liked
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-white/5 text-gray-400 hover:text-red-400 border border-gray-700/50 hover:border-red-500/40'}`}>
                    <Heart size={14} className={liked ? 'fill-red-400' : ''} />
                    {liked ? 'Đã yêu thích' : 'Yêu thích'}
                  </button>
                </div>
              </div>
            )}

            {/* No episode but movie has video_url */}
            {episodes.length === 0 && (
              <div className="mb-6 bg-[#111827] border border-gray-800/50 rounded-xl p-6">
                <p className="text-gray-300 text-sm font-medium">Phim đang cập nhật</p>
              </div>
            )}

            {/* Episodes */}
            {episodes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-5 bg-orange-500 rounded-full" />
                  <h2 className="text-white font-bold text-base">Danh Sách Tập ({episodes.length})</h2>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {episodes.map(ep => (
                    <button key={ep.id} onClick={() => selectEp(ep)}
                      className={`py-2 px-1 rounded-lg text-sm font-medium transition-all text-center ${
                        activeEp?.id === ep.id
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-900/40'
                          : 'bg-[#1c2333] text-gray-400 hover:bg-[#263148] hover:text-white border border-gray-700/50'
                      }`}>
                      {ep.episode_number}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {movie.description && (
              <div className="mb-6 bg-[#111827] border border-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-5 bg-orange-500 rounded-full" />
                  <h2 className="text-white font-bold text-base">Nội Dung Phim</h2>
                </div>
                <p className={`text-gray-400 text-sm leading-relaxed ${!expandDesc ? 'line-clamp-4' : ''}`}>
                  {movie.description}
                </p>
                {movie.description.length > 200 && (
                  <button onClick={() => setExpandDesc(v => !v)}
                    className="mt-2 text-orange-400 hover:text-orange-300 text-sm transition-colors">
                    {expandDesc ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                )}
              </div>
            )}

            {/* Comments */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-orange-500 rounded-full" />
                <h2 className="text-white font-bold text-base">Bình Luận ({comments.length})</h2>
              </div>
              <form onSubmit={submitComment} className="flex gap-3 mb-5">
                <img src={user?.avatar || 'https://placehold.co/36x36/1c2333/9ca3af?text=U'}
                  alt="avatar" className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-700" />
                <div className="flex-1 flex gap-2">
                  <input value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder={user ? 'Viết bình luận...' : 'Đăng nhập để bình luận...'}
                    disabled={!user}
                    className="flex-1 bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600 disabled:opacity-50" />
                  <button type="submit" disabled={!user || !commentText.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                    Gửi
                  </button>
                </div>
              </form>
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-6">Chưa có bình luận. Hãy là người đầu tiên!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <img src={c.avatar || 'https://placehold.co/36x36/1c2333/9ca3af?text=U'}
                        alt={c.username} className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-700" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-white text-sm font-semibold">{c.username || 'Ẩn danh'}</span>
                          <span className="text-gray-600 text-[11px]">{c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5 break-words">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Related */}
          {related.length > 0 && (
            <div className="lg:w-72 xl:w-80 shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-orange-500 rounded-full" />
                <h2 className="text-white font-bold text-base">Phim Liên Quan</h2>
              </div>
              <div className="space-y-3">
                {related.map(m => (
                  <Link key={m.id} to={`/movie/${m.id}`}
                    className="flex gap-3 group hover:bg-[#111827] rounded-xl p-2 -mx-2 transition-all duration-200">
                    <div className="shrink-0 w-16 rounded-lg overflow-hidden">
                      {m.image ? (
                        <img src={m.image} alt={m.title} className="w-16 h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.target.src = 'https://placehold.co/64x96/111827/374151?text=N/A'; }} />
                      ) : (
                        <div className="w-16 h-24 bg-gray-900 rounded-lg" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-300 text-xs font-medium line-clamp-2 group-hover:text-orange-400 transition-colors">{m.title}</p>
                      <p className="text-gray-500 text-[11px] mt-1">{Number(m.total_episodes) || 0} Tập</p>
                      {m.quality && <span className="inline-block mt-1 bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded-md font-medium">{m.quality}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
