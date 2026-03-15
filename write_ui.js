const fs = require('fs');
const p = (f) => `c:/IT/project-hh3d/src/${f}`;

// ─────────────────────────────────────────────────────────────
// 1. components/Navbar.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('components/Navbar.jsx'), `import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Film, LogIn, LogOut, LayoutDashboard } from 'lucide-react';

const CATEGORIES = [
  { id: 1, name: 'Huyễn Huyễn' },
  { id: 2, name: 'Xuyên Không' },
  { id: 3, name: 'Trùng Sinh' },
  { id: 4, name: 'Tiên Hiệp' },
  { id: 5, name: 'Cổ Trang' },
  { id: 6, name: 'Anime 3D' },
  { id: 7, name: 'Anime 4K' },
  { id: 8, name: 'Hoạt hình 2D' },
];

const NAV_LINKS = [
  { label: 'Trang Chủ', path: '/' },
  { label: 'Mới Cập Nhật', path: '/?sort=created_at' },
  { label: 'Top Xem Nhiều', path: '/?sort=views' },
  { label: 'Hoàn Thành', path: '/?status=Completed' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const catRef = useRef(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e) => { if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMenuOpen(false); setCatOpen(false); }, [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(\`/?search=\${encodeURIComponent(query.trim())}\`); setSearchOpen(false); setQuery(''); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className={\`fixed top-0 left-0 right-0 z-50 transition-all duration-300 \${scrolled ? 'bg-[#0d1117]/95 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-gradient-to-b from-black/80 to-transparent'}\`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14 md:h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-md shadow-orange-900/50">
            <Film size={17} className="text-white" />
          </div>
          <span className="text-white font-extrabold text-lg tracking-wide hidden sm:block">
            Yan<span className="text-orange-400">HH3D</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(l => (
            <Link key={l.path} to={l.path}
              className="px-3 py-1.5 text-sm text-gray-300 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-all duration-200">
              {l.label}
            </Link>
          ))}
          <div className="relative" ref={catRef}>
            <button onClick={() => setCatOpen(v => !v)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-all duration-200">
              Thể Loại <ChevronDown size={13} className={\`transition-transform duration-200 \${catOpen ? 'rotate-180 text-orange-400' : ''}\`} />
            </button>
            {catOpen && (
              <div className="absolute top-full left-0 mt-2 bg-[#111827] border border-gray-700/60 rounded-xl shadow-2xl shadow-black/70 grid grid-cols-2 gap-0.5 p-2 w-52 animate-in fade-in slide-in-from-top-2 duration-150">
                {CATEGORIES.map(c => (
                  <Link key={c.id} to={\`/?category=\${c.id}\`}
                    onClick={() => setCatOpen(false)}
                    className="px-3 py-2 text-xs text-gray-400 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-all whitespace-nowrap">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Tìm phim..."
                className="bg-[#1c2333] border border-gray-600 text-white text-sm rounded-l-lg px-3 py-1.5 w-36 sm:w-48 outline-none focus:border-orange-500 transition-colors" />
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-r-lg transition-colors">
                <Search size={14} />
              </button>
              <button type="button" onClick={() => { setSearchOpen(false); setQuery(''); }}
                className="ml-1 text-gray-400 hover:text-white p-1.5 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)}
              className="text-gray-400 hover:text-orange-400 p-2 rounded-lg hover:bg-white/5 transition-all">
              <Search size={18} />
            </button>
          )}

          {user ? (
            <div className="hidden md:flex items-center gap-1">
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 px-2.5 py-1.5 hover:bg-white/5 rounded-lg transition-all">
                  <LayoutDashboard size={14} /> Admin
                </Link>
              )}
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 px-2.5 py-1.5 hover:bg-white/5 rounded-lg transition-all">
                <LogOut size={14} /> Xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-all font-medium">
              <LogIn size={14} /> Đăng nhập
            </Link>
          )}

          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1117]/98 border-t border-gray-800/60 px-4 pt-3 pb-5 space-y-1">
          {NAV_LINKS.map(l => (
            <Link key={l.path} to={l.path}
              className="block px-3 py-2.5 text-sm text-gray-300 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-all">
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-800/60">
            <p className="px-3 py-1 text-xs text-gray-600 uppercase tracking-wider font-medium">Thể Loại</p>
            <div className="grid grid-cols-2 gap-0.5 mt-1">
              {CATEGORIES.map(c => (
                <Link key={c.id} to={\`/?category=\${c.id}\`}
                  className="px-3 py-2 text-sm text-gray-400 hover:text-orange-400 hover:bg-white/5 rounded-lg transition-all">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-800/60">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 px-3 py-2.5 text-sm text-orange-400 hover:bg-white/5 rounded-lg">
                    <LayoutDashboard size={16} /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-white/5 rounded-lg text-left">
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all mt-2">
                <LogIn size={16} /> Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// 2. components/MovieCard.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('components/MovieCard.jsx'), `import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export default function MovieCard({ movie }) {
  const { id, title, image, episode_display, quality, status, views, category_name } = movie;

  return (
    <Link to={\`/movie/\${id}\`} className="group relative block bg-[#111827] rounded-xl overflow-hidden border border-transparent hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/20">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
        {image ? (
          <img src={image} alt={title} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.src = 'https://placehold.co/300x450/111827/374151?text=No+Image'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <span className="text-gray-600 text-xs">No Image</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-orange-500/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Quality badge */}
        {quality && (
          <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {quality}
          </span>
        )}

        {/* Status badge */}
        {status === 'Completed' && (
          <span className="absolute top-1.5 right-1.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            FULL
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 leading-tight group-hover:text-orange-400 transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1.5 gap-1">
          {episode_display && (
            <span className="text-gray-400 text-[10px] sm:text-xs truncate">{episode_display}</span>
          )}
          {views > 0 && (
            <span className="flex items-center gap-0.5 text-gray-500 text-[10px] shrink-0">
              <Eye size={10} /> {views >= 1000 ? (views/1000).toFixed(0)+'k' : views}
            </span>
          )}
        </div>
        {category_name && (
          <span className="inline-block mt-1 text-[10px] text-orange-400/80 bg-orange-500/10 px-1.5 py-0.5 rounded-md">
            {category_name}
          </span>
        )}
      </div>
    </Link>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// 3. components/Pagination.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('components/Pagination.jsx'), `import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 2;
    const range = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    if (left > 1) { range.push(1); if (left > 2) range.push('...'); }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages) { if (right < totalPages - 1) range.push('...'); range.push(totalPages); }
    return range;
  };

  const btn = 'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200';

  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className={\`\${btn} text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed\`}>
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={i} className="w-9 h-9 flex items-center justify-center text-gray-500 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)}
            className={\`\${btn} \${currentPage === p ? 'bg-orange-500 text-white shadow-md shadow-orange-900/40' : 'text-gray-400 hover:text-white hover:bg-white/10'}\`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className={\`\${btn} text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed\`}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// 4. components/Slider.jsx  (NEW)
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('components/Slider.jsx'), `import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function Slider({ movies = [] }) {
  const items = movies.slice(0, 6);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % items.length), [items.length]);
  const prev = () => setCurrent(c => (c - 1 + items.length) % items.length);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, items.length]);

  if (!items.length) return null;
  const m = items[current];

  return (
    <div className="relative w-full overflow-hidden bg-[#0d1117]" style={{ height: 'clamp(260px, 52vw, 520px)' }}>
      {/* Slides */}
      {items.map((item, i) => (
        <div key={item.id}
          className={\`absolute inset-0 transition-opacity duration-700 \${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}\`}>
          {item.image && (
            <img src={item.image} alt={item.title}
              className="w-full h-full object-cover object-top"
              onError={e => { e.target.style.display='none'; }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-end pb-10 md:items-center md:pb-0 px-6 md:px-12 max-w-7xl mx-auto left-0 right-0">
        <div className="max-w-lg">
          {m.quality && <span className="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md mb-2">{m.quality}</span>}
          <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight drop-shadow-xl line-clamp-2">{m.title}</h1>
          {m.episode_display && (
            <p className="text-orange-300 text-sm mt-1 font-medium">{m.episode_display}</p>
          )}
          {m.description && (
            <p className="text-gray-300 text-sm mt-2 line-clamp-2 hidden md:block leading-relaxed">{m.description}</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <Link to={\`/movie/\${m.id}\`}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-900/40 hover:scale-105">
              <Play size={16} fill="white" /> Xem Ngay
            </Link>
            <Link to={\`/movie/\${m.id}\`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all backdrop-blur-sm border border-white/10">
              Chi Tiết
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      {items.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
            <ChevronRight size={20} />
          </button>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
            {items.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={\`h-1.5 rounded-full transition-all duration-300 \${i === current ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/40 hover:bg-white/70'}\`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// 5. components/MovieList.jsx  (NEW)
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('components/MovieList.jsx'), `import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

export default function MovieList({ title, movies, loading, moreLink, cols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-orange-500 rounded-full" />
          <h2 className="text-white font-bold text-base md:text-lg">{title}</h2>
        </div>
        {moreLink && (
          <Link to={moreLink} className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm transition-colors">
            Xem thêm <ChevronRight size={15} />
          </Link>
        )}
      </div>
      <div className={\`grid \${cols} gap-3 md:gap-4\`}>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : movies.map(m => <MovieCard key={m.id} movie={m} />)
        }
      </div>
    </section>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// 6. components/MovieCardSkeleton.jsx  (NEW)
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('components/MovieCardSkeleton.jsx'), `import React from 'react';

export default function MovieCardSkeleton() {
  return (
    <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-800/50 animate-pulse">
      <div className="aspect-[2/3] bg-gray-800" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-gray-800 rounded w-4/5" />
        <div className="h-3 bg-gray-800 rounded w-3/5" />
        <div className="h-3 bg-gray-800 rounded w-2/5" />
      </div>
    </div>
  );
}
`, 'utf8');

// ─────────────────────────────────────────────────────────────
// 7. pages/Home.jsx
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(p('pages/Home.jsx'), `import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Slider from '../components/Slider';
import MovieList from '../components/MovieList';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 20;
const API = 'http://localhost:5000';

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
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
        else if (search) url = \`\${API}/api/search?q=\${encodeURIComponent(search)}&limit=100\`;
        else url = \`\${API}/api/movies\`;

        const res = await axios.get(url);
        let data = Array.isArray(res.data) ? res.data : (res.data.data || []);

        if (status) data = data.filter(m => m.status === status);
        if (sort === 'views') data.sort((a, b) => (b.views||0) - (a.views||0));
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

  const isFiltered = search || sort || category || status;
  const newest  = useMemo(() => [...movies].sort((a,b) => new Date(b.created_at)-new Date(a.created_at)).slice(0,12), [movies]);
  const topViews = useMemo(() => [...movies].sort((a,b) => (b.views||0)-(a.views||0)).slice(0,12), [movies]);

  const totalPages = Math.ceil(movies.length / PAGE_SIZE);
  const paginated  = movies.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const pageTitle = () => {
    if (search) return \`Kết quả: "\${search}"\`;
    if (sort === 'views') return 'Top Xem Nhiều';
    if (sort === 'created_at') return 'Mới Cập Nhật';
    if (status === 'Completed') return 'Hoàn Thành';
    if (category) return 'Theo Thể Loại';
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Slider only on main page */}
      {!isFiltered && !loading && <Slider movies={newest} />}

      <div className="max-w-7xl mx-auto px-4">
        {!isFiltered && (
          <div className="pt-8 space-y-2">
            <MovieList title="Mới Cập Nhật" movies={newest} loading={loading} moreLink="/?sort=created_at" />
            <MovieList title="Xem Nhiều Nhất" movies={topViews} loading={loading} moreLink="/?sort=views" />
          </div>
        )}

        {isFiltered && (
          <div className="pt-8">
            {pageTitle() && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-orange-500 rounded-full" />
                <h1 className="text-white font-bold text-xl">{pageTitle()}</h1>
                {!loading && <span className="text-gray-500 text-sm ml-1">({movies.length} phim)</span>}
              </div>
            )}
            {movies.length === 0 && !loading ? (
              <div className="flex flex-col items-center py-20 text-gray-500">
                <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p className="text-lg font-medium">Không tìm thấy phim nào</p>
                {search && <p className="text-sm mt-1">Thử từ khóa khác nhé!</p>}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {loading
                    ? Array.from({length:12}).map((_,i) => (
                        <div key={i} className="bg-[#111827] rounded-xl overflow-hidden animate-pulse">
                          <div className="aspect-[2/3] bg-gray-800" />
                          <div className="p-2.5 space-y-2"><div className="h-3 bg-gray-800 rounded w-4/5" /><div className="h-3 bg-gray-800 rounded w-3/5" /></div>
                        </div>
                      ))
                    : paginated.map(m => {
                        const { default: MovieCard } = require('../components/MovieCard');
                        return <MovieCard key={m.id} movie={m} />;
                      })
                  }
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => { setPage(p); window.scrollTo({top:0,behavior:'smooth'}); }} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
`, 'utf8');

console.log('Batch 1-6 done');
