import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ socket, room, username, isDrawer, gameState, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const chatBottomRef = useRef(null);

  // Generates a happy "Ding!" sound out of thin air
  const playDing = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) { console.error("Audio error", e); }
  };

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msgData) => {
      // Check if this is a correct guess system message
      const isWinningGuess = msgData.system && msgData.text.toLowerCase().includes('guessed');
      
      if (isWinningGuess) {
        msgData.isSuccess = true;
        playDing(); // Trigger the dopamine!
      }
      
      setMessages((prev) => [...prev, msgData]);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    socket.emit('send_message', {
      room,
      message: inputMsg.trim(),
      username
    });

    setInputMsg('');
  };

  const isInputDisabled = isDrawer && (gameState === 'drawing' || gameState === 'selecting_word');

  return (
    <>
      <style>{`
        /* Desktop Default */
        .doodle-chat-container {
          display: flex;
          flex-direction: column;
          width: 320px;
          min-width: 300px;
          flex-shrink: 0; 
          height: 100%;
          background: #fffcf2;
          border: 4px solid #2d3436;
          border-radius: 12px;
          box-shadow: 4px 4px 0px #2d3436;
          overflow: hidden;
          font-family: 'Comic Sans MS', cursive, sans-serif;
        }
        
        .doodle-chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: #ffeaa7;
          border-bottom: 4px solid #2d3436;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .doodle-close-btn {
          display: none; 
          background: #ff7675;
          border: 2px solid #2d3436;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          padding: 2px 8px;
        }

        .doodle-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .doodle-msg {
          font-size: 0.95rem;
          line-height: 1.4;
        }

        /* THE GREEN TEXT DOPAMINE CSS */
        .system-msg {
          color: #636e72;
          font-weight: bold;
        }
        .success-msg {
          color: #00b894 !important;
          font-weight: 900 !important;
          background: #e8f8f5;
          padding: 4px 8px;
          border-radius: 6px;
          text-align: center;
          border: 2px dashed #00b894;
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .doodle-chat-input {
          display: flex;
          padding: 10px;
          border-top: 4px solid #2d3436;
          background: #ffffff;
        }

        .doodle-chat-input input {
          flex: 1;
          padding: 10px;
          border: 2px solid #2d3436;
          border-radius: 8px;
          font-family: inherit;
          outline: none;
          min-width: 0; 
        }
        
        .doodle-chat-input input:focus {
          border-color: #0984e3;
        }

        .doodle-chat-input button {
          margin-left: 8px;
          padding: 10px 16px;
          background: #55efc4;
          border: 2px solid #2d3436;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-family: inherit;
        }

        .doodle-chat-input button:disabled {
          background: #dfe6e9;
          cursor: not-allowed;
        }

        /* Mobile Overlay Styles */
        @media (max-width: 768px) {
          .doodle-chat-container {
            display: none; 
          }
          .doodle-chat-container.mobile-open {
            display: flex;
            position: fixed;
            top: 10%;
            left: 5%;
            width: 90%;
            height: 80%;
            z-index: 1000;
            box-shadow: 8px 8px 0px rgba(0,0,0,0.3);
          }
          .doodle-close-btn {
            display: block; 
          }
          .chat-mobile-backdrop {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(2px);
            z-index: 999;
          }
        }
      `}</style>

      {isOpen && <div className="chat-mobile-backdrop" onClick={onClose}></div>}
      
      <aside className={`doodle-chat-container ${isOpen ? 'mobile-open' : ''}`}>
        <div className="doodle-chat-header">
          <span>📝 GUESS CHAT</span>
          <button className="doodle-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="doodle-chat-messages">
          {messages.map((msg) => (
            <div 
              key={msg.id || Math.random()} 
              className={`doodle-msg ${msg.system ? 'system-msg' : ''} ${msg.isSuccess ? 'success-msg' : ''}`}
            >
              {msg.system ? (
                <span>{msg.text}</span>
              ) : (
                <span><strong>{msg.username}:</strong> {msg.text}</span>
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        <form className="doodle-chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={isInputDisabled ? "You are drawing..." : "Type guess..."}
            disabled={isInputDisabled}
          />
          <button type="submit" disabled={isInputDisabled || !inputMsg.trim()}>
            Send
          </button>
        </form>
      </aside>
    </>
  );
};

export default Chat;