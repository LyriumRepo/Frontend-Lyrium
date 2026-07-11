'use client';

import { useState, useCallback, useEffect } from 'react';
import { triviaQuestions, TriviaQuestion } from '@/shared/lib/constants/triviaData';
import { Lightbulb, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: 15 + Math.random() * 70,
  delay: Math.random() * 0.4,
  size: 4 + Math.random() * 6,
  color: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][i % 5],
}));

export default function TriviaWidget() {
  const [deck, setDeck] = useState<TriviaQuestion[]>(() => shuffleArray(triviaQuestions).slice(0, 5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showAnim, setShowAnim] = useState(false);

  const initDeck = useCallback(() => {
    setShowAnim(false);
    const shuffled = shuffleArray(triviaQuestions).slice(0, 5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setTotal(0);
    setFinished(false);
  }, []);

  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => setShowAnim(true), 50);
      return () => clearTimeout(t);
    }
  }, [finished]);

  const current = deck[currentIndex];

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
    setTotal(prev => prev + 1);
    if (index === current.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setFinished(true);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      lirios: 'Lirios',
      lyrium: 'Lyrium',
      salud: 'Salud',
      peru: 'Perú',
      variado: 'Variado',
    };
    return labels[category] || category;
  };

  if (!current) return null;

  return (
    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-[#dddddd] dark:to-[#dddddd] border border-sky-100 dark:border-gray-300 rounded-2xl p-4 space-y-3 overflow-hidden relative">
      {!finished ? (
        <>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500 dark:text-[var(--brand-green)]" />
            <h5 className="font-bold text-xs uppercase tracking-wider text-sky-600 dark:text-[var(--brand-green)]">
              ¿Sabías que...?
            </h5>
          </div>

          <span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 dark:bg-gray-200 text-[10px] font-bold text-sky-600 dark:text-gray-700 uppercase tracking-wider">
            {getCategoryLabel(current.category)}
          </span>

          <p className="text-sm font-semibold text-[#333333] leading-relaxed">
            {current.question}
          </p>

          <div className="space-y-1.5">
            {current.options.map((option, i) => {
              let btnClass = 'bg-white dark:bg-gray-100 border-gray-200 dark:border-gray-300 text-gray-700 dark:text-gray-800 hover:border-sky-300 dark:hover:border-gray-400';
              if (revealed && i === current.correctIndex) {
                btnClass = 'bg-emerald-50 dark:bg-emerald-100 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-900';
              } else if (revealed && i === selected && i !== current.correctIndex) {
                btnClass = 'bg-red-50 dark:bg-red-100 border-red-300 dark:border-red-400 text-red-700 dark:text-red-800';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={revealed}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all duration-300 ${btnClass} ${!revealed ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-200 text-[10px] font-bold text-gray-500 shrink-0">
                    {['A', 'B', 'C', 'D'][i]}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-600 italic leading-relaxed bg-white dark:bg-gray-100 rounded-xl p-3 border border-gray-100 dark:border-gray-300">
                <Lightbulb className="w-3.5 h-3.5 inline-block mr-1 text-amber-500" />
                {current.explanation}
              </p>
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 dark:bg-[var(--brand-green)] text-white text-xs font-bold hover:bg-sky-600 dark:hover:brightness-110 transition-all"
              >
                {currentIndex < deck.length - 1 ? (
                  <>Siguiente <ChevronRight className="w-3.5 h-3.5" /></>
                ) : (
                  'Ver resultado'
                )}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            <span>{currentIndex + 1} / {deck.length}</span>
            <span>✓ {score} / {total}</span>
          </div>
        </>
      ) : (
        <div className={`relative ${showAnim ? 'animate-in' : 'opacity-0'}`}>
          {showAnim && (
            <style>{`
              @keyframes float-up {
                0% { transform: translateY(0) scale(0); opacity: 0; }
                20% { transform: translateY(-10px) scale(1); opacity: 0.8; }
                100% { transform: translateY(-80px) scale(0.3); opacity: 0; }
              }
              @keyframes pulse-glow {
                0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(14,165,233,0.2); }
                50% { transform: scale(1.05); box-shadow: 0 0 20px 4px rgba(14,165,233,0.15); }
              }
              @keyframes slide-up {
                0% { transform: translateY(20px) scale(0.95); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
              }
              .trivia-particle {
                position: absolute;
                border-radius: 50%;
                pointer-events: none;
                animation: float-up 1.2s ease-out forwards;
              }
              .trivia-result-card {
                animation: slide-up 0.5s ease-out forwards;
              }
              .trivia-score-pop {
                animation: pulse-glow 1.5s ease-in-out infinite;
              }
            `}</style>
          )}
          {showAnim && particles.map(p => (
            <div
              key={p.id}
              className="trivia-particle"
              style={{
                left: `${p.left}%`,
                bottom: '10px',
                width: p.size,
                height: p.size,
                background: p.color,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
          <div className="text-center space-y-3 py-2 trivia-result-card">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-gray-200 dark:to-gray-200 flex items-center justify-center trivia-score-pop">
              <Sparkles className="w-7 h-7 text-sky-500 dark:text-[var(--brand-green)]" />
            </div>
            <p className="text-sm font-bold text-[#333333]">¡Completaste la trivia!</p>
            <p className="text-xs text-gray-500 dark:text-gray-600">
              Acertaste <strong className="text-sky-600 dark:text-[var(--brand-green)] text-base">{score}</strong> de <strong>{total}</strong> preguntas
            </p>
            <button
              onClick={initDeck}
              className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl bg-sky-50 dark:bg-gray-100 text-sky-600 dark:text-[var(--brand-green)] text-xs font-bold border border-sky-100 dark:border-gray-300 hover:bg-sky-100 dark:hover:bg-gray-200 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
