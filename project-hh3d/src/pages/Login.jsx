import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom'; // QUAN TRỌNG: Phải có dòng này

function Login() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center pt-10 px-4 font-sans">
      <div className="flex items-center gap-3 text-white text-3xl font-bold mb-8">
        <User size={32} />
        <h1>Đăng nhập</h1>
      </div>

      <div className="w-full max-w-[500px] bg-[#222] p-10 rounded-lg shadow-2xl border border-gray-800">
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-bold block">Email</label>
            <input 
              type="text" 
              className="w-full bg-white text-black p-3 rounded outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-bold block">Mật khẩu</label>
            <input 
              type="password" 
              className="w-full bg-white text-black p-3 rounded outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>

          <div className="flex justify-end items-center gap-4 pt-4">
            <button type="button" className="text-gray-400 hover:text-white text-sm">
              Quên mật khẩu?
            </button>
            <button type="submit" className="bg-[#333] hover:bg-[#444] text-white px-8 py-2 rounded-md font-bold border border-gray-600 uppercase tracking-wider transition-colors">
              Đăng nhập
            </button>
          </div>

          {/* Đăng ký - Đã sửa lỗi bọc thẻ Link */}
          <div className="pt-8 border-t border-gray-700 text-gray-300 text-sm flex items-center">
            Chưa có tài khoản? 
            <Link to="/Accout">
               <button type="button" className="bg-[#ff5722] hover:bg-[#e64a19] text-white px-4 py-1 rounded ml-2 font-bold transition-colors uppercase">
                 Đăng ký
               </button>
            </Link>
            <span className="ml-2 italic">ngay</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;