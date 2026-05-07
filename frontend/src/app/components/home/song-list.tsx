

let songs = [
    { id: 1, name: "Bohemian Rhapsody" },
    { id: 2, name: "Stairway to Heaven" },
]

export default function SongList() {
  
    return (
        <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Song List</h2>
        {songs.map((song) => (
            <p key={song.id} className="text-lg text-gray-300">
                {song.name}
            </p>
        ))}
        </div>
    );

}