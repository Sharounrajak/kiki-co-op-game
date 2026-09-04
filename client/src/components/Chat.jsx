import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = ({ socket, room, username, isDrawer, gameState, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleCorrectGuess = ({ winnerName, word }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'System', message: `🎉 ${winnerName} guessed "${word}"!`, isSystem: true }
      ]);
    };

    socket.on("receive_message", handleMessage);
    socket.on("correct_guess", handleCorrectGuess);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("correct_guess", handleCorrectGuess);
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit("send_message", {
      room,
      message: input,
      sender: username
    });
    setInput('');
  };

  const isChatDisabled = isDrawer && gameState === 'drawing';

  return (
    <div className={`chat-container ${isOpen ? 'mobile-open' : ''}`}>
      <div className="chat-header">
        <span>💬 Room Chat</span>
        <button className="close-chat-btn" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat-note">Type a message or guess the word!</div>
        ) : (
          messages.map((m) => (
            <div key={m.id || Math.random()} className={`chat-bubble ${m.isSystem ? 'system-msg' : ''}`}>
              <strong>{m.sender}: </strong>
              <span>{m.message}</span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-box">
        <input
          type="text"
          placeholder={isChatDisabled ? "You are drawing!" : "Type your guess..."}
          value={input}
          disabled={isChatDisabled}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={isChatDisabled || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;