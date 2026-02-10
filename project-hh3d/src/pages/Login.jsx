import React, { useState } from 'react';
import { User, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      
      if (res.data.message === "Thành công") {
        // --- LƯU THÔNG TIN USER ĐỂ DÙNG CHO BÌNH LUẬN ---
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // --- PHÂN QUYỀN ĐIỀU HƯỚNG ---
        if (res.data.user.role === 'admin') {
          alert("Chào sếp! Đang vào khu vực quản trị...");
          navigate('/admin'); 
        } else {
          // Nếu là người dùng thường, về trang chủ
          navigate('/'); 
        }

        // Reload nhẹ để Header và phần Bình luận nhận diện đã đăng nhập
        window.location.reload();
      }
    } catch (err) {
      // Trả về lỗi nếu sai tài khoản hoặc server sập
      setError(err.response?.data?.message || "Sai email hoặc mật khẩu sếp ơi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center pt-20 px-4 font-sans text-gray-300">
      <div className="flex items-center gap-3 text-white text-3xl font-black mb-8 italic uppercase tracking-tighter">
        <User size={32} className="text-cyan-500" />
        <h1>Đăng nhập</h1>
      </div>

      <div className="w-full max-w-[450px] bg-[#161616] p-8 rounded-2xl shadow-2xl border border-white/5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-xs font-bold text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest block ml-1">Email của sếp</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yanhh3d.com"
              className="w-full bg-black text-white p-4 rounded-xl border border-gray-800 outline-none focus:border-cyan-500 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-500 text-[10px] uppercase font-black tracking-widest block ml-1">Mật khẩu</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black text-white p-4 rounded-xl border border-gray-800 outline-none focus:border-cyan-500 transition-all text-sm"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button type="button" className="text-gray-600 hover:text-cyan-500 text-[10px] uppercase font-bold transition-colors">
              Quên mật khẩu?
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Xác nhận'}
            </button>
          </div>

          <div className="pt-8 border-t border-white/5 text-gray-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3">
            Chưa có tài khoản? 
            <Link to="/Accout">
               <span className="text-orange-500 hover:text-orange-400 transition-colors cursor-pointer">Đăng ký ngay</span>
            </Link>
          </div>
        </form>
      </div>
      
      <Link to="/" className="mt-8 text-gray-700 hover:text-gray-500 text-[10px] uppercase font-black tracking-[3px] transition-all">
        ← Quay lại trang chủ
      </Link>
    </div>
  );
}

export default Login;