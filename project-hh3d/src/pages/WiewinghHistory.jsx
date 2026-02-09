import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, History, PlayCircle } from 'lucide-react';

function ViewingHistory() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('viewing_history')) || [];
        setHistory(data);
    }, []);

    const removeHistory = (id) => {
        const updated = history.filter(m => m.id !== id);
        localStorage.setItem('viewing_history', JSON.stringify(updated));
        setHistory(updated);
    };

    const clearAll = () => {
        if (window.confirm("Xóa toàn bộ lịch sử xem?")) {
            localStorage.removeItem('viewing_history');
            setHistory([]);
        }
    };

    return (
        <div className="bg-[#0f0f0f] min-h-screen text-white pt-24 pb-10">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-bold uppercase flex items-center gap-2 text-cyan-400 italic">
                        <History /> Lịch sử đã xem
                    </h2>
                    {history.length > 0 && (
                        <button onClick={clearAll} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 uppercase font-bold">
                            <Trash2 size={14} /> Xóa tất cả
                        </button>
                    )}
                </div>

                {history.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {history.map((movie) => (
                            <div key={movie.id} className="group relative bg-[#161616] rounded-xl overflow-hidden border border-gray-800">
                                <Link to={`/movie/${movie.id}`} className="block aspect-[2/3] relative">
                                    <img src={movie.image} className="w-full h-full object-cover" alt={movie.title} />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <PlayCircle size={40} className="text-cyan-400" />
                                    </div>
                                </Link>
                                <div className="p-3">
                                    <h3 className="text-xs font-bold uppercase truncate">{movie.title}</h3>
                                    <button onClick={() => removeHistory(movie.id)} className="mt-2 text-gray-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-600 uppercase text-sm italic">Bạn chưa xem phim nào.</div>
                )}
            </div>
        </div>
    );
}

export default ViewingHistory;