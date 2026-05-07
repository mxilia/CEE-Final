"use client"

interface Favorite {
  id: number;
  song_id: number;
  song_name: string;
}

{/*เดี๋ยวเปี่ยนเป็น  userId : number เพื่อ fetch favorite songs ในนี้*/}
export default function FavoriteSong({ favorite }: { favorite: Favorite }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Favorite Song</h2>
      <p className="text-lg">{favorite.song_name}</p>
    </div>
  );
}