const fs = require('fs');
const p = (f) => `c:/IT/project-hh3d/src/${f}`;

// ─────────────────────────────────────────────────────────────
// Home.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('pages/Home.jsx'), `import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Slider from '../components/Slider';
import MovieList from '../components/MovieList';
import MovieCard from '../components/MovieCard';
import MovieCardSkeleton from '../components/MovieCardSkeleton';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 24;
const API = 'http://localhost:5000';

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const sort   = searchParams.get('sort')   || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url;
        if (category) url = \`\${API}/api/movies/category/\${category}\`;
        else if (search) url = \`\${API}/api/search?q=\${encodeURIComponent(search)}&limit=200\`;
        else url = \`\${API}/api/movies\`;

        const res = await axios.get(url);
        let data = Array.isArray(res.data) ? res.data : (res.data.data || []);

        if (status) data = data.filter(m => m.status === status);
        if (sort === 'views') data.sort((a, b) => (b.views || 0) - (a.views || 0));
        else if (sort === 'created_at') data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setMovies(data);
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error(e);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, sort, category, status]);

  const isFiltered = !!(search || sort || category || status);

  const newest   = useMemo(() => [...movies].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 12), [movies]);
  const topViews = useMemo(() => [...movies].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12), [movies]);

  const totalPages = Math.ceil(movies.length / PAGE_SIZE);
  const paginated  = movies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageTitle = () => {
    if (search)  return \`Kết quả: "\${search}"\`;
    if (sort === 'views')      return 'Top Xem Nhiều';
    if (sort === 'created_at') return 'Mới Cập Nhật';
    if (status === 'Completed') return 'Phim Hoàn Thành';
    if (category) return 'Theo Thể Loại';
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] pt-14 md:pt-16">
      {!isFiltered && !loading && <Slider movies={newest} />}

      <div className="max-w-7xl mx-auto px-4">
        {!isFiltered ? (
          <div className="pt-8 space-y-2">
            <MovieList title="Mới Cập Nhật" movies={newest} loading={loading} moreLink="/?sort=created_at" />
            <MovieList title="Xem Nhiều Nhất" movies={topViews} loading={loading} moreLink="/?sort=views" />
          </div>
        ) : (
          <div className="pt-8">
            {pageTitle() && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-orange-500 rounded-full" />
                <h1 className="text-white font-bold text-xl">{pageTitle()}</h1>
                {!loading && (
                  <span className="text-gray-500 text-sm ml-1">({movies.length} phim)</span>
                )}
              </div>
            )}

            {!loading && movies.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-gray-600">
                <svg className="w-20 h-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p className="text-lg font-medium text-gray-500">Không tìm thấy phim nào</p>
                {search && <p className="text-sm mt-1 text-gray-600">Thử tìm kiếm với từ khóa khác nhé!</p>}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {loading
                    ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
                    : paginated.map(m => <MovieCard key={m.id} movie={m} />)
                  }
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// Detail.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('pages/Detail.jsx'), `import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, ChevronLeft, Eye, Heart, MessageCircle, Clock, Tag, Star } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const API = 'http://localhost:5000';

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
          axios.get(\`\${API}/api/movies/\${id}\`),
          axios.get(\`\${API}/api/episodes/\${id}\`),
          axios.get(\`\${API}/api/comments/\${id}\`).catch(() => ({ data: [] })),
        ]);
        const m = mRes.data;
        setMovie(m);
        const eps = Array.isArray(epRes.data) ? epRes.data : [];
        setEpisodes(eps);
        setActiveEp(eps.length > 0 ? eps[0] : null);
        setComments(Array.isArray(cmRes.data) ? cmRes.data : []);

        // Related movies by same category
        if (m.category_id) {
          const relRes = await axios.get(\`\${API}/api/movies/category/\${m.category_id}\`);
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
      await axios.post(\`\${API}/api/comments/\${id}\`, { user_id: user.id, content: commentText.trim() });
      const cmRes = await axios.get(\`\${API}/api/comments/\${id}\`);
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
              {movie.episode_display && <p className="text-orange-300 text-sm mt-1 font-medium">{movie.episode_display}</p>}
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
                    className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all \${liked
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-white/5 text-gray-400 hover:text-red-400 border border-gray-700/50 hover:border-red-500/40'}\`}>
                    <Heart size={14} className={liked ? 'fill-red-400' : ''} />
                    {liked ? 'Đã yêu thích' : 'Yêu thích'}
                  </button>
                </div>
              </div>
            )}

            {/* No episode but movie has video_url */}
            {!activeEp && movie.video_url && (
              <div ref={playerRef} className="mb-6">
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl shadow-black/60">
                  <iframe src={movie.video_url} className="w-full h-full" allowFullScreen
                    title={movie.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
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
                      className={\`py-2 px-1 rounded-lg text-sm font-medium transition-all text-center \${
                        activeEp?.id === ep.id
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-900/40'
                          : 'bg-[#1c2333] text-gray-400 hover:bg-[#263148] hover:text-white border border-gray-700/50'
                      }\`}>
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
                <p className={\`text-gray-400 text-sm leading-relaxed \${!expandDesc ? 'line-clamp-4' : ''}\`}>
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
                  <Link key={m.id} to={\`/movie/\${m.id}\`}
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
                      {m.episode_display && <p className="text-gray-500 text-[11px] mt-1">{m.episode_display}</p>}
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
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// Login.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('pages/Login.jsx'), `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, Film, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:5000';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(\`\${API}/api/login\`, form);
      if (res.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate(res.data.user.role === 'admin' ? '/admin' : '/');
      } else {
        setError(res.data?.message || 'Đăng nhập thất bại.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sai email hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 pt-14 md:pt-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/50">
              <Film size={20} className="text-white" />
            </div>
            <span className="text-white font-extrabold text-xl tracking-wide">
              Yan<span className="text-orange-400">HH3D</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm">Chào mừng trở lại!</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-gray-800/60 rounded-2xl p-6 shadow-2xl shadow-black/60">
          <h2 className="text-white text-xl font-bold mb-5 text-center">Đăng nhập</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="your@email.com" autoComplete="email"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-orange-900/30 hover:shadow-orange-900/50 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Đăng nhập</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 bg-[#0d1117] border border-gray-800/40 rounded-xl p-4">
          <p className="text-gray-600 text-xs text-center mb-2 font-medium">TÀI KHOẢN THỬ NGHIỆM</p>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex justify-between"><span>User</span><span>user@hh3d.com / 123456</span></div>
            <div className="flex justify-between"><span>Admin</span><span>admin@hh3d.com / Admin@123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// Register.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('pages/Register.jsx'), `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, UserPlus, Film, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:5000';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (form.password !== form.confirm) { setError('Mật khẩu xác nhận không khớp.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(\`\${API}/api/register\`, {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      if (res.status === 201 || res.data?.message) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 pt-14 md:pt-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/50">
              <Film size={20} className="text-white" />
            </div>
            <span className="text-white font-extrabold text-xl tracking-wide">
              Yan<span className="text-orange-400">HH3D</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm">Tạo tài khoản mới</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-gray-800/60 rounded-2xl p-6 shadow-2xl shadow-black/60">
          <h2 className="text-white text-xl font-bold mb-5 text-center">Đăng ký</h2>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-4 text-center">
              ✓ Đăng ký thành công! Đang chuyển hướng...
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Tên người dùng</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" name="username" value={form.username} onChange={handleChange}
                  placeholder="username" autoComplete="username"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="your@email.com" autoComplete="email"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự" autoComplete="new-password"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange}
                  placeholder="Nhập lại mật khẩu" autoComplete="new-password"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            <button type="submit" disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-orange-900/30 hover:shadow-orange-900/50 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus size={16} /> Tạo tài khoản</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// App.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('App.jsx'), `import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Admin/Dashboard';

function PrivateRoute({ children }) {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  if (!user) { window.location.href = '/login'; return null; }
  return children;
}

function AdminRoute({ children }) {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  if (!user || user.role !== 'admin') { window.location.href = '/'; return null; }
  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<Detail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/*" element={<AdminRoute><Dashboard /></AdminRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
`, 'utf8');

console.log('Batch 2 done - Home, Detail, Login, Register, App');
