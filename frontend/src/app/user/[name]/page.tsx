

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
  const name = (await params).name
 
  const mockUserData: UserDataProps = {
    id: 1,
    name: name,
    profile_picture: "https://example.com/avatar.jpg",
    Ranking: "#1",
    Streak: 5, 
    total_score: 12345,
    best_song: {
      id: 101,
      name: "Bohemian Rhapsody",
      score: 9876
    },
    sing_count: 50
  }


    return (
    <>
      <div className="min-h-screen bg-[rgb(10,25,40)] text-sky-200 px-4 sm:px-6 lg:px-12 py-8 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%)]">
        <div className="mx-auto flex flex-col gap-y-6 w-full max-w-6xl">
          <FullUser {...mockUserData} />
          <GraphHistory />

          <FavoriteSong favorite={{ id: 12, song_id: 101, song_name: "Bohemian Rhapsody" }} />
          <PlayHistory
            playHistory={[
              { id: 1, name: "Bohemian Rhapsody" },
              { id: 2, name: "Stairway to Heaven" },
              { id: 3, name: "Thriller" },
            ]}
          />
        </div>
      </div>
    </>
    );

};

export default UserPage;
