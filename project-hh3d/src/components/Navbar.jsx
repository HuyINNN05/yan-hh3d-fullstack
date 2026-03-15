import React, { useState, useEffect, useRef } from 'react';
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
    if (query.trim()) { navigate(`/?search=${encodeURIComponent(query.trim())}`); setSearchOpen(false); setQuery(''); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0d1117]/95 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
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
              Thể Loại <ChevronDown size={13} className={`transition-transform duration-200 ${catOpen ? 'rotate-180 text-orange-400' : ''}`} />
            </button>
            {catOpen && (
              <div className="absolute top-full left-0 mt-2 bg-[#111827] border border-gray-700/60 rounded-xl shadow-2xl shadow-black/70 grid grid-cols-2 gap-0.5 p-2 w-52 animate-in fade-in slide-in-from-top-2 duration-150">
                {CATEGORIES.map(c => (
                  <Link key={c.id} to={`/?category=${c.id}`}
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
                <Link key={c.id} to={`/?category=${c.id}`}
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
