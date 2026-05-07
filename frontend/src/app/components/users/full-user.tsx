"use client"

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


{/*เดี๋ยวเปี่ยนเป็น  userId : number เพื่อ fetch UserData ในนี้*/}
export default function FullUser( User : UserDataProps  ) {
  return (
      <>

        
        <div className="flex justify-between ">

          <div className="flex flex-col gap-3">

              {/* Name */}
              <div className="flex flex-col gap-2">
                  <h1 className="text-3xl font-bold">Name: {User.name}</h1>
              </div>

              {/* Ranking */}
              <div className="flex items-center gap-2">
                  <span className="text-medium font-semibold">Ranking:</span>
                  <span className="text-lg">{User.Ranking}</span>
              </div>

              {/* Streak */}
              <div className="flex items-left gap-20  ">
                  <div className="flex items-center gap-2">
                    <span className="text-medium font-semibold">Streak:</span>
                    <span className="text-lg">{User.Streak}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-medium font-semibold">Total Score:</span>
                    <span className="text-lg">{User.total_score}</span>
                  </div> 
              </div>    

          </div>
       

          <div className="w-32 h-32 border border-black flex items-center justify-center">
              <span className="text-sm">Avatar</span>
          </div>

        </div>
  
        
      </>
  );
  
}