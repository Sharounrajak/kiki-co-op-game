import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const BOARD_SPACES = [
  { id: 0, name: "GO", type: "go", price: 0 },
  { id: 1, name: "San Diego Drive", type: "property", price: 60, rent: 2, houseCost: 50, color: "#955251" },
  { id: 2, name: "Community Chest", type: "chest", price: 0 },
  { id: 3, name: "Kansas Drive", type: "property", price: 90, rent: 4, houseCost: 50, color: "#955251" },
  { id: 4, name: "Income Tax", type: "tax", cost: 150 },
  { id: 5, name: "Beverly Rail", type: "railroad", price: 200, rent: 25 },
  { id: 6, name: "Vermont Drive", type: "property", price: 120, rent: 8, houseCost: 50, color: "#87CEEB" },
  { id: 7, name: "Chance", type: "chance", price: 0 },
  { id: 8, name: "Phoenix Drive", type: "property", price: 130, rent: 10, houseCost: 50, color: "#87CEEB" },
  { id: 9, name: "Boston Drive", type: "property", price: 150, rent: 12, houseCost: 50, color: "#87CEEB" },
  { id: 10, name: "Jail / Visiting", type: "jail", price: 0 },
  { id: 11, name: "Olivia Gardens", type: "property", price: 140, rent: 14, houseCost: 100, color: "#DA70D6" },
  { id: 12, name: "Car Company", type: "utility", price: 150, rent: 15 },
  { id: 13, name: "California Drive", type: "property", price: 160, rent: 14, houseCost: 100, color: "#DA70D6" },
  { id: 14, name: "States Drive", type: "property", price: 140, rent: 12, houseCost: 100, color: "#DA70D6" },
  { id: 15, name: "Manhattan Rail", type: "railroad", price: 200, rent: 25 },
  { id: 16, name: "Bethany Drive", type: "property", price: 180, rent: 14, houseCost: 100, color: "#FF8C00" },
  { id: 17, name: "Community Chest", type: "chest", price: 0 },
  { id: 18, name: "New York Drive", type: "property", price: 200, rent: 16, houseCost: 100, color: "#FF8C00" },
  { id: 19, name: "Atlanta Drive", type: "property", price: 200, rent: 16, houseCost: 100, color: "#FF8C00" },
  { id: 20, name: "Free Parking", type: "parking", price: 0 },
  { id: 21, name: "Almond Drive", type: "property", price: 200, rent: 18, houseCost: 150, color: "#DC143C" },
  { id: 22, name: "Chance", type: "chance", price: 0 },
  { id: 23, name: "Clement Drive", type: "property", price: 200, rent: 18, houseCost: 150, color: "#DC143C" },
  { id: 24, name: "Pacific Drive", type: "property", price: 260, rent: 22, houseCost: 150, color: "#DC143C" },
  { id: 25, name: "Water Works", type: "utility", price: 60, rent: 15 },
  { id: 26, name: "Rodeo Drive", type: "property", price: 260, rent: 22, houseCost: 150, color: "#FFD700" },
  { id: 27, name: "Nashville Drive", type: "property", price: 260, rent: 22, houseCost: 150, color: "#FFD700" },
  { id: 28, name: "Railroad", type: "railroad", price: 130, rent: 25 },
  { id: 29, name: "Oakville", type: "property", price: 230, rent: 20, houseCost: 150, color: "#FFD700" },
  { id: 30, name: "Go To Jail", type: "gotojail", price: 0 },
  { id: 31, name: "Atlantic Drive", type: "property", price: 300, rent: 26, houseCost: 200, color: "#228B22" },
  { id: 32, name: "Clement Drive", type: "property", price: 300, rent: 26, houseCost: 200, color: "#228B22" },
  { id: 33, name: "Community Chest", type: "chest", price: 0 },
  { id: 34, name: "Riverside", type: "property", price: 250, rent: 22, houseCost: 200, color: "#228B22" },
  { id: 35, name: "Short Line", type: "railroad", price: 200, rent: 25 },
  { id: 36, name: "Chance", type: "chance", price: 0 },
  { id: 37, name: "Folklore Heights", type: "property", price: 200, rent: 18, houseCost: 200, color: "#00008B" },
  { id: 38, name: "Luxury Tax", type: "tax", cost: 200 },
  { id: 39, name: "Salt Lake", type: "property", price: 350, rent: 35, houseCost: 200, color: "#00008B" }
];

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function MonopolyGame({ socket }) {
  const { room } = useParams();
  const activeRoomCode = room || 'MONO1';
  const canvasRef = useRef(null);

  const [localSlotId, setLocalSlotId] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceVisual, setDiceVisual] = useState([1, 1]);
  const [isAnimatingPiece, setIsAnimatingPiece] = useState(false);
  const [moneyPopups, setMoneyPopups] = useState([]);
  const [activeCardModal, setActiveCardModal] = useState(null);
  const [auctionState, setAuctionState] = useState(null);

  const [gameState, setGameState] = useState({
    turn: '0',
    players: {
      '0': { id: '0', socketId: '', name: 'Player 1', money: 1500, position: 0, token: '🎩', color: '#ef4444' },
      '1': { id: '1', socketId: '', name: 'Player 2', money: 1500, position: 0, token: '🚗', color: '#3b82f6' }
    },
    properties: {},
    lastRoll: [1, 1],
    hasRolled: false,
    pendingPurchase: null,
    logs: ['🏦 Banker: Welcome! Copy invite link to invite Player 2.']
  });

  const [animatedPositions, setAnimatedPositions] = useState({ '0': 0, '1': 0 });

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_monopoly_room", { room: activeRoomCode, username: "Player" });

    socket.on("monopoly_slot_assigned", ({ slotId }) => {
      setLocalSlotId(slotId);
    });

    socket.on("update_monopoly_state", (newState) => {
      setGameState(newState);
    });

    return () => {
      socket.off("monopoly_slot_assigned");
      socket.off("update_monopoly_state");
    };
  }, [socket, activeRoomCode]);

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAnimatingPiece && gameState?.players) {
      setAnimatedPositions({
        '0': gameState.players['0']?.position || 0,
        '1': gameState.players['1']?.position || 0
      });
    }
  }, [gameState.players, isAnimatingPiece]);

  const emitStateChange = (updatedState) => {
    setGameState(updatedState);
    if (socket && activeRoomCode) {
      socket.emit("monopoly_state_change", { room: activeRoomCode, state: updatedState });
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/monopoly/${activeRoomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    alert("Invite link copied to clipboard!");
  };

  const triggerMoneyPopup = (playerId, amount) => {
    const id = Date.now() + Math.random();
    const text = amount >= 0 ? `+$${amount}` : `-$${Math.abs(amount)}`;
    const color = amount >= 0 ? '#4ade80' : '#f87171';
    setMoneyPopups(prev => [...prev, { id, playerId, text, color }]);
    setTimeout(() => setMoneyPopups(prev => prev.filter(p => p.id !== id)), 1800);
  };

  const animateTokenMovement = (playerId, startPos, totalSteps, callback) => {
    setIsAnimatingPiece(true);
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const nextPos = (startPos + currentStep) % 40;
      setAnimatedPositions(prev => ({ ...prev, [playerId]: nextPos }));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setIsAnimatingPiece(false);
        callback();
      }
    }, 180);
  };

  const rollDice = () => {
    if (gameState.hasRolled || isRolling || isAnimatingPiece || gameState.turn !== localSlotId) return;
    setIsRolling(true);

    const spinInterval = setInterval(() => {
      setDiceVisual([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
    }, 70);

    setTimeout(() => {
      clearInterval(spinInterval);
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      setDiceVisual([d1, d2]);
      setIsRolling(false);

      const state = JSON.parse(JSON.stringify(gameState));
      const currId = state.turn;
      const p = state.players[currId];
      const startPos = p.position;

      state.lastRoll = [d1, d2];
      state.hasRolled = true;

      animateTokenMovement(currId, startPos, total, () => {
        let newPos = (startPos + total) % 40;
        if (newPos < startPos) {
          p.money += 200;
          triggerMoneyPopup(currId, 200);
          state.logs.unshift(`🏦 Banker: ${p.name} passed GO and collected $200!`);
        }
        p.position = newPos;
        const space = BOARD_SPACES[newPos];
        state.logs.unshift(`🎲 ${p.name} rolled [${d1}, ${d2}] (Total: ${total}) -> Landed on ${space.name}`);

        if (space.type === 'gotojail') {
          p.position = 10;
          state.logs.unshift(`🚨 Banker: ${p.name} was sent directly to JAIL!`);
        } else if (space.type === 'tax') {
          p.money -= space.cost;
          triggerMoneyPopup(currId, -space.cost);
          state.logs.unshift(`🏦 Banker: ${p.name} paid $${space.cost} for ${space.name}.`);
        } else if (space.type === 'chance' || space.type === 'chest') {
          const reward = space.type === 'chance' ? 100 : 50;
          p.money += reward;
          triggerMoneyPopup(currId, reward);
          setActiveCardModal({ type: space.type.toUpperCase(), text: `Banker rewards you $${reward} from ${space.name}!` });
          state.logs.unshift(`🃏 Banker: ${p.name} drew a ${space.type.toUpperCase()} card and gained $${reward}.`);
        } else if (['property', 'railroad', 'utility'].includes(space.type)) {
          const prop = state.properties[space.id];
          if (!prop) {
            state.pendingPurchase = space;
          } else if (prop.owner !== currId && !prop.isMortgaged) {
            const rentCost = space.rent || 20;
            p.money -= rentCost;
            state.players[prop.owner].money += rentCost;
            triggerMoneyPopup(currId, -rentCost);
            triggerMoneyPopup(prop.owner, rentCost);
            state.logs.unshift(`💰 Banker: ${p.name} paid $${rentCost} rent to ${state.players[prop.owner].name}.`);
          }
        }
        emitStateChange(state);
      });
    }, 900);
  };

  const buyProperty = () => {
    if (!gameState.pendingPurchase || gameState.turn !== localSlotId) return;
    const state = JSON.parse(JSON.stringify(gameState));
    const currId = state.turn;
    const p = state.players[currId];
    const space = state.pendingPurchase;

    if (p.money >= space.price) {
      p.money -= space.price;
      triggerMoneyPopup(currId, -space.price);
      state.properties[space.id] = { owner: currId, houses: 0, isMortgaged: false };
      state.logs.unshift(`🏛️ Banker: ${p.name} bought ${space.name} for $${space.price}.`);
      state.pendingPurchase = null;
    }
    emitStateChange(state);
  };

  const passToAuction = () => {
    if (!gameState.pendingPurchase || gameState.turn !== localSlotId) return;
    const prop = gameState.pendingPurchase;
    setAuctionState({
      property: prop,
      currentBid: Math.floor(prop.price * 0.5),
      highestBidder: null,
      activeBidders: ['0', '1']
    });
    const state = JSON.parse(JSON.stringify(gameState));
    state.logs.unshift(`🔨 Banker: ${prop.name} is UP FOR AUCTION starting at $${Math.floor(prop.price * 0.5)}!`);
    state.pendingPurchase = null;
    emitStateChange(state);
  };

  const endTurn = () => {
    if (!gameState.hasRolled || isAnimatingPiece || gameState.turn !== localSlotId) return;
    const state = JSON.parse(JSON.stringify(gameState));
    state.turn = state.turn === '0' ? '1' : '0';
    state.hasRolled = false;
    state.pendingPurchase = null;
    state.logs.unshift(`🔄 Banker: Turn passed to ${state.players[state.turn].name}!`);
    emitStateChange(state);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    const cornerSize = size * 0.13;
    const tileWidth = (size - cornerSize * 2) / 9;

    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, 0, size, size);

    const getTileRect = (i) => {
      if (i === 0) return { x: size - cornerSize, y: size - cornerSize, w: cornerSize, h: cornerSize };
      if (i > 0 && i < 10) return { x: size - cornerSize - i * tileWidth, y: size - cornerSize, w: tileWidth, h: cornerSize };
      if (i === 10) return { x: 0, y: size - cornerSize, w: cornerSize, h: cornerSize };
      if (i > 10 && i < 20) return { x: 0, y: size - cornerSize - (i - 10) * tileWidth, w: cornerSize, h: tileWidth };
      if (i === 20) return { x: 0, y: 0, w: cornerSize, h: cornerSize };
      if (i > 20 && i < 30) return { x: cornerSize + (i - 21) * tileWidth, y: 0, w: tileWidth, h: cornerSize };
      if (i === 30) return { x: size - cornerSize, y: 0, w: cornerSize, h: cornerSize };
      if (i > 30 && i < 40) return { x: size - cornerSize, y: cornerSize + (i - 31) * tileWidth, w: cornerSize, h: tileWidth };
    };

    BOARD_SPACES.forEach((space) => {
      const rect = getTileRect(space.id);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

      if (space.color) {
        ctx.fillStyle = space.color;
        if (space.id > 0 && space.id < 10) ctx.fillRect(rect.x, rect.y, rect.w, 18);
        else if (space.id > 10 && space.id < 20) ctx.fillRect(rect.x + rect.w - 18, rect.y, 18, rect.h);
        else if (space.id > 20 && space.id < 30) ctx.fillRect(rect.x, rect.y + rect.h - 18, rect.w, 18);
        else if (space.id > 30 && space.id < 40) ctx.fillRect(rect.x, rect.y, 18, rect.h);
      }

      const prop = gameState.properties[space.id];
      if (prop) {
        ctx.strokeStyle = gameState.players[prop.owner].color;
        ctx.lineWidth = 4;
        ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
      }
    });

    Object.entries(animatedPositions).forEach(([pId, pos]) => {
      const rect = getTileRect(pos);
      const player = gameState.players[pId];
      if (!player) return;
      const offsetX = pId === '0' ? rect.w * 0.3 : rect.w * 0.7;
      const offsetY = rect.h * 0.55;

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.token, rect.x + offsetX, rect.y + offsetY);
    });

  }, [gameState, animatedPositions]);

  const currPlayer = gameState.players[gameState.turn];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', padding: '16px', backgroundColor: '#090d16', minHeight: '100vh', color: '#f8fafc' }}>
      {isPortrait && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 13, 22, 0.96)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Rotate Screen</h2>
          <p>Turn your phone horizontally to landscape mode to play!</p>
        </div>
      )}

      <div style={{ position: 'relative', background: '#1e293b', padding: '12px', borderRadius: '16px' }}>
        <canvas ref={canvasRef} width={620} height={620} style={{ maxWidth: '100%', height: 'auto' }} />
        {moneyPopups.map(pop => (
          <div key={pop.id} style={{ position: 'absolute', top: pop.playerId === '0' ? '80%' : '20%', left: '50%', color: pop.color, fontSize: '26px', fontWeight: '900' }}>
            {pop.text}
          </div>
        ))}
      </div>

      <div style={{ flex: '1 1 340px', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={copyInviteLink} style={{ padding: '10px', background: '#38bdf8', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          🔗 Copy Invite Link
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Object.values(gameState.players).map(p => {
            const isMe = p.id === localSlotId;
            return (
              <div key={p.id} style={{ background: '#131c2e', padding: '12px', borderRadius: '10px', borderLeft: `5px solid ${p.color}` }}>
                <div>{p.token} {p.name} {isMe ? "(You)" : ""}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>${p.money}</div>
              </div>
            );
          })}
        </div>

        <div style={{ background: '#131c2e', padding: '14px', borderRadius: '10px' }}>
          <div>Current Turn: <strong style={{ color: currPlayer.color }}>{currPlayer.name}</strong></div>

          {gameState.turn === localSlotId ? (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={rollDice} disabled={gameState.hasRolled || isRolling || isAnimatingPiece} style={{ flex: 1, padding: '12px', background: gameState.hasRolled ? '#334155' : '#16a34a', color: '#fff', borderRadius: '8px', fontWeight: 'bold' }}>
                {isRolling ? `${DICE_FACES[diceVisual[0] - 1]} ${DICE_FACES[diceVisual[1] - 1]}` : '🎲 Roll Dice'}
              </button>
              <button onClick={endTurn} disabled={!gameState.hasRolled || isAnimatingPiece} style={{ flex: 1, padding: '12px', background: !gameState.hasRolled ? '#334155' : '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: 'bold' }}>
                End Turn
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '10px' }}>
              Waiting for {currPlayer.name} to roll...
            </div>
          )}

          {gameState.pendingPurchase && gameState.turn === localSlotId && (
            <div style={{ marginTop: '12px', background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <div>Landed on <strong>{gameState.pendingPurchase.name}</strong> (${gameState.pendingPurchase.price})</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button onClick={buyProperty} style={{ flex: 1, padding: '8px', background: '#eab308', borderRadius: '4px', fontWeight: 'bold' }}>Buy</button>
                <button onClick={passToAuction} style={{ flex: 1, padding: '8px', background: '#6366f1', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}>Auction</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#0d1527', padding: '14px', borderRadius: '10px', flex: 1, maxHeight: '200px', overflowY: 'auto' }}>
          <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '8px' }}>🏦 Banker Feed</div>
          {gameState.logs.map((log, idx) => (
            <div key={idx} style={{ fontSize: '12px', color: idx === 0 ? '#f8fafc' : '#64748b' }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}