

import FavoriteSong from "@/app/components/users/favoriteSong";
import FullUser from "@/app/components/users/full-user";
import PlayHistory from "@/app/components/users/play-history";

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
      <div className="flex-col gap-y-6 m-12">
        <FullUser {...mockUserData} />
        <FavoriteSong favorite={{ id: 12, song_id: 101, song_name: "Bohemian Rhapsody" }} />     
        <PlayHistory playHistory={[
          { id: 1, name: "Bohemian Rhapsody" },
          { id: 2, name: "Stairway to Heaven" },
          { id: 3, name: "Thriller" }
        ]} />
      </div>
    </>
    );

};

export default UserPage;
