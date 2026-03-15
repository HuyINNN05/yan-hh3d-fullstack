import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../compoment/AdminLayout';
import { Save, X, Image as ImageIcon, ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react';

function AddMovie() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadStatus, setUploadStatus] = useState(''); // 'uploading' | 'done' | 'error'
  const [movieData, setMovieData] = useState({
    title: '', image: '', description: '', category_id: '',
    total_episodes: 1
  });

  useEffect(() => {
    axiosInstance.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Lỗi lấy category:", err));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Vui lòng chọn file ảnh!'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('Ảnh quá lớn! Tối đa 10MB.'); return; }

    setImagePreview(URL.createObjectURL(file));
    setUploadStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axiosInstance.post('/admin/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMovieData(prev => ({ ...prev, image: res.data.path }));
      setUploadStatus('done');
    } catch (err) {
      console.error('Lỗi upload:', err);
      setUploadStatus('error');
      alert('Lỗi upload ảnh! ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadStatus === 'uploading') { alert('Đang upload ảnh, chờ xíu!'); return; }
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/admin/movies', {
        title: movieData.title,
        description: movieData.description,
        image: movieData.image,
        category_id: Number(movieData.category_id),
        total_episodes: Number(movieData.total_episodes) || 0,
      });
      alert('Đã tạo bộ phim thành công! Bây giờ hãy thêm các tập phim.');
      navigate('/admin/movies');
    } catch (err) {
      console.error('Lỗi thêm phim:', err);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto pb-10 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/admin/movies')} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Thêm phim mới</h2>
          </div>
          <button type="button" onClick={() => navigate('/admin/movies')} className="text-gray-500 hover:text-white flex items-center gap-2 font-bold uppercase text-[10px]">
            <X size={16} /> Hủy bỏ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Poster */}
          <div className="lg:col-span-4">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 sticky top-10">
              <div className="aspect-[2/3] bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center relative">
                {imagePreview
                  ? <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                  : <ImageIcon size={64} className="text-gray-800" />
                }
                {uploadStatus === 'uploading' && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-cyan-400 font-bold">Đang upload...</span>
                  </div>
                )}
                {uploadStatus === 'done' && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                    <AlertCircle size={16} className="text-white" />
                  </div>
                )}
              </div>

              <input type="file" accept="image/*" className="hidden" id="upload-poster" onChange={handleFileChange} />
              <label htmlFor="upload-poster" className="w-full mt-5 bg-cyan-600 text-black py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase cursor-pointer hover:bg-cyan-500 transition-colors">
                <Upload size={14} /> Chọn ảnh từ máy (tối đa 10MB)
              </label>

              <div className="mt-3">
                <p className="text-[10px] text-gray-600 text-center mb-2">— hoặc nhập link ảnh —</p>
                <input
                  type="text"
                  placeholder="https://... (URL externo) hoặc /image/ten-anh.jpg (local)"
                  className="w-full bg-black border border-white/5 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-cyan-500"
                  onChange={(e) => {
                    let imageUrl = e.target.value;
                    // Se for URL http/https, manter como está. Senão, manter path local
                    setMovieData(prev => ({ ...prev, image: imageUrl }));
                    setImagePreview(imageUrl);
                    setUploadStatus('');
                  }}
                  value={movieData.image}
                />
                {movieData.image && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    {movieData.image.includes('http') ? '🌐 URL externo' : '📁 Local'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
              <div className="grid grid-cols-1 gap-6">
                {/* Tên phim */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Tên bộ phim *</label>
                  <input type="text" required
                    className="w-full bg-black border border-white/5 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500 font-bold"
                    placeholder="VD: Đấu Phá Thương Khung"
                    onChange={(e) => setMovieData(prev => ({ ...prev, title: e.target.value }))} />
                </div>

                <div className="bg-cyan-500/5 p-5 rounded-2xl border border-cyan-500/10">
                  <p className="text-[10px] text-cyan-300">
                    Sau khi lưu bộ phim, bạn thêm tập bằng nút "Thêm tập" ở trang danh sách phim.
                  </p>
                </div>

                {/* Số lượng tập */}
                <div>
                  <label className="text-[10px] font-black text-cyan-400 uppercase mb-2 flex items-center gap-1 block">
                    📺 Số lượng tập tối đa *
                  </label>
                  <p className="text-[10px] text-gray-400 mb-2">Đây là tổng số tập sẽ có của bộ phim (tập 1 đến tập này)</p>
                  <input type="number" min="1" max="999" required placeholder="VD: 12"
                    className="w-full bg-black border border-cyan-500/30 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-cyan-500"
                    value={movieData.total_episodes}
                    onChange={(e) => setMovieData(prev => ({ ...prev, total_episodes: parseInt(e.target.value) || 1 }))} />
                </div>

                {/* Thể loại */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Thể loại *</label>
                    <select required
                      className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-white"
                      value={movieData.category_id}
                      onChange={(e) => setMovieData(prev => ({ ...prev, category_id: e.target.value }))}>
                      <option value="">-- Chọn --</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Mô tả / Tóm tắt</label>
                  <textarea rows="4"
                    placeholder="Tóm tắt nội dung..."
                    className="w-full bg-black border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-cyan-500 resize-none"
                    onChange={(e) => setMovieData(prev => ({ ...prev, description: e.target.value }))}></textarea>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                <button type="button" onClick={() => navigate('/admin/movies')}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/5">
                  Hủy & Quay lại
                </button>
                <button type="submit" disabled={isSubmitting || uploadStatus === 'uploading'}
                  className={`flex-[2] ${(isSubmitting || uploadStatus === 'uploading') ? 'bg-gray-700 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'} text-black font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-3 transition-all`}>
                  {isSubmitting ? 'Đang lưu...' : uploadStatus === 'uploading' ? 'Chờ upload ảnh...' : <><Save size={20} /> Lưu và đăng phim</>}
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
