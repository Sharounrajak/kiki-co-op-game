import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import JoinLobby from './JoinLobby';

const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  id: 'player-socket-123',
};

const renderLobby = (initialEntry = '/join') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/join" element={<JoinLobby socket={mockSocket} />} />
        <Route path="/game/:room" element={<div>Game Screen Active</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Lobby & Invite System Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('1. Auto-fills Room Code from URL query param (Invite Link flow)', () => {
    renderLobby('/join?room=GAME99');

    const codeInput = screen.getByPlaceholderText(/Enter Room Code/i);
    expect(codeInput.value).toBe('GAME99');
  });

  test('2. Manual Room Code Entry & Join trigger socket emit', () => {
    renderLobby('/join');

    const nameInput = screen.getByPlaceholderText(/Your Name/i);
    const codeInput = screen.getByPlaceholderText(/Enter Room Code/i);
    const joinBtn = screen.getByRole('button', { name: /Join Room Code/i });

    fireEvent.change(nameInput, { target: { value: 'Player 2' } });
    fireEvent.change(codeInput, { target: { value: 'ROOM123' } });
    fireEvent.click(joinBtn);

    expect(mockSocket.emit).toHaveBeenCalledWith('join_room', {
      room: 'ROOM123',
      playerName: 'Player 2',
    });
    expect(screen.getByTestId('room-code-display')).toHaveTextContent('ROOM123');
  });

  test('3. Generates shareable link and allows launching any of the 3 games', () => {
    renderLobby('/join');

    const createBtn = screen.getByRole('button', { name: /Create New Lobby/i });
    fireEvent.click(createBtn);

    expect(mockSocket.emit).toHaveBeenCalledWith('create_room', expect.any(Object));

    // Check share link input is present
    const linkInput = screen.getByTestId('share-link-input');
    expect(linkInput.value).toContain('/join?room=');

    // Check game selection options exist
    const monopolyBtn = screen.getByRole('button', { name: /Monopoly/i });
    const chessBtn = screen.getByRole('button', { name: /Chess/i });
    const unoBtn = screen.getByRole('button', { name: /Card Game \/ Uno/i });

    expect(monopolyBtn).toBeInTheDocument();
    expect(chessBtn).toBeInTheDocument();
    expect(unoBtn).toBeInTheDocument();

    // Trigger game launch emission
    fireEvent.click(chessBtn);
    expect(mockSocket.emit).toHaveBeenCalledWith('start_game_session', expect.objectContaining({
      gameType: 'chess',
    }));
  });
});
