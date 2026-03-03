import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    fetchMovies,
    createMovie,
    updateMovie,
    deleteMovie,
} from '../../api/movieApi';
import {
    Film, Plus, Pencil, Trash2, X, LogOut,
    Search, AlertCircle, CheckCircle, Users, Eye,
} from 'lucide-react';

const EMPTY_FORM = {
    title: '',
    description: '',
    image: '',
    video_url: '',
    category_id: '',
    quality: '',
    status: 'Ongoing',
    episode_display: '',
};

const CATEGORIES = [
    { id: 1, name: 'Huyễn Huyễn' },
    { id: 2, name: 'Xuyên Không' },
    { id: 3, name: 'Trùng Sinh' },
    { id: 4, name: 'Tiên Hiệp' },
    { id: 5, name: 'Cổ Trang' },
    { id: 6, name: 'Anime 3D' },
    { id: 7, name: 'Anime 4K' },
    { id: 8, name: 'Hoạt hình 2D' },
];
const STATUSES = ['Ongoing', 'Completed', 'Upcoming'];
const QUALITIES = ['HD', 'FHD', '4K', 'CAM'];

// ─── Reusable Modal ───────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                    <X size={20} />
                </button>
            </div>
            <div className="p-5">{children}</div>
        </div>
    </div>
);

// ─── Movie Form ───────────────────────────────────────────────────────────────
const MovieForm = ({ initial, onSubmit, onClose, loading }) => {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Tên phim không được để trống';
        if (!form.image.trim()) e.image = 'URL ảnh không được để trống';
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(ev => { const n = {...ev}; delete n[name]; return n; });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        onSubmit(form);
    };

    const inputClass = (field) =>
        `w-full bg-[#2a2a2a] text-white placeholder-gray-500 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
            errors[field] ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-purple-500'
        }`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">Tên phim *</label>
                <input name="title" value={form.title} onChange={handleChange}
                    placeholder="Nhập tên phim..." className={inputClass('title')} />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">Thể loại</label>
                    <select name="category_id" value={form.category_id} onChange={handleChange}
                        className="w-full bg-[#2a2a2a] text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
                        <option value="">-- Chọn thể loại --</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">Trạng thái</label>
                    <select name="status" value={form.status} onChange={handleChange}
                        className="w-full bg-[#2a2a2a] text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">Chất lượng</label>
                    <select name="quality" value={form.quality} onChange={handleChange}
                        className="w-full bg-[#2a2a2a] text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
                        <option value="">-- Chọn chất lượng --</option>
                        {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">Hiển thị tập</label>
                    <input name="episode_display" value={form.episode_display} onChange={handleChange}
                        placeholder="VD: Tập 12" className={inputClass('episode_display')} />
                </div>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">URL ảnh bìa *</label>
                <input name="image" value={form.image} onChange={handleChange}
                    placeholder="https://..." className={inputClass('image')} />
                {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">URL video</label>
                <input name="video_url" value={form.video_url} onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..." className={inputClass('video_url')} />
                <p className="text-gray-600 text-xs mt-1">Hỗ trợ YouTube embed hoặc link video trực tiếp</p>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">Mô tả</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                    rows={4} placeholder="Nội dung phim..."
                    className="w-full bg-[#2a2a2a] text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none" />
            </div>
            {form.image && (
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">Preview ảnh</label>
                    <img src={form.image} alt="preview"
                        className="w-28 rounded-xl border border-gray-700 object-cover"
                        onError={e => { e.target.style.display = 'none'; }} />
                </div>
            )}
            <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition">
                    {loading ? 'Đang lưu...' : (initial ? 'Cập nhật' : 'Thêm phim')}
                </button>
                <button type="button" onClick={onClose}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-xl font-medium text-sm transition">
                    Hủy
                </button>
            </div>
        </form>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [movies,      setMovies]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState('');
    const [toast,       setToast]       = useState(null);

    const [search,       setSearch]       = useState('');
    const [showAdd,      setShowAdd]      = useState(false);
    const [editTarget,   setEditTarget]   = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetchMovies({});
            setMovies(res.data.data || []);
        } catch {
            setError('Không thể tải danh sách phim.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAdd = async (form) => {
        setSaving(true);
        try {
            await createMovie(form);
            await load();
            setShowAdd(false);
            showToast('success', 'Thêm phim thành công!');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Thêm phim thất bại.');
        } finally { setSaving(false); }
    };

    const handleUpdate = async (form) => {
        setSaving(true);
        try {
            await updateMovie(editTarget.id, form);
            await load();
            setEditTarget(null);
            showToast('success', 'Cập nhật phim thành công!');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Cập nhật thất bại.');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await deleteMovie(deleteTarget);
            await load();
            setDeleteTarget(null);
            showToast('success', 'Đã xóa phim!');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Xóa thất bại.');
        } finally { setSaving(false); }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const filtered = movies.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.category_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalViews = movies.reduce((acc, m) => acc + (m.views || 0), 0);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Top Bar */}
            <header className="bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <Film className="text-purple-400" size={24} />
                    <span className="font-bold text-lg">HH3D Admin</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm hidden sm:block">
                        Xin chào, <span className="text-purple-300 font-medium">{user?.email}</span>
                    </span>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition">
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            </header>

            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                    toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {toast.msg}
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: Film,  label: 'Tổng phim',     value: movies.length,               color: 'purple' },
                        { icon: Eye,   label: 'Tổng lượt xem', value: totalViews.toLocaleString(), color: 'blue'   },
                        { icon: Users, label: 'Admin',         value: user?.email?.split('@')[0],   color: 'green'  },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5">
                            <div className={`text-${color}-400 mb-2`}><Icon size={20} /></div>
                            <p className="text-gray-500 text-xs mb-1">{label}</p>
                            <p className="text-white font-bold text-xl">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm kiếm tên phim, thể loại..."
                            className="w-full bg-[#1a1a1a] text-white placeholder-gray-500 border border-gray-700 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap">
                        <Plus size={16} /> Thêm phim
                    </button>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-700 text-red-400 rounded-xl p-4 mb-4 flex items-center gap-2 text-sm">
                        <AlertCircle size={16} /> {error}
                        <button onClick={load} className="ml-auto underline hover:text-red-300">Thử lại</button>
                    </div>
                )}

                {/* Table */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#111] text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-4 py-3 text-left">Phim</th>
                                    <th className="px-4 py-3 text-left hidden md:table-cell">Thể loại</th>
                                    <th className="px-4 py-3 text-right hidden sm:table-cell">Lượt xem</th>
                                    <th className="px-4 py-3 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="border-t border-gray-800 animate-pulse">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 bg-gray-800 rounded-lg" />
                                                    <div className="space-y-2">
                                                        <div className="h-3 bg-gray-700 rounded w-32" />
                                                        <div className="h-2 bg-gray-800 rounded w-20" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell"><div className="h-3 bg-gray-800 rounded w-16" /></td>
                                            <td className="px-4 py-3 hidden sm:table-cell"><div className="h-3 bg-gray-800 rounded w-12 ml-auto" /></td>
                                            <td className="px-4 py-3"><div className="h-8 bg-gray-800 rounded w-24 mx-auto" /></td>
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-16 text-center text-gray-500 italic">
                                            {search ? `Không tìm thấy kết quả cho "${search}"` : 'Chưa có phim nào. Hãy thêm phim đầu tiên!'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(movie => (
                                        <tr key={movie.id} className="border-t border-gray-800 hover:bg-white/[0.02] transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={movie.image || 'https://placehold.co/40x56?text=N/A'}
                                                        alt={movie.title}
                                                        className="w-10 h-14 object-cover rounded-lg border border-gray-700 flex-shrink-0"
                                                        onError={e => { e.target.src = 'https://placehold.co/40x56?text=N/A'; }} />
                                                    <div>
                                                        <p className="font-medium text-white line-clamp-1">{movie.title}</p>
                                                        <p className="text-gray-500 text-xs mt-0.5">ID: {movie.id} {movie.quality && <span className="ml-1 text-cyan-500">{movie.quality}</span>}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                {movie.category_name ? (
                                                    <span className="bg-purple-600/20 border border-purple-600/40 text-purple-300 px-2 py-0.5 rounded-full text-xs">
                                                        {movie.category_name}
                                                    </span>
                                                ) : <span className="text-gray-600 text-xs italic">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">
                                                {(movie.views || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => setEditTarget(movie)}
                                                        className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-blue-600/30">
                                                        <Pencil size={12} /> Sửa
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(movie.id)}
                                                        className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-red-600/30">
                                                        <Trash2 size={12} /> Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && (
                        <div className="px-4 py-3 border-t border-gray-800 text-gray-500 text-xs">
                            Hiển thị {filtered.length} / {movies.length} phim
                            {search && ` (lọc theo "${search}")`}
                        </div>
                    )}
                </div>
            </main>

            {showAdd && (
                <Modal title="Thêm phim mới" onClose={() => setShowAdd(false)}>
                    <MovieForm onSubmit={handleAdd} onClose={() => setShowAdd(false)} loading={saving} />
                </Modal>
            )}

            {editTarget && (
                <Modal title={`Chỉnh sửa: ${editTarget.title}`} onClose={() => setEditTarget(null)}>
                    <MovieForm initial={editTarget} onSubmit={handleUpdate} onClose={() => setEditTarget(null)} loading={saving} />
                </Modal>
            )}

            {deleteTarget !== null && (
                <Modal title="Xác nhận xóa" onClose={() => setDeleteTarget(null)}>
                    <div className="text-center py-4">
                        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                        <p className="text-gray-300 mb-2">Bạn có chắc muốn xóa phim này không?</p>
                        <p className="text-gray-500 text-sm mb-6">Hành động này không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button onClick={handleDelete} disabled={saving}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition">
                                {saving ? 'Đang xóa...' : 'Xóa'}
                            </button>
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-xl font-medium text-sm transition">
                                Hủy
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;
