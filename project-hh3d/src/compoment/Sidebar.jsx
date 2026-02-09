import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Dùng Link thay thẻ a để không load lại trang
import axios from 'axios';
import { ChevronLeft, Home, Clock, Heart, Flame } from 'lucide-react';

// Menu tĩnh (Ít thay đổi thì ta để cứng ở đây cho nhẹ)
const STATIC_MENU = [
  { id: 1, label: 'Trang Chủ', url: '/', icon: <Home size={18} />, color: 'text-white' },
  { id: 2, label: 'Lịch Sử Xem', url: '/history', icon: <Clock size={18} />, color: 'text-gray-400' },
  { id: 3, label: 'Phim Yêu Thích', url: '/favorites', icon: <Heart size={18} />, color: 'text-red-400' },
  { id: 4, label: 'Phim Hot Trend', url: '/trending', icon: <Flame size={18} />, color: 'text-orange-400' },
];

function Sidebar({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);

  // Gọi API lấy danh sách thể loại từ Database khi mở web
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  }, []);

  return (
    <>
      {/* Overlay: Lớp phủ đen phía sau */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar chính */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-[#121212] z-[70] transform transition-transform duration-300 border-r border-gray-800 flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header của Sidebar */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]">
          <span className="font-black italic text-xl tracking-tighter">
             <span className="text-[#26c6da]">MENU</span>
          </span>
          <button 
            onClick={onClose}
            className="flex items-center gap-1 bg-[#333] hover:bg-red-500 text-white px-3 py-1.5 rounded text-xs transition-colors"
          >
            <ChevronLeft size={16} /> Đóng
          </button>
        </div>

        {/* Nội dung cuộn */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          
          {/* 1. Menu Chính */}
          <div className="px-4 mb-6">
             <h3 className="text-gray-500 text-[10px] font-bold mb-3 uppercase tracking-widest pl-2">Điều hướng</h3>
             <div className="space-y-1">
               {STATIC_MENU.map((link) => (
                 <Link 
                   key={link.id} 
                   to={link.url} 
                   onClick={onClose} // Đóng menu khi click
                   className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#26c6da]/10 hover:border-[#26c6da] border border-transparent transition-all ${link.color}`}
                 >
                   {link.icon}
                   <span className="text-sm font-medium">{link.label}</span>
                 </Link>
               ))}
             </div>
          </div>

          <div className="border-t border-gray-800 mx-6 my-2"></div>

          {/* 2. Phần Thể Loại (Lấy từ SQL) */}
          <div className="p-6 pt-2">
            <h3 className="text-gray-500 text-[10px] font-bold mb-4 uppercase tracking-widest">Thể loại phim</h3>
            
            {/* Grid hiển thị Categories */}
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <Link 
                    key={cat.id} 
                    // Link này sẽ dẫn đến trang lọc phim theo category (cần làm sau này)
                    to={`/category/${cat.id}`} 
                    onClick={onClose}
                    className={`text-sm py-2 px-3 rounded bg-[#1a1a1a] border border-gray-800 hover:border-[#26c6da] hover:text-[#26c6da] transition-all text-center truncate ${cat.color_class || 'text-gray-300'}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-xs italic text-center">Đang tải thể loại...</p>
            )}
          </div>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-800 bg-[#0a0a0a]">
            <p className="text-[10px] text-gray-500 text-center">
              © 2024 YanHH3D Project<br/>Designed by You
            </p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;