import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, RotateCcw, Volume2, VolumeX, Trophy, Sparkles, Clock } from 'lucide-react';

// Kart karakterleri
interface CardCharacter {
  id: string;
  emoji: string;
  name: string;
  color: string;
  bgColor: string;
}

const CHARACTERS: CardCharacter[] = [
  { id: 'cat', emoji: '🐱', name: 'Kedi', color: '#FF9F43', bgColor: '#FFF3E0' },
  { id: 'dog', emoji: '🐶', name: 'Köpek', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { id: 'rabbit', emoji: '🐰', name: 'Tavşan', color: '#EC4899', bgColor: '#FCE7F3' },
  { id: 'bear', emoji: '🐻', name: 'Ayı', color: '#92400E', bgColor: '#FEF3C7' },
  { id: 'panda', emoji: '🐼', name: 'Panda', color: '#1F2937', bgColor: '#F3F4F6' },
  { id: 'koala', emoji: '🐨', name: 'Koala', color: '#6B7280', bgColor: '#E5E7EB' },
  { id: 'lion', emoji: '🦁', name: 'Aslan', color: '#F59E0B', bgColor: '#FEF3C7' },
  { id: 'monkey', emoji: '🐵', name: 'Maymun', color: '#B45309', bgColor: '#FEFCE8' },
  { id: 'penguin', emoji: '🐧', name: 'Penguen', color: '#1E40AF', bgColor: '#DBEAFE' },
  { id: 'owl', emoji: '🦉', name: 'Baykuş', color: '#7C3AED', bgColor: '#EDE9FE' },
  { id: 'fox', emoji: '🦊', name: 'Tilki', color: '#EA580C', bgColor: '#FFEDD5' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', color: '#DB2777', bgColor: '#FCE7F3' },
];

// Zorluk seviyeleri
interface DifficultyLevel {
  name: string;
  pairs: number;
  columns: number;
  timeBonus: number;
}

const DIFFICULTIES: DifficultyLevel[] = [
  { name: 'Kolay', pairs: 4, columns: 4, timeBonus: 100 },
  { name: 'Orta', pairs: 6, columns: 4, timeBonus: 80 },
  { name: 'Zor', pairs: 8, columns: 4, timeBonus: 60 },
  { name: 'Uzman', pairs: 12, columns: 6, timeBonus: 50 },
];

// Kart tipi
interface Card {
  id: number;
  character: CardCharacter;
  isFlipped: boolean;
  isMatched: boolean;
}

// Animasyonlu kart arka yüzü
const CardBack: React.FC<{ size: number }> = React.memo(({ size }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Gradient arka plan
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(0.5, '#EC4899');
    gradient.addColorStop(1, '#F59E0B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Yıldız deseni
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 12; i++) {
      const x = (i % 4) * (size / 4) + size / 8;
      const y = Math.floor(i / 4) * (size / 3) + size / 6;
      drawStar(ctx, x, y, 8, 5, 0.5);
    }

    // Soru işareti
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', size / 2, size / 2);

  }, [size]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-2xl" />;
});

// Yardımcı yıldız çizim fonksiyonu
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, points: number, innerRatio: number) {
  const innerR = outerR * innerRatio;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// Animasyonlu karakter yüzü
const CharacterFace: React.FC<{ character: CardCharacter; size: number; isMatched: boolean; isActive: boolean }> = React.memo(({ 
  character, 
  size, 
  isMatched,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const frame = frameRef.current;

      // Arka plan
      ctx.fillStyle = character.bgColor;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, 16);
      ctx.fill();

      // Çerçeve
      ctx.strokeStyle = character.color;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Eşleşme efekti
      if (isMatched) {
        // Parıltı efekti
        const sparkleCount = 8;
        for (let i = 0; i < sparkleCount; i++) {
          const angle = (i / sparkleCount) * Math.PI * 2 + frame * 0.05;
          const distance = size * 0.35 + Math.sin(frame * 0.1 + i) * 5;
          const x = size / 2 + Math.cos(angle) * distance;
          const y = size / 2 + Math.sin(angle) * distance;
          
          ctx.fillStyle = `hsl(${(frame * 3 + i * 45) % 360}, 100%, 60%)`;
          drawStar(ctx, x, y, 6, 4, 0.5);
        }
      }

      // Emoji
      const bounce = isMatched ? Math.sin(frame * 0.15) * 5 : (isActive ? Math.sin(frame * 0.05) * 2 : 0);
      ctx.font = `${size * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(character.emoji, size / 2, size / 2 + bounce);

      // Karakter adı
      ctx.fillStyle = character.color;
      ctx.font = `bold ${size * 0.12}px Arial`;
      ctx.fillText(character.name, size / 2, size * 0.88);

      frameRef.current++;
      if (isActive || isMatched) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [character, size, isMatched, isActive]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-2xl" />;
});

// Tek kart bileşeni
const MemoryCard: React.FC<{
  card: Card;
  size: number;
  onClick: () => void;
  disabled: boolean;
}> = React.memo(({ card, size, onClick, disabled }) => {
  return (
    <div
      className={`relative cursor-pointer transition-transform duration-300 ${
        disabled ? 'pointer-events-none' : 'hover:scale-105'
      }`}
      style={{ 
        width: size, 
        height: size,
        perspective: '1000px',
      }}
      onClick={onClick}
    >
      <div
        className={`absolute inset-0 transition-transform duration-500 rounded-2xl shadow-lg`}
        style={{
          transformStyle: 'preserve-3d',
          transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Arka yüz */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <CardBack size={size} />
        </div>

        {/* Ön yüz */}
        <div
          className="absolute inset-0"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CharacterFace 
            character={card.character} 
            size={size} 
            isMatched={card.isMatched} 
            isActive={card.isFlipped || card.isMatched}
          />
        </div>
      </div>
    </div>
  );
});

// Konfeti efekti
const WinConfetti: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      emoji: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const emojis = ['⭐', '🌟', '✨', '💫', '🎉', '🎊', '🏆'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -50 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 20 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      if (particles.some((p) => p.y < canvas.height + 100)) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

// Ana oyun bileşeni
interface MemoryMatchProps {
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({
  soundEnabled = true,
  onToggleSound
}) => {
  const [difficulty, setDifficulty] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  // Local state removed
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Internal toggle fallback
  const [internalSound, setInternalSound] = useState(true);
  const isSoundEnabled = onToggleSound ? soundEnabled : internalSound;
  const handleToggleSound = onToggleSound || (() => setInternalSound(prev => !prev));

  // Oyunu başlat
  const initGame = useCallback((diffIndex: number) => {
    const diff = DIFFICULTIES[diffIndex];
    const selectedChars = [...CHARACTERS].sort(() => Math.random() - 0.5).slice(0, diff.pairs);
    
    // Her karakterden 2 tane (çift)
    const cardPairs: Card[] = [];
    selectedChars.forEach((char, i) => {
      cardPairs.push(
        { id: i * 2, character: char, isFlipped: false, isMatched: false },
        { id: i * 2 + 1, character: char, isFlipped: false, isMatched: false }
      );
    });

    // Kartları karıştır
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setScore(0);
    setGameWon(false);
    setTimer(0);
    setIsPlaying(true);
    setShowDifficultySelect(false);

    // Timer başlat
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  }, []);

  // Temizlik
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Ses çal
  const playSound = useCallback((type: 'flip' | 'match' | 'wrong' | 'win') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'flip':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'match':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'wrong':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'win':
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
          gain.gain.setValueAtTime(0.12, audioContext.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.2);
          osc.start(audioContext.currentTime + i * 0.15);
          osc.stop(audioContext.currentTime + i * 0.15 + 0.2);
        });
        return;
    }
  }, [isSoundEnabled]);

  // Kart tıklama
  const handleCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    if (cards.find(c => c.id === cardId)?.isMatched) return;
    if (flippedCards.includes(cardId)) return;

    playSound('flip');

    // Kartı çevir
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // İki kart çevrildi mi?
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [first, second] = newFlipped;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.character.id === secondCard.character.id) {
        // Eşleşme!
        setTimeout(() => {
          playSound('match');
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(prev => prev + 1);
          setScore(prev => prev + DIFFICULTIES[difficulty].timeBonus);
          setFlippedCards([]);

          // Oyun bitti mi?
          const totalPairs = DIFFICULTIES[difficulty].pairs;
          if (matchedPairs + 1 === totalPairs) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsPlaying(false);
            setTimeout(() => {
              playSound('win');
              setGameWon(true);
            }, 500);
          }
        }, 500);
      } else {
        // Eşleşmedi
        setTimeout(() => {
          playSound('wrong');
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Süreyi formatla
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Kart boyutunu hesapla
  const getCardSize = () => {
    const cols = DIFFICULTIES[difficulty].columns;
    if (cols === 6) return 70;
    return 80;
  };

  // Zorluk seçim ekranı
  if (showDifficultySelect) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-purple-100 via-pink-50 to-orange-100 rounded-3xl flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hafıza Ustası</h1>
          <p className="text-gray-600">Kartları eşleştir ve hafızanı test et!</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          {DIFFICULTIES.map((diff, i) => (
            <button
              key={i}
              onClick={() => {
                setDifficulty(i);
                initGame(i);
              }}
              className={`p-6 rounded-2xl shadow-lg transition-all hover:scale-105 ${
                i === 0 ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                i === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                i === 2 ? 'bg-gradient-to-br from-pink-400 to-red-500' :
                'bg-gradient-to-br from-purple-400 to-indigo-500'
              } text-white`}
            >
              <div className="text-2xl mb-2">
                {i === 0 ? '🌟' : i === 1 ? '⭐' : i === 2 ? '🔥' : '👑'}
              </div>
              <div className="font-bold text-lg">{diff.name}</div>
              <div className="text-white/80 text-sm">{diff.pairs} çift</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-100 via-pink-50 to-orange-100 rounded-3xl overflow-hidden relative">
      {/* Konfeti */}
      <WinConfetti active={gameWon} />

      {/* Üst bar */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🃏</span>
          <span className="font-bold text-gray-800">Hafıza Ustası</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
            <Clock size={16} className="text-blue-500" />
            <span className="font-bold text-blue-700">{formatTime(timer)}</span>
          </div>

          {/* Skor */}
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
            <Star size={16} className="text-yellow-500" fill="currentColor" />
            <span className="font-bold text-yellow-700">{score}</span>
          </div>

          {/* Hamle */}
          <div className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full">
            <Sparkles size={16} className="text-purple-500" />
            <span className="font-bold text-purple-700">{moves}</span>
          </div>

          {/* Ses */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isSoundEnabled ? (
              <Volume2 size={20} className="text-gray-600" />
            ) : (
              <VolumeX size={20} className="text-gray-400" />
            )}
          </button>

          {/* Yeniden başlat */}
          <button
            onClick={() => initGame(difficulty)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <RotateCcw size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* İlerleme */}
      <div className="px-4 py-2">
        <div className="bg-white/50 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(matchedPairs / DIFFICULTIES[difficulty].pairs) * 100}%` }}
          />
        </div>
        <div className="text-center text-sm text-gray-600 mt-1">
          {matchedPairs} / {DIFFICULTIES[difficulty].pairs} çift bulundu
        </div>
      </div>

      {/* Kartlar */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="grid gap-3"
          style={{ 
            gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].columns}, ${getCardSize()}px)`,
          }}
        >
          {cards.map((card) => (
            <MemoryCard
              key={card.id}
              card={card}
              size={getCardSize()}
              onClick={() => handleCardClick(card.id)}
              disabled={flippedCards.length >= 2 || card.isMatched}
            />
          ))}
        </div>
      </div>

      {/* Zorluk değiştir */}
      <div className="absolute bottom-4 left-4">
        <button
          onClick={() => setShowDifficultySelect(true)}
          className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-white transition-colors"
        >
          ← Seviye Seç
        </button>
      </div>

      {/* Kazanma modalı */}
      {gameWon && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tebrikler!</h2>
            <p className="text-gray-600 mb-4">Tüm kartları eşleştirdin!</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Süre:</span>
                <span className="font-bold text-gray-800">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hamle:</span>
                <span className="font-bold text-gray-800">{moves}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Skor:</span>
                <span className="font-bold text-yellow-600">{score}</span>
              </div>
            </div>

            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={32} 
                  className={moves <= DIFFICULTIES[difficulty].pairs + i * 3 ? 'text-yellow-400' : 'text-gray-200'} 
                  fill="currentColor" 
                />
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => initGame(difficulty)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-full font-bold transition-colors"
              >
                <RotateCcw size={20} />
                Tekrarla
              </button>
              
              <button
                onClick={() => setShowDifficultySelect(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                <Trophy size={20} />
                Yeni Oyun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatch;
