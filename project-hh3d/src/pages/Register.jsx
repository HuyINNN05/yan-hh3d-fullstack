import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, UserPlus, Film, Eye, EyeOff } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.username || !form.email || !form.password) { 
      setError('Vui lòng điền đầy đủ thông tin.'); 
      return; 
    }
    
    if (form.password.length < 6) { 
      setError('Mật khẩu phải có ít nhất 6 ký tự.'); 
      return; 
    }
    
    if (form.password !== form.confirm) { 
      setError('Mật khẩu xác nhận không khớp.'); 
      return; 
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API}/api/register`, {
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirm,
      });
      
      if (res.status === 201 || res.data?.message) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Email hoặc username có thể đã tồn tại.';
      setError(errorMsg);
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 pt-14 md:pt-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/50">
              <Film size={20} className="text-white" />
            </div>
            <span className="text-white font-extrabold text-xl tracking-wide">
              Yan<span className="text-orange-400">HH3D</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm">Tạo tài khoản mới</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-gray-800/60 rounded-2xl p-6 shadow-2xl shadow-black/60">
          <h2 className="text-white text-xl font-bold mb-5 text-center">Đăng ký</h2>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-4 text-center">
              ✓ Đăng ký thành công! Đang chuyển hướng...
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Tên người dùng</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" name="username" value={form.username} onChange={handleChange}
                  placeholder="username" autoComplete="username"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="your@email.com" autoComplete="email"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự" autoComplete="new-password"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type={showPw ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange}
                  placeholder="Nhập lại mật khẩu" autoComplete="new-password"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
              </div>
            </div>

            <button type="submit" disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-orange-900/30 hover:shadow-orange-900/50 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus size={16} /> Tạo tài khoản</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
