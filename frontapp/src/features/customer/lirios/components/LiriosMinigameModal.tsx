'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Trophy, RotateCcw, Sparkles, Leaf, Frown, Info, Coins } from 'lucide-react';

type Cell = 'player' | 'ai' | null;
type Board = Cell[];
type GameResult = 'win' | 'lose' | 'draw' | null;
type Difficulty = 'easy' | 'normal' | 'hard';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const CONFETTI_EMOJIS = ['🌟', '✨', '🌿', '🎉', '💚', '⭐', '🍃'];

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: 'easy', label: 'Fácil' },
  { key: 'normal', label: 'Normal' },
  { key: 'hard', label: 'Difícil' },
];

const REWARD_KEY = 'lirios-minigame-reward';

function checkWinner(board: Board): { winner: Cell; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

function isDraw(board: Board) {
  return board.every((c) => c !== null);
}

function getEmpty(board: Board): number[] {
  return board.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
}

function minimax(board: Board, depth: number, isMaximizing: boolean): number {
  const w = checkWinner(board);
  if (w?.winner === 'ai') return 10 - depth;
  if (w?.winner === 'player') return depth - 10;
  if (isDraw(board)) return 0;

  const empty = getEmpty(board);
  if (isMaximizing) {
    let best = -Infinity;
    for (const i of empty) {
      const t = [...board];
      t[i] = 'ai';
      best = Math.max(best, minimax(t, depth + 1, false));
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of empty) {
      const t = [...board];
      t[i] = 'player';
      best = Math.min(best, minimax(t, depth + 1, true));
    }
    return best;
  }
}

function getSmartMove(board: Board): number {
  const empty = getEmpty(board);
  if (empty.length === 0) return -1;

  for (const i of empty) {
    const t = [...board];
    t[i] = 'ai';
    if (checkWinner(t)?.winner === 'ai') return i;
  }
  for (const i of empty) {
    const t = [...board];
    t[i] = 'player';
    if (checkWinner(t)?.winner === 'player') return i;
  }
  if (board[4] === null) return 4;

  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  return empty[Math.floor(Math.random() * empty.length)];
}

function getHardMove(board: Board): number {
  const empty = getEmpty(board);
  if (empty.length === 0) return -1;

  let bestScore = -Infinity;
  let bestMove = empty[0];
  for (const i of empty) {
    const t = [...board];
    t[i] = 'ai';
    const score = minimax(t, 0, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

function getEasyMove(board: Board): number {
  const empty = getEmpty(board);
  if (empty.length === 0) return -1;
  if (Math.random() < 0.3) return getSmartMove(board);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getAiMove(board: Board, difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return getEasyMove(board);
    case 'normal': return getSmartMove(board);
    case 'hard': return getHardMove(board);
  }
}

function Particle({ index }: { index: number }) {
  const emoji = CONFETTI_EMOJIS[index % CONFETTI_EMOJIS.length];
  const left = 10 + Math.random() * 80;
  const delay = index * 0.07;
  const size = 16 + Math.random() * 16;
  return (
    <span
      className="absolute pointer-events-none"
      style={{
        left: `${left}%`,
        bottom: '40%',
        fontSize: `${size}px`,
        animation: `liriosConfetti 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`,
        opacity: 0,
      }}
    >
      {emoji}
    </span>
  );
}

export default function LiriosMinigameModal({
  open,
  onClose,
  onEarnLirios,
}: {
  open: boolean;
  onClose: () => void;
  onEarnLirios?: (amount: number) => void;
}) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [result, setResult] = useState<GameResult>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [claimedToday, setClaimedToday] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);
  const aiThinking = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(REWARD_KEY);
    setClaimedToday(stored === new Date().toISOString().slice(0, 10));
  }, [open]);

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn('player');
    setResult(null);
    setWinLine(null);
    setShowResult(false);
    setRewardEarned(false);
    aiThinking.current = false;
  }, []);

  const changeDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setBoard(Array(9).fill(null));
    setTurn('player');
    setResult(null);
    setWinLine(null);
    setShowResult(false);
    setRewardEarned(false);
    aiThinking.current = false;
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (turn === 'ai' && !result && !aiThinking.current) {
      aiThinking.current = true;
      const delay = 400 + Math.random() * 400;
      const timer = setTimeout(() => {
        setBoard((prev) => {
          const idx = getAiMove(prev, difficulty);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = 'ai';
          const w = checkWinner(next);
          if (w) {
            setWinLine(w.line);
            setResult('lose');
            setShowResult(true);
          } else if (isDraw(next)) {
            setResult('draw');
            setShowResult(true);
          } else {
            setTurn('player');
          }
          return next;
        });
        aiThinking.current = false;
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [turn, result, difficulty]);

  const handleClick = useCallback(
    (idx: number) => {
      if (board[idx] || turn !== 'player' || result) return;
      const next = [...board];
      next[idx] = 'player';
      const w = checkWinner(next);
      if (w) {
        setWinLine(w.line);
        setResult('win');
        setShowResult(true);
      } else if (isDraw(next)) {
        setResult('draw');
        setShowResult(true);
      } else {
        setTurn('ai');
      }
      setBoard(next);
    },
    [board, turn, result],
  );

  const handleWin = useCallback(() => {
    if (difficulty === 'hard' && !claimedToday) {
      setRewardEarned(true);
      setClaimedToday(true);
      localStorage.setItem(REWARD_KEY, new Date().toISOString().slice(0, 10));
      onEarnLirios?.(2);
    }
  }, [difficulty, claimedToday, onEarnLirios]);

  if (!open) return null;

  const todayFormatted = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <style>{`
        @keyframes liriosConfetti {
          0%   { transform: translateY(0) scale(0) rotate(0deg); opacity: 0; }
          20%  { transform: translateY(-20px) scale(1.3) rotate(15deg); opacity: 1; }
          60%  { transform: translateY(-60px) scale(1) rotate(-10deg); opacity: 0.9; }
          100% { transform: translateY(-120px) scale(0.6) rotate(30deg); opacity: 0; }
        }
        @keyframes liriosBounceIn {
          0%   { transform: scale(0); opacity: 0; }
          50%  { transform: scale(1.25); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes liriosShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-3deg); }
          40% { transform: translateX(8px) rotate(3deg); }
          60% { transform: translateX(-5px) rotate(-2deg); }
          80% { transform: translateX(5px) rotate(2deg); }
        }
      `}</style>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[var(--bg-card)] rounded-3xl shadow-2xl border border-gray-200 dark:border-[var(--border-subtle)] w-full max-w-sm animate-fade-slide-in">
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 dark:from-emerald-700 dark:to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-black text-sm uppercase tracking-wider">Tres en Raya Lirio</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Difficulty selector */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-xl p-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                onClick={() => changeDifficulty(d.key)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    difficulty === d.key
                      ? 'bg-white dark:bg-[var(--bg-card)] text-sky-700 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-[var(--border-subtle)]'
                      : 'text-gray-500 dark:text-[var(--text-muted)] hover:text-sky-600 dark:hover:text-emerald-400'
                }`}
              >
                {d.label}
                {d.key === 'hard' && (
                    <span className="relative group inline-flex items-center">
                    <Info className="w-3 h-3 text-sky-500 dark:text-emerald-400" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 hidden group-hover:block z-50">
                      <div className="bg-sky-800 dark:bg-emerald-950 text-white text-[10px] leading-relaxed rounded-xl p-3 shadow-xl text-center">
                        <p className="font-bold mb-1">💎 Modo difícil</p>
                        <p className="text-gray-200">
                          ¡Gana <span className="text-sky-400 dark:text-emerald-400 font-bold">+2 Lirios</span> si vences a la IA!
                        </p>
                        <p className="text-gray-400 mt-1">
                          Disponible 1 vez al día
                        </p>
                        {claimedToday && (
                          <p className="text-sky-400 dark:text-emerald-400 mt-1 font-bold">
                            ✓ Reclamado hoy
                          </p>
                        )}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 bg-sky-800 dark:bg-emerald-950 rotate-45" />
                    </div>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {result && showResult ? (
            <div className="text-center space-y-4 py-4">
              {result === 'win' && (
                <div className="relative">
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <Particle key={i} index={i} />
                    ))}
                  </div>
                  <div
                    className="w-16 h-16 rounded-full bg-sky-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto"
                    style={{ animation: 'liriosBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards' }}
                  >
                    <Trophy className="w-8 h-8 text-sky-500 dark:text-emerald-400" />
                  </div>
                  <p
                    className="text-xl font-black text-sky-600 dark:text-emerald-400 mt-4"
                    style={{ animation: 'liriosBounceIn 0.4s 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) both' }}
                  >
                    ¡Ganaste!
                  </p>
                  <p
                    className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1"
                    style={{ animation: 'liriosBounceIn 0.3s 0.5s both' }}
                  >
                    {rewardEarned ? '¡Has ganado 2 Lirios!' : '¡Eres imparable!'}
                  </p>
                  {rewardEarned && (
                    <div
                      className="mt-3 inline-flex items-center gap-1.5 bg-sky-100 dark:bg-emerald-900/40 text-sky-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ animation: 'liriosBounceIn 0.4s 0.6s both' }}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      +2 Lirios
                    </div>
                  )}
                </div>
              )}
              {result === 'draw' && (
                <>
                  <div
                    className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto"
                    style={{ animation: 'liriosBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards' }}
                  >
                    <Leaf className="w-8 h-8 text-cyan-500 dark:text-emerald-400" />
                  </div>
                  <p
                    className="text-xl font-black text-cyan-600 dark:text-emerald-400 mt-4"
                    style={{ animation: 'liriosBounceIn 0.4s 0.3s both' }}
                  >
                    ¡Empate!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">
                    ¡Estuvo reñido!
                  </p>
                </>
              )}
              {result === 'lose' && (
                <>
                  <div
                    className="w-16 h-16 rounded-full bg-sky-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto"
                    style={{ animation: 'liriosShake 0.5s ease-in-out' }}
                  >
                    <Frown className="w-8 h-8 text-sky-500 dark:text-emerald-400" />
                  </div>
                  <p className="text-xl font-black text-sky-600 dark:text-emerald-400 mt-4">Perdiste</p>
                  <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] mt-1">
                    ¡La próxima será!
                  </p>
                </>
              )}
              <button
                onClick={() => { reset(); if (!claimedToday) handleWin(); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 dark:bg-emerald-600 text-white text-sm font-bold hover:bg-sky-600 dark:hover:bg-emerald-700 transition"
              >
                <RotateCcw className="w-4 h-4" /> Jugar otra vez
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-sky-500 dark:text-emerald-400" /> Tú (🌿)
                </span>
                <span className="font-bold">
                  {turn === 'player' ? 'Tu turno' : 'Pensando...'}
                </span>
                <span className="flex items-center gap-1">
                  💎 IA
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 aspect-square max-w-[280px] mx-auto">
                {board.map((cell, i) => {
                  const isWinning = winLine?.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => handleClick(i)}
                      disabled={!!cell || turn !== 'player' || !!result}
                      className={`aspect-square rounded-xl text-3xl font-black flex items-center justify-center transition-all duration-200
                        ${isWinning ? 'bg-sky-100 dark:bg-emerald-900/40 scale-105' : 'bg-gray-50 dark:bg-[var(--bg-muted)]'}
                        ${!cell && turn === 'player' && !result ? 'hover:bg-sky-50 dark:hover:bg-emerald-900/20 hover:scale-105 active:scale-95 cursor-pointer' : ''}
                        ${cell ? 'shadow-inner' : 'shadow-sm hover:shadow-md'}
                        border border-gray-200 dark:border-[var(--border-subtle)]
                        disabled:opacity-80 disabled:cursor-not-allowed`}
                    >
                      {cell === 'player' && <span className="text-sky-500 dark:text-emerald-400">🌿</span>}
                      {cell === 'ai' && <span className="text-sky-500 dark:text-emerald-400">💎</span>}
                    </button>
                  );
                })}
              </div>

              {!result && (
                <div className="flex justify-center">
                  <button
                    onClick={reset}
                    className="text-[10px] font-black uppercase text-gray-400 hover:text-sky-500 dark:hover:text-emerald-400 transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reiniciar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
