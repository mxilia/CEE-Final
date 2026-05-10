import FavoriteSong from "@/src/components/users/favorite-song";
import FullUser from "@/src/components/users/full-user";
import GraphHistory from "@/src/components/users/graph-history";
import PlayHistory from "@/src/components/users/play-history";

interface BestSong {
  id: number;
  name: string;
  score: number;
}

interface UserDataProps {
  id: number;
  name: string;
  profile_picture: string;
  Ranking: string;
  Streak: number;
  total_score: number;
  best_song: BestSong;
  sing_count: number;
}



const UserPage = async ({ params }: { params: Promise<{ name: string }> }) => {
  const name = (await params).name;

  const mockUserData: UserDataProps = {
    id: 1,
    name: name || "SingingStar",
    profile_picture: "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
    Ranking: "Global #123",
    Streak: 154,
    total_score: 12450,
    best_song: {
      id: 101,
      name: "Bohemian Rhapsody",
      score: 9850,
    },
    sing_count: 342,
  };

  const favoriteSongsMock = [
    { id: 1, song_id: 101, song_name: "No Batidao", song_artist: "ZXKAI, SLXUGTHER" },
    { id: 2, song_id: 102, song_name: "Ever-Forever", song_artist: "Billkin" },
    { id: 3, song_id: 103, song_name: "Double Take", song_artist: "Dhruv" },
    { id: 4, song_id: 104, song_name: "The Walls", song_artist: "Chase Atlantic" },
    { id: 5, song_id: 105, song_name: "Let It Be", song_artist: "The Beatles" },
    { id: 6, song_id: 106, song_name: "Hey Jude", song_artist: "The Beatles" },
  ];

  const playHistoryMock = [
    { id: 1, name: "No Batidao", artist: "ZXKAI, SLXUGTHER" },
    { id: 2, name: "Double Take", artist: "Dhruv" },
    { id: 3, name: "Thriller", artist: "Michael Jackson" },
    { id: 4, name: "Hotel California", artist: "Eagles" },
    { id: 5, name: "Sweet Child O' Mine", artist: "Guns N' Roses" },
    { id: 6, name: "Billie Jean", artist: "Michael Jackson" },
  ];

  return (
    <div className="min-h-screen bg-black text-neutral-200 px-4 py-8 sm:px-10 lg:px-16 font-sans">
      <div className="mx-auto flex flex-col gap-y-8 w-full max-w-5xl">
        <FullUser {...mockUserData} />
        <GraphHistory />
        <FavoriteSong favorites={favoriteSongsMock} />
        <PlayHistory playHistory={playHistoryMock} />
      </div>
    </div>
  );
};

export default UserPage;