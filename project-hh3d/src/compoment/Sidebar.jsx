import React from 'react';
import { ChevronLeft } from 'lucide-react';
// Import data giả bạn vừa tạo
import { MENU_LINKS, CATEGORIES_DATA } from '../data.js';

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay: Lớp phủ đen phía sau */}
      <div 
        className={`fixed inset-0 bg-black/70 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar chính */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#1a1a1a] z-[70] transform transition-transform duration-300 border-r border-gray-800 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Phần nút Đóng ở trên cùng */}
        <div className="p-4 border-b border-gray-800/50">
          <button 
            onClick={onClose}
            className="flex items-center gap-1 bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded-md text-xs transition-all active:scale-95"
          >
            <ChevronLeft size={14} /> Đóng
          </button>
        </div>

        {/* Render danh sách Menu chính từ data giả */}
        <nav className="flex flex-col py-2 overflow-y-auto">
          {MENU_LINKS.map((link) => (
            <a 
              key={link.id} 
              href={link.url} 
              className={`px-6 py-3 hover:bg-white/5 border-b border-gray-800/30 text-sm font-medium transition-colors ${link.color}`}
            >
              {link.label}
            </a>
          ))}

          {/* Phần Thể Loại */}
          <div className="p-6">
            <h3 className="text-gray-500 text-[11px] font-bold mb-4 uppercase tracking-[2px]">Thể loại</h3>
            
            {/* Chia 2 cột dùng Grid để giống ảnh mẫu */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              {CATEGORIES_DATA.map((cat) => (
                <a 
                  key={cat.id} 
                  href="#" 
                  className={`text-sm hover:brightness-125 transition-all ${cat.color}`}
                >
                  {cat.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Một chút thông tin ở dưới cùng cho chuyên nghiệp */}
        <div className="mt-auto p-6 border-t border-gray-800/50 bg-[#151515]">
            <p className="text-[10px] text-gray-600">YanHH3D Version 2.0</p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;