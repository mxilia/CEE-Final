

export interface playedSong {
  id: number;
  name: string;
}

interface playHistoryProps {
  playHistory: playedSong[];
}


{/*เดี๋ยวเปี่ยนเป็น  userId : number เพื่อ fetch playHistory ในนี้*/}
export default function PlayHistory({ playHistory }: playHistoryProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Play History</h2>

        {playHistory.length > 0 ? (
            <div className=" pl-5">
            {playHistory.map((song) => (
                <div key={song.id} className="text-lg">
                {song.name}
                </div>
            ))}
            </div>
        ) : (
            <p className="text-lg">No play history.</p>
        )}

    </div>
  );
}