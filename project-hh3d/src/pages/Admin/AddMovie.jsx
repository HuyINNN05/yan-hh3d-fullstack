import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../compoment/AdminLayout';
import { Save, X, Image as ImageIcon, Link as LinkIcon, Calendar, Film, ArrowLeft } from 'lucide-react';

function AddMovie() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [movieData, setMovieData] = useState({
    title: '', image: '', description: '', category_id: '',
    status: 'Đang tiến hành', episode_display: '', show_schedule: '', video_url: '' 
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Lỗi lấy category:", err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => setMovieData({ ...movieData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/admin/movies', movieData);
      alert("Đã đăng phim thành công!");
      navigate('/admin/movies');
    } catch (err) {
      alert("Lỗi rồi sếp!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-10 px-4">
        {/* Tiêu đề và nút thoát trên đầu */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/admin/movies')} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Thêm phim mới & Lịch chiếu</h2>
          </div>
          <button type="button" onClick={() => navigate('/admin/movies')} className="text-gray-500 hover:text-white flex items-center gap-2 font-bold uppercase text-[10px]">
            <X size={16} /> Hủy bỏ nhanh
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Poster Preview */}
          <div className="lg:col-span-4">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 sticky top-10">
              <div className="aspect-[2/3] bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center relative">
                {movieData.image ? <img src={movieData.image} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={64} className="text-gray-800" />}
              </div>
              <input type="file" accept="image/*" className="hidden" id="upload-poster" onChange={handleFileChange} />
              <label htmlFor="upload-poster" className="w-full mt-5 bg-cyan-600 text-black py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase cursor-pointer hover:bg-cyan-500">
                <ImageIcon size={14} /> Chọn ảnh từ máy
              </label>
            </div>
          </div>

          {/* Cột phải: Form nhập liệu */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
              <div className="grid grid-cols-1 gap-6 relative z-10">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Tên bộ phim</label>
                  <input type="text" required className="w-full bg-black border border-white/5 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500 font-bold"
                    placeholder="VD: Đấu Phá Thương Khung" onChange={(e) => setMovieData({...movieData, title: e.target.value})} />
                </div>

                <div className="bg-cyan-500/5 p-5 rounded-2xl border border-cyan-500/10">
                  <label className="text-[10px] font-black text-cyan-400 uppercase mb-2 block flex items-center gap-2"><LinkIcon size={12} /> Link Video</label>
                  <input type="text" required className="w-full bg-black border border-cyan-500/20 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500"
                    placeholder="Dán link..." onChange={(e) => setMovieData({...movieData, video_url: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <input type="text" placeholder="Lịch chiếu" className="bg-black border border-white/5 rounded-xl py-3 px-4 text-white" onChange={(e) => setMovieData({...movieData, show_schedule: e.target.value})} />
                  <input type="text" placeholder="Tập hiện tại" className="bg-black border border-white/5 rounded-xl py-3 px-4 text-white" onChange={(e) => setMovieData({...movieData, episode_display: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <select required className="bg-black border border-white/5 rounded-xl py-3 px-4 text-white" onChange={(e) => setMovieData({...movieData, category_id: e.target.value})}>
                    <option value="">-- Thể loại --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <select className="bg-black border border-white/5 rounded-xl py-3 px-4 text-white" onChange={(e) => setMovieData({...movieData, status: e.target.value})}>
                    <option value="Đang tiến hành">Đang tiến hành</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </div>

                <textarea rows="4" placeholder="Tóm tắt nội dung..." className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500 resize-none"
                    onChange={(e) => setMovieData({...movieData, description: e.target.value})}></textarea>
              </div>

              {/* ĐÂY LÀ CHỖ SỬA: Thêm nút Hủy to đùng ở đây */}
              <div className="mt-10 pt-6 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => navigate('/admin/movies')} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/5">
                   Hủy & Quay lại
                </button>
                <button type="submit" disabled={isSubmitting} className={`flex-[2] ${isSubmitting ? 'bg-gray-700' : 'bg-cyan-600 hover:bg-cyan-500'} text-black font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 transition-all`}>
                  {isSubmitting ? 'Đang lưu...' : <><Save size={20} /> Lưu và đăng phim</>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddMovie;