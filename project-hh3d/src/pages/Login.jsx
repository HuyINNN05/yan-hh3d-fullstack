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
        // Lưu thông tin user vào localStorage để các trang khác biết đã đăng nhập
        localStorage.setItem('user', JSON.stringify(res.data.user));
        alert("Đăng nhập thành công!");
        navigate('/'); // Chuyển về trang chủ
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center pt-10 px-4 font-sans">
      <div className="flex items-center gap-3 text-white text-3xl font-bold mb-8">
        <User size={32} className="text-[#26c6da]" />
        <h1>Đăng nhập</h1>
      </div>

      <div className="w-full max-w-[500px] bg-[#222] p-10 rounded-lg shadow-2xl border border-gray-800">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-bold block">Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full bg-[#333] text-white p-3 rounded border border-gray-700 outline-none focus:border-[#26c6da] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-bold block">Mật khẩu</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#333] text-white p-3 rounded border border-gray-700 outline-none focus:border-[#26c6da] transition-all"
            />
          </div>

          <div className="flex justify-end items-center gap-4 pt-4">
            <button type="button" className="text-gray-400 hover:text-white text-sm">
              Quên mật khẩu?
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#26c6da] hover:bg-[#00acc1] text-black px-8 py-2 rounded-md font-bold uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Đăng nhập
            </button>
          </div>

          <div className="pt-8 border-t border-gray-700 text-gray-300 text-sm flex items-center justify-center">
            Chưa có tài khoản? 
            <Link to="/Accout">
               <button type="button" className="bg-[#ff5722] hover:bg-[#e64a19] text-white px-4 py-1 rounded ml-2 font-bold transition-colors uppercase">
                 Đăng ký
               </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;