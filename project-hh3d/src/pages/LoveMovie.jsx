import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, PlayCircle, Trash2 } from 'lucide-react';

function LoveMovie() {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('favorite_movies')) || [];
        setFavorites(data);
    }, []);

    const toggleFavorite = (id) => {
        const updated = favorites.filter(m => m.id !== id);
        localStorage.setItem('favorite_movies', JSON.stringify(updated));
        setFavorites(updated);
    };

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
                                    <img src={movie.image} className="w-full h-full object-cover" alt={movie.title} />
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