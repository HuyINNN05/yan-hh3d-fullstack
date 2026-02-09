import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../compoment/AdminLayout';
import { Film, Users, PlayCircle, Activity } from 'lucide-react';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalEpisodes: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/movies'),
          axios.get('http://localhost:5000/api/admin/users') 
        ]);
        
        // Lọc danh sách người dùng, chỉ giữ lại những người KHÔNG PHẢI admin
        const regularUsers = usersRes.data.filter(user => user.role !== 'admin');
        
        setStats({
          totalMovies: moviesRes.data.length,
          // CẬP NHẬT: Chỉ đếm số lượng người dùng bình thường (kết quả sẽ là 2)
          totalUsers: regularUsers.length, 
          totalEpisodes: 0
        });
      } catch (err) {
        console.error("Lỗi lấy thống kê:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Bảng điều khiển</h2>
        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Chào mừng Sếp trở lại phòng làm việc</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-cyan-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Tổng số phim</p>
              <h3 className="text-3xl font-black text-white mt-2">{stats.totalMovies}</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500">
              <Film size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase">
            <Activity size={12} /> Hệ thống ổn định
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-xl group hover:border-orange-500/50 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Người dùng (Thành viên)</p>
              {/* HIỂN THỊ: Đã trừ tài khoản Admin ra khỏi danh sách */}
              <h3 className="text-3xl font-black text-white mt-2">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 text-[10px] font-bold text-gray-600 uppercase italic">Không tính tài khoản Admin</div>
        </div>
      </div>

      <div className="bg-cyan-600/10 border border-cyan-500/20 p-6 rounded-2xl">
        <h4 className="text-cyan-400 font-bold uppercase text-xs mb-2 italic">Ghi chú cho Admin:</h4>
        <ul className="text-[11px] text-gray-400 space-y-2 list-disc pl-4 uppercase font-bold tracking-tighter">
          <li>Hãy đảm bảo link ảnh poster luôn hoạt động.</li>
          <li>Khi thêm phim mới, nhớ chọn đúng ID Thể loại.</li>
          <li>Cập nhật lịch chiếu đều đặn để giữ chân người xem.</li>
        </ul>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;