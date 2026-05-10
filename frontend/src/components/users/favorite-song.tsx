"use client";
import { useState } from "react";

export interface Favorite {
  id: number;
  song_id: number;
  song_name: string;
  song_artist: string;
}

export default function FavoriteSong({ favorites }: { favorites: Favorite[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayedSongs = showAll ? favorites : favorites.slice(0, 5);

  return (
    <div className="relative flex flex-col rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-6 sm:p-8 w-full">
      
      {/* Label Box */}
      <div className="absolute top-0 left-0 bg-neutral-800 text-neutral-300 text-sm font-extrabold px-6 py-1 rounded-br-2xl">
        ★
      </div>

      <h2 className="text-2xl font-black italic text-white mb-6 mt-2 tracking-wider uppercase">
        FAVORITE SONGS
      </h2>
      
      <div className="flex flex-col gap-3">
        {displayedSongs.map((song) => (
          <div 
            key={song.id} 
            className="flex items-center gap-5 rounded-2xl border border-neutral-800 bg-[#121212] p-4 hover:bg-[#1a1a1a] transition-colors duration-200"
          >
            <div className="flex-shrink-0 text-neutral-500 bg-[#050505] p-3 rounded-xl border border-neutral-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            
            <div className="flex flex-col flex-1">
              <span className="text-lg font-black italic text-white tracking-wide uppercase">{song.song_name}</span>
              <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest">{song.song_artist}</span>
            </div>

      
          </div>
        ))}
      </div>

      {favorites.length > 5 && (
        <button 
          onClick={() => setShowAll(!showAll)} 
          className="mt-5 w-full text-center py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-all duration-200 text-sm font-bold uppercase tracking-widest"
        >
          {showAll ? "SHOW LESS" : "SHOW MORE"}
        </button>
      )}
    </div>
  );
}