import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Card {
  id: number;
  emotionIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface EmotionType {
  color: string;
  bgColor: string;
}

// Emotions defined by their visual appearance (drawn on canvas)
const EMOTIONS: EmotionType[] = [
  { color: '#FFD700', bgColor: '#FFF8DC' }, // Happy - yellow
  { color: '#60A5FA', bgColor: '#EFF6FF' }, // Sad - blue
  { color: '#EF4444', bgColor: '#FEF2F2' }, // Angry - red
  { color: '#A855F7', bgColor: '#FAF5FF' }, // Surprised - purple
  { color: '#6366F1', bgColor: '#EEF2FF' }, // Scared - indigo
  { color: '#EC4899', bgColor: '#FDF2F8' }, // Love - pink
  { color: '#F97316', bgColor: '#FFF7ED' }, // Excited - orange
  { color: '#10B981', bgColor: '#ECFDF5' }, // Calm - green
];

const LEVELS = [
  { pairs: 4, gridCols: 4 },
  { pairs: 6, gridCols: 4 },
  { pairs: 8, gridCols: 4 },
];

// Canvas-based face drawing component
const FaceCanvas: React.FC<{ emotionIndex: number; size: number }> = ({ emotionIndex, size }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const emotion = EMOTIONS[emotionIndex];
    const centerX = size / 2;
    const centerY = size / 2;
    const faceRadius = size * 0.38;

    ctx.clearRect(0, 0, size, size);

    // Face circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, faceRadius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      centerX - faceRadius * 0.3, centerY - faceRadius * 0.3, 0,
      centerX, centerY, faceRadius
    );
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.3, emotion.color);
    gradient.addColorStop(1, shadeColor(emotion.color, -20));
    ctx.fillStyle = gradient;
    ctx.fill();

    // Face outline
    ctx.strokeStyle = shadeColor(emotion.color, -30);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw different expressions based on emotion
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const eyeY = centerY - faceRadius * 0.15;
    const eyeSpacing = faceRadius * 0.35;
    const eyeSize = faceRadius * 0.12;

    switch (emotionIndex) {
      case 0: // Happy 😊
        // Happy eyes (arcs)
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY, eyeSize * 1.2, 0.9 * Math.PI, 0.1 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing, eyeY, eyeSize * 1.2, 0.9 * Math.PI, 0.1 * Math.PI);
        ctx.stroke();
        // Big smile
        ctx.beginPath();
        ctx.arc(centerX, centerY + faceRadius * 0.1, faceRadius * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        // Rosy cheeks
        ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
        ctx.beginPath();
        ctx.ellipse(centerX - eyeSpacing * 1.3, eyeY + faceRadius * 0.35, faceRadius * 0.12, faceRadius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + eyeSpacing * 1.3, eyeY + faceRadius * 0.35, faceRadius * 0.12, faceRadius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 1: // Sad 😢
        // Sad eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Sad eyebrows
        ctx.beginPath();
        ctx.moveTo(centerX - eyeSpacing - eyeSize * 1.5, eyeY - eyeSize * 1.5);
        ctx.lineTo(centerX - eyeSpacing + eyeSize * 1.5, eyeY - eyeSize * 2.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + eyeSpacing + eyeSize * 1.5, eyeY - eyeSize * 1.5);
        ctx.lineTo(centerX + eyeSpacing - eyeSize * 1.5, eyeY - eyeSize * 2.2);
        ctx.stroke();
        // Sad mouth
        ctx.beginPath();
        ctx.arc(centerX, centerY + faceRadius * 0.45, faceRadius * 0.2, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        // Tear
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.ellipse(centerX - eyeSpacing + eyeSize * 0.5, eyeY + eyeSize * 2, eyeSize * 0.4, eyeSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 2: // Angry 😠
        // Angry eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY + eyeSize * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing, eyeY + eyeSize * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Angry eyebrows (V shape)
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX - eyeSpacing - eyeSize * 1.8, eyeY - eyeSize * 1.2);
        ctx.lineTo(centerX - eyeSpacing + eyeSize * 0.5, eyeY - eyeSize * 2.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX + eyeSpacing + eyeSize * 1.8, eyeY - eyeSize * 1.2);
        ctx.lineTo(centerX + eyeSpacing - eyeSize * 0.5, eyeY - eyeSize * 2.5);
        ctx.stroke();
        // Angry mouth
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - faceRadius * 0.25, centerY + faceRadius * 0.35);
        ctx.lineTo(centerX + faceRadius * 0.25, centerY + faceRadius * 0.35);
        ctx.stroke();
        break;

      case 3: // Surprised 😲
        // Big round eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY, eyeSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing, eyeY, eyeSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing + eyeSize * 0.4, eyeY - eyeSize * 0.4, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing + eyeSize * 0.4, eyeY - eyeSize * 0.4, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Raised eyebrows
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY - eyeSize * 3, eyeSize * 1.5, 0.7 * Math.PI, 0.3 * Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing, eyeY - eyeSize * 3, eyeSize * 1.5, 0.7 * Math.PI, 0.3 * Math.PI, true);
        ctx.stroke();
        // O mouth
        ctx.beginPath();
        ctx.arc(centerX, centerY + faceRadius * 0.35, faceRadius * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 4: // Scared 😨
        // Wide scared eyes
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(centerX - eyeSpacing, eyeY, eyeSize * 1.2, eyeSize * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + eyeSpacing, eyeY, eyeSize * 1.2, eyeSize * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing + eyeSize * 0.3, eyeY - eyeSize * 0.5, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing + eyeSize * 0.3, eyeY - eyeSize * 0.5, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        // Wavy scared mouth
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(centerX - faceRadius * 0.25, centerY + faceRadius * 0.35);
        ctx.quadraticCurveTo(centerX - faceRadius * 0.12, centerY + faceRadius * 0.25, centerX, centerY + faceRadius * 0.35);
        ctx.quadraticCurveTo(centerX + faceRadius * 0.12, centerY + faceRadius * 0.45, centerX + faceRadius * 0.25, centerY + faceRadius * 0.35);
        ctx.stroke();
        // Sweat drop
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.ellipse(centerX + eyeSpacing + eyeSize * 2, eyeY, eyeSize * 0.4, eyeSize * 0.7, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 5: // Love 🥰
        // Heart eyes
        ctx.fillStyle = '#EC4899';
        drawHeart(ctx, centerX - eyeSpacing, eyeY, eyeSize * 2);
        drawHeart(ctx, centerX + eyeSpacing, eyeY, eyeSize * 2);
        // Smile with tongue
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX, centerY + faceRadius * 0.1, faceRadius * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Rosy cheeks
        ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX - eyeSpacing * 1.4, centerY + faceRadius * 0.15, faceRadius * 0.12, faceRadius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + eyeSpacing * 1.4, centerY + faceRadius * 0.15, faceRadius * 0.12, faceRadius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 6: // Excited 🤩
        // Star eyes
        ctx.fillStyle = '#FFD700';
        drawStar(ctx, centerX - eyeSpacing, eyeY, eyeSize * 1.8);
        drawStar(ctx, centerX + eyeSpacing, eyeY, eyeSize * 1.8);
        // Big open smile
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX, centerY + faceRadius * 0.15, faceRadius * 0.3, 0, Math.PI);
        ctx.fill();
        // Teeth
        ctx.fillStyle = 'white';
        ctx.fillRect(centerX - faceRadius * 0.2, centerY + faceRadius * 0.15, faceRadius * 0.4, faceRadius * 0.1);
        break;

      case 7: // Calm 😌
        // Closed peaceful eyes
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX - eyeSpacing, eyeY, eyeSize * 1.2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX + eyeSpacing, eyeY, eyeSize * 1.2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Peaceful smile
        ctx.beginPath();
        ctx.arc(centerX, centerY + faceRadius * 0.15, faceRadius * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Blush
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX - eyeSpacing * 1.2, eyeY + faceRadius * 0.25, faceRadius * 0.1, faceRadius * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + eyeSpacing * 1.2, eyeY + faceRadius * 0.25, faceRadius * 0.1, faceRadius * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }, [emotionIndex, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="w-full h-full" />;
};

// Helper function to draw a heart
const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
  ctx.bezierCurveTo(x - size * 0.5, y + size * 0.6, x, y + size * 0.8, x, y + size * 0.8);
  ctx.bezierCurveTo(x, y + size * 0.8, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
  ctx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
  ctx.fill();
};

// Helper function to draw a star
const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = x + Math.cos(angle) * size;
    const py = y + Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
};

// Helper function to shade colors
const shadeColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

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
  const [isLocked, setIsLocked] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const audioContextRef = useRef<AudioContext>();

  useEffect(() => {
    const saved = localStorage.getItem('psiko_emotion_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const playSound = useCallback((type: 'flip' | 'match' | 'wrong' | 'win') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      switch (type) {
        case 'flip':
          oscillator.frequency.value = 600;
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.1);
          break;
        case 'match':
          oscillator.frequency.setValueAtTime(523, ctx.currentTime);
          oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.4);
          break;
        case 'wrong':
          oscillator.frequency.value = 200;
          oscillator.type = 'sawtooth';
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.2);
          break;
        case 'win':
          [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.3);
          });
          break;
      }
    } catch (e) {}
  }, []);

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
    const emotionIndices = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, currentLevel.pairs);
    
    const cardPairs: Card[] = [];
    emotionIndices.forEach((emotionIndex, index) => {
      cardPairs.push({
        id: index * 2,
        emotionIndex,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: index * 2 + 1,
        emotionIndex,
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setCombo(0);
    setLevel(levelIndex);
    setIsPlaying(true);
    setIsFullScreen(true);
    setShowConfetti(false);
    setIsLocked(false);
  }, []);

  const handleCardClick = (cardId: number) => {
    if (isLocked) return;
    
    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;
    if (flippedCards.length >= 2) return;

    playSound('flip');
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;

      if (firstCard.emotionIndex === secondCard.emotionIndex) {
        playSound('match');
        const newCombo = combo + 1;
        setCombo(newCombo);
        
        const points = 100 + (newCombo > 1 ? newCombo * 20 : 0);
        setScore(s => s + points);
        setMatchedPairs(mp => mp + 1);
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 800);

        setCards(prev => prev.map(card => 
          card.emotionIndex === firstCard.emotionIndex ? { ...card, isMatched: true } : card
        ));

        setFlippedCards([]);
        setIsLocked(false);

        const newMatchedPairs = matchedPairs + 1;
        if (newMatchedPairs === LEVELS[level].pairs) {
          playSound('win');
          setShowConfetti(true);
          
          const levelBonus = (level + 1) * 200;
          const finalScore = score + points + levelBonus;
          setScore(finalScore);
          
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('psiko_emotion_highscore', finalScore.toString());
          }

          setTimeout(() => {
            if (level < LEVELS.length - 1) {
              initGame(level + 1);
            } else {
              setIsPlaying(false);
              setShowConfetti(false);
            }
          }, 2000);
        }
      } else {
        playSound('wrong');
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

  const containerClasses = isFullScreen
    ? "fixed inset-0 z-50 w-full h-full bg-gradient-to-b from-purple-200 to-pink-200"
    : "w-full max-w-2xl mx-auto glass-panel rounded-3xl overflow-hidden relative shadow-2xl h-[500px]";

  return (
    <div className={containerClasses}>
      {/* Confetti */}
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
                style={{ 
                  transform: `rotate(${Math.random() * 360}deg)`,
                  color: ['#F9E104', '#FF5656', '#3DB6B1', '#A855F7', '#EC4899'][Math.floor(Math.random() * 5)]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Match animation */}
      {showMatch && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-8xl animate-bounce">⭐</div>
        </div>
      )}

      {/* Exit Button */}
      {isFullScreen && (
        <button
          onClick={stopGame}
          className="absolute bottom-4 right-4 z-50 bg-white/70 hover:bg-white p-4 rounded-full shadow-lg transition-all"
        >
          <X size={28} />
        </button>
      )}

      {/* Start Screen - Visual only */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center text-center p-8">
          <div className="text-8xl mb-6 animate-bounce">🧩</div>
          
          <div className="flex gap-4 mb-8">
            {[0, 1, 5, 6].map(i => (
              <div key={i} className="w-16 h-16 rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: EMOTIONS[i].bgColor }}>
                <FaceCanvas emotionIndex={i} size={64} />
              </div>
            ))}
          </div>

          {score > 0 && (
            <div className="mb-6 flex items-center gap-3 bg-purple-100 px-6 py-3 rounded-2xl">
              <span className="text-4xl">⭐</span>
              <span className="text-4xl font-bold text-purple-600">{score}</span>
              {score >= highScore && score > 0 && <span className="text-3xl">🏆</span>}
            </div>
          )}

          {highScore > 0 && (
            <div className="mb-6 flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-xl">
              <span className="text-2xl">🏆</span>
              <span className="text-xl font-bold text-yellow-700">{highScore}</span>
            </div>
          )}

          <button
            onClick={() => initGame(0)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-5 px-12 rounded-full shadow-lg hover:scale-110 transition-all"
          >
            <span className="text-5xl">▶️</span>
          </button>
        </div>
      )}

      {/* HUD - Visual only */}
      {isPlaying && (
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-md flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-2xl font-bold text-purple-600">{score}</span>
              </div>
              {combo > 1 && (
                <div className="bg-yellow-400 px-3 py-2 rounded-xl shadow-md animate-pulse flex items-center gap-1">
                  {[...Array(Math.min(combo, 5))].map((_, i) => (
                    <span key={i} className="text-xl">🌟</span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 items-end">
              <div className="bg-white/90 px-4 py-2 rounded-2xl shadow-md flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="text-xl font-bold text-gray-600">{matchedPairs}/{LEVELS[level].pairs}</span>
              </div>
              {highScore > 0 && (
                <div className="bg-yellow-100 px-3 py-1 rounded-xl shadow-sm flex items-center gap-1">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm font-bold text-yellow-700">{highScore}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Grid */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pt-24 pb-20">
          <div 
            className="grid gap-3 w-full max-w-md mx-auto"
            style={{ gridTemplateColumns: `repeat(${LEVELS[level].gridCols}, minmax(0, 1fr))` }}
          >
            {cards.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped || isLocked}
                className={`
                  aspect-square rounded-2xl shadow-lg transition-all duration-300 transform
                  ${card.isFlipped || card.isMatched ? '' : 'hover:scale-105'}
                  ${card.isMatched ? 'opacity-50 scale-95' : ''}
                `}
                style={{ perspective: '1000px' }}
              >
                <div
                  className="w-full h-full rounded-2xl transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Card Back */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-inner"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-5xl">❓</span>
                  </div>
                  
                  {/* Card Front */}
                  <div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center shadow-inner p-2"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      backgroundColor: EMOTIONS[card.emotionIndex].bgColor,
                      border: `4px solid ${EMOTIONS[card.emotionIndex].color}`,
                    }}
                  >
                    <FaceCanvas emotionIndex={card.emotionIndex} size={80} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visual footer */}
      {!isFullScreen && (
        <div className="bg-white/50 p-4 text-center absolute bottom-0 w-full">
          <div className="flex justify-center gap-6 text-3xl">
            <span>🧩</span>
            <span>😊</span>
            <span>⭐</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionMatch;
