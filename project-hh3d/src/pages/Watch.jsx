import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

function getEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url.split('&')[0];

  const ytWatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (ytWatch?.[1]) return `https://www.youtube.com/embed/${ytWatch[1]}`;

  const ytShort = url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShort?.[1]) return `https://www.youtube.com/embed/${ytShort[1]}`;

  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}`;
  return url;
}

export default function Watch() {
  const { movieId, episode } = useParams();
  const selectedEpisode = Number(episode);

  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [movieRes, episodesRes] = await Promise.all([
          axios.get(`${API}/api/movies/${movieId}`),
          axios.get(`${API}/api/movies/${movieId}/episodes`),
        ]);
        setMovie(movieRes.data || null);
        setEpisodes(Array.isArray(episodesRes.data) ? episodesRes.data : []);
      } catch (err) {
        console.error(err);
        setMovie(null);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movieId]);

  const episodeMap = useMemo(() => {
    const map = new Map();
    episodes.forEach((ep) => map.set(Number(ep.episode_number), ep));
    return map;
  }, [episodes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] pt-16 flex items-center justify-center text-gray-400">
        Đang tải video...
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

  const foundEpisode = episodeMap.get(selectedEpisode);
  const embedUrl = getEmbedUrl(foundEpisode?.video_url || '');
  const totalEpisodes = Number(movie.total_episodes) || 0;

  return (
    <div className="min-h-screen bg-[#0d1117] pt-14 md:pt-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-white">Trang chủ</Link>
          <span className="text-gray-600">/</span>
          <Link to={`/movie/${movieId}`} className="text-gray-400 hover:text-white line-clamp-1">{movie.title}</Link>
          <span className="text-gray-600">/</span>
          <span className="text-orange-400">Tập {selectedEpisode}</span>
        </div>

        <h1 className="text-white text-xl md:text-2xl font-bold mb-4 line-clamp-2">
          {movie.title} - Tập {selectedEpisode}
        </h1>

        <div className="bg-black rounded-xl overflow-hidden aspect-video border border-gray-800">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              title={`${movie.title} - Tap ${selectedEpisode}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
              Sắp cập nhật
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-gray-300 text-sm mb-2">Danh sách tập</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((epNum) => {
              const isActive = epNum === selectedEpisode;
              const isReady = episodeMap.has(epNum);

              return (
                <Link
                  key={epNum}
                  to={`/watch/${movieId}/${epNum}`}
                  className={`py-2 px-2 rounded-lg text-sm text-center border transition ${
                    isActive
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : isReady
                      ? 'bg-[#1c2333] border-gray-700 text-gray-300 hover:border-orange-500/60'
                      : 'bg-[#111827] border-gray-800 text-gray-600'
                  }`}
                >
                  {epNum}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
