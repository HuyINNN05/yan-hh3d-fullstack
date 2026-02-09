import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Import các thành phần cơ bản
import Header from './compoment/Header'; 
import Sidebar from './compoment/Sidebar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Login from './pages/login';
import LoveMovie from './pages/LoveMovie';
import WiewinghHistory from './pages/WiewinghHistory'; 
import MovieSingle from './pages/Menu_home/MovieSingle';

// Import từ thư mục Menu_home
import Anime3D from './pages/Menu_home/Anime3D';
import Anime2D from './pages/Menu_home/Anime2D';
import Movie4K from './pages/Menu_home/Movie4K';
import Completed from './pages/Menu_home/Completed';
import Ongoing from './pages/Menu_home/Ongoing';
import Register from './pages/Register';

// Import của phần admin
import AdminMovies from './pages/Admin/AdminMovies';
import AdminDashboard from './pages/Admin/Dashboard';
import AddMovie from './pages/Admin/AddMovie';
import AdminUsers from './pages/Admin/AdminUsers';
import AddEpisode from './pages/Admin/AddEpisode';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Kiểm tra xem trang hiện tại có phải là trang Admin hay không
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* CHỈ HIỆN HEADER VÀ SIDEBAR CŨ NẾU KHÔNG PHẢI LÀ TRANG ADMIN */}
      {!isAdminPage && (
        <>
          <Header onOpenMenu={() => setIsMenuOpen(true)} /> 
          <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<Detail />} />
          <Route path="/login" element={<Login />} />
          
          <Route path='/lich_su_xem' element={<LoveMovie />} />
          <Route path='/dang-ki' element={<Register />} />

          <Route path="/history" element={<WiewinghHistory />} />
          <Route path="/favorites" element={<LoveMovie />} />

          <Route path="/moi-nhat" element={<Home />} />
          <Route path="/3d" element={<Anime3D />} />
          <Route path="/2d" element={<Anime2D />} />
          <Route path="/4k" element={<Movie4K />} />
          <Route path="/full" element={<Completed />} />
          <Route path="/trending" element={<Ongoing />} />
          <Route path="/ova" element={<MovieSingle />} />
          
          <Route path="/category/:id" element={<Anime2D />} />

          {/* PHẦN CỦA ADMIN - ĐÃ SỬA LẠI PATH CHO KHỚP VỚI NÚT BẤM */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/movies" element={<AdminMovies />} />
          {/* Sếp chú ý dòng dưới này nhé, phải là /admin/movies/add mới đúng bài */}
          <Route path="/admin/movies/add" element={<AddMovie />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/episodes" element={<AddEpisode />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;