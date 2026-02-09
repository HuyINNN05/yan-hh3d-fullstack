import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Play, Calendar, Clock, Eye } from 'lucide-react';

function MoviesSingle() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/movies/${id}`)
      .then(res => {
        setMovie(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-white text-center mt-20">Đang tải phim...</div>;
  if (!movie) return <div className="text-white text-center mt-20">Không tìm thấy phim!</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen pb-10">
      {/* PLAYER VIDEO */}
      <div className="w-full bg-black aspect-video md:aspect-[21/9] flex justify-center items-center shadow-2xl border-b border-gray-800">
         {movie.video_url ? (
           <iframe 
             src={movie.video_url} 
             title={movie.title}
             className="w-full h-full"
             allow="autoplay; encrypted-media"
             allowFullScreen
           ></iframe>
         ) : (
           <div className="text-gray-500 flex flex-col items-center">
             <Play size={48} className="mb-2 opacity-50"/>
             <p>Chưa có link video</p>
           </div>
         )}
      </div>

      {/* THÔNG TIN */}
      <div className="container mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 hidden md:block">
           <img src={movie.image} alt={movie.title} className="rounded-lg shadow-lg border border-gray-700"/>
        </div>
        
        <div className="flex-1 text-gray-300">
           <h1 className="text-4xl font-bold text-[#26c6da] mb-2">{movie.title}</h1>
           <p className="italic text-gray-500 mb-4">{movie.other_name || "Tên khác: Đang cập nhật"}</p>
           
           <div className="flex gap-4 mb-6 text-sm">
             <span className="flex items-center gap-1"><Calendar size={16}/> {movie.year || "2024"}</span>
             <span className="flex items-center gap-1"><Clock size={16}/> {movie.duration || "N/A"}</span>
             <span className="flex items-center gap-1"><Eye size={16}/> {movie.views || 0} View</span>
           </div>

           <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
             <h3 className="text-xl font-bold text-white mb-2">Nội dung chính</h3>
             <p className="leading-relaxed">
               {movie.description || "Nội dung đang được cập nhật..."}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}

export default MoviesSingle;