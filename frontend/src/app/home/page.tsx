
import SearchBar from "../../components/home/searchBar";
import SongList from "../../components/home/song-list";


export default function Home() {
  return (
    <div className="flex flex-col gap-6 m-12">
      <SearchBar />
      <SongList />
    </div>
  );
}