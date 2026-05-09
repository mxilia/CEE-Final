import Link from "next/link";


export const SongBox = ({ song }: { song: { id: number; name: string } }) => {
    return (
        <Link href={`/lobby/${song.id}`} className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-300">{song.name}</h3>
        </Link>
    );
}