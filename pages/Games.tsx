import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ArrowLeft, Heart, Brain, Wind, Palette, PawPrint, Flower2, Sparkles, Play, Volume2, VolumeX, Star, Trophy, Info, Crown, Zap } from 'lucide-react';
import EmotionMatch from '../components/Game/EmotionMatch';
import BalloonPop from '../components/Game/BalloonPop';
import ColorEmotion from '../components/Game/ColorEmotion';
import AnimalFriends from '../components/Game/AnimalFriends';
import HappinessGarden from '../components/Game/HappinessGarden';
import RhythmBreath from '../components/Game/RhythmBreath';

// Oyun tipleri
type GameId = 'emotion' | 'balloon' | 'color' | 'animal' | 'garden' | 'breath';

interface GameInfo {
  id: GameId;
  name: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  description: string;
  ageRange: string;
  difficulty: 1 | 2 | 3;
  category: 'emotion' | 'fun' | 'relaxation' | 'creativity';
}

const GAMES: GameInfo[] = [
  {
    id: 'emotion',
    name: 'Duygu Eşleştirme',
    icon: Brain,
    color: '#9333EA',
    bgGradient: 'from-purple-400 via-pink-400 to-purple-500',
    description: 'Duyguları tanı ve eşleştir!',
    ageRange: '3-6',
    difficulty: 2,
    category: 'emotion',
  },
  {
    id: 'balloon',
    name: 'Balon Patlatma',
    icon: Wind,
    color: '#0EA5E9',
    bgGradient: 'from-sky-400 via-blue-400 to-cyan-500',
    description: 'Renkli balonları patlatarak eğlen!',
    ageRange: '2-6',
    difficulty: 1,
    category: 'fun',
  },
  {
    id: 'color',
    name: 'Renk ve Duygu',
    icon: Palette,
    color: '#F97316',
    bgGradient: 'from-orange-400 via-amber-400 to-yellow-500',
    description: 'Renklerin dünyasında hayal gücünü kullan!',
    ageRange: '2-6',
    difficulty: 1,
    category: 'creativity',
  },
  {
    id: 'animal',
    name: 'Hayvan Dostları',
    icon: PawPrint,
    color: '#22C55E',
    bgGradient: 'from-green-400 via-emerald-400 to-teal-500',
    description: 'Üzgün hayvanlara yardım et!',
    ageRange: '3-6',
    difficulty: 2,
    category: 'emotion',
  },
  {
    id: 'garden',
    name: 'Mutluluk Bahçesi',
    icon: Flower2,
    color: '#EC4899',
    bgGradient: 'from-pink-400 via-rose-400 to-red-400',
    description: 'Güzel bir bahçe yetiştir!',
    ageRange: '2-5',
    difficulty: 1,
    category: 'creativity',
  },
  {
    id: 'breath',
    name: 'Ritim ve Nefes',
    icon: Sparkles,
    color: '#8B5CF6',
    bgGradient: 'from-violet-400 via-purple-400 to-indigo-500',
    description: 'Sakinleşmek için nefes al!',
    ageRange: '3-6',
    difficulty: 2,
    category: 'relaxation',
  },
];

// Kategori emojileri
const CATEGORY_INFO = {
  emotion: { emoji: '💝', name: 'Duygular' },
  fun: { emoji: '🎉', name: 'Eğlence' },
  relaxation: { emoji: '🧘', name: 'Rahatlama' },
  creativity: { emoji: '🎨', name: 'Yaratıcılık' },
};

// Yüksek skorları localStorage'dan al
const getHighScores = (): Partial<Record<GameId, number>> => {
  try {
    const saved = localStorage.getItem('psikominik_highscores');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

// Favorileri localStorage'dan al
const getFavorites = (): GameId[] => {
  try {
    const saved = localStorage.getItem('psikominik_favorites');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Favorileri kaydet
const saveFavorites = (favorites: GameId[]) => {
  localStorage.setItem('psikominik_favorites', JSON.stringify(favorites));
};

// Günün oyununu hesapla
const getDailyGame = (): GameId => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const gameIndex = dayOfYear % GAMES.length;
  return GAMES[gameIndex].id;
};

// Zorluk yıldızları
const DifficultyStars: React.FC<{ level: 1 | 2 | 3 }> = ({ level }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3].map((i) => (
      <svg
        key={i}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i <= level ? '#FFD700' : '#E5E7EB'}
      >
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
      </svg>
    ))}
  </div>
);

// Animasyonlu Maskot Bileşeni
const FloatingMascot: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 100 });
  const [isWaving, setIsWaving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const drawMascot = () => {
      const size = 80;
      ctx.clearRect(0, 0, size, size);
      
      const cx = size / 2;
      const cy = size / 2;
      const bounce = Math.sin(frame * 0.1) * 3;

      // Gölge
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 28, 15, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vücut (bulut şeklinde)
      ctx.fillStyle = '#4ECDC4';
      ctx.beginPath();
      ctx.arc(cx - 12, cy + bounce, 18, 0, Math.PI * 2);
      ctx.arc(cx + 12, cy + bounce, 18, 0, Math.PI * 2);
      ctx.arc(cx, cy - 8 + bounce, 20, 0, Math.PI * 2);
      ctx.fill();

      // Yüz
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 5 + bounce, 4, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 5 + bounce, 4, 0, Math.PI * 2);
      ctx.fill();

      // Göz bebekleri
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(cx - 7, cy - 4 + bounce, 2, 0, Math.PI * 2);
      ctx.arc(cx + 9, cy - 4 + bounce, 2, 0, Math.PI * 2);
      ctx.fill();

      // Gülümseme
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy + 5 + bounce, 8, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Yanaklar
      ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
      ctx.beginPath();
      ctx.ellipse(cx - 18, cy + 2 + bounce, 5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 18, cy + 2 + bounce, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // El sallama
      if (isWaving) {
        const waveAngle = Math.sin(frame * 0.3) * 0.5;
        ctx.save();
        ctx.translate(cx + 25, cy - 5 + bounce);
        ctx.rotate(waveAngle);
        ctx.fillStyle = '#4ECDC4';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Yıldız parıltıları
      if (frame % 30 < 15) {
        ctx.fillStyle = '#FFD700';
        const starX = cx + 25 + Math.sin(frame * 0.1) * 5;
        const starY = cy - 25 + bounce;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = starX + Math.cos(angle) * 5;
          const py = starY + Math.sin(angle) * 5;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }

      frame++;
      animationId = requestAnimationFrame(drawMascot);
    };

    drawMascot();

    return () => cancelAnimationFrame(animationId);
  }, [isWaving]);

  // Rastgele hareket
  useEffect(() => {
    const moveInterval = setInterval(() => {
      const newX = 30 + Math.random() * 40;
      const newY = 80 + Math.random() * 40;
      setTargetPosition({ x: newX, y: newY });
    }, 5000);

    return () => clearInterval(moveInterval);
  }, []);

  // Pozisyon animasyonu
  useEffect(() => {
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.02,
        y: prev.y + (targetPosition.y - prev.y) * 0.02,
      }));
    };
    const id = setInterval(animate, 50);
    return () => clearInterval(id);
  }, [targetPosition]);

  return (
    <div
      className="fixed z-30 cursor-pointer transition-transform hover:scale-110"
      style={{ 
        right: `${100 - position.x}%`, 
        top: `${position.y}px`,
        transform: 'translateX(50%)'
      }}
      onClick={() => {
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 2000);
      }}
    >
      <canvas ref={canvasRef} width={80} height={80} />
    </div>
  );
};

// Günün Oyunu Banner
const DailyGameBanner: React.FC<{ onPlay: (gameId: GameId) => void }> = ({ onPlay }) => {
  const dailyGameId = getDailyGame();
  const dailyGame = GAMES.find(g => g.id === dailyGameId)!;
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="container mx-auto px-4 py-4">
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${dailyGame.bgGradient} p-4 shadow-xl`}>
        {/* Parıltı efekti */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Taç ikonu */}
            <div className="w-16 h-16 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
              <Crown size={32} className="text-yellow-500" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/30 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ⭐ GÜNÜN OYUNU
                </span>
              </div>
              <h3 className="text-white text-xl font-bold drop-shadow-md">
                {dailyGame.name}
              </h3>
              <p className="text-white/80 text-sm">{dailyGame.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlay(dailyGameId)}
              className="bg-white text-gray-800 font-bold py-3 px-6 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Zap size={20} className="text-yellow-500" />
              <span>Hemen Oyna!</span>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Yüksek Skor Göstergesi
const HighScoreBadge: React.FC<{ gameId: GameId }> = ({ gameId }) => {
  const [scores] = useState(getHighScores());
  const score = scores[gameId];

  if (!score) return null;

  return (
    <div className="absolute top-12 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
      <Trophy size={12} />
      <span>{score}</span>
    </div>
  );
};

// Favori Butonu
const FavoriteButton: React.FC<{ 
  gameId: GameId;
  isFavorite: boolean;
  onToggle: () => void;
}> = ({ gameId, isFavorite, onToggle }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`absolute top-3 right-12 p-2 rounded-full transition-all ${
        isFavorite 
          ? 'bg-red-500 text-white scale-110' 
          : 'bg-white/30 text-white hover:bg-white/50'
      }`}
    >
      <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  );
};

// Ebeveyn Bilgi Modalı
const ParentInfoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-psiko-teal/10 rounded-full flex items-center justify-center">
                <Info size={24} className="text-psiko-teal" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Ebeveyn Köşesi</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
              <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                <Brain size={20} /> Duygu Gelişimi
              </h3>
              <p className="text-gray-600 text-sm">
                Oyunlarımız çocukların duygusal zekasını geliştirmek için tasarlandı. 
                Her oyun farklı duyguları tanıma ve ifade etme becerilerini destekler.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <Sparkles size={20} /> Güvenli İçerik
              </h3>
              <p className="text-gray-600 text-sm">
                Tüm içerikler çocuk psikologları tarafından denetlenmiştir. 
                Reklam içermez ve tamamen güvenlidir.
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-4">
              <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <Star size={20} /> Öneriler
              </h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>• Günde 15-20 dakika oyun süresi önerilir</li>
                <li>• Çocuğunuzla birlikte oynayın</li>
                <li>• Duygular hakkında konuşmak için fırsat yaratın</li>
                <li>• Başarılarını kutlayın</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4">
              <h3 className="font-bold text-blue-800 mb-2">📞 İletişim</h3>
              <p className="text-gray-600 text-sm">
                Sorularınız için: <br />
                <a href="mailto:info@psikominik.com" className="text-blue-600 font-bold">
                  info@psikominik.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Oyun Kartı Canvas (Dekoratif arka plan)
const GameCardCanvas: React.FC<{ color: string; size?: number }> = ({ color, size = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    // Dekoratif yıldızlar
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const starSize = 3 + Math.random() * 5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
        const px = x + Math.cos(angle) * starSize;
        const py = y + Math.sin(angle) * starSize;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Dekoratif daireler
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 5 + Math.random() * 10;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [color, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
    />
  );
};

// Oyun Kartı Bileşeni
const GameCard: React.FC<{
  game: GameInfo;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}> = ({ game, onClick, isFavorite, onToggleFavorite }) => {
  const IconComponent = game.icon;

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-3xl shadow-xl 
        bg-gradient-to-br ${game.bgGradient}
        transform hover:scale-105 active:scale-95 
        transition-all duration-300
        w-full aspect-[4/5] p-4
        flex flex-col items-center justify-between
        group
      `}
    >
      {/* Dekoratif arka plan */}
      <GameCardCanvas color={game.color} size={200} />

      {/* Favori butonu */}
      <FavoriteButton 
        gameId={game.id} 
        isFavorite={isFavorite} 
        onToggle={onToggleFavorite} 
      />

      {/* Kategori etiketi */}
      <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm rounded-full px-2 py-1 text-sm">
        <span>{CATEGORY_INFO[game.category].emoji}</span>
      </div>

      {/* Yaş aralığı */}
      <div className="absolute top-3 left-3 bg-white/30 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white font-bold">
        {game.ageRange} 👶
      </div>

      {/* Yüksek skor rozeti */}
      <HighScoreBadge gameId={game.id} />

      {/* Ana içerik */}
      <div className="flex-1 flex flex-col items-center justify-center z-10">
        {/* İkon container */}
        <div className="w-20 h-20 bg-white/90 rounded-2xl flex items-center justify-center shadow-lg mb-3 group-hover:rotate-12 transition-transform">
          <IconComponent size={40} color={game.color} strokeWidth={2.5} />
        </div>

        {/* Oyun adı */}
        <h3 className="text-white text-lg font-bold text-center drop-shadow-md leading-tight">
          {game.name}
        </h3>
      </div>

      {/* Alt kısım */}
      <div className="w-full z-10">
        {/* Zorluk */}
        <div className="flex justify-center mb-2">
          <DifficultyStars level={game.difficulty} />
        </div>

        {/* Oyna butonu */}
        <div className="bg-white/90 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 shadow-lg group-hover:bg-white transition-colors">
          <Play size={24} fill={game.color} color={game.color} />
          <span className="font-bold text-lg" style={{ color: game.color }}>Oyna</span>
        </div>
      </div>
    </button>
  );
};

// Tam Ekran Oyun Wrapper
const FullScreenGame: React.FC<{
  gameId: GameId | null;
  onClose: () => void;
}> = ({ gameId, onClose }) => {
  if (!gameId) return null;

  const game = GAMES.find((g) => g.id === gameId);
  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Çıkış butonu */}
      <button
        onClick={onClose}
        className="absolute bottom-6 right-6 z-[60] bg-white/90 hover:bg-white p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
        aria-label="Oyundan çık"
      >
        <X size={32} className="text-gray-700" />
      </button>

      {/* Oyun içeriği */}
      <div className="w-full h-full">
        {gameId === 'emotion' && <EmotionMatch />}
        {gameId === 'balloon' && (
          <div className="w-full h-full">
            <BalloonPop onBack={onClose} />
          </div>
        )}
        {gameId === 'color' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 p-4">
            <div className="w-full max-w-2xl h-full max-h-[90vh]">
              <ColorEmotion />
            </div>
          </div>
        )}
        {gameId === 'animal' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 p-4">
            <div className="w-full max-w-2xl h-full max-h-[90vh]">
              <AnimalFriends />
            </div>
          </div>
        )}
        {gameId === 'garden' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-200 to-green-200 p-4">
            <div className="w-full max-w-2xl h-full max-h-[90vh]">
              <HappinessGarden />
            </div>
          </div>
        )}
        {gameId === 'breath' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
            <div className="w-full max-w-2xl h-full max-h-[90vh]">
              <RhythmBreath />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Ana Sayfa
const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<GameId[]>(getFavorites());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showParentInfo, setShowParentInfo] = useState(false);

  // Favori toggle
  const toggleFavorite = useCallback((gameId: GameId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId];
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  // Filtrelenmiş oyunlar
  const filteredGames = GAMES.filter((g) => {
    if (showFavoritesOnly && !favorites.includes(g.id)) return false;
    if (selectedCategory && g.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E8] via-[#FFF5E1] to-[#FFE4C4] relative overflow-x-hidden">
      {/* Arka plan dekorasyon */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 right-1/3 w-36 h-36 bg-green-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Animasyonlu Maskot */}
      <FloatingMascot />

      {/* Tam ekran oyun */}
      <FullScreenGame gameId={activeGame} onClose={() => setActiveGame(null)} />

      {/* Ebeveyn Bilgi Modalı */}
      <ParentInfoModal isOpen={showParentInfo} onClose={() => setShowParentInfo(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Geri butonu ve Logo */}
            <a
              href="/"
              className="flex items-center gap-3 text-deep-slate hover:text-psiko-teal transition-colors"
            >
              <div className="w-10 h-10 bg-psiko-teal/10 rounded-full flex items-center justify-center">
                <ArrowLeft size={20} className="text-psiko-teal" />
              </div>
              <span className="font-heading text-2xl font-black text-psiko-teal hidden sm:block">
                Psikominik
              </span>
            </a>

            {/* Başlık */}
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎮</span>
              <h1 className="font-heading text-xl sm:text-2xl text-deep-slate font-bold">
                Oyunlar
              </h1>
            </div>

            {/* Ebeveyn köşesi butonu */}
            <button
              onClick={() => setShowParentInfo(true)}
              className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors"
              title="Ebeveyn Köşesi"
            >
              <Info size={20} className="text-purple-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Günün oyunu banner */}
      <DailyGameBanner onPlay={setActiveGame} />

      {/* Kategori filtreleri */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setShowFavoritesOnly(false);
            }}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              selectedCategory === null && !showFavoritesOnly
                ? 'bg-psiko-teal text-white shadow-lg scale-105'
                : 'bg-white/70 text-gray-600 hover:bg-white hover:scale-105'
            }`}
          >
            ✨ Tümü
          </button>

          {/* Favoriler butonu */}
          <button
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setSelectedCategory(null);
            }}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1 ${
              showFavoritesOnly
                ? 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-white/70 text-gray-600 hover:bg-white hover:scale-105'
            }`}
          >
            <Heart size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">Favoriler</span>
            {favorites.length > 0 && (
              <span className="bg-white/30 text-xs px-1.5 rounded-full">{favorites.length}</span>
            )}
          </button>

          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedCategory(key);
                setShowFavoritesOnly(false);
              }}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1 ${
                selectedCategory === key
                  ? 'bg-psiko-teal text-white shadow-lg scale-105'
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:scale-105'
              }`}
            >
              <span>{info.emoji}</span>
              <span className="hidden sm:inline">{info.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Oyun kartları */}
      <main className="container mx-auto px-4 py-6 pb-24 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => setActiveGame(game.id)}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={() => toggleFavorite(game.id)}
            />
          ))}
        </div>

        {/* Boş durum */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{showFavoritesOnly ? '💝' : '🎮'}</div>
            <p className="text-gray-500 text-lg">
              {showFavoritesOnly 
                ? 'Henüz favori oyun eklemediniz' 
                : 'Bu kategoride oyun bulunamadı'}
            </p>
            {showFavoritesOnly && (
              <p className="text-gray-400 text-sm mt-2">
                Oyunlardaki ❤️ butonuna tıklayarak favorilere ekleyebilirsiniz
              </p>
            )}
          </div>
        )}
      </main>

      {/* Alt bilgi */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-white/50 py-3 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-pink-500" />
            <span>2-6 yaş çocuklar için</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500" />
              <span className="hidden sm:inline">{GAMES.length} Oyun</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">👶</span>
              <span className="hidden sm:inline">Güvenli &amp; Eğlenceli</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Games;
