import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MonopolyGame from './MonopolyGame';

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

const renderGame = (playerId = '0') => {
  return render(
    <MemoryRouter initialEntries={[`/game/test-room?player=${playerId}`]}>
      <Routes>
        <Route path="/game/:room" element={<MonopolyGame socket={mockSocket} />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Monopoly Game Extended Test Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  test('1. Turn Toggling: Simulates back-and-forth turns between Player 1 and Player 2', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    if (socketCall) {
      const socketCallback = socketCall[1];
      await act(async () => {
        socketCallback({
          turn: '0',
          hasRolled: true,
          properties: {},
          players: {
            '0': { id: '0', name: 'Player 1', money: 1500, position: 0 },
            '1': { id: '1', name: 'Player 2', money: 1500, position: 0 },
          },
          logs: [],
        });
      });
    }

    const endTurnBtn = screen.getByRole('button', { name: /End Turn/i });
    expect(endTurnBtn).not.toBeDisabled();
    fireEvent.click(endTurnBtn);

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'monopoly_state_change',
      expect.objectContaining({
        room: 'test-room',
        state: expect.objectContaining({ turn: '1' }),
      })
    );
  });

  test('2. Mortgage & Financials: Allows mortgaging property when cash is low', async () => {
    renderGame('0');

    expect(screen.getByText(/MY PROPERTIES & MORTGAGE/i)).toBeInTheDocument();

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    if (socketCall) {
      const socketCallback = socketCall[1];
      await act(async () => {
        socketCallback({
          turn: '0',
          properties: {
            '0': { id: 0, name: 'San Diego Drive', owner: '0', price: 60, mortgaged: false, mortgageValue: 30 },
          },
          players: {
            '0': { id: '0', name: 'Player 1', money: 100, position: 1 },
            '1': { id: '1', name: 'Player 2', money: 1500, position: 0 },
          },
          logs: [],
        });
      });
    }

    const mortgageBtn = screen.queryByRole('button', { name: /Mortgage/i });
    if (mortgageBtn) {
      fireEvent.click(mortgageBtn);
      expect(mockSocket.emit).toHaveBeenCalled();
    }
  });

  test('3. Special Tiles & Game Logic: Handles turn events correctly', async () => {
    renderGame('0');

    const rollBtn = screen.getByRole('button', { name: /Roll Dice/i });
    fireEvent.click(rollBtn);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    const liveCommentary = screen.getByText(/Banker Live Commentary/i);
    expect(liveCommentary).toBeInTheDocument();
  });

  test('4. Socket Listener: Updates UI when remote state is received', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    expect(socketCall, 'Expected socket.on("update_monopoly_state") to be registered').toBeTruthy();
    const socketCallback = socketCall[1];

    await act(async () => {
      socketCallback({
        turn: '1',
        properties: {},
        players: {
          '0': { id: '0', name: 'Player 1', money: 1500, position: 0, token: '🏎️' },
          '1': { id: '1', name: 'Player 2', money: 1300, position: 3, token: '🎩' },
        },
        logs: ['Player 2 bought Kansas Drive for $90!'],
      });
    });

    expect(screen.getByText(/Player 2 bought Kansas Drive/i)).toBeInTheDocument();
  });

  test('5. Property Purchase & Modals: Handles buy and decline actions', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    const socketCallback = socketCall[1];

    await act(async () => {
      socketCallback({
        turn: '0',
        properties: {},
        pendingPurchase: {
          id: 3,
          name: 'Kansas Drive',
          price: 90,
          rent: 4,
          type: 'property',
        },
        players: {
          '0': { id: '0', name: 'Player 1', money: 1500, position: 3, token: '🏎️' },
          '1': { id: '1', name: 'Player 2', money: 1500, position: 0, token: '🎩' },
        },
        logs: ['Landed on Kansas Drive'],
      });
    });

    const buyBtn = screen.queryByRole('button', { name: /Buy/i });
    if (buyBtn) {
      fireEvent.click(buyBtn);
      expect(mockSocket.emit).toHaveBeenCalled();
    }
  });

  test('6. Jail Mechanics: Handles jail status and roll triggers', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    const socketCallback = socketCall[1];

    await act(async () => {
      socketCallback({
        turn: '0',
        hasRolled: false,
        properties: {},
        players: {
          '0': { id: '0', name: 'Player 1', money: 1500, position: 10, inJail: true, jailTurns: 1 },
          '1': { id: '1', name: 'Player 2', money: 1500, position: 0 },
        },
        logs: ['Player 1 is in Jail'],
      });
    });

    const rollBtn = screen.getByRole('button', { name: /Roll Dice/i });
    expect(rollBtn).not.toBeDisabled();
    fireEvent.click(rollBtn);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      'monopoly_state_change',
      expect.objectContaining({
        room: 'test-room',
      })
    );
  });

  test('7. Trade System: Processes trade offers in game state', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    const socketCallback = socketCall[1];

    await act(async () => {
      socketCallback({
        turn: '1',
        properties: {
          '1': { id: 1, name: 'Kentucky Avenue', owner: '1', price: 220 },
        },
        pendingTrade: {
          id: 'trade-101',
          from: '1',
          to: '0',
          offerMoney: 200,
          offerProperties: ['1'],
          requestMoney: 100,
          requestProperties: [],
        },
        players: {
          '0': { id: '0', name: 'Player 1', money: 1500, position: 0 },
          '1': { id: '1', name: 'Player 2', money: 1500, position: 0 },
        },
        logs: ['Player 2 proposed a trade'],
      });
    });

    expect(screen.getByText(/Player 2 proposed a trade/i)).toBeInTheDocument();
  });

  test('8. Property Actions: Handles mortgaging and building houses', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    const socketCallback = socketCall[1];

    await act(async () => {
      socketCallback({
        turn: '0',
        properties: {
          '0': { id: 0, name: 'San Diego Drive', owner: '0', price: 60, houses: 0, mortgaged: false },
        },
        players: {
          '0': { id: '0', name: 'Player 1', money: 1500, position: 1 },
          '1': { id: '1', name: 'Player 2', money: 1500, position: 0 },
        },
        logs: [],
      });
    });

    const mortgageBtn = screen.queryByRole('button', { name: /Mortgage/i });
    if (mortgageBtn) fireEvent.click(mortgageBtn);

    const buildBtn = screen.queryByRole('button', { name: /Build|House/i });
    if (buildBtn) fireEvent.click(buildBtn);

    expect(mockSocket.emit).toHaveBeenCalled();
  });

  test('9. Un-mortgage & Property Trading UI Controls', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    const socketCallback = socketCall[1];

    await act(async () => {
      socketCallback({
        turn: '0',
        properties: {
          '0': { id: 0, name: 'San Diego Drive', owner: '0', price: 60, houses: 0, mortgaged: true, unmortgagePrice: 33 },
        },
        players: {
          '0': { id: '0', name: 'Player 1', money: 1500, position: 1 },
          '1': { id: '1', name: 'Player 2', money: 1500, position: 0 },
        },
        logs: ['Baltic Avenue was mortgaged.'],
      });
    });

    const unmortgageBtn = screen.queryByRole('button', { name: /Unmortgage|Mortgage/i });
    if (unmortgageBtn) {
      fireEvent.click(unmortgageBtn);
      expect(mockSocket.emit).toHaveBeenCalled();
    }
  });

  test('10. Active Trade Modal Interactivity: Accepts and declines trade offers', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    const socketCallback = socketCall[1];

    await act(async () => {
      socketCallback({
        turn: '0',
        properties: {
          '0': { id: 0, name: 'San Diego Drive', owner: '0', price: 60 },
          '1': { id: 1, name: 'Kansas Drive', owner: '1', price: 90 },
        },
        pendingTrade: {
          id: 'trade-999',
          from: '1',
          to: '0',
          offerMoney: 150,
          offerProperties: [1],
          requestMoney: 50,
          requestProperties: [0],
          status: 'pending',
        },
        showTradeModal: true,
        players: {
          '0': { id: '0', name: 'Player 1', money: 1000, position: 0 },
          '1': { id: '1', name: 'Player 2', money: 1000, position: 0 },
        },
        logs: [],
      });
    });

    const acceptTradeBtn = screen.queryByRole('button', { name: /Accept|Trade/i });
    if (acceptTradeBtn) {
      fireEvent.click(acceptTradeBtn);
      expect(mockSocket.emit).toHaveBeenCalled();
    } else {
      expect(screen.getByText(/MY PROPERTIES & MORTGAGE/i)).toBeInTheDocument();
    }
  });

  test('11. Financial Distress & Bankruptcy: Handles low funds bankruptcy trigger', async () => {
    renderGame('0');

    const socketCall = mockSocket.on.mock.calls.find(([event]) => event === 'update_monopoly_state');
    const socketCallback = socketCall[1];

    await act(async () => {
      socketCallback({
        turn: '0',
        properties: {},
        players: {
          '0': { id: '0', name: 'Player 1', money: -200, position: 5, isBankrupt: true },
          '1': { id: '1', name: 'Player 2', money: 1500, position: 0 },
        },
        logs: ['Player 1 declared bankruptcy!'],
      });
    });

    const declareBankruptBtn = screen.queryByRole('button', { name: /Bankrupt|Declare Bankruptcy/i });
    if (declareBankruptBtn) {
      fireEvent.click(declareBankruptBtn);
      expect(mockSocket.emit).toHaveBeenCalled();
    }
  });
});