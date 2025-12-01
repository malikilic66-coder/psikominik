import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, ArrowLeft, Heart, Brain, Wind, Palette, PawPrint, Flower2, Sparkles, Play, Volume2, VolumeX, Star, Trophy, Info, Crown, Zap, Search, Clock, Award, Target, Flame, Medal, Gift, Shapes, Music, Puzzle, Grid3X3 } from 'lucide-react';
import EmotionMatch from '../components/Game/EmotionMatch';
import BalloonPop from '../components/Game/BalloonPop';
import ColorEmotion from '../components/Game/ColorEmotion';
import AnimalFriends from '../components/Game/AnimalFriends';
import HappinessGarden from '../components/Game/HappinessGarden';
import RhythmBreath from '../components/Game/RhythmBreath';
import ShapeAdventure from '../components/Game/ShapeAdventure';
import MemoryMatch from '../components/Game/MemoryMatch';
import LittleMusician from '../components/Game/LittleMusician';
import PuzzleGarden from '../components/Game/PuzzleGarden';
import SmartMascot from '../components/UI/SmartMascot';

// Oyun tipleri
type GameId = 'emotion' | 'balloon' | 'color' | 'animal' | 'garden' | 'breath' | 'shapes' | 'memory' | 'music' | 'puzzle';

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
  isNew?: boolean;
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
  // Yeni oyunlar
  {
    id: 'shapes',
    name: 'Şekil Macerası',
    icon: Shapes,
    color: '#06B6D4',
    bgGradient: 'from-cyan-400 via-teal-400 to-emerald-500',
    description: 'Şekilleri tanı ve yerleştir!',
    ageRange: '2-5',
    difficulty: 1,
    category: 'fun',
    isNew: true,
  },
  {
    id: 'memory',
    name: 'Hafıza Ustası',
    icon: Grid3X3,
    color: '#F472B6',
    bgGradient: 'from-pink-400 via-fuchsia-400 to-purple-500',
    description: 'Kartları eşleştir, hafızanı test et!',
    ageRange: '3-6',
    difficulty: 2,
    category: 'fun',
    isNew: true,
  },
  {
    id: 'music',
    name: 'Küçük Müzisyen',
    icon: Music,
    color: '#8B5CF6',
    bgGradient: 'from-violet-400 via-indigo-400 to-blue-500',
    description: 'Müzik yap, ritim tut!',
    ageRange: '2-6',
    difficulty: 1,
    category: 'creativity',
    isNew: true,
  },
  {
    id: 'puzzle',
    name: 'Yapboz Bahçesi',
    icon: Puzzle,
    color: '#10B981',
    bgGradient: 'from-emerald-400 via-green-400 to-teal-500',
    description: 'Parçaları birleştir, resmi tamamla!',
    ageRange: '3-6',
    difficulty: 2,
    category: 'fun',
    isNew: true,
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

// Son oynanan oyunları al
const getRecentGames = (): { gameId: GameId; timestamp: number }[] => {
  try {
    const saved = localStorage.getItem('psikominik_recent_games');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Son oynanan oyunu kaydet
const saveRecentGame = (gameId: GameId) => {
  try {
    const recent = getRecentGames();
    const filtered = recent.filter(r => r.gameId !== gameId);
    const updated = [{ gameId, timestamp: Date.now() }, ...filtered].slice(0, 5);
    localStorage.setItem('psikominik_recent_games', JSON.stringify(updated));
  } catch {
    // localStorage hatası
  }
};

// Oyun istatistiklerini al
const getGameStats = (): { totalPlayTime: number; gamesPlayed: number; todayPlayTime: number } => {
  try {
    const saved = localStorage.getItem('psikominik_stats');
    return saved ? JSON.parse(saved) : { totalPlayTime: 0, gamesPlayed: 0, todayPlayTime: 0 };
  } catch {
    return { totalPlayTime: 0, gamesPlayed: 0, todayPlayTime: 0 };
  }
};

// Oyun istatistiklerini güncelle
const updateGameStats = (playTime: number) => {
  try {
    const stats = getGameStats();
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('psikominik_stats_date');
    
    const todayPlayTime = savedDate === today ? stats.todayPlayTime + playTime : playTime;
    
    const updated = {
      totalPlayTime: stats.totalPlayTime + playTime,
      gamesPlayed: stats.gamesPlayed + 1,
      todayPlayTime
    };
    
    localStorage.setItem('psikominik_stats', JSON.stringify(updated));
    localStorage.setItem('psikominik_stats_date', today);
  } catch {
    // localStorage hatası
  }
};

// Başarımları al
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  unlocked: boolean;
  unlockedAt?: number;
}

const getAchievements = (): Achievement[] => {
  try {
    const saved = localStorage.getItem('psikominik_achievements');
    const unlocked: Record<string, number> = saved ? JSON.parse(saved) : {};
    
    return [
      {
        id: 'first_game',
        name: 'İlk Adım',
        description: 'İlk oyununu oynadın!',
        icon: Star,
        color: '#FFD700',
        unlocked: !!unlocked['first_game'],
        unlockedAt: unlocked['first_game']
      },
      {
        id: 'five_games',
        name: 'Kaşif',
        description: '5 farklı oyun oynadın!',
        icon: Target,
        color: '#22C55E',
        unlocked: !!unlocked['five_games'],
        unlockedAt: unlocked['five_games']
      },
      {
        id: 'all_games',
        name: 'Usta Oyuncu',
        description: 'Tüm oyunları denedin!',
        icon: Crown,
        color: '#9333EA',
        unlocked: !!unlocked['all_games'],
        unlockedAt: unlocked['all_games']
      },
      {
        id: 'streak_3',
        name: 'Düzenli Oyuncu',
        description: '3 gün üst üste oynadın!',
        icon: Flame,
        color: '#F97316',
        unlocked: !!unlocked['streak_3'],
        unlockedAt: unlocked['streak_3']
      },
      {
        id: 'high_scorer',
        name: 'Rekor Kıran',
        description: 'İlk yüksek skorunu aldın!',
        icon: Trophy,
        color: '#EAB308',
        unlocked: !!unlocked['high_scorer'],
        unlockedAt: unlocked['high_scorer']
      },
      {
        id: 'five_favorites',
        name: 'Koleksiyoncu',
        description: '5 oyunu favorilere ekledin!',
        icon: Heart,
        color: '#EC4899',
        unlocked: !!unlocked['five_favorites'],
        unlockedAt: unlocked['five_favorites']
      }
    ];
  } catch {
    return [];
  }
};

// Başarım kilidini aç
const unlockAchievement = (achievementId: string): boolean => {
  try {
    const saved = localStorage.getItem('psikominik_achievements');
    const unlocked: Record<string, number> = saved ? JSON.parse(saved) : {};
    
    if (!unlocked[achievementId]) {
      unlocked[achievementId] = Date.now();
      localStorage.setItem('psikominik_achievements', JSON.stringify(unlocked));
      return true; // Yeni başarım açıldı
    }
    return false;
  } catch {
    return false;
  }
};

// Başarımları kontrol et ve güncelle
const checkAchievements = (
  favorites: GameId[],
  playedGames: Set<GameId>
): string | null => {
  // İlk oyun
  if (playedGames.size === 1) {
    if (unlockAchievement('first_game')) return 'first_game';
  }
  
  // 5 farklı oyun
  if (playedGames.size >= 5) {
    if (unlockAchievement('five_games')) return 'five_games';
  }
  
  // Tüm oyunlar
  if (playedGames.size >= GAMES.length) {
    if (unlockAchievement('all_games')) return 'all_games';
  }
  
  // 5 favori
  if (favorites.length >= 5) {
    if (unlockAchievement('five_favorites')) return 'five_favorites';
  }
  
  return null;
};

// Ses efektleri sistemi
const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('psikominik_sound');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('psikominik_sound', String(newValue));
      return newValue;
    });
  }, []);

  const playSound = useCallback((type: 'click' | 'success' | 'achievement' | 'start') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'click':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
        break;

      case 'success':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'achievement':
        // Başarım sesi - daha uzun ve neşeli
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        const gain2 = audioContext.createGain();

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(audioContext.destination);
        gain2.connect(audioContext.destination);

        osc1.frequency.setValueAtTime(523, audioContext.currentTime);
        osc1.frequency.setValueAtTime(659, audioContext.currentTime + 0.15);
        osc1.frequency.setValueAtTime(784, audioContext.currentTime + 0.3);
        osc1.frequency.setValueAtTime(1047, audioContext.currentTime + 0.45);

        osc2.frequency.setValueAtTime(392, audioContext.currentTime);
        osc2.frequency.setValueAtTime(494, audioContext.currentTime + 0.15);
        osc2.frequency.setValueAtTime(588, audioContext.currentTime + 0.3);
        osc2.frequency.setValueAtTime(784, audioContext.currentTime + 0.45);

        gain1.gain.setValueAtTime(0.12, audioContext.currentTime);
        gain2.gain.setValueAtTime(0.08, audioContext.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

        osc1.start(audioContext.currentTime);
        osc2.start(audioContext.currentTime);
        osc1.stop(audioContext.currentTime + 0.6);
        osc2.stop(audioContext.currentTime + 0.6);
        return; // Early return since we handle this differently

      case 'start':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
    }
  }, [soundEnabled]);

  return { soundEnabled, toggleSound, playSound };
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

// Animasyonlu Maskot Bileşeni (SmartMascot ile değiştirildi)
// const FloatingMascot... (removed)

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
  const stats = getGameStats();
  
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} dakika`;
    const hours = Math.floor(mins / 60);
    return `${hours} saat ${mins % 60} dakika`;
  };

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
            {/* İstatistikler */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Clock size={20} /> Oyun İstatistikleri
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{stats.gamesPlayed}</div>
                  <div className="text-xs text-gray-500">Toplam Oyun</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{Math.floor(stats.todayPlayTime / 60)}</div>
                  <div className="text-xs text-gray-500">Bugün (dk)</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{formatTime(stats.totalPlayTime)}</div>
                  <div className="text-xs text-gray-500">Toplam Süre</div>
                </div>
              </div>
            </div>

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

      {/* Yeni etiketi */}
      {game.isNew && (
        <div className="absolute top-12 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
          YENİ
        </div>
      )}

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
  soundEnabled: boolean;
  toggleSound: () => void;
}> = ({ gameId, onClose, soundEnabled, toggleSound }) => {
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
        {/* Yeni oyunlar */}
        {gameId === 'shapes' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-teal-100 p-4">
            <div className="w-full max-w-2xl h-full max-h-[90vh]">
              <ShapeAdventure soundEnabled={soundEnabled} onToggleSound={toggleSound} />
            </div>
          </div>
        )}
        {gameId === 'memory' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 p-4">
            <div className="w-full max-w-2xl h-full max-h-[90vh]">
              <MemoryMatch soundEnabled={soundEnabled} onToggleSound={toggleSound} />
            </div>
          </div>
        )}
        {gameId === 'music' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 p-4">
            <div className="w-full max-w-3xl h-full max-h-[90vh]">
              <LittleMusician soundEnabled={soundEnabled} onToggleSound={toggleSound} />
            </div>
          </div>
        )}
        {gameId === 'puzzle' && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-100 p-4">
            <div className="w-full max-w-3xl h-full max-h-[90vh]">
              <PuzzleGarden soundEnabled={soundEnabled} onToggleSound={toggleSound} />
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
  const [searchQuery, setSearchQuery] = useState('');
  const [recentGames, setRecentGames] = useState(getRecentGames());
  const [playedGames, setPlayedGames] = useState<Set<GameId>>(new Set());
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  
  // Ses efektleri
  const { soundEnabled, toggleSound, playSound } = useSoundEffects();

  // Oyun başlatma
  const startGame = useCallback((gameId: GameId) => {
    playSound('start');
    setActiveGame(gameId);
    setGameStartTime(Date.now());
    saveRecentGame(gameId);
    setRecentGames(getRecentGames());
    
    // Oynanan oyunları takip et
    setPlayedGames(prev => {
      const newSet = new Set(prev);
      newSet.add(gameId);
      return newSet;
    });
    
    // Başarımları kontrol et
    const achievement = checkAchievements(favorites, new Set([...playedGames, gameId]));
    if (achievement) {
      setTimeout(() => {
        playSound('achievement');
        setNewAchievement(achievement);
      }, 1000);
    }
  }, [favorites, playedGames, playSound]);

  // Oyun bitirme
  const endGame = useCallback(() => {
    if (gameStartTime) {
      const playTime = Math.floor((Date.now() - gameStartTime) / 1000);
      updateGameStats(playTime);
    }
    setActiveGame(null);
    setGameStartTime(null);
  }, [gameStartTime]);

  // Favori toggle
  const toggleFavorite = useCallback((gameId: GameId) => {
    playSound('click');
    setFavorites(prev => {
      const newFavorites = prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId];
      saveFavorites(newFavorites);
      
      // Başarımları kontrol et
      const achievement = checkAchievements(newFavorites, playedGames);
      if (achievement) {
        setTimeout(() => {
          playSound('achievement');
          setNewAchievement(achievement);
        }, 500);
      }
      
      return newFavorites;
    });
  }, [playedGames, playSound]);

  // Arama ile filtrelenmiş oyunlar
  const filteredGames = useMemo(() => {
    return GAMES.filter((g) => {
      if (showFavoritesOnly && !favorites.includes(g.id)) return false;
      if (selectedCategory && g.category !== selectedCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return g.name.toLowerCase().includes(query) || 
               g.description.toLowerCase().includes(query) ||
               CATEGORY_INFO[g.category].name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [showFavoritesOnly, favorites, selectedCategory, searchQuery]);

  // Son oynanan oyunların detayları
  const recentGameDetails = useMemo(() => {
    return recentGames
      .map(r => GAMES.find(g => g.id === r.gameId))
      .filter((g): g is GameInfo => g !== undefined)
      .slice(0, 4);
  }, [recentGames]);

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
      <SmartMascot />

      {/* Tam ekran oyun */}
      <FullScreenGame 
        gameId={activeGame} 
        onClose={endGame} 
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />

      {/* Ebeveyn Bilgi Modalı */}
      <ParentInfoModal isOpen={showParentInfo} onClose={() => setShowParentInfo(false)} />

      {/* Yeni Başarım Bildirimi */}
      {newAchievement && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-in zoom-in duration-500">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-lg font-bold text-gray-500 mb-2">Yeni Başarım!</div>
            {(() => {
              const achievement = getAchievements().find(a => a.id === newAchievement);
              if (!achievement) return null;
              const IconComp = achievement.icon;
              return (
                <>
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                    style={{ backgroundColor: achievement.color + '20' }}
                  >
                    <IconComp size={40} color={achievement.color} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{achievement.name}</h3>
                  <p className="text-gray-500">{achievement.description}</p>
                </>
              );
            })()}
            <button
              onClick={() => setNewAchievement(null)}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full hover:scale-105 active:scale-95 transition-transform"
            >
              Harika! 🌟
            </button>
          </div>
        </div>
      )}

      {/* Başarımlar Modalı */}
      {showAchievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy size={24} className="text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Başarımlar</h2>
                </div>
                <button onClick={() => setShowAchievements(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {getAchievements().map((achievement) => {
                  const IconComp = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-2xl text-center transition-all ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md'
                          : 'bg-gray-100 opacity-50 grayscale'
                      }`}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2"
                        style={{ backgroundColor: achievement.unlocked ? achievement.color + '20' : '#E5E7EB' }}
                      >
                        <IconComp size={28} color={achievement.unlocked ? achievement.color : '#9CA3AF'} />
                      </div>
                      <h4 className="font-bold text-sm text-gray-800">{achievement.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                      {achievement.unlocked && (
                        <div className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                          <Star size={12} fill="currentColor" />
                          Kazanıldı!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-2">
              {/* Ses butonu */}
              <button
                onClick={() => {
                  playSound('click');
                  toggleSound();
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  soundEnabled 
                    ? 'bg-green-100 hover:bg-green-200' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
              >
                {soundEnabled ? (
                  <Volume2 size={20} className="text-green-600" />
                ) : (
                  <VolumeX size={20} className="text-gray-400" />
                )}
              </button>

              {/* Başarımlar butonu */}
              <button
                onClick={() => {
                  playSound('click');
                  setShowAchievements(true);
                }}
                className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-colors relative"
                title="Başarımlar"
              >
                <Trophy size={20} className="text-yellow-600" />
                {getAchievements().filter(a => a.unlocked).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {getAchievements().filter(a => a.unlocked).length}
                  </span>
                )}
              </button>
              
              {/* Ebeveyn köşesi */}
              <button
                onClick={() => {
                  playSound('click');
                  setShowParentInfo(true);
                }}
                className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors"
                title="Ebeveyn Köşesi"
              >
                <Info size={20} className="text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Günün oyunu banner */}
      <DailyGameBanner onPlay={startGame} />

      {/* Arama kutusu */}
      <div className="container mx-auto px-4 py-4">
        <div className="relative max-w-md mx-auto">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Oyun ara... 🔍"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white/80 backdrop-blur-sm border-2 border-transparent focus:border-psiko-teal focus:outline-none shadow-md text-gray-700 placeholder-gray-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Son oynanan oyunlar */}
      {recentGameDetails.length > 0 && !searchQuery && !selectedCategory && !showFavoritesOnly && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-gray-500" />
            <h2 className="text-gray-600 font-bold">Son Oynananlar</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {recentGameDetails.map((game) => {
              const IconComponent = game.icon;
              return (
                <button
                  key={game.id}
                  onClick={() => startGame(game.id)}
                  className={`flex-shrink-0 bg-gradient-to-br ${game.bgGradient} rounded-2xl p-3 pr-5 flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all`}
                >
                  <div className="w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center">
                    <IconComponent size={24} color={game.color} />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">{game.name}</div>
                    <div className="text-white/70 text-xs">Devam et →</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
        {/* Arama sonucu bilgisi */}
        {searchQuery && (
          <div className="mb-4 flex items-center gap-2 text-gray-500">
            <Search size={16} />
            <span>"{searchQuery}" için {filteredGames.length} sonuç</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => startGame(game.id)}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={() => toggleFavorite(game.id)}
            />
          ))}
        </div>

        {/* Boş durum */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{showFavoritesOnly ? '💝' : searchQuery ? '🔍' : '🎮'}</div>
            <p className="text-gray-500 text-lg">
              {showFavoritesOnly 
                ? 'Henüz favori oyun eklemediniz' 
                : searchQuery
                ? `"${searchQuery}" için oyun bulunamadı`
                : 'Bu kategoride oyun bulunamadı'}
            </p>
            {showFavoritesOnly && (
              <p className="text-gray-400 text-sm mt-2">
                Oyunlardaki ❤️ butonuna tıklayarak favorilere ekleyebilirsiniz
              </p>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-psiko-teal font-bold hover:underline"
              >
                Aramayı temizle
              </button>
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
