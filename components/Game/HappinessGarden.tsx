import React, { useState, useEffect, useCallback } from 'react';
import { Flower2, Sun, Droplets, Star, RefreshCw, Sparkles } from 'lucide-react';

interface Flower {
  id: number;
  stage: number; // 0: seed, 1: sprout, 2: bud, 3: flower, 4: blooming
  type: number;
  x: number;
  y: number;
  color: string;
}

interface PositiveAction {
  id: number;
  text: string;
  emoji: string;
  points: number;
}

const FLOWER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF69B4', '#9B59B6', '#2ECC71', '#F39C12'];

const POSITIVE_ACTIONS: PositiveAction[] = [
  { id: 1, text: 'Bugün birine teşekkür ettim', emoji: '🙏', points: 20 },
  { id: 2, text: 'Oyuncaklarımı paylaştım', emoji: '🤝', points: 25 },
  { id: 3, text: 'Aileme yardım ettim', emoji: '👨‍👩‍👧', points: 25 },
  { id: 4, text: 'Bir arkadaşıma gülümsedim', emoji: '😊', points: 15 },
  { id: 5, text: 'Sabırlı davrandım', emoji: '⏳', points: 30 },
  { id: 6, text: 'Özür diledim', emoji: '💕', points: 30 },
  { id: 7, text: 'Birini dinledim', emoji: '👂', points: 20 },
  { id: 8, text: 'Dürüst davrandım', emoji: '✨', points: 25 },
  { id: 9, text: 'Temizlik yaptım', emoji: '🧹', points: 20 },
  { id: 10, text: 'Yeni bir şey öğrendim', emoji: '📚', points: 20 },
  { id: 11, text: 'Hayvanları sevdim', emoji: '🐾', points: 15 },
  { id: 12, text: 'Doğayı korudum', emoji: '🌱', points: 25 },
];

const HappinessGarden: React.FC = () => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedActions, setSelectedActions] = useState<number[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState('');
  const [gardenLevel, setGardenLevel] = useState(1);
  const [waterDrops, setWaterDrops] = useState(3);
  const [sunlight, setSunlight] = useState(50);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('happinessGardenData');
    if (saved) {
      const data = JSON.parse(saved);
      setFlowers(data.flowers || []);
      setTotalPoints(data.totalPoints || 0);
      setSelectedActions(data.selectedActions || []);
      setGardenLevel(data.gardenLevel || 1);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('happinessGardenData', JSON.stringify({
      flowers,
      totalPoints,
      selectedActions,
      gardenLevel
    }));
  }, [flowers, totalPoints, selectedActions, gardenLevel]);

  // Sunlight animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSunlight(s => (s + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Regenerate water drops over time
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterDrops(w => Math.min(w + 1, 5));
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  }, []);

  const handleAction = (action: PositiveAction) => {
    if (selectedActions.includes(action.id)) {
      showMessage('Bu davranışı zaten seçtin! 🌻');
      return;
    }

    setSelectedActions(prev => [...prev, action.id]);
    setTotalPoints(p => p + action.points);
    showMessage(`+${action.points} puan! ${action.emoji}`);

    // Plant a new flower
    const newFlower: Flower = {
      id: Date.now(),
      stage: 0,
      type: Math.floor(Math.random() * 5),
      x: Math.random() * 80 + 10,
      y: Math.random() * 40 + 50,
      color: FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]
    };
    setFlowers(prev => [...prev, newFlower]);

    // Check for level up
    const newTotal = totalPoints + action.points;
    if (newTotal >= gardenLevel * 100) {
      setGardenLevel(l => l + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const waterFlowers = () => {
    if (waterDrops <= 0) {
      showMessage('Su bitti! Biraz bekle 💧');
      return;
    }

    setWaterDrops(w => w - 1);
    
    // Grow flowers
    setFlowers(prev => prev.map(flower => ({
      ...flower,
      stage: Math.min(flower.stage + 1, 4)
    })));
    
    showMessage('Çiçekler sulandı! 🌸');
  };

  const getFlowerEmoji = (stage: number, type: number) => {
    const stages = [
      ['🌰', '🌰', '🌰', '🌰', '🌰'], // Seeds
      ['🌱', '🌱', '🌱', '🌱', '🌱'], // Sprouts
      ['🌿', '🌿', '🌿', '🌿', '🌿'], // Buds
      ['🌷', '🌻', '🌹', '🌺', '💐'], // Flowers
      ['🌸', '🌼', '🏵️', '💮', '🌺'], // Blooming
    ];
    return stages[stage][type];
  };

  const resetGarden = () => {
    setFlowers([]);
    setTotalPoints(0);
    setSelectedActions([]);
    setGardenLevel(1);
    localStorage.removeItem('happinessGardenData');
    showMessage('Bahçe sıfırlandı! 🌱');
  };

  const availableActions = POSITIVE_ACTIONS.filter(a => !selectedActions.includes(a.id));

  return (
    <div className="bg-gradient-to-b from-sky-200 via-sky-100 to-green-200 rounded-[2rem] p-4 shadow-xl h-full overflow-hidden relative">
      {/* Celebration */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 rounded-[2rem]">
          <div className="bg-white/95 rounded-2xl p-6 text-center animate-bounce shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-green-600">Seviye {gardenLevel}!</h3>
            <p className="text-gray-600">Bahçen büyüyor!</p>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-white/95 rounded-xl px-4 py-2 shadow-lg animate-bounce">
            <span className="font-bold text-green-600">{message}</span>
          </div>
        </div>
      )}

      {/* Sun */}
      <div 
        className="absolute top-4 right-4 text-5xl animate-spin-slow"
        style={{ 
          filter: `brightness(${0.8 + sunlight * 0.004})`,
          transform: `rotate(${sunlight * 3.6}deg)`
        }}
      >
        ☀️
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Flower2 className="text-pink-500" size={24} />
          <h2 className="text-lg font-bold text-green-700">Mutluluk Bahçesi</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/80 rounded-full px-3 py-1 flex items-center gap-1">
            <Star className="text-yellow-500" size={16} />
            <span className="font-bold text-green-600 text-sm">{totalPoints}</span>
          </div>
          <div className="bg-white/80 rounded-full px-2 py-1 text-xs font-semibold text-green-600">
            Lv.{gardenLevel}
          </div>
        </div>
      </div>

      {/* Garden Area */}
      <div className="relative bg-gradient-to-b from-green-300 to-green-400 rounded-2xl h-36 mb-3 overflow-hidden shadow-inner">
        {/* Grass texture */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-green-600 text-2xl"
              style={{
                left: `${(i * 5) % 100}%`,
                bottom: `${Math.random() * 20}%`
              }}
            >
              🌿
            </div>
          ))}
        </div>

        {/* Flowers */}
        {flowers.map(flower => (
          <div
            key={flower.id}
            className="absolute transition-all duration-500 transform hover:scale-110"
            style={{
              left: `${flower.x}%`,
              top: `${flower.y}%`,
              fontSize: `${1.5 + flower.stage * 0.3}rem`
            }}
          >
            {getFlowerEmoji(flower.stage, flower.type)}
          </div>
        ))}

        {/* Empty garden message */}
        {flowers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-green-700 font-semibold bg-white/60 px-4 py-2 rounded-xl">
              Pozitif davranışlar seç ve çiçek ek! 🌱
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={waterFlowers}
          disabled={waterDrops <= 0 || flowers.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-all ${
            waterDrops > 0 && flowers.length > 0
              ? 'bg-blue-400 hover:bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Droplets size={18} />
          Sula ({waterDrops})
        </button>
        <button
          onClick={resetGarden}
          className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-600 transition-all"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Positive Actions */}
      <div className="bg-white/60 rounded-xl p-3">
        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <Sparkles size={14} className="text-yellow-500" />
          Bugün yaptığın güzel şeyleri seç:
        </p>
        
        {availableActions.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {availableActions.slice(0, 6).map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="flex items-center gap-2 bg-white hover:bg-green-50 p-2 rounded-lg text-left transition-all hover:scale-102 border border-transparent hover:border-green-300"
              >
                <span className="text-xl">{action.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{action.text}</p>
                  <p className="text-xs text-green-600 font-semibold">+{action.points}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-green-600 font-semibold">🎉 Tüm davranışları tamamladın!</p>
            <p className="text-sm text-gray-500 mt-1">Yarın yeni davranışlar için gel!</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-3 flex justify-between text-xs text-gray-600">
        <span>🌸 {flowers.length} çiçek</span>
        <span>✨ {selectedActions.length} davranış</span>
        <span>🏆 {Math.floor(totalPoints / 100)} rozet</span>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HappinessGarden;
