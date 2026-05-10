<<<<<<< HEAD
import Karaoke from "@/src/components/lobby/Karaoke"
=======
import Karaoke from "@/src/components/lobby/karaoke-bar"
>>>>>>> 97a73763b00f25c245e564efaaafad059fac2ff8

export default async function Page({ params }: { params: { song_id: string } }) {
  const songId = (await params).song_id
  return <Karaoke songId={songId} />
}