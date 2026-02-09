import React, { useState } from 'react';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Mật khẩu xác nhận không khớp!");
    
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      alert(res.data.message);
      navigate('/login'); // Đăng ký xong thì sang trang Đăng nhập
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center pt-10 px-4">
      <div className="w-full max-w-[500px] bg-[#222] p-10 rounded-lg shadow-2xl border border-gray-800">
        <div className="flex items-center gap-3 text-white text-2xl font-bold mb-8 border-b border-gray-800 pb-4">
          <UserPlus className="text-[#ff5722]" />
          <h1>Tạo tài khoản mới</h1>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm text-center">{error}</div>}

        <form className="space-y-5" onSubmit={handleRegister}>
          <div className="space-y-1">
            <label className="text-gray-400 text-xs font-bold uppercase">Tên hiển thị</label>
            <input required type="text" className="w-full bg-[#333] text-white p-3 rounded outline-none focus:ring-1 focus:ring-[#ff5722]" 
              onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-gray-400 text-xs font-bold uppercase">Email</label>
            <input required type="email" className="w-full bg-[#333] text-white p-3 rounded outline-none focus:ring-1 focus:ring-[#ff5722]" 
              onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-400 text-xs font-bold uppercase">Mật khẩu</label>
              <input required type="password" className="w-full bg-[#333] text-white p-3 rounded outline-none focus:ring-1 focus:ring-[#ff5722]" 
                onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400 text-xs font-bold uppercase">Xác nhận</label>
              <input required type="password" className="w-full bg-[#333] text-white p-3 rounded outline-none focus:ring-1 focus:ring-[#ff5722]" 
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white py-3 rounded-md font-bold uppercase mt-4 flex items-center justify-center gap-2 transition-all">
            {loading && <Loader2 size={18} className="animate-spin" />}
            Đăng ký ngay
          </button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-gray-500 hover:text-white text-sm mt-4 transition-colors">
             <ArrowLeft size={14} /> Quay lại đăng nhập
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Register;