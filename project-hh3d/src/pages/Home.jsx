import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchMovies } from '../api/movieApi';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import { Search, SlidersHorizontal, TrendingUp, X } from 'lucide-react';

const GENRES = ['', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];
const SORTS  = [
    { value: '',           label: 'Má»›i nháº¥t' },
    { value: 'views',      label: 'LÆ°á»£t xem' },
    { value: 'title',      label: 'TÃªn A-Z' },
];
const PAGE_SIZE = 12;

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [genre,  setGenre]  = useState(searchParams.get('genre')  || '');
    const [sort,   setSort]   = useState(searchParams.get('sort')   || '');
    const [page,   setPage]   = useState(1);

    const [movies,       setMovies]       = useState([]);
    const [totalMovies,  setTotalMovies]  = useState(0);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState('');
    const [searchInput,  setSearchInput]  = useState(search);

    const totalPages = Math.ceil(totalMovies / PAGE_SIZE);

    // Gá»i API má»—i khi filter/page thay Ä‘á»•i
    const loadMovies = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res  = await fetchMovies({ search, genre, sort });
            const all  = res.data.data || [];
            setTotalMovies(all.length);
            const start = (page - 1) * PAGE_SIZE;
            setMovies(all.slice(start, start + PAGE_SIZE));
        } catch (err) {
            setError(err.response?.data?.message || 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch phim. Vui lÃ²ng thá»­ láº¡i.');
        } finally {
            setLoading(false);
        }
    }, [search, genre, sort, page]);

    useEffect(() => {
        loadMovies();
    }, [loadMovies]);

    // Äá»“ng bá»™ state search tá»« URL (khi navigate tá»« Navbar)
    useEffect(() => {
        const s = searchParams.get('search') || '';
        setSearch(s);
        setSearchInput(s);
        setPage(1);
    }, [searchParams]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearch(searchInput.trim());
        setPage(1);
        const params = {};
        if (searchInput.trim()) params.search = searchInput.trim();
        if (genre) params.genre = genre;
        if (sort)  params.sort  = sort;
        setSearchParams(params);
    };

    const handleGenreChange = (g) => { setGenre(g); setPage(1); };
    const handleSortChange  = (s) => { setSort(s);  setPage(1); };

    const clearFilters = () => {
        setSearch(''); setSearchInput(''); setGenre(''); setSort(''); setPage(1);
        setSearchParams({});
    };

    const hasFilters = search || genre || sort;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Hero */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        <span className="text-purple-400">HH3D</span> â€” Phim Hoáº¡t HÃ¬nh 3D
                    </h1>
                    <p className="text-gray-400 text-sm">KhÃ¡m phÃ¡ kho phim hoáº¡t hÃ¬nh 3D cháº¥t lÆ°á»£ng cao</p>
                </div>

                {/* Search + Filters */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5 mb-8">
                    <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                placeholder="TÃ¬m kiáº¿m tÃªn phim..."
                                className="w-full bg-[#2a2a2a] text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
                            TÃ¬m
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <SlidersHorizontal size={16} /><span>Thá»ƒ loáº¡i:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map(g => (
                                <button
                                    key={g}
                                    onClick={() => handleGenreChange(g)}
                                    className={`px-3 py-1 rounded-full text-xs border transition ${
                                        genre === g
                                            ? 'bg-purple-600 border-purple-600 text-white'
                                            : 'border-gray-700 text-gray-400 hover:border-purple-500 hover:text-gray-200'
                                    }`}
                                >{g || 'Táº¥t cáº£'}</button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <TrendingUp size={16} className="text-gray-400" />
                            <select
                                value={sort}
                                onChange={e => handleSortChange(e.target.value)}
                                className="bg-[#2a2a2a] text-gray-300 text-sm border border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        {hasFilters && (
                            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition">
                                <X size={14} /> XÃ³a lá»c
                            </button>
                        )}
                    </div>
                </div>

                {/* Results info */}
                {!loading && !error && (
                    <p className="text-gray-500 text-sm mb-4">
                        {search && <span>Káº¿t quáº£ cho "<span className="text-purple-400">{search}</span>" â€” </span>}
                        <span className="text-gray-400">{totalMovies}</span> phim tÃ¬m tháº¥y
                    </p>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="bg-[#1a1a1a] rounded-xl overflow-hidden animate-pulse">
                                <div className="aspect-[2/3] bg-gray-800" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                                    <div className="h-2 bg-gray-800 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="text-center py-20">
                        <p className="text-red-400 text-lg mb-4">{error}</p>
                        <button onClick={loadMovies} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl transition">Thá»­ láº¡i</button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && movies.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg mb-2">KhÃ´ng tÃ¬m tháº¥y phim nÃ o.</p>
                        {hasFilters && <button onClick={clearFilters} className="text-purple-400 hover:text-purple-300 text-sm transition">XÃ³a bá»™ lá»c</button>}
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && movies.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                        </div>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;