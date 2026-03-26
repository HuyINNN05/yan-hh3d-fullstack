import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import { addFavorite, removeFavorite, getLocalFavorites, setLocalFavorites } from '../api/userLibraryApi';

// Image pode ser URL completa ou path relativa /image/xxx.jpg
// Se for URL externa (http/https), usar rota proxy para evitar CORS
const PLACEHOLDER = '/image/Dau-pha-thuong-khung.jpg';

function getImageUrl(image) {
  if (!image) return PLACEHOLDER;
  // Se já for uma URL relativa ao /image/, deixar como está
  if (image.startsWith('/image/')) return image;
  // Se for URL completa (http/https), fazer proxy através do backend
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return `/api/proxy-image?url=${encodeURIComponent(image)}`;
  }
  return image || PLACEHOLDER;
}

export default function MovieCard({ movie }) {
  const { id, title, image, poster, quality, status, views, total_episodes } = movie;
  const imgSrc = getImageUrl(poster || image);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const localFavs = getLocalFavorites();
    setIsFav(localFavs.some((item) => Number(item.id) === Number(id)));
  }, [id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const hasToken = Boolean(localStorage.getItem('token'));
    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();

    try {
      if (hasToken && currentUser) {
        if (isFav) {
          await removeFavorite(id);
          setIsFav(false);
        } else {
          await addFavorite(id);
          setIsFav(true);
        }
      } else {
        const localFavs = getLocalFavorites();
        if (isFav) {
          const updated = localFavs.filter((item) => Number(item.id) !== Number(id));
          setLocalFavorites(updated);
          setIsFav(false);
        } else {
          const updated = [...localFavs, movie];
          setLocalFavorites(updated);
          setIsFav(true);
        }
      }
    } catch (err) {
      console.error('Loi cap nhat yeu thich:', err);
    }
  };

  return (
    <Link to={`/movie/${id}`} className="group relative block bg-[#111827] rounded-xl overflow-hidden border border-transparent hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/20">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
        <img src={imgSrc} alt={title} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => { if (e.target.src !== window.location.origin + PLACEHOLDER) e.target.src = PLACEHOLDER; }} />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-orange-500/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Quality badge */}
        {quality && (
          <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {quality}
          </span>
        )}

        {/* Status badge */}
        {status === 'Completed' && (
          <span className="absolute top-1.5 right-1.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            FULL
          </span>
        )}

        <button
          type="button"
          onClick={toggleFavorite}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border flex items-center justify-center transition ${
            isFav
              ? 'bg-pink-500 border-pink-500 text-white'
              : 'bg-black/60 border-white/20 text-gray-200 hover:border-pink-400 hover:text-pink-300'
          }`}
          title={isFav ? 'Bo yeu thich' : 'Them vao yeu thich'}
        >
          <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 leading-tight group-hover:text-orange-400 transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1.5 gap-1">
          <span className="text-gray-400 text-[10px] sm:text-xs truncate">{Number(total_episodes) || 0} Tập</span>
          {views > 0 && (
            <span className="flex items-center gap-0.5 text-gray-500 text-[10px] shrink-0">
              <Eye size={10} /> {views >= 1000 ? (views/1000).toFixed(0)+'k' : views}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
