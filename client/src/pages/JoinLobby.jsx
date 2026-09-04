import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function JoinLobby({ socket }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedGame, setSelectedGame] = useState('monopoly'); // 'monopoly' | 'chess' | 'uno'
  const [joinedRoom, setJoinedRoom] = useState(null);

  useEffect(() => {
    const queryRoom = searchParams.get('room');
    if (queryRoom) {
      setRoomCode(queryRoom.toUpperCase());
    }
  }, [searchParams]);

  const handleCreateRoom = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(newCode);
    setJoinedRoom(newCode);

    socket.emit('create_room', { room: newCode, playerName });
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return;
    const cleanCode = roomCode.trim().toUpperCase();
    setJoinedRoom(cleanCode);

    socket.emit('join_room', { room: cleanCode, playerName });
  };

  const handleStartGame = (gameType) => {
    if (!joinedRoom) return;
    socket.emit('start_game_session', { room: joinedRoom, gameType });
    navigate(`/game/${joinedRoom}?player=${socket.id}&type=${gameType}`);
  };

  const shareableLink = `${window.location.origin}/join?room=${roomCode}`;

  return (
    <div style={{ padding: 20, color: '#fff', background: '#0f172a', minHeight: '100vh' }}>
      <h2>Game Lobby</h2>

      {!joinedRoom ? (
        <div>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <br /><br />
          <button onClick={handleCreateRoom}>Create New Lobby</button>
          <hr />
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
          <button onClick={handleJoinRoom}>Join Room Code</button>
        </div>
      ) : (
        <div>
          <h3>Lobby Code: <span data-testid="room-code-display">{joinedRoom}</span></h3>
          <p>Share Link: <input readOnly value={shareableLink} data-testid="share-link-input" /></p>
          <button onClick={() => navigator.clipboard.writeText(shareableLink)}>Copy Invite Link</button>

          <h4>Select Game to Play:</h4>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleStartGame('monopoly')}>Monopoly</button>
            <button onClick={() => handleStartGame('chess')}>Chess</button>
            <button onClick={() => handleStartGame('uno')}>Card Game / Uno</button>
          </div>
        </div>
      )}
    </div>
  );
}