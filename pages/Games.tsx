import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft, Heart, Brain, Wind, Palette, PawPrint, Flower2, Sparkles, Play, Volume2, VolumeX } from 'lucide-react';
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
}> = ({ game, onClick }) => {
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

      {/* Kategori etiketi */}
      <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm rounded-full px-2 py-1 text-sm">
        <span>{CATEGORY_INFO[game.category].emoji}</span>
      </div>

      {/* Yaş aralığı */}
      <div className="absolute top-3 left-3 bg-white/30 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white font-bold">
        {game.ageRange} 👶
      </div>

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

  // Filtrelenmiş oyunlar
  const filteredGames = selectedCategory
    ? GAMES.filter((g) => g.category === selectedCategory)
    : GAMES;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E8] via-[#FFF5E1] to-[#FFE4C4] relative overflow-x-hidden">
      {/* Arka plan dekorasyon */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/3 w-36 h-36 bg-green-300/30 rounded-full blur-3xl" />
      </div>

      {/* Tam ekran oyun */}
      <FullScreenGame gameId={activeGame} onClose={() => setActiveGame(null)} />

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

            {/* Boşluk */}
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Kategori filtreleri */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              selectedCategory === null
                ? 'bg-psiko-teal text-white shadow-lg scale-105'
                : 'bg-white/70 text-gray-600 hover:bg-white hover:scale-105'
            }`}
          >
            ✨ Tümü
          </button>
          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
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
            />
          ))}
        </div>

        {/* Boş durum */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-500 text-lg">Bu kategoride oyun bulunamadı</p>
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
          <div className="flex items-center gap-2">
            <span className="text-lg">👶</span>
            <span className="hidden sm:inline">Güvenli &amp; Eğlenceli</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Games;
