import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, History, Bookmark, User, LogOut } from 'lucide-react'; 

function Header({ onOpenMenu }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Lấy dữ liệu user từ localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserData(user);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserData(null);
    navigate('/');
  };

  // Logic tìm kiếm
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }

      // API này yêu cầu bạn đã cập nhật file index.js (backend)
      axios.get(`http://localhost:5000/api/search?q=${searchTerm}`)
        .then(res => {
          setSearchResults(res.data.slice(0, 5));
        })
        .catch(err => {
          console.error("Lỗi tìm kiếm:", err);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Đóng kết quả tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-[#1a1a1a] text-white p-3 border-b border-gray-800 sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto flex items-center justify-between gap-4">
        
        {/* Logo và Nút Menu */}
        <div className="flex items-center gap-3">
          <button onClick={onOpenMenu} className="hover:text-[#26c6da] transition-colors">
             <div className="space-y-1">
                <div className="w-6 h-0.5 bg-white"></div>
                <div className="w-6 h-0.5 bg-white"></div>
                <div className="w-6 h-0.5 bg-white"></div>
             </div>
          </button>
          <Link to="/" className="text-2xl font-black italic flex items-center tracking-tighter">
            <span className="text-[#26c6da]">Yan</span><span className="text-white">HH3D</span><span className="text-[#ff5722]">.GG</span>
          </Link>
        </div>

        {/* Ô Tìm Kiếm */}
        <div className="relative flex-1 max-w-sm" ref={searchRef}>
          <div className="flex items-center bg-white rounded-sm overflow-hidden shadow-inner">
            <input
              type="text"
              placeholder="Tìm kiếm phim từ database..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              className="w-full text-black px-3 py-1.5 text-sm outline-none placeholder:text-gray-400"
            />
            <button className="bg-[#333] hover:bg-[#444] px-4 py-1.5 flex items-center gap-1 border-l border-gray-300 transition-colors">
               <Search size={14} className="text-white" />
               <span className="text-[10px] font-bold text-white uppercase">Tìm</span>
            </button>
          </div>

          {/* Kết quả tìm kiếm đổ xuống */}
          {showResults && searchTerm && (
            <div className="absolute top-full left-0 w-full bg-[#1e1e1e] mt-1 rounded shadow-2xl border border-gray-700 overflow-hidden z-[100]">
              {searchResults.length > 0 ? (
                searchResults.map(movie => (
                  <Link 
                    key={movie.id} 
                    to={`/movie/${movie.id}`}
                    onClick={() => {setSearchTerm(''); setShowResults(false);}}
                    className="flex items-center gap-3 p-2 hover:bg-[#26c6da]/20 border-b border-gray-800 last:border-0 transition-colors"
                  >
                    <img 
                      src={movie.image} 
                      className="w-8 h-10 object-cover rounded shadow-md" 
                      alt="" 
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50x70'}
                    />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase truncate text-gray-200">{movie.title}</span>
                        <span className="text-[9px] text-[#26c6da]">{movie.year || '2024'}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-3 text-[10px] text-gray-500 italic text-center uppercase">Không tìm thấy phim này trong dữ liệu...</div>
              )}
            </div>
          )}
        </div>

        {/* Menu Điều hướng và Auth */}
        <div className="hidden md:flex items-center gap-8">
          {/* Đã đồng bộ với App.jsx */}
          <Link to="/history" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#26c6da] transition-all group">
              <History size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Lịch sử xem</span>
          </Link>

          <Link to="/favorites" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#26c6da] transition-all group">
              <Bookmark size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-tighter">Phim yêu thích</span>
          </Link>
          
          {userData ? (
            <div className="flex items-center gap-3 bg-[#222] p-1 pr-3 rounded-sm border border-gray-700 group">
              <div className="w-7 h-7 bg-[#26c6da] rounded-sm flex items-center justify-center text-white font-black text-xs">
                {userData.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-200 uppercase leading-none">{userData.username}</span>
                <button 
                  onClick={handleLogout}
                  className="text-[8px] text-gray-500 hover:text-red-500 uppercase font-bold text-left mt-1 flex items-center gap-1"
                >
                  <LogOut size={10} /> Thoát
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="bg-[#26c6da] hover:bg-[#00acc1] text-white px-5 py-1.5 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-cyan-900/20"
              >
                  Đăng Nhập
              </Link>
              {/* KHỚP VỚI path="/dang-ki" TRONG App.jsx */}
              <Link 
                to="/dang-ki" 
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-sm text-[11px] font-black uppercase transition-all"
              >
                  Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;