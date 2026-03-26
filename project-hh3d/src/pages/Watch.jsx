import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { addToWatchHistory, getLocalWatchHistory, setLocalWatchHistory } from '../api/userLibraryApi';

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
  const navigate = useNavigate();
  const selectedEpisode = Number(episode);
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quality, setQuality] = useState('720p');
  const [streamInfo, setStreamInfo] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState('');

  useEffect(() => {
    const key = `viewed:${movieId}:${selectedEpisode}`;
    const lastAt = Number(sessionStorage.getItem(key) || 0);
    const now = Date.now();

    // Chỉ ghi nhận 1 lượt xem cho cùng 1 tập trong 15 giây ở cùng tab.
    if (now - lastAt < 15000) return;

    sessionStorage.setItem(key, String(now));
    axios.post(`${API}/api/movies/${movieId}/view`, { episode: selectedEpisode }).catch(console.error);
  }, [movieId, selectedEpisode]);

  useEffect(() => {
    if (!movieId || !selectedEpisode) return;
    const episodeRecord = episodes.find((ep) => Number(ep.episode_number) === selectedEpisode);

    const key = `history:${movieId}:${selectedEpisode}`;
    const lastAt = Number(sessionStorage.getItem(key) || 0);
    const now = Date.now();

    // Tránh spam ghi lịch sử khi user đổi chất lượng hoặc reload liên tục.
    if (now - lastAt < 10000) return;
    sessionStorage.setItem(key, String(now));

    if (token) {
      addToWatchHistory(Number(movieId), episodeRecord?.id || null).catch((err) => {
        console.error('Không thể lưu lịch sử xem:', err);
      });
      return;
    }

    if (!movie) return;

    const history = getLocalWatchHistory();
    const withoutCurrent = history.filter((item) => Number(item.id) !== Number(movieId));
    const next = {
      ...movie,
      watched_at: new Date().toISOString(),
      episode_number: selectedEpisode,
    };

    setLocalWatchHistory([next, ...withoutCurrent].slice(0, 100));
  }, [movieId, selectedEpisode, token, movie, episodes]);

  useEffect(() => {
    setQuality('720p');
  }, [selectedEpisode, movieId]);

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
  

  const foundEpisode = episodeMap.get(selectedEpisode);
  const availableQualities = foundEpisode?.available_qualities?.length
    ? foundEpisode.available_qualities
    : (foundEpisode?.sources || []).map((s) => s.quality);

  useEffect(() => {
    if (!foundEpisode) {
      setStreamInfo(null);
      return;
    }

    const fetchStream = async () => {
      setStreamLoading(true);
      setStreamError('');
      try {
        const res = await axios.get(`${API}/api/movies/${movieId}/episodes/${selectedEpisode}/stream`, {
          params: { quality },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setStreamInfo(res.data || null);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 402) {
          setStreamInfo(null);
          setStreamError(err?.response?.data?.message || 'Chất lượng này yêu cầu tài khoản VIP.');
        } else {
          setStreamInfo(null);
          setStreamError(err?.response?.data?.message || 'Không thể tải nguồn phát video');
        }
      } finally {
        setStreamLoading(false);
      }
    };

    fetchStream();
  }, [movieId, selectedEpisode, quality, token, foundEpisode]);

  const handleGoToVipCheckout = () => {
    navigate('/vip/checkout');
  };

  const embedUrl = getEmbedUrl(streamInfo?.video_url || foundEpisode?.video_url || '');
  const totalEpisodes = Number(movie?.total_episodes) || 0;

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

        <div className="mb-4 bg-[#111827] border border-gray-800 rounded-xl p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">Chọn chất lượng:</span>
          {['360p', '720p', '1080p', '4k'].map((q) => {
            const exists = availableQualities?.includes(q);
            const is4k = q === '4k';
            const locked4k = is4k && !user?.is_vip;
            return (
              <button
                key={q}
                type="button"
                disabled={!exists}
                onClick={() => setQuality(q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  quality === q
                    ? 'bg-orange-500 text-white border-orange-500'
                    : exists
                    ? 'bg-[#1c2333] text-gray-300 border-gray-700 hover:border-orange-500/60'
                    : 'bg-[#0f172a] text-gray-600 border-gray-800 cursor-not-allowed'
                }`}
              >
                {q.toUpperCase()} {locked4k ? '(VIP)' : ''}
              </button>
            );
          })}

          {!user?.is_vip && (
            <button
              type="button"
              onClick={handleGoToVipCheckout}
              className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-black transition"
            >
              Thanh toán VIP để xem 4K
            </button>
          )}
        </div>

        <div className="bg-black rounded-xl overflow-hidden aspect-video border border-gray-800">
          {streamLoading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
              Đang tải nguồn video...
            </div>
          ) : streamError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 gap-3">
              <p className="text-orange-300 text-base">{streamError}</p>
              {!user?.is_vip && quality === '4k' && (
                <button
                  type="button"
                  onClick={handleGoToVipCheckout}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-yellow-500 hover:bg-yellow-400 text-black transition"
                >
                  Chuyển tới trang thanh toán VIP
                </button>
              )}
            </div>
          ) : embedUrl ? (
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
