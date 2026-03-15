import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';

const API = import.meta.env.VITE_API_URL || '';

export default function Detail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [movieRes, episodesRes] = await Promise.all([
          axios.get(`${API}/api/movies/${id}`),
          axios.get(`${API}/api/movies/${id}/episodes`),
        ]);

        const movieData = movieRes.data;
        setMovie(movieData);
        setEpisodes(Array.isArray(episodesRes.data) ? episodesRes.data : []);

        if (movieData?.category_id) {
          const relatedRes = await axios.get(`${API}/api/movies/category/${movieData.category_id}`);
          const relatedData = Array.isArray(relatedRes.data) ? relatedRes.data : [];
          setRelated(relatedData.filter((item) => String(item.id) !== String(id)).slice(0, 12));
        } else {
          setRelated([]);
        }
      } catch (err) {
        console.error(err);
        setMovie(null);
        setEpisodes([]);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const episodeMap = useMemo(() => {
    const map = new Map();
    episodes.forEach((ep) => map.set(Number(ep.episode_number), ep));
    return map;
  }, [episodes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] pt-16 flex items-center justify-center text-gray-400">
        Đang tải phim...
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0d1117] pt-16 flex flex-col items-center justify-center gap-3 text-gray-400">
        <p>Không tìm thấy phim.</p>
        <Link to="/" className="text-orange-400 hover:text-orange-300">Về trang chủ</Link>
      </div>
    );
  }

  const poster = movie.poster || movie.image;
  const totalEpisodes = Number(movie.total_episodes) || 0;

  return (
    <div className="min-h-screen bg-[#0d1117] pt-14 md:pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-2xl overflow-hidden border border-gray-800 bg-[#111827]">
              {poster ? (
                <img
                  src={poster}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300x450/111827/374151?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-900" />
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h1 className="text-white text-2xl md:text-3xl font-bold">{movie.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {totalEpisodes} tập
              </span>
              {movie.category_name && (
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {movie.category_name}
                </span>
              )}
            </div>

            <p className="text-gray-300 text-sm md:text-base mt-4 leading-relaxed whitespace-pre-line">
              {movie.description || 'Chưa có mô tả.'}
            </p>

            <div className="mt-8">
              <h2 className="text-white font-semibold mb-3">Danh sách tập</h2>

              {totalEpisodes === 0 ? (
                <div className="bg-[#111827] border border-gray-800 rounded-xl p-4 text-gray-400">
                  Phim đang cập nhật
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((epNum) => {
                    const hasVideo = episodeMap.has(epNum);
                    return (
                      <Link
                        key={epNum}
                        to={`/watch/${movie.id}/${epNum}`}
                        className={`py-2 px-2 rounded-lg text-sm text-center border transition ${
                          hasVideo
                            ? 'bg-[#1c2333] text-gray-200 border-gray-700 hover:border-orange-500/60 hover:text-white'
                            : 'bg-[#111827] text-gray-600 border-gray-800'
                        }`}
                      >
                        {epNum}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="text-white text-lg font-semibold mb-4">Phim liên quan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {related.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
