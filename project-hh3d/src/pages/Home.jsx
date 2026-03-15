import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Slider from '../components/Slider';
import MovieList from '../components/MovieList';
import MovieCard from '../components/MovieCard';
import MovieCardSkeleton from '../components/MovieCardSkeleton';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 24;
const API = import.meta.env.VITE_API_URL || '';

export default function Home() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const sort   = searchParams.get('sort')   || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url;
        if (category) url = `${API}/api/movies/category/${category}`;
        else if (search) url = `${API}/api/search?q=${encodeURIComponent(search)}&limit=200`;
        else url = `${API}/api/movies`;

        const res = await axios.get(url);
        let data = Array.isArray(res.data) ? res.data : (res.data.data || []);

        if (status) data = data.filter(m => m.status === status);
        if (sort === 'views') data.sort((a, b) => (b.views || 0) - (a.views || 0));
        else if (sort === 'created_at') data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setMovies(data);
        setPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error(e);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, sort, category, status]);

  const isFiltered = !!(search || sort || category || status);

  const newest   = useMemo(() => [...movies].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 12), [movies]);
  const topViews = useMemo(() => [...movies].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12), [movies]);

  const totalPages = Math.ceil(movies.length / PAGE_SIZE);
  const paginated  = movies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageTitle = () => {
    if (search)  return `Kết quả: "${search}"`;
    if (sort === 'views')      return 'Top Xem Nhiều';
    if (sort === 'created_at') return 'Mới Cập Nhật';
    if (status === 'Completed') return 'Phim Hoàn Thành';
    if (category) return 'Theo Thể Loại';
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0d1117] pt-14 md:pt-16">
      {!isFiltered && !loading && <Slider movies={newest} />}

      <div className="max-w-7xl mx-auto px-4">
        {!isFiltered ? (
          <div className="pt-8 space-y-2">
            <MovieList title="Mới Cập Nhật" movies={newest} loading={loading} moreLink="/?sort=created_at" />
            <MovieList title="Xem Nhiều Nhất" movies={topViews} loading={loading} moreLink="/?sort=views" />
          </div>
        ) : (
          <div className="pt-8">
            {pageTitle() && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-orange-500 rounded-full" />
                <h1 className="text-white font-bold text-xl">{pageTitle()}</h1>
                {!loading && (
                  <span className="text-gray-500 text-sm ml-1">({movies.length} phim)</span>
                )}
              </div>
            )}

            {!loading && movies.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-gray-600">
                <svg className="w-20 h-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <p className="text-lg font-medium text-gray-500">Không tìm thấy phim nào</p>
                {search && <p className="text-sm mt-1 text-gray-600">Thử tìm kiếm với từ khóa khác nhé!</p>}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {loading
                    ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
                    : paginated.map(m => <MovieCard key={m.id} movie={m} />)
                  }
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
