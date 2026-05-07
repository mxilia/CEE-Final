"use client"

import { useRouter , useSearchParams , usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'


export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Handle search logic here

  }, [searchText]);


  const handleSearchSubmit = ()=>{
    // Update the URL with the search query
    router.push(`${pathname}?q=${searchText}`);
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search the Song"
        className="bg-gray-800 text-gray-300 placeholder:text-gray-500 
                    border border-gray-600 
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    p-2 rounded-lg w-full
                    "
        onChange={(e:any)=>setSearchText(e.target.value)}
      />
      <button className="absolute right-2 top-2 
                        text-gray-400 hover:text-white"
              onClick={handleSearchSubmit}
      > Search </button>
    </div>
  );
}