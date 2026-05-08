"use client"

import GraphHistory from "./graph-history";

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
        <div className="flex flex-col  border border-sky-500/20 bg-[#274D69] p-6 backdrop-blur shadow-[0_0_28px_rgba(56,189,248,0.12)]">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4 sm:gap-3">

                {/* Name */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-sky-200 sm:text-4xl">
                      {User.name}
                    </h1>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">

                  {/* Ranking */}
                  <div className="flex-col flex items-center ">
                      <div className="text-sm font-semibold text-sky-300/90">Ranking</div>
                      <div className="text-xl text-sky-200">{User.Ranking}</div>
                  </div>

                  {/* Streak */}
                  <div className="flex-col flex  items-center ">
                      <div className="text-sm font-semibold text-sky-300/90">Streak</div>
                      <div className="text-xl text-sky-200">{User.Streak}</div>
                  </div>

                 {/* Total Score */}
                  <div className="flex-col flex items-center ">
                    <div className="text-sm font-semibold text-sky-300/90">Total Score</div>
                    <div className="text-xl text-sky-200">{User.total_score}</div>
                  </div>
                </div>

            </div>
            {/* Avatar */}
            <div className="mt-2 w-24 h-24 rounded-xl border border-sky-500/30 bg-slate-900/40 flex items-center justify-center shadow-[0_0_18px_rgba(56,189,248,0.18)] sm:mt-0 sm:w-28 sm:h-28 md:w-32 md:h-32">
                <span className="text-xs text-sky-200/70">Avatar</span>
            </div>
          </div>
    
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:gap-12">

            {/* Best Song */}
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-sky-200 sm:text-xl">Best Song</h2>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-sky-300/90">Name:</span>
                <span className="text-base text-sky-200">{User.best_song.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-sky-300/90">Score:</span>
                <span className="text-base text-sky-200">{User.best_song.score}</span>
              </div>
            </div>

            {/*Sing count */}
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-sky-200 sm:text-xl">Sing Count</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-sky-300/90">Count:</span>
                <span className="text-base text-sky-200">{User.sing_count}</span>
              </div>
            </div>
            
          </div>

        </div>
      </>
  );
  
}