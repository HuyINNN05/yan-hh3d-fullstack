import React from 'react';

export default function MovieCardSkeleton() {
  return (
    <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-800/50 animate-pulse">
      <div className="aspect-[2/3] bg-gray-800" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-gray-800 rounded w-4/5" />
        <div className="h-3 bg-gray-800 rounded w-3/5" />
        <div className="h-3 bg-gray-800 rounded w-2/5" />
      </div>
    </div>
  );
}
