import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, PlayCircle } from 'lucide-react';

/**
 * MovieCard: hiển thị thẻ một bộ phim trong danh sách
 * @param {Object} movie - Dữ liệu phim từ API
 */
const MovieCard = ({ movie }) => {
    const { id, title, thumbnail_url, genre, views } = movie;

    return (
        <Link
            to={`/movie/${id}`}
            className="group relative bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/30 block"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
                {thumbnail_url ? (
                    <img
                        src={thumbnail_url}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle size={48} className="text-gray-600" />
                    </div>
                )}

                {/* Overlay play button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle size={52} className="text-purple-400 drop-shadow-lg" />
                </div>

                {/* Genre badge */}
                {genre && (
                    <span className="absolute top-2 left-2 bg-purple-600/80 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {genre}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {title}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-gray-500 text-xs">
                    <Eye size={12} />
                    <span>{(views || 0).toLocaleString()} lượt xem</span>
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
