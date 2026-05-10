
import SearchBar from "@/src/components/home/search-bar";
import SongList from "@/src/components/home/song-list";
import { Suspense } from "react";


export default function Home() {
  return (
    <div className="flex flex-col gap-6 m-12">
      <Suspense>
        <SearchBar />
        <SongList />
      </Suspense>
    </div>
  );
}