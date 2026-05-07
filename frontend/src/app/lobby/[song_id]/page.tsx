

/* Authen ว่าเล่นได้ป่าว ในหน้านี้  */
export default function LobbyPage({ params }: { params: { song_id: string } }) {
    return (
        <div>
            <h1>Lobby</h1>
            <p>Song ID: {params.song_id}</p>
        </div>
    );

}