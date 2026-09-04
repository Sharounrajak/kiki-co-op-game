import { describe, it, expect } from 'vitest';

// Pure logic helper functions to test game state routines
const maskWord = (word) => word.replace(/[a-zA-Z]/g, '_');

const calculateScore = (timeRemaining) => Math.max(10, timeRemaining * 10);

const generateInviteLink = (origin, roomCode) => `${origin}/draw/${roomCode}`;

describe('Skribbl Game Logic', () => {
  it('correctly masks the target word', () => {
    expect(maskWord('Pikachu')).toBe('_______');
    expect(maskWord('Formula 1')).toBe('_______ 1');
  });

  it('calculates points based on remaining turn time', () => {
    expect(calculateScore(45)).toBe(450);
    expect(calculateScore(0)).toBe(10);
  });

  it('formats working room invite link correctly', () => {
    const origin = 'http://localhost:5173';
    const room = 'D4PA';
    expect(generateInviteLink(origin, room)).toBe('http://localhost:5173/draw/D4PA');
  });
});