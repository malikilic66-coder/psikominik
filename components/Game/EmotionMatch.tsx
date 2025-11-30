import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RefreshCw, Play, Crown, X, Clock, Sparkles } from 'lucide-react';

interface Card {
  id: number;
  emotion: string;
  emoji: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface EmotionType {
  name: string;
  emoji: string;
  color: string;
  message: string;
}

const EMOTIONS: EmotionType[] = [
  { name: 'Mutlu', emoji: '😊', color: '#F9E104', message: 'Mutluluk güzel bir duygu!' },
  { name: 'Üzgün', emoji: '😢', color: '#60A5FA', message: 'Üzülmek de olur, geçer!' },
  { name: 'Kızgın', emoji: '😠', color: '#EF4444', message: 'Kızgınlık geçicidir.' },
  { name: 'Şaşkın', emoji: '😲', color: '#A855F7', message: 'Şaşırmak merak demek!' },
  { name: 'Korkmuş', emoji: '😨', color: '#6366F1', message: 'Korku bizi korur.' },
  { name: 'Sevgi', emoji: '🥰', color: '#EC4899', message: 'Sevgi en güzel duygu!' },
  { name: 'Heyecanlı', emoji: '🤩', color: '#F97316', message: 'Heyecan enerji verir!' },
  { name: 'Sakin', emoji: '😌', color: '#10B981', message: 'Sakinlik huzur getirir.' },
];

const LEVELS = [
  { pairs: 4, name: 'Kolay', gridCols: 4 },
  { pairs: 6, name: 'Orta', gridCols: 4 },
  { pairs: 8, name: 'Zor', gridCols: 4 },
];

const EmotionMatch: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('psiko_emotion_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !showConfetti) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, showConfetti]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const initGame = useCallback((levelIndex: number = 0) => {
    const currentLevel = LEVELS[levelIndex];
    const selectedEmotions = shuffleArray(EMOTIONS).slice(0, currentLevel.pairs);
    
    const cardPairs: Card[] = [];
    selectedEmotions.forEach((emotion, index) => {
      // Create pairs
      cardPairs.push({
        id: index * 2,
        emotion: emotion.name,
        emoji: emotion.emoji,
        color: emotion.color,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: index * 2 + 1,
        emotion: emotion.name,
        emoji: emotion.emoji,
        color: emotion.color,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setCombo(0);
    setLevel(levelIndex);
    setIsPlaying(true);
    setIsFullScreen(true);
    setShowMessage(null);
    setShowConfetti(false);
    setIsLocked(false);
  }, []);

  const handleCardClick = (cardId: number) => {
    if (isLocked) return;
    
    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;
    if (flippedCards.length >= 2) return;

    // Flip the card
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;

      if (firstCard.emotion === secondCard.emotion) {
        // Match found!
        const newCombo = combo + 1;
        setCombo(newCombo);
        
        const basePoints = 100;
        const comboBonus = newCombo > 1 ? newCombo * 20 : 0;
        const timeBonus = Math.max(0, 50 - timer);
        const points = basePoints + comboBonus + timeBonus;
        
        setScore(s => s + points);
        setMatchedPairs(mp => mp + 1);

        // Show emotion message
        const emotion = EMOTIONS.find(e => e.name === firstCard.emotion);
        setShowMessage(emotion?.message || 'Harika!');
        setTimeout(() => setShowMessage(null), 1500);

        setCards(prev => prev.map(card => 
          card.emotion === firstCard.emotion ? { ...card, isMatched: true } : card
        ));

        setFlippedCards([]);
        setIsLocked(false);

        // Check for level complete
        const newMatchedPairs = matchedPairs + 1;
        if (newMatchedPairs === LEVELS[level].pairs) {
          // Level complete!
          setShowConfetti(true);
          
          // Bonus points for completing level
          const levelBonus = (level + 1) * 200;
          const finalScore = score + points + levelBonus;
          setScore(finalScore);
          
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('psiko_emotion_highscore', finalScore.toString());
          }

          // Next level or game complete
          setTimeout(() => {
            if (level < LEVELS.length - 1) {
              initGame(level + 1);
            } else {
              // Game complete!
              setIsPlaying(false);
              setShowConfetti(false);
            }
          }, 2000);
        }
      } else {
        // No match - flip back
        setCombo(0);
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const stopGame = () => {
    setIsPlaying(false);
    setIsFullScreen(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('psiko_emotion_highscore', score.toString());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const containerClasses = isFullScreen
    ? "fixed inset-0 z-50 w-full h-full bg-gradient-to-b from-purple-100 to-pink-100"
    : "w-full max-w-2xl mx-auto glass-panel rounded-3xl overflow-hidden relative shadow-2xl transform hover:scale-[1.01] transition-all duration-300 h-[500px]";

  return (
    <div className={containerClasses}>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles 
                size={20 + Math.random() * 20} 
                className="text-yellow-400"
                style={{ 
                  transform: `rotate(${Math.random() * 360}deg)`,
                  color: ['#F9E104', '#FF5656', '#3DB6B1', '#A855F7', '#EC4899'][Math.floor(Math.random() * 5)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Exit Button */}
      {isFullScreen && (
        <button
          onClick={stopGame}
          className="absolute bottom-4 right-4 z-50 bg-white/50 backdrop-blur hover:bg-white text-deep-slate p-3 rounded-full shadow-lg transition-all"
        >
          <X size={24} />
        </button>
      )}

      {/* Message Overlay */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-white/95 backdrop-blur px-8 py-4 rounded-3xl shadow-2xl animate-bounce">
            <p className="text-2xl font-heading text-psiko-teal">{showMessage}</p>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8">
          <div className="bg-gradient-to-br from-purple-400 to-pink-400 p-6 rounded-full shadow-soft mb-6 animate-bounce">
            <span className="text-5xl">🧩</span>
          </div>
          <h3 className="font-heading text-3xl text-deep-slate mb-2">Duygu Eşleştirme</h3>

          {score > 0 ? (
            <div className="mb-8">
              <p className="text-gray-500 text-lg">Skorun</p>
              <p className="text-4xl font-heading text-purple-500 mb-2">{score}</p>
              {matchedPairs === LEVELS[LEVELS.length - 1].pairs && level === LEVELS.length - 1 && (
                <p className="text-pink-500 font-bold text-xl mb-2">Tüm Seviyeleri Tamamladın! 🎉</p>
              )}
              {score >= highScore && score > 0 && (
                <p className="text-sun-yellow font-bold animate-pulse">Yeni Rekor! 🏆</p>
              )}
              <div className="text-sm text-gray-400 mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">
                En Yüksek: {highScore}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-8 max-w-xs">
              Duygu kartlarını eşleştir ve duyguları tanımayı öğren! Her eşleşmede puan kazan.
            </p>
          )}

          <button
            onClick={() => initGame(0)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-heading text-xl px-12 py-4 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105 flex items-center gap-3"
          >
            {score > 0 ? <RefreshCw /> : <Play />}
            {score > 0 ? 'Tekrar Oyna' : 'Oyuna Başla'}
          </button>
          <p className="text-xs text-gray-400 mt-4">*Oyun tam ekran açılacaktır.</p>
        </div>
      )}

      {/* HUD */}
      {isPlaying && (
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div className="flex justify-between items-start gap-2">
            {/* Left - Score & Level */}
            <div className="flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-md flex items-center gap-2">
                <Trophy className="text-purple-500" size={18} />
                <span className="font-heading text-xl text-deep-slate">{score}</span>
              </div>
              <div className="bg-purple-500 text-white px-3 py-1 rounded-xl shadow-md text-sm font-bold">
                Seviye {level + 1}: {LEVELS[level].name}
              </div>
              {combo > 1 && (
                <div className="bg-sun-yellow text-deep-slate px-3 py-1 rounded-xl shadow-md font-heading font-bold animate-pulse">
                  {combo}x Combo!
                </div>
              )}
            </div>

            {/* Right - Timer, Moves, High Score */}
            <div className="flex flex-col gap-2 items-end">
              <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-2xl shadow-md flex items-center gap-2">
                <Clock className="text-pink-500" size={16} />
                <span className="font-heading text-lg text-deep-slate">{formatTime(timer)}</span>
              </div>
              <div className="bg-white/60 backdrop-blur px-3 py-1 rounded-xl shadow-sm text-sm font-bold text-gray-500">
                Hamle: {moves}
              </div>
              <div className="bg-white/60 backdrop-blur px-3 py-1 rounded-xl shadow-sm flex items-center gap-1 text-sm font-bold text-gray-500">
                <Crown size={14} className="text-sun-yellow fill-current" />
                {highScore}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Grid */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pt-28 pb-20">
          <div 
            className="grid gap-3 sm:gap-4 w-full max-w-lg mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${LEVELS[level].gridCols}, minmax(0, 1fr))`,
            }}
          >
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped || isLocked}
                className={`
                  aspect-square rounded-2xl shadow-lg transition-all duration-300 transform
                  ${card.isFlipped || card.isMatched 
                    ? 'scale-100 rotate-0' 
                    : 'hover:scale-105 hover:-rotate-3'
                  }
                  ${card.isMatched ? 'opacity-50 scale-95' : ''}
                `}
                style={{
                  perspective: '1000px',
                }}
              >
                <div
                  className={`
                    w-full h-full rounded-2xl transition-transform duration-500 transform-gpu
                    ${card.isFlipped || card.isMatched ? '' : ''}
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Card Back */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center backface-hidden shadow-inner"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-4xl sm:text-5xl">❓</span>
                  </div>
                  
                  {/* Card Front */}
                  <div
                    className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center backface-hidden shadow-inner p-2"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      backgroundColor: card.color + '30',
                      border: `3px solid ${card.color}`,
                    }}
                  >
                    <span className="text-4xl sm:text-5xl mb-1">{card.emoji}</span>
                    <span 
                      className="text-xs sm:text-sm font-bold"
                      style={{ color: card.color }}
                    >
                      {card.emotion}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instruction Footer */}
      {!isFullScreen && (
        <div className="bg-white/50 backdrop-blur p-4 text-center border-t border-white/60 absolute bottom-0 w-full">
          <div className="flex justify-center gap-4 text-xs md:text-sm font-bold text-deep-slate/70">
            <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
              <span className="text-lg">🧩</span> Eşleştir
            </span>
            <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
              <span className="text-lg">😊</span> Duyguları Tanı
            </span>
            <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg">
              <span className="text-lg">🏆</span> Puan Kazan
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionMatch;
