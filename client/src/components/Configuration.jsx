import React, { useState } from 'react';
import './Configuration.css';

const Configuration = ({ room, settings, onUpdateSettings, onStartGame, isHost }) => {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/draw/${room}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <div className="config-overlay">
      <div className="config-card">
        <div className="config-header">
          <h2>Room Setup ({room})</h2>
          <span className="badge">{isHost ? "Host Controls" : "Guest View"}</span>
        </div>

        <div className="invite-box">
          <label>INVITE FRIENDS</label>
          <div className="invite-input-row">
            <input type="text" readOnly value={inviteLink} className="visible-link-input" />
            <button type="button" className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <label className="section-label">MATCH CONFIGURATION</label>

          <div className="setting-row">
            <span>Draw Time:</span>
            {isHost ? (
              <select value={settings.timeLimit || 60} onChange={(e) => onUpdateSettings('timeLimit', Number(e.target.value))}>
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds</option>
                <option value={90}>90 Seconds</option>
              </select>
            ) : (
              <strong>{settings.timeLimit || 60} Seconds</strong>
            )}
          </div>

          <div className="setting-row">
            <span>Total Rounds:</span>
            {isHost ? (
              <select value={settings.totalRounds || 3} onChange={(e) => onUpdateSettings('totalRounds', Number(e.target.value))}>
                <option value={2}>2 Rounds</option>
                <option value={3}>3 Rounds</option>
                <option value={5}>5 Rounds</option>
              </select>
            ) : (
              <strong>{settings.totalRounds || 3} Rounds</strong>
            )}
          </div>
        </div>

        {isHost ? (
          <button type="button" className="start-game-btn" onClick={onStartGame}>
            🚀 START GAME NOW
          </button>
        ) : (
          <div className="guest-waiting-footer">
            <span className="pulse-dot"></span> Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuration;