import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import các thành phần cơ bản
import Header from './compoment/Header'; 
import Sidebar from './compoment/Sidebar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Login from './pages/login';
import LoveMovie from './pages/LoveMovie';
import MovieSingle from './pages/Menu_home/MovieSingle';

// Import chính xác từ thư mục Menu_home
import Anime3D from './pages/Menu_home/Anime3D';
import Anime2D from './pages/Menu_home/Anime2D';
import Movie4K from './pages/Menu_home/Movie4K';
import Completed from './pages/Menu_home/Completed';
import Ongoing from './pages/Menu_home/Ongoing';
import Accout from './pages/accout';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header chứa ô tìm kiếm và nút đăng nhập */}
      <Header onOpenMenu={() => setIsMenuOpen(true)} /> 
      
      {/* Sidebar điều hướng menu trái */}
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<Detail />} />
          <Route path="/login" element={<Login />} />
          
          {/* Sửa lại dấu ngoặc cho 2 dòng này */}
          <Route path='/lich_su_xem' element={<LoveMovie />} />
          <Route path='/dang-ki' element={<Accout />} />

          {/* Các Route dành cho Menu lọc phim */}
          <Route path="/moi-nhat" element={<Home />} />
          <Route path="/3d" element={<Anime3D />} />
          <Route path="/2d" element={<Anime2D />} />
          <Route path="/4k" element={<Movie4K />} />
          <Route path="/full" element={<Completed />} />
          <Route path="/trending" element={<Ongoing />} />
          <Route path="/ova" element={<MovieSingle />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;