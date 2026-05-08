'use client'

import { env } from '@/src/config/env'
import useSWR from 'swr'

export default function SongList() {
    const { data, error, isLoading } = useSWR(
        `${env.API_URL}/songs`,
        (url) => fetch(url).then((res) => res.json())
    )

    if (isLoading) return <p>Loading...</p>
    if (error) return <p>Error</p>

    const songs = data.data.flatMap((song: { id: number; title: string }) => ({
        id: song.id,
        name: song.title
    }))
    console.log(songs)

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Song List</h2>
            {songs?.map((song: { id: number; name: string }) => (
                <p key={song.id} className="text-lg text-gray-300">
                    {song.name}
                </p>
            ))}
            {songs.length === 0 && (
                <p className="text-lg text-gray-300">No songs available</p>
            )}
        </div>
    );

}