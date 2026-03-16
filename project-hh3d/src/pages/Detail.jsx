import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import MovieCard from '../components/MovieCard';
import { Star, Trash2, Send } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ratings & Comments
  const [ratings, setRatings] = useState({ total_votes: 0, avg_rating: 0, five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0 });
  const [userRating, setUserRating] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Auth context
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [movieRes, episodesRes, ratingsRes, commentsRes] = await Promise.all([
          axios.get(`${API}/api/movies/${id}`),
          axios.get(`${API}/api/movies/${id}/episodes`),
          axios.get(`${API}/api/movies/${id}/ratings`),
          axios.get(`${API}/api/movies/${id}/comments`),
        ]);

        const movieData = movieRes.data;
        setMovie(movieData);
        setEpisodes(Array.isArray(episodesRes.data) ? episodesRes.data : []);
        setRatings(ratingsRes.data || {});
        setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);

        // Load user's rating if logged in
        if (user?.id) {
          try {
            const myRatingRes = await axiosInstance.get(`/movies/${id}/my-rating`);
            setUserRating(myRatingRes.data?.rating || null);
          } catch (err) {
            console.warn('Could not load user rating:', err);
          }
        }

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
  }, [id, user?.id]);

  const episodeMap = useMemo(() => {
    const map = new Map();
    episodes.forEach((ep) => map.set(Number(ep.episode_number), ep));
    return map;
  }, [episodes]);

  const handleRating = async (newRating) => {
    if (!user?.id) {
      // Save return URL and navigate to login
      window.localStorage.setItem('returnTo', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      await axiosInstance.post(`/movies/${id}/ratings`, { rating: newRating });
      setUserRating(newRating);
      
      // Reload ratings
      const ratingsRes = await axios.get(`${API}/api/movies/${id}/ratings`);
      setRatings(ratingsRes.data || {});
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi đánh giá');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      window.localStorage.setItem('returnTo', window.location.pathname);
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      alert('Vui lòng nhập bình luận');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await axiosInstance.post(`/movies/${id}/comments`, { content: newComment.trim() });
      setNewComment('');
      
      // Reload comments
      const commentsRes = await axios.get(`${API}/api/movies/${id}/comments`);
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thêm bình luận');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Xác nhận xóa bình luận?')) return;

    try {
      await axiosInstance.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi xóa bình luận');
    }
  };

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
  const avgRating = Number(ratings?.avg_rating ?? 0) || 0;
  const totalVotes = Number(ratings?.total_votes ?? 0) || 0;

  return (
    <div className="min-h-screen bg-[#0d1117] pt-14 md:pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Phim Info */}
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
            
            {/* Ratings */}
            <div className="mt-4 bg-[#111827] border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.ceil(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-300">
                    <span className="text-yellow-400 font-bold text-lg">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-500"> / 5.0</span> ({totalVotes} đánh giá)
                  </div>
                </div>
              </div>

              {user?.id && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Đánh giá của bạn:</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className={`transition ${userRating >= star ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-300'}`}
                      >
                        <Star
                          size={24}
                          className={userRating >= star ? 'fill-yellow-400' : ''}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
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

        {/* Comments Section */}
        <div className="mt-12">
          <h3 className="text-white text-xl font-bold mb-6">Bình luận ({comments.length})</h3>

          {user?.id ? (
            <form onSubmit={handleAddComment} className="mb-8 bg-[#111827] border border-gray-700 rounded-xl p-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                maxLength={1000}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-cyan-500 outline-none resize-none"
                rows="3"
              />
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">{newComment.length}/1000</span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                    newComment.trim() && !isSubmittingComment
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-black'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} /> {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 bg-[#111827] border border-orange-500/30 rounded-xl p-4 text-center text-gray-400">
              <p><Link to="/login" className="text-orange-400 hover:text-orange-300 font-semibold">Đăng nhập</Link> để viết bình luận</p>
            </div>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-[#111827] border border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <img
                        src={comment.avatar || 'https://placehold.co/40x40/374151/9ca3af'}
                        alt={comment.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{comment.username}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(comment.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-gray-300 text-sm mt-3 break-words">{comment.content}</p>
                      </div>
                    </div>
                    {(user?.id === comment.user_id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-400 hover:text-red-300 p-2 transition"
                        title="Xóa bình luận"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Movies */}
        {related.length > 0 && (
          <div className="mt-12">
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
