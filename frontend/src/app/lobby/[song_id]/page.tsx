import Karaoke from "@/src/components/lobby/Karaoke"

export default async function Page({ params }: { params: { song_id: string } }) {
  const songId = (await params).song_id
  return <Karaoke songId={songId} />
}