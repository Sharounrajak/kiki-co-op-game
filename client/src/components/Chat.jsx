import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ socket, room, username, isDrawer, gameState, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msgData) => {
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

  return (
    <aside className={`chat-box-wrapper ${isOpen ? 'mobile-open' : ''}`}>
      <div className="chat-header">
        <span>GUESS CHAT</span>
        {onClose && <button className="chat-close-btn" onClick={onClose}>✕</button>}
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id || Math.random()}
            className={`chat-msg ${msg.system ? 'system-msg' : ''}`}
          >
            {msg.system ? (
              <strong>{msg.text}</strong>
            ) : (
              <span><strong>{msg.username}:</strong> {msg.text}</span>
            )}
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={isDrawer ? "You are drawing..." : "Type your guess here..."}
          disabled={isDrawer || gameState !== 'drawing'}
        />
        <button type="submit" disabled={isDrawer || gameState !== 'drawing' || !inputMsg.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
};

export default Chat;