import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Film, LogIn, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

/**
 * Navbar toàn cục: logo, tìm kiếm, các link điều hướng, nút đăng nhập/xuất
 */
const Navbar = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery]       = useState('');
    const [mobileOpen, setMobile] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/?search=${encodeURIComponent(query.trim())}`);
            setMobile(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-[#141414] border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-purple-400 font-bold text-xl shrink-0">
                    <Film size={24} />
                    <span className="hidden sm:inline">HH3D</span>
                </Link>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Tìm kiếm phim..."
                            className="w-full bg-[#2a2a2a] text-white placeholder-gray-500 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </form>

                {/* Right actions */}
                <div className="hidden sm:flex items-center gap-3">
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition"
                        >
                            <LayoutDashboard size={16} />
                            <span>Admin</span>
                        </Link>
                    )}
                    {user ? (
                        <>
                            <span className="text-gray-400 text-sm">{user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition"
                            >
                                <LogOut size={16} />
                                <span>Đăng xuất</span>
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-1 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition"
                        >
                            <LogIn size={16} />
                            <span>Đăng nhập</span>
                        </Link>
                    )}
                </div>

                {/* Mobile burger */}
                <button className="sm:hidden text-gray-300" onClick={() => setMobile(v => !v)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="sm:hidden px-4 pb-4 flex flex-col gap-3 border-t border-gray-800 pt-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Tìm kiếm phim..."
                            className="flex-1 bg-[#2a2a2a] text-white placeholder-gray-500 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button type="submit" className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm">Tìm</button>
                    </form>
                    {isAdmin && (
                        <Link to="/admin" className="text-purple-400 text-sm" onClick={() => setMobile(false)}>
                            Dashboard Admin
                        </Link>
                    )}
                    {user ? (
                        <button onClick={handleLogout} className="text-left text-red-400 text-sm">Đăng xuất ({user.email})</button>
                    ) : (
                        <Link to="/login" className="text-purple-400 text-sm" onClick={() => setMobile(false)}>Đăng nhập</Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
