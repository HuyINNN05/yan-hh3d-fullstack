import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function Slider({ movies = [] }) {
  const items = movies.slice(0, 6);
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % items.length), [items.length]);
  const prev = () => setCurrent(c => (c - 1 + items.length) % items.length);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, items.length]);

  if (!items.length) return null;
  const m = items[current];

  return (
    <div className="relative w-full overflow-hidden bg-[#0d1117]" style={{ height: 'clamp(260px, 52vw, 520px)' }}>
      {/* Slides */}
      {items.map((item, i) => (
        <div key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img
            src={item.image || '/image/Dau-pha-thuong-khung.jpg'}
            alt={item.title}
            className="w-full h-full object-cover object-top"
            onError={e => { e.target.src = '/image/Dau-pha-thuong-khung.jpg'; }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-end pb-10 md:items-center md:pb-0 px-6 md:px-12 max-w-7xl mx-auto left-0 right-0">
        <div className="max-w-lg">
          {m.quality && <span className="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md mb-2">{m.quality}</span>}
          <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight drop-shadow-xl line-clamp-2">{m.title}</h1>
          <p className="text-orange-300 text-sm mt-1 font-medium">{Number(m.total_episodes) || 0} Tập</p>
          {m.description && (
            <p className="text-gray-300 text-sm mt-2 line-clamp-2 hidden md:block leading-relaxed">{m.description}</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <Link to={`/movie/${m.id}`}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-900/40 hover:scale-105">
              <Play size={16} fill="white" /> Xem Ngay
            </Link>
            <Link to={`/movie/${m.id}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all backdrop-blur-sm border border-white/10">
              Chi Tiết
            </Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      {items.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110">
            <ChevronRight size={20} />
          </button>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
            {items.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
