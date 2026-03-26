import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Film, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedForm = {
      email: form.email.trim(),
      password: form.password,
    };

    if (!normalizedForm.email || !normalizedForm.password) { 
      setError('Vui lòng điền đầy đủ thông tin.'); 
      return; 
    }
    
    setLoading(true);
    setError('');
    
    try {
      const loggedInUser = await login(normalizedForm.email, normalizedForm.password);

      // Check if there's a return URL
      const returnTo = localStorage.getItem('returnTo');
      if (returnTo && returnTo !== '/login') {
        localStorage.removeItem('returnTo');
        navigate(returnTo);
      } else {
        // Redirect based on role
        navigate(loggedInUser?.role === 'admin' ? '/admin' : '/');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Sai email hoặc mật khẩu!';
      setError(errorMsg);
      console.error('Login error:', err);
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
          <p className="text-gray-500 text-sm">Chào mừng trở lại!</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-gray-800/60 rounded-2xl p-6 shadow-2xl shadow-black/60">
          <h2 className="text-white text-xl font-bold mb-5 text-center">Đăng nhập</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full bg-[#1c2333] border border-gray-700/60 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none focus:border-orange-500 transition-colors placeholder-gray-600" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-orange-900/30 hover:shadow-orange-900/50 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={16} /> Đăng nhập</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 bg-[#0d1117] border border-gray-800/40 rounded-xl p-4">
          <p className="text-gray-600 text-xs text-center mb-2 font-medium">TÀI KHOẢN THỬ NGHIỆM</p>
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex justify-between"><span>User</span><span>user@gmail.com / 123456</span></div>
            <div className="flex justify-between"><span>Admin</span><span>admin@yanhh3d.gg / admin123456</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
