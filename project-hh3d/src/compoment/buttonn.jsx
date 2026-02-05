import React from "react";

function MovieButton({ title, variant = "primary", icon: Icon, className = "" }) {
  // variant "primary" là màu xanh của bạn, "secondary" là màu tối trong ảnh mẫu
  const styles = variant === "primary" 
    ? "bg-[#26c6da] hover:bg-[#00acc1] text-white" 
    : "bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#26c6da] border border-[#26c6da]/30";

  return (
    <button className={`flex items-center justify-center gap-2 px-6 py-2 rounded-full transition-all duration-300 shadow-lg active:scale-95 min-w-[160px] ${styles} ${className}`}>
      {/* Nếu có Icon (như Plus, Play) thì hiện, không thì hiện icon mặc định của bạn */}
      {Icon ? <Icon size={18} /> : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      <span className="text-sm font-medium whitespace-nowrap">
        {title}
      </span>
    </button>
  );
}

export default MovieButton;