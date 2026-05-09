
import SearchBar from "@/src/components/home/search-bar";
import SongList from "@/src/components/home/song-list";


export default function Home() {
  return (
    <div className="flex flex-col gap-6 m-12">
      <SearchBar />
      <SongList />
    </div>
  );
}