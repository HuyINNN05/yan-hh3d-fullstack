import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Admin/Dashboard';
import AdminMovies from './pages/Admin/AdminMovies';
import AddMovie from './pages/Admin/AddMovie';
import AddEpisode from './pages/Admin/AddEpisode';
import EpisodeManager from './pages/Admin/EpisodeManager';
import AdminUsers from './pages/Admin/AdminUsers';

function AdminRoute({ children }) {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  if (!user || user.role !== 'admin') { window.location.href = '/'; return null; }
  return children;
}

export default function App() {
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
        <Route path="/admin/movies" element={<AdminRoute><AdminMovies /></AdminRoute>} />
        <Route path="/admin/movies/add" element={<AdminRoute><AddMovie /></AdminRoute>} />
        <Route path="/admin/episodes/:movieId" element={<AdminRoute><EpisodeManager /></AdminRoute>} />
        <Route path="/admin/episodes/add" element={<AdminRoute><AddEpisode /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      </Routes>
    </>
  );
}
