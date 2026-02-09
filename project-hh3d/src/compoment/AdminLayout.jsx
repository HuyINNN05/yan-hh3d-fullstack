import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Film, ListPlus, Users, LogOut, Home } from 'lucide-react';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Kiểm tra quyền Admin - Nếu không phải admin thì đá về trang chủ
  if (!user || user.role !== 'admin') {
    return (
      <div className="h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-black text-red-500 mb-4 uppercase">Truy cập bị từ chối</h1>
        <p className="text-gray-400 uppercase tracking-widest text-sm">Sếp cần tài khoản Admin để vào đây!</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 bg-[#26c6da] text-black px-6 py-2 rounded font-bold uppercase"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 flex">
      {/* Sidebar Admin bên trái */}
      <aside className="w-64 bg-[#111] border-r border-white/5 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <Link to="/admin" className="text-xl font-black italic tracking-tighter text-[#26c6da]">
            YANHH3D <span className="text-white text-[10px] bg-red-600 px-1 rounded ml-1 not-italic">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all text-xs font-bold uppercase">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/movies" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all text-xs font-bold uppercase">
            <Film size={18} /> Quản lý phim
          </Link>
          <Link to="/admin/episodes" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all text-xs font-bold uppercase">
            <ListPlus size={18} /> Thêm tập phim
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all text-xs font-bold uppercase">
            <Users size={18} /> Người dùng
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
           <Link to="/" className="flex items-center gap-3 p-3 text-gray-500 hover:text-white transition-all text-[10px] uppercase font-bold">
            <Home size={16} /> Xem trang chủ
          </Link>
          <button 
            onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} 
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-[10px] uppercase font-bold"
          >
            <LogOut size={16} /> Thoát quyền sếp
          </button>
        </div>
      </aside>

      {/* Nội dung trang Admin bên phải */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-[#111] border-b border-white/5 flex items-center justify-end px-8">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase text-gray-500 italic">Phiên làm việc của:</span>
            <span className="text-sm font-black text-white uppercase">{user.username}</span>
            <div className="w-8 h-8 bg-[#26c6da] rounded flex items-center justify-center text-black font-black text-xs">
              {user.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;