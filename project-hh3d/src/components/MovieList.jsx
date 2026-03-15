import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

export default function MovieList({ title, movies, loading, moreLink, cols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' }) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-orange-500 rounded-full" />
          <h2 className="text-white font-bold text-base md:text-lg">{title}</h2>
        </div>
        {moreLink && (
          <Link to={moreLink} className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm transition-colors">
            Xem thêm <ChevronRight size={15} />
          </Link>
        )}
      </div>
      <div className={`grid ${cols} gap-3 md:gap-4`}>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : movies.map(m => <MovieCard key={m.id} movie={m} />)
        }
      </div>
    </section>
  );
}
