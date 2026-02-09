import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../compoment/AdminLayout';
import { Search, Trash2, User, Mail, Shield, Calendar, UserCheck } from 'lucide-react';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // API này lát nữa mình sẽ viết ở Backend sau sếp nhé
      const res = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Sếp có chắc muốn xóa người dùng này không? Hành động này không thể hoàn tác!")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Lỗi xóa người dùng rồi sếp ơi!");
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Tiêu đề trang */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Quản lý người dùng</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Hệ thống thành viên
          </p>
        </div>
        
        {/* Thanh tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Tìm tên hoặc email..." 
            className="bg-[#111] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-cyan-500 outline-none w-80 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase">Thành viên</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase">Email</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase text-center">Vai trò</th>
              <th className="p-6 text-[10px] font-black text-gray-500 uppercase text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-black text-white text-sm uppercase italic">{user.username}</div>
                      <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">ID: #{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-gray-400 text-xs font-medium">{user.email}</td>
                <td className="p-6 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    <Shield size={10} />
                    {user.role || 'Member'}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-3 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;