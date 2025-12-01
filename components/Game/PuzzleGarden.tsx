import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Star, RotateCcw, Volume2, VolumeX, ChevronRight, Puzzle, Sparkles } from 'lucide-react';

// Yapboz resimleri
interface PuzzleImage {
  id: string;
  name: string;
  emoji: string;
  category: 'animal' | 'fruit' | 'vehicle';
  bgColor: string;
  colors: string[];
}

const PUZZLE_IMAGES: PuzzleImage[] = [
  // Hayvanlar
  { 
    id: 'cat', 
    name: 'Kedi', 
    emoji: '🐱', 
    category: 'animal',
    bgColor: '#FFF3E0',
    colors: ['#FF9F43', '#FFE0B2', '#FFCC80', '#FFB74D']
  },
  { 
    id: 'dog', 
    name: 'Köpek', 
    emoji: '🐶', 
    category: 'animal',
    bgColor: '#E3F2FD',
    colors: ['#8B5CF6', '#D1C4E9', '#B39DDB', '#9575CD']
  },
  { 
    id: 'bunny', 
    name: 'Tavşan', 
    emoji: '🐰', 
    category: 'animal',
    bgColor: '#FCE4EC',
    colors: ['#EC4899', '#F8BBD9', '#F48FB1', '#F06292']
  },
  { 
    id: 'bear', 
    name: 'Ayı', 
    emoji: '🐻', 
    category: 'animal',
    bgColor: '#FFF8E1',
    colors: ['#8D6E63', '#D7CCC8', '#BCAAA4', '#A1887F']
  },
  // Meyveler
  { 
    id: 'apple', 
    name: 'Elma', 
    emoji: '🍎', 
    category: 'fruit',
    bgColor: '#FFEBEE',
    colors: ['#F44336', '#FFCDD2', '#EF9A9A', '#E57373']
  },
  { 
    id: 'banana', 
    name: 'Muz', 
    emoji: '🍌', 
    category: 'fruit',
    bgColor: '#FFFDE7',
    colors: ['#FFEB3B', '#FFF9C4', '#FFF59D', '#FFF176']
  },
  { 
    id: 'orange', 
    name: 'Portakal', 
    emoji: '🍊', 
    category: 'fruit',
    bgColor: '#FFF3E0',
    colors: ['#FF9800', '#FFE0B2', '#FFCC80', '#FFB74D']
  },
  { 
    id: 'grape', 
    name: 'Üzüm', 
    emoji: '🍇', 
    category: 'fruit',
    bgColor: '#F3E5F5',
    colors: ['#9C27B0', '#E1BEE7', '#CE93D8', '#BA68C8']
  },
  // Araçlar
  { 
    id: 'car', 
    name: 'Araba', 
    emoji: '🚗', 
    category: 'vehicle',
    bgColor: '#E3F2FD',
    colors: ['#2196F3', '#BBDEFB', '#90CAF9', '#64B5F6']
  },
  { 
    id: 'bus', 
    name: 'Otobüs', 
    emoji: '🚌', 
    category: 'vehicle',
    bgColor: '#FFF8E1',
    colors: ['#FFC107', '#FFECB3', '#FFE082', '#FFD54F']
  },
  { 
    id: 'plane', 
    name: 'Uçak', 
    emoji: '✈️', 
    category: 'vehicle',
    bgColor: '#E8F5E9',
    colors: ['#4CAF50', '#C8E6C9', '#A5D6A7', '#81C784']
  },
  { 
    id: 'boat', 
    name: 'Gemi', 
    emoji: '🚢', 
    category: 'vehicle',
    bgColor: '#E0F7FA',
    colors: ['#00BCD4', '#B2EBF2', '#80DEEA', '#4DD0E1']
  },
];

// Zorluk seviyeleri
interface DifficultyLevel {
  name: string;
  grid: number; // 2x2, 3x3, 4x4
  stars: number;
}

const DIFFICULTIES: DifficultyLevel[] = [
  { name: 'Kolay', grid: 2, stars: 1 },
  { name: 'Orta', grid: 3, stars: 2 },
  { name: 'Zor', grid: 4, stars: 3 },
];

// Yapboz parçası
interface PuzzlePiece {
  id: number;
  correctX: number;
  correctY: number;
  currentX: number;
  currentY: number;
  isPlaced: boolean;
}

// Yapboz parçası çizimi
const PuzzlePieceCanvas: React.FC<{
  piece: PuzzlePiece;
  image: PuzzleImage;
  pieceSize: number;
  gridSize: number;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: () => void;
}> = ({ piece, image, pieceSize, gridSize, isSelected, isDragging, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, pieceSize, pieceSize);

    // Gölge
    if (!isDragging) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.roundRect(3, 5, pieceSize - 6, pieceSize - 6, 8);
      ctx.fill();
    }

    // Parça arka planı - gradient
    const colorIndex = (piece.correctY * gridSize + piece.correctX) % image.colors.length;
    const gradient = ctx.createLinearGradient(0, 0, pieceSize, pieceSize);
    gradient.addColorStop(0, image.colors[colorIndex]);
    gradient.addColorStop(1, adjustColor(image.colors[colorIndex], -20));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(2, 2, pieceSize - 4, pieceSize - 4, 8);
    ctx.fill();

    // Kenarlık
    ctx.strokeStyle = isSelected ? '#FF6B6B' : adjustColor(image.colors[colorIndex], -40);
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // Emoji parçası
    ctx.font = `${pieceSize * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Emoji'nin hangi parçasını göstereceğimizi hesapla
    // Her parça, büyük emoji'nin bir bölümünü temsil eder
    const emojiSize = pieceSize * 0.6;
    
    // Parça numarası göster (çocukların takip etmesi için)
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(pieceSize - 15, 15, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${piece.id + 1}`, pieceSize - 15, 16);

    // Merkeze küçük emoji
    ctx.font = `${pieceSize * 0.4}px Arial`;
    ctx.fillText(image.emoji, pieceSize / 2, pieceSize / 2);

    // Seçili efekti
    if (isSelected) {
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.roundRect(5, 5, pieceSize - 10, pieceSize - 10, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [piece, image, pieceSize, gridSize, isSelected, isDragging]);

  return (
    <canvas 
      ref={canvasRef} 
      width={pieceSize} 
      height={pieceSize}
      className={`cursor-pointer transition-transform ${isDragging ? 'scale-110 opacity-80' : ''}`}
      onClick={onSelect}
    />
  );
};

// Hedef slot
const TargetSlot: React.FC<{
  x: number;
  y: number;
  slotSize: number;
  isFilled: boolean;
  isHighlighted: boolean;
  image: PuzzleImage;
  gridSize: number;
}> = ({ x, y, slotSize, isFilled, isHighlighted, image, gridSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, slotSize, slotSize);

    // Slot arka planı
    ctx.fillStyle = isHighlighted ? 'rgba(76, 175, 80, 0.3)' : 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.roundRect(2, 2, slotSize - 4, slotSize - 4, 8);
    ctx.fill();

    // Kesik çizgi kenarlık
    ctx.strokeStyle = isHighlighted ? '#4CAF50' : '#9CA3AF';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Slot numarası
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${y * gridSize + x + 1}`, slotSize / 2, slotSize / 2);

  }, [x, y, slotSize, isFilled, isHighlighted, image, gridSize]);

  return <canvas ref={canvasRef} width={slotSize} height={slotSize} />;
};

// Konfeti
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
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
    }> = [];

    const emojis = ['⭐', '🌟', '✨', '🎉', '🧩', '🏆', '💫'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -50 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3 + 2,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 20 + Math.random() * 15,
        rotation: Math.random() * 0.1,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * p.y * 0.01);
        ctx.font = `${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      if (particles.some((p) => p.y < canvas.height + 50)) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [active]);

  if (!active) return null;

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

// Renk ayarlama
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Ana bileşen
const PuzzleGarden: React.FC = () => {
  const [difficulty, setDifficulty] = useState(0);
  const [currentImage, setCurrentImage] = useState<PuzzleImage | null>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [placedPieces, setPlacedPieces] = useState<Map<string, PuzzlePiece>>(new Map());
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showImageSelect, setShowImageSelect] = useState(true);
  const [category, setCategory] = useState<'animal' | 'fruit' | 'vehicle'>('animal');

  // Oyunu başlat
  const startGame = useCallback((image: PuzzleImage) => {
    const grid = DIFFICULTIES[difficulty].grid;
    const totalPieces = grid * grid;
    
    // Parçaları oluştur
    const newPieces: PuzzlePiece[] = [];
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        newPieces.push({
          id: y * grid + x,
          correctX: x,
          correctY: y,
          currentX: -1,
          currentY: -1,
          isPlaced: false,
        });
      }
    }

    // Karıştır
    const shuffled = [...newPieces].sort(() => Math.random() - 0.5);

    setCurrentImage(image);
    setPieces(shuffled);
    setPlacedPieces(new Map());
    setSelectedPiece(null);
    setMoves(0);
    setIsComplete(false);
    setShowImageSelect(false);
  }, [difficulty]);

  // Ses çal
  const playSound = useCallback((type: 'select' | 'place' | 'wrong' | 'complete') => {
    if (!soundEnabled) return;
    
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'select':
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        break;
      case 'place':
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'wrong':
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'complete':
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
          g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.2);
          o.start(ctx.currentTime + i * 0.15);
          o.stop(ctx.currentTime + i * 0.15 + 0.2);
        });
        return;
    }
  }, [soundEnabled]);

  // Parça seç
  const handleSelectPiece = (pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) return;

    playSound('select');
    setSelectedPiece(pieceId);
  };

  // Slot'a yerleştir
  const handleSlotClick = (slotX: number, slotY: number) => {
    if (selectedPiece === null) return;

    const piece = pieces.find(p => p.id === selectedPiece);
    if (!piece) return;

    setMoves(prev => prev + 1);

    // Doğru yer mi?
    if (piece.correctX === slotX && piece.correctY === slotY) {
      playSound('place');
      
      // Parçayı yerleştir
      const key = `${slotX}-${slotY}`;
      const newPlaced = new Map(placedPieces);
      newPlaced.set(key, { ...piece, currentX: slotX, currentY: slotY, isPlaced: true });
      setPlacedPieces(newPlaced);

      // Parçayı listeden kaldır
      setPieces(prev => prev.map(p => 
        p.id === selectedPiece ? { ...p, isPlaced: true } : p
      ));
      
      setSelectedPiece(null);

      // Tamamlandı mı?
      const grid = DIFFICULTIES[difficulty].grid;
      if (newPlaced.size === grid * grid) {
        setTimeout(() => {
          playSound('complete');
          setIsComplete(true);
        }, 300);
      }
    } else {
      playSound('wrong');
    }
  };

  const grid = DIFFICULTIES[difficulty].grid;
  const pieceSize = Math.min(70, 280 / grid);
  const slotSize = pieceSize;

  // Resim seçim ekranı
  if (showImageSelect) {
    const filteredImages = PUZZLE_IMAGES.filter(img => img.category === category);

    return (
      <div className="w-full h-full bg-gradient-to-b from-green-100 via-emerald-50 to-teal-100 rounded-3xl flex flex-col p-4 overflow-auto">
        {/* Başlık */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🧩</div>
          <h1 className="text-2xl font-bold text-gray-800">Yapboz Bahçesi</h1>
          <p className="text-gray-600 text-sm">Bir resim seç ve yapbozu tamamla!</p>
        </div>

        {/* Zorluk seçimi */}
        <div className="flex justify-center gap-2 mb-4">
          {DIFFICULTIES.map((diff, i) => (
            <button
              key={i}
              onClick={() => setDifficulty(i)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                difficulty === i
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-white/70 text-gray-600 hover:bg-white'
              }`}
            >
              {diff.name} ({diff.grid}x{diff.grid})
            </button>
          ))}
        </div>

        {/* Kategori seçimi */}
        <div className="flex justify-center gap-2 mb-4">
          {[
            { type: 'animal' as const, emoji: '🐱', name: 'Hayvanlar' },
            { type: 'fruit' as const, emoji: '🍎', name: 'Meyveler' },
            { type: 'vehicle' as const, emoji: '🚗', name: 'Araçlar' },
          ].map((cat) => (
            <button
              key={cat.type}
              onClick={() => setCategory(cat.type)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1 ${
                category === cat.type
                  ? 'bg-purple-500 text-white shadow-lg scale-105'
                  : 'bg-white/70 text-gray-600 hover:bg-white'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Resim grid */}
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {filteredImages.map((img) => (
            <button
              key={img.id}
              onClick={() => startGame(img)}
              className="aspect-square rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 p-2"
              style={{ backgroundColor: img.bgColor }}
            >
              <span className="text-4xl">{img.emoji}</span>
              <span className="text-xs font-bold text-gray-700">{img.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-green-100 via-emerald-50 to-teal-100 rounded-3xl overflow-hidden flex flex-col">
      {/* Konfeti */}
      <Confetti active={isComplete} />

      {/* Üst bar */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧩</span>
          <span className="font-bold text-gray-800">{currentImage?.name}</span>
          <span className="text-2xl">{currentImage?.emoji}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Hamle */}
          <div className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full">
            <Sparkles size={16} className="text-purple-500" />
            <span className="font-bold text-purple-700">{moves}</span>
          </div>

          {/* İlerleme */}
          <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
            <Puzzle size={16} className="text-green-500" />
            <span className="font-bold text-green-700">{placedPieces.size}/{grid * grid}</span>
          </div>

          {/* Ses */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 size={20} className="text-gray-600" />
            ) : (
              <VolumeX size={20} className="text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Ana alan */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 p-4">
        {/* Hedef alan */}
        <div 
          className="p-4 rounded-2xl shadow-inner"
          style={{ backgroundColor: currentImage?.bgColor }}
        >
          <div 
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${grid}, ${slotSize}px)` }}
          >
            {Array.from({ length: grid * grid }).map((_, i) => {
              const x = i % grid;
              const y = Math.floor(i / grid);
              const key = `${x}-${y}`;
              const placed = placedPieces.get(key);
              const isHighlighted = selectedPiece !== null && 
                pieces.find(p => p.id === selectedPiece)?.correctX === x &&
                pieces.find(p => p.id === selectedPiece)?.correctY === y;

              return (
                <div
                  key={i}
                  className="cursor-pointer"
                  onClick={() => handleSlotClick(x, y)}
                >
                  {placed ? (
                    <PuzzlePieceCanvas
                      piece={placed}
                      image={currentImage!}
                      pieceSize={slotSize}
                      gridSize={grid}
                      isSelected={false}
                      isDragging={false}
                      onSelect={() => {}}
                    />
                  ) : (
                    <TargetSlot
                      x={x}
                      y={y}
                      slotSize={slotSize}
                      isFilled={false}
                      isHighlighted={isHighlighted}
                      image={currentImage!}
                      gridSize={grid}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Parça havuzu */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
          <div className="text-center text-sm text-gray-500 mb-2">Parçalar</div>
          <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-auto">
            {pieces.filter(p => !p.isPlaced).map((piece) => (
              <div
                key={piece.id}
                className={`transition-all ${selectedPiece === piece.id ? 'scale-105' : ''}`}
              >
                <PuzzlePieceCanvas
                  piece={piece}
                  image={currentImage!}
                  pieceSize={pieceSize}
                  gridSize={grid}
                  isSelected={selectedPiece === piece.id}
                  isDragging={false}
                  onSelect={() => handleSelectPiece(piece.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alt bar */}
      <div className="bg-white/60 backdrop-blur-sm py-3 px-4 flex justify-center gap-4">
        <button
          onClick={() => setShowImageSelect(true)}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium transition-colors"
        >
          <RotateCcw size={18} />
          Yeni Resim
        </button>
        
        <button
          onClick={() => currentImage && startGame(currentImage)}
          className="flex items-center gap-2 bg-green-100 hover:bg-green-200 px-4 py-2 rounded-full font-medium text-green-700 transition-colors"
        >
          <RotateCcw size={18} />
          Tekrar Karıştır
        </button>
      </div>

      {/* Tamamlandı modalı */}
      {isComplete && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl">
            <div className="text-6xl mb-4">{currentImage?.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Harika!</h2>
            <p className="text-gray-600 mb-4">{currentImage?.name} yapbozunu tamamladın!</p>
            
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: DIFFICULTIES[difficulty].stars }).map((_, i) => (
                <Star key={i} size={32} className="text-yellow-400" fill="currentColor" />
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hamle:</span>
                <span className="font-bold">{moves}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => currentImage && startGame(currentImage)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-full font-bold transition-colors"
              >
                <RotateCcw size={20} />
                Tekrarla
              </button>
              
              <button
                onClick={() => setShowImageSelect(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Yeni Yapboz
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleGarden;
