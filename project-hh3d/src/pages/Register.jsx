import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const { register } = useAuth();
    const navigate     = useNavigate();

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [confirm,  setConfirm]  = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) return setError('Mật khẩu xác nhận không khớp.');
        if (password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.');
        setLoading(true);
        try {
            await register(email.trim(), password);
            setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <Link to="/" className="flex items-center justify-center gap-2 text-purple-400 font-bold text-2xl mb-8">
                    <Film size={28} /> HH3D
                </Link>
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-white text-xl font-bold mb-6 text-center">Tạo tài khoản</h2>
                    {error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
                    {success && <div className="bg-green-500/10 border border-green-500/40 text-green-400 text-sm px-4 py-3 rounded-xl mb-5">{success}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="example@email.com"
                                    className="w-full bg-[#2a2a2a] text-white placeholder-gray-600 pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-700 focus:outline-none focus:border-purple-500 transition" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Ít nhất 6 ký tự"
                                    className="w-full bg-[#2a2a2a] text-white placeholder-gray-600 pl-9 pr-10 py-2.5 rounded-xl text-sm border border-gray-700 focus:outline-none focus:border-purple-500 transition" />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1.5">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input type={showPass ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Nhập lại mật khẩu"
                                    className="w-full bg-[#2a2a2a] text-white placeholder-gray-600 pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-700 focus:outline-none focus:border-purple-500 transition" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading || !!success}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition mt-2">
                            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus size={16} /> Đăng ký</>}
                        </button>
                    </form>
                    <p className="text-center text-gray-500 text-sm mt-5">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 transition font-medium">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;