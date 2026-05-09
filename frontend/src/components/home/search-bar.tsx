"use client"

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/src/lib/utils'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // Sync state with URL query parameter
  const [searchText, setSearchText] = useState(searchParams.get('q') || '')

  const handleSearchSubmit = () => {
    const params = new URLSearchParams(searchParams)
    if (searchText) {
      params.set('q', searchText)
    } else {
      params.delete('q')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  const clearSearch = () => {
    setSearchText('')
    router.push(pathname)
  }

  return (
    <div className="relative w-full group">
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors">
        <Search size={18} />
      </div>

      <input
        type="text"
        value={searchText}
        placeholder="Search for a song or artist..."
        className={cn(
          "w-full bg-zinc-900/40 text-white placeholder:text-zinc-600",
          "border border-white/5 rounded-2xl py-4 pl-12 pr-24",
          "backdrop-blur-xl transition-all duration-300",
          "focus:outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10",
          "group-hover:border-white/10 shadow-2xl"
        )}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Action Buttons */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {searchText && (
          <button 
            onClick={clearSearch}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
        
        <button 
          onClick={handleSearchSubmit}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/5"
        >
          Find
        </button>
      </div>
    </div>
  )
}