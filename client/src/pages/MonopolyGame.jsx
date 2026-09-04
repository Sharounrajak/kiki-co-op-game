import React, { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

// ==========================================
// 1. MONOPOLY 40 SPACES DATA
// ==========================================


const BOARD_SPACES = [
  // Bottom Row (0 - 10)
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

  // Left Column (11 - 19)
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

  // Top Row (21 - 29)
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

  // Right Column (31 - 39)
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

    // ✅ Ensure useEffect sits at the TOP LEVEL of the MonopolyGame component:
useEffect(() => {
  socket.on('update_monopoly_state', (newState) => {
    setGameState(newState);
  });

  return () => socket.off('update_monopoly_state');
}, [socket]);
  const { room } = useParams();
  const [searchParams] = useSearchParams();
  const localPlayerId = searchParams.get('player') || '0'; // Current client player ID ('0' or '1')
  const canvasRef = useRef(null);

  // Layout & Animation States
  const [isPortrait, setIsPortrait] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [diceVisual, setDiceVisual] = useState([1, 1]);
  const [isAnimatingPiece, setIsAnimatingPiece] = useState(false);
  const [moneyPopups, setMoneyPopups] = useState([]);
  const [activeCardModal, setActiveCardModal] = useState(null);

  // Auction State
  const [auctionState, setAuctionState] = useState(null); // { property, currentBid, highestBidder, activeBidders: [] }

  // Game Core State
  const [gameState, setGameState] = useState({
    turn: '0',
    players: {
      '0': { id: '0', name: 'Player 1', money: 1500, position: 0, token: '🎩', color: '#ef4444' },
      '1': { id: '1', name: 'Player 2', money: 1500, position: 0, token: '🚗', color: '#3b82f6' }
    },
    properties: {}, // { spaceId: { owner, houses, isMortgaged } }
    lastRoll: [1, 1],
    hasRolled: false,
    pendingPurchase: null,
    decisionTimer: 0,
    logs: ['🏦 Banker: Welcome to Monopoly! Roll the dice to begin your journey.']
  });

  const [animatedPositions, setAnimatedPositions] = useState({ '0': 0, '1': 0 });

  // Mobile orientation detection
  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync token position when not animating
  useEffect(() => {
    if (!isAnimatingPiece) {
      setAnimatedPositions({
        '0': gameState.players['0'].position,
        '1': gameState.players['1'].position
      });
    }
  }, [gameState.players, isAnimatingPiece]);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;
    socket.on("update_monopoly_state", (newState) => setGameState(newState));
    return () => socket.off("update_monopoly_state");
  }, [socket]);

  const emitStateChange = (updatedState) => {
    setGameState(updatedState);
    
    if (socket && room) socket.emit("monopoly_state_change", { room, state: updatedState });
  };

  const triggerMoneyPopup = (playerId, amount) => {
    const id = Date.now() + Math.random();
    const text = amount >= 0 ? `+$${amount}` : `-$${Math.abs(amount)}`;
    const color = amount >= 0 ? '#4ade80' : '#f87171';
    setMoneyPopups(prev => [...prev, { id, playerId, text, color }]);
    setTimeout(() => {
      setMoneyPopups(prev => prev.filter(p => p.id !== id));
    }, 1800);
  };

  // Animated Token Stepping
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

  // Roll Dice Routine
  const rollDice = () => {
    if (gameState.hasRolled || isRolling || isAnimatingPiece || gameState.turn !== localPlayerId) return;
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

  // Buy Property
  const buyProperty = () => {
    if (!gameState.pendingPurchase) return;
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

  // Start Property Auction
  const passToAuction = () => {
    if (!gameState.pendingPurchase) return;
    const prop = gameState.pendingPurchase;
    setAuctionState({
      property: prop,
      currentBid: Math.floor(prop.price * 0.5),
      highestBidder: null,
      activeBidders: ['0', '1']
    });
    const state = JSON.parse(JSON.stringify(gameState));
    state.logs.unshift(`🔨 Banker: ${prop.name} is now UP FOR AUCTION starting at $${Math.floor(prop.price * 0.5)}!`);
    state.pendingPurchase = null;
    emitStateChange(state);
  };

  // Bid in Auction
  const placeBid = (playerId, increment) => {
    if (!auctionState) return;
    const newBid = auctionState.currentBid + increment;
    if (gameState.players[playerId].money < newBid) return;

    setAuctionState(prev => ({
      ...prev,
      currentBid: newBid,
      highestBidder: playerId
    }));

    const state = JSON.parse(JSON.stringify(gameState));
    state.logs.unshift(`🔨 Banker: ${gameState.players[playerId].name} placed a bid of $${newBid}`);
    emitStateChange(state);
  };

  // Pass Auction Bid
  const passBid = (playerId) => {
    if (!auctionState) return;
    const remaining = auctionState.activeBidders.filter(id => id !== playerId);

    if (remaining.length <= 1 && auctionState.highestBidder) {
      // Complete Auction
      const winnerId = auctionState.highestBidder;
      const finalPrice = auctionState.currentBid;
      const prop = auctionState.property;

      const state = JSON.parse(JSON.stringify(gameState));
      state.players[winnerId].money -= finalPrice;
      triggerMoneyPopup(winnerId, -finalPrice);
      state.properties[prop.id] = { owner: winnerId, houses: 0, isMortgaged: false };
      state.logs.unshift(`🎉 Banker: AUCTION CLOSED! ${state.players[winnerId].name} won ${prop.name} for $${finalPrice}!`);
      emitStateChange(state);
      setAuctionState(null);
    } else if (remaining.length === 0 || !auctionState.highestBidder) {
      const state = JSON.parse(JSON.stringify(gameState));
      state.logs.unshift(`❌ Banker: Auction ended with no buyers for ${auctionState.property.name}.`);
      emitStateChange(state);
      setAuctionState(null);
    } else {
      setAuctionState(prev => ({ ...prev, activeBidders: remaining }));
    }
  };

  // Mortgage Property
  const mortgageProperty = (spaceId) => {
    const state = JSON.parse(JSON.stringify(gameState));
    const prop = state.properties[spaceId];
    const space = BOARD_SPACES.find(s => s.id === parseInt(spaceId));

    if (prop && prop.owner === localPlayerId && !prop.isMortgaged) {
      const payout = Math.floor(space.price * 0.5);
      prop.isMortgaged = true;
      state.players[localPlayerId].money += payout;
      triggerMoneyPopup(localPlayerId, payout);
      state.logs.unshift(`🏦 Banker: ${state.players[localPlayerId].name} mortgaged ${space.name} for $${payout}.`);
      emitStateChange(state);
    }
  };

  // End Turn
  const endTurn = () => {
    if (!gameState.hasRolled || isAnimatingPiece || gameState.turn !== localPlayerId) return;
    const state = JSON.parse(JSON.stringify(gameState));
    state.turn = state.turn === '0' ? '1' : '0';
    state.hasRolled = false;
    state.pendingPurchase = null;
    state.logs.unshift(`🔄 Banker: Turn passed to ${state.players[state.turn].name}!`);
    emitStateChange(state);
  };

  // ==========================================
  // CANVAS RENDER ENGINE
  // ==========================================
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

      // Color Headers
      if (space.color) {
        ctx.fillStyle = space.color;
        if (space.id > 0 && space.id < 10) ctx.fillRect(rect.x, rect.y, rect.w, 18);
        else if (space.id > 10 && space.id < 20) ctx.fillRect(rect.x + rect.w - 18, rect.y, 18, rect.h);
        else if (space.id > 20 && space.id < 30) ctx.fillRect(rect.x, rect.y + rect.h - 18, rect.w, 18);
        else if (space.id > 30 && space.id < 40) ctx.fillRect(rect.x, rect.y, 18, rect.h);
      }

      // Tile Labels
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = '600 7px sans-serif';

      if (space.type === 'go') {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText("COLLECT $200", rect.x + rect.w / 2, rect.y + rect.h / 2 - 4);
        ctx.fillText("GO ➡️", rect.x + rect.w / 2, rect.y + rect.h / 2 + 12);
      } else if (space.type === 'jail') {
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText("IN JAIL", rect.x + rect.w / 2, rect.y + rect.h / 2 - 4);
        ctx.fillText("VISITING", rect.x + rect.w / 2, rect.y + rect.h / 2 + 8);
      } else if (space.type === 'parking') {
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText("FREE PARKING", rect.x + rect.w / 2, rect.y + rect.h / 2);
      } else if (space.type === 'gotojail') {
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText("GO TO JAIL 🚨", rect.x + rect.w / 2, rect.y + rect.h / 2);
      } else {
        const words = space.name.split(' ');
        if (space.id > 0 && space.id < 10) {
          ctx.fillText(words[0] || "", rect.x + rect.w / 2, rect.y + 28);
          if (words[1]) ctx.fillText(words[1], rect.x + rect.w / 2, rect.y + 36);
          if (space.price > 0) ctx.fillText(`M${space.price}`, rect.x + rect.w / 2, rect.y + rect.h - 4);
        } else if (space.id > 10 && space.id < 20) {
          ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
          ctx.rotate(Math.PI / 2);
          ctx.fillText(words[0] || "", 0, -4);
          if (words[1]) ctx.fillText(words[1], 0, 4);
        } else if (space.id > 20 && space.id < 30) {
          ctx.fillText(words[0] || "", rect.x + rect.w / 2, rect.y + 12);
          if (words[1]) ctx.fillText(words[1], rect.x + rect.w / 2, rect.y + 20);
        } else if (space.id > 30 && space.id < 40) {
          ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(words[0] || "", 0, -4);
          if (words[1]) ctx.fillText(words[1], 0, 4);
        }
      }
      ctx.restore();

      // Owned Property Indicators
      const prop = gameState.properties[space.id];
      if (prop) {
        ctx.strokeStyle = gameState.players[prop.owner].color;
        ctx.lineWidth = 4;
        ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
        if (prop.isMortgaged) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        }
      }
    });

    // Central Monopoly Banner
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-120, -28, 240, 56);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(-120, -28, 240, 56);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("MONOPOLY", 0, 9);
    ctx.restore();

    // RENDER ICON PIECES (Top Hat / Vintage Car)
    Object.entries(animatedPositions).forEach(([pId, pos]) => {
      const rect = getTileRect(pos);
      const player = gameState.players[pId];
      const offsetX = pId === '0' ? rect.w * 0.3 : rect.w * 0.7;
      const offsetY = rect.h * 0.55;

      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.token, rect.x + offsetX, rect.y + offsetY);
    });

  }, [gameState, animatedPositions]);

  const currPlayer = gameState.players[gameState.turn];
  const myData = gameState.players[localPlayerId];

  return (
    <div style={{
      display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '20px',
      padding: '16px', backgroundColor: '#090d16', minHeight: '100vh', color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>

      {/* PORTRAIT OVERLAY */}
      {isPortrait && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(9, 13, 22, 0.96)',
          zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>📱🔄</div>
          <h2 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>Rotate Screen</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '280px' }}>
            Turn your phone horizontally to landscape mode to play Monopoly on a wider view!
          </p>
        </div>
      )}

      {/* LEFT: BOARD CONTAINER */}
      <div style={{
        position: 'relative', background: '#1e293b', padding: '12px', borderRadius: '16px',
        border: '1px solid #334155', boxShadow: '0 12px 30px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <canvas ref={canvasRef} width={620} height={620} style={{ maxWidth: '100%', height: 'auto' }} />

        {/* Dynamic Money Pop-ups */}
        {moneyPopups.map(pop => (
          <div key={pop.id} style={{
            position: 'absolute', top: pop.playerId === '0' ? '80%' : '20%', left: '50%',
            transform: 'translate(-50%, -50%)', color: pop.color, fontSize: '26px', fontWeight: '900',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)', animation: 'floatUp 1.8s forwards'
          }}>
            {pop.text}
          </div>
        ))}

       {/* Replace line 515 with array safety checks */}
{gameState?.lastRoll?.length === 2 && (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ fontSize: '18px' }}>🎲</span>
    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#38bdf8' }}>
      Rolled: {DICE_FACES[gameState.lastRoll[0] - 1]} {DICE_FACES[gameState.lastRoll[1] - 1]} ({gameState.lastRoll[0] + gameState.lastRoll[1]})
    </span>
  </div>
)}
        {/* Chance / Chest Modal */}
        {activeCardModal && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#0284c7', padding: '20px', borderRadius: '12px', width: '260px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>{activeCardModal.type}</h3>
            <p style={{ background: '#fff', color: '#0f172a', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px' }}>
              {activeCardModal.text}
            </p>
            <button onClick={() => setActiveCardModal(null)} style={{ padding: '8px 18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Acknowledge
            </button>
          </div>
        )}

        {/* AUCTION MODAL */}
        {auctionState && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#1e1b4b', padding: '20px', borderRadius: '16px', border: '2px solid #6366f1',
            width: '300px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.9)'
          }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#818cf8' }}>🔨 PROPERTY AUCTION</h3>
            <div style={{ fontSize: '14px', color: '#f8fafc', fontWeight: 'bold' }}>{auctionState.property.name}</div>
            <div style={{ fontSize: '24px', color: '#4ade80', margin: '10px 0', fontWeight: 'bold' }}>
              Current Bid: ${auctionState.currentBid}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
              Highest Bidder: {auctionState.highestBidder ? gameState.players[auctionState.highestBidder].name : 'None'}
            </div>

            {auctionState.activeBidders.includes(localPlayerId) ? (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => placeBid(localPlayerId, 10)} style={{ padding: '8px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  +$10
                </button>
                <button onClick={() => placeBid(localPlayerId, 50)} style={{ padding: '8px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  +$50
                </button>
                <button onClick={() => passBid(localPlayerId)} style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Pass
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: '#f87171' }}>You passed this auction.</div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: UPDATED DASHBOARD & BANKER FEED */}
      <div style={{ flex: '1 1 340px', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* PLAYERS SUMMARY (PRIVACY ENABLED) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Object.values(gameState.players).map(p => {
            const isMe = p.id === localPlayerId;
            return (
              <div key={p.id} style={{
                background: '#131c2e', padding: '12px', borderRadius: '10px',
                borderLeft: `5px solid ${p.color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{p.token}</span> {p.name} {isMe && <span style={{ color: '#38bdf8', fontSize: '10px' }}>(You)</span>}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>
                  {isMe ? `$${p.money}` : '🔒 $???'}
                </div>
                <small style={{ color: '#cbd5e1', fontSize: '11px' }}>Tile: {BOARD_SPACES[p.position].name}</small>
              </div>
            );
          })}
        </div>

        {/* ACTIVE TURN & DECISION CONTROLS */}
        <div style={{ background: '#131c2e', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '14px', marginBottom: '10px', color: '#94a3b8' }}>
            Current Turn: <strong style={{ color: currPlayer.color }}>{currPlayer.name}</strong>
          </div>

          {gameState.turn === localPlayerId ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={rollDice}
                disabled={gameState.hasRolled || isRolling || isAnimatingPiece}
                style={{
                  flex: 1, padding: '12px', background: gameState.hasRolled ? '#334155' : '#16a34a',
                  color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {isRolling ? `${DICE_FACES[diceVisual[0] - 1]} ${DICE_FACES[diceVisual[1] - 1]}` : '🎲 Roll Dice'}
              </button>
              <button
                onClick={endTurn}
                disabled={!gameState.hasRolled || isAnimatingPiece}
                style={{
                  flex: 1, padding: '12px', background: (!gameState.hasRolled || isAnimatingPiece) ? '#334155' : '#2563eb',
                  color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                End Turn
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '10px' }}>
              Waiting for {currPlayer.name} to complete their move...
            </div>
          )}

          {/* PROPERTY BUY OR AUCTION DECISION */}
          {gameState.pendingPurchase && gameState.turn === localPlayerId && (
            <div style={{ marginTop: '12px', background: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
              <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px' }}>
                Landed on <strong>{gameState.pendingPurchase.name}</strong> (${gameState.pendingPurchase.price})
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={buyProperty}
                  disabled={myData.money < gameState.pendingPurchase.price}
                  style={{ flex: 1, padding: '8px', background: '#eab308', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Buy Property
                </button>
                <button
                  onClick={passToAuction}
                  style={{ flex: 1, padding: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Send to Auction
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MY PORTFOLIO & MORTGAGE PANEL */}
        <div style={{ background: '#131c2e', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px' }}>
            💼 MY PROPERTIES & MORTGAGE
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
           {Object.entries(gameState?.properties || {})
  .filter(([_, prop]) => prop.owner === localPlayerId)
  .map(([spaceId, prop]) => {
                const space = BOARD_SPACES.find(s => s.id === parseInt(spaceId));
                return (
                  <div key={spaceId} style={{
                    background: '#1e293b', padding: '6px 8px', borderRadius: '6px', fontSize: '11px',
                    display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${space.color || '#334155'}`
                  }}>
                    <span>{space.name}</span>
                    {!prop.isMortgaged ? (
                      <button
                        onClick={() => mortgageProperty(spaceId)}
                        style={{ padding: '2px 6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '9px', cursor: 'pointer' }}
                      >
                        Mortgage (+${Math.floor(space.price * 0.5)})
                      </button>
                    ) : (
                      <span style={{ color: '#f87171', fontSize: '9px' }}>(Mortgaged)</span>
                    )}
                  </div>
                );
              })}
            {Object.values(gameState.properties).filter(p => p.owner === localPlayerId).length === 0 && (
              <div style={{ fontSize: '11px', color: '#64748b' }}>No properties owned yet.</div>
            )}
          </div>
        </div>

        {/* BANKER LIVE NARRATOR FEED */}
        <div style={{
          background: '#0d1527', padding: '14px', borderRadius: '10px', border: '1px solid #1d2d4a',
          flex: 1, minHeight: '180px', maxHeight: '220px', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span>🏦</span> Banker Live Commentary
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gameState.logs.map((log, idx) => (
                <div key={idx} style={{
                  fontSize: '12px',
                  color: idx === 0 ? '#f8fafc' : '#64748b',
                  background: idx === 0 ? '#1e293b' : 'transparent',
                  padding: idx === 0 ? '6px 10px' : '0 4px',
                  borderRadius: '6px',
                  borderLeft: idx === 0 ? '3px solid #38bdf8' : 'none'
                }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}