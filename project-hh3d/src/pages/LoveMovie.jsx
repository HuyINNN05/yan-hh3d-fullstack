import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, PlayCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFavorites, removeFavorite, getLocalFavorites, setLocalFavorites } from '../api/userLibraryApi';

function LoveMovie() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Load favorites từ API (nếu user đăng nhập) hoặc localStorage (guest)
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                setLoading(true);
                if (user) {
                    // User đăng nhập: lấy từ backend
                    const data = await getFavorites();
                    setFavorites(data);
                } else {
                    // Guest: lấy từ localStorage
                    const data = getLocalFavorites();
                    setFavorites(data);
                }
            } catch (error) {
                console.error('Lỗi load favorites:', error);
                setFavorites([]);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, [user]);

    const toggleFavorite = async (id) => {
        try {
            if (user) {
                // User đăng nhập: gọi API xóa
                await removeFavorite(id);
                setFavorites(favorites.filter(m => m.id !== id));
            } else {
                // Guest: xóa từ localStorage
                const updated = favorites.filter(m => m.id !== id);
                setLocalFavorites(updated);
                setFavorites(updated);
            }
        } catch (error) {
            console.error('Lỗi xóa yêu thích:', error);
        }
    };

    if (loading) {
        return <div className="bg-[#0f0f0f] min-h-screen text-white pt-24 flex items-center justify-center">Đang tải...</div>;
    }

    return (
        <div className="bg-[#0f0f0f] min-h-screen text-white pt-24 pb-10">
            <div className="container mx-auto px-4">
                <h2 className="text-xl font-bold uppercase mb-8 border-b border-gray-800 pb-4 flex items-center gap-2 text-orange-500 italic">
                    <Heart fill="currentColor" /> Phim bạn đã thích
                </h2>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {favorites.map((movie) => (
                            <div key={movie.id} className="group relative bg-[#161616] rounded-xl overflow-hidden border border-gray-800">
                                <Link to={`/movie/${movie.id}`} className="block aspect-[2/3] relative">
                                    <img src={movie.image || movie.poster} className="w-full h-full object-cover" alt={movie.title} />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <PlayCircle size={40} className="text-orange-500" />
                                    </div>
                                </Link>
                                <div className="p-3 flex justify-between items-center">
                                    <h3 className="text-xs font-bold uppercase truncate flex-1">{movie.title}</h3>
                                    <button onClick={() => toggleFavorite(movie.id)} className="text-gray-600 hover:text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-600 uppercase text-sm italic">Danh sách yêu thích trống.</div>
                )}
            </div>
        </div>
    );
}

export default LoveMovie;