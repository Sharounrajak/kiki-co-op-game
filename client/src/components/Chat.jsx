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
    <>
      {isOpen && <div className="chat-mobile-backdrop" onClick={onClose} style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 99}}></div>}
      <aside className={`chat-box-wrapper doodle-chat-wrapper ${isOpen ? 'mobile-open' : ''}`} style={isOpen ? {position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 100, background: '#fff', borderTop: '4px solid #333', borderRadius: '15px 15px 0 0'} : {}}>
        <div className="chat-header doodle-chat-header" style={{borderBottom: '2px dashed #ccc', padding: '10px'}}>
          <span style={{fontFamily: 'cursive', fontWeight: 'bold'}}>📝 GUESS CHAT</span>
          {onClose && <button className="chat-close-btn doodle-close-btn" onClick={onClose}>✕</button>}
        </div>

        <div className="chat-messages doodle-chat-messages" style={{fontFamily: 'cursive'}}>
          {messages.map((msg) => (
            <div
              key={msg.id || Math.random()}
              className={`chat-msg doodle-msg ${msg.system ? 'system-msg' : ''}`}
            >
              {msg.system ? (
                <strong style={{color: '#888'}}>{msg.text}</strong>
              ) : (
                <span><strong>{msg.username}:</strong> {msg.text}</span>
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        <form className="chat-input-form doodle-chat-input" onSubmit={handleSendMessage} style={{display: 'flex', gap: '5px', padding: '10px', borderTop: '2px dashed #ccc'}}>
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={isDrawer ? "You are drawing..." : "Type your guess here..."}
            disabled={isDrawer || gameState !== 'drawing'}
            style={{flex: 1, padding: '8px', border: '2px solid #333', borderRadius: '8px', fontFamily: 'cursive'}}
          />
          <button type="submit" disabled={isDrawer || gameState !== 'drawing' || !inputMsg.trim()} style={{padding: '8px 15px', border: '2px solid #333', background: '#ffeaa7', borderRadius: '8px', cursor: 'pointer', fontFamily: 'cursive'}}>
            Send
          </button>
        </form>
      </aside>
    </>
  );
};

export default Chat;