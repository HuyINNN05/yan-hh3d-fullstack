import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../compoment/AdminLayout';
import { Plus, Search, Edit2, Trash2, Film } from 'lucide-react';

function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/movies');
      setMovies(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách phim:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sếp có chắc muốn xóa phim này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/movies/${id}`);
        fetchMovies();
      } catch (err) {
        alert("Lỗi xóa phim sếp ơi!");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Quản lý kho phim</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Tổng cộng: {movies.length} bộ phim</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input type="text" placeholder="Tìm phim trong kho..." className="bg-[#111] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-cyan-500 outline-none w-64 transition-all" />
          </div>
          <button onClick={() => navigate('/admin/movies/add')} className="bg-cyan-600 hover:bg-cyan-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20">
            <Plus size={18} /> Thêm phim mới
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase">ID</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase">Poster</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase">Tên phim</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase text-center">Trạng thái</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {movies.map((movie) => {
               const adminImg = movie.image?.startsWith('http') ? movie.image : `/image/${movie.image}`;
               return (
                <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6 text-xs font-bold text-gray-600">#{movie.id}</td>
                  <td className="p-6">
                    <div className="w-12 h-16 rounded-lg bg-black border border-white/10 overflow-hidden shadow-lg">
                      {movie.image ? (
                        <img 
                          src={adminImg} 
                          className="w-full h-full object-cover" 
                          alt="" 
                          onError={(e) => {e.target.src = 'https://placehold.jp/24/333333/ffffff/100x150.png?text=No+Img'}}
                        />
                      ) : (
                        <Film size={16} className="m-auto mt-6 text-gray-800" />
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="font-black text-white text-sm uppercase italic group-hover:text-cyan-400 transition-colors">{movie.title}</div>
                    <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">Tập: {movie.episode_display || 'Chưa cập nhật'}</div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${movie.status === 'Hoàn thành' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {movie.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(movie.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminMovies;