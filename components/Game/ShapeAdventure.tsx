import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Star, RotateCcw, Volume2, VolumeX, ChevronRight, Sparkles } from 'lucide-react';

// Şekil tipleri
type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'hexagon';

interface Shape {
  type: ShapeType;
  color: string;
  emoji: string;
  name: string;
}

interface DraggableShape extends Shape {
  id: string;
  x: number;
  y: number;
  placed: boolean;
}

interface TargetSlot {
  type: ShapeType;
  x: number;
  y: number;
  filled: boolean;
}

// Şekil tanımları
const SHAPES: Shape[] = [
  { type: 'circle', color: '#FF6B6B', emoji: '🔴', name: 'Daire' },
  { type: 'square', color: '#4ECDC4', emoji: '🟦', name: 'Kare' },
  { type: 'triangle', color: '#FFE66D', emoji: '🔺', name: 'Üçgen' },
  { type: 'star', color: '#FF9F43', emoji: '⭐', name: 'Yıldız' },
  { type: 'heart', color: '#FF6B9D', emoji: '❤️', name: 'Kalp' },
  { type: 'hexagon', color: '#A855F7', emoji: '⬡', name: 'Altıgen' },
];

// Seviye tanımları
const LEVELS = [
  { shapes: ['circle', 'square', 'triangle'], name: 'Kolay', stars: 1 },
  { shapes: ['circle', 'square', 'triangle', 'star'], name: 'Orta', stars: 2 },
  { shapes: ['circle', 'square', 'triangle', 'star', 'heart'], name: 'Zor', stars: 3 },
  { shapes: ['circle', 'square', 'triangle', 'star', 'heart', 'hexagon'], name: 'Uzman', stars: 3 },
];

// Şekil çizim bileşeni
const ShapeRenderer: React.FC<{
  type: ShapeType;
  color: string;
  size: number;
  isTarget?: boolean;
  hasEyes?: boolean;
  isHappy?: boolean;
  animate?: boolean;
}> = React.memo(({ type, color, size, isTarget = false, hasEyes = true, isHappy = false, animate = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const drawShape = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;
      
      // Bounce animasyonu
      const bounce = animate ? Math.sin(frame * 0.1) * 3 : 0;
      const scale = animate ? 1 + Math.sin(frame * 0.05) * 0.02 : 1;

      ctx.save();
      ctx.translate(cx, cy + bounce);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);

      // Gölge
      if (!isTarget) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
      }

      // Ana şekil
      ctx.fillStyle = isTarget ? '#E5E7EB' : color;
      ctx.strokeStyle = isTarget ? '#D1D5DB' : adjustColor(color, -20);
      ctx.lineWidth = 3;

      ctx.beginPath();
      switch (type) {
        case 'circle':
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          break;
        case 'square':
          const sqSize = r * 1.6;
          roundRect(ctx, cx - sqSize/2, cy - sqSize/2, sqSize, sqSize, 10);
          break;
        case 'triangle':
          drawTriangle(ctx, cx, cy, r);
          break;
        case 'star':
          drawStar(ctx, cx, cy, r);
          break;
        case 'heart':
          drawHeart(ctx, cx, cy, r);
          break;
        case 'hexagon':
          drawHexagon(ctx, cx, cy, r);
          break;
      }
      ctx.fill();
      if (!isTarget) ctx.stroke();

      // Gölgeyi kapat
      ctx.shadowColor = 'transparent';

      // Yüz özellikleri (sadece sürüklenebilir şekillerde)
      if (hasEyes && !isTarget) {
        // Gözler
        const eyeY = cy - r * 0.15;
        const eyeSpacing = r * 0.35;
        const eyeSize = r * 0.15;

        // Göz beyazı
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx - eyeSpacing, eyeY, eyeSize * 1.3, eyeSize * 1.5, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + eyeSpacing, eyeY, eyeSize * 1.3, eyeSize * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Göz bebekleri - hareket eden
        const pupilOffset = animate ? Math.sin(frame * 0.08) * 3 : 0;
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(cx - eyeSpacing + pupilOffset, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.arc(cx + eyeSpacing + pupilOffset, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Göz parıltısı
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx - eyeSpacing + pupilOffset - 2, eyeY - 2, eyeSize * 0.25, 0, Math.PI * 2);
        ctx.arc(cx + eyeSpacing + pupilOffset - 2, eyeY - 2, eyeSize * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Yanaklar
        ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.6, cy + r * 0.1, r * 0.15, r * 0.1, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.6, cy + r * 0.1, r * 0.15, r * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ağız
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (isHappy) {
          // Gülümseyen ağız
          ctx.arc(cx, cy + r * 0.2, r * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
        } else {
          // Normal ağız
          ctx.arc(cx, cy + r * 0.35, r * 0.2, 0.2 * Math.PI, 0.8 * Math.PI);
        }
        ctx.stroke();
      }

      // Hedef şekil için kesik çizgi
      if (isTarget) {
        ctx.setLineDash([8, 5]);
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        switch (type) {
          case 'circle':
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            break;
          case 'square':
            const sqSize = r * 1.6;
            roundRect(ctx, cx - sqSize/2, cy - sqSize/2, sqSize, sqSize, 10);
            break;
          case 'triangle':
            drawTriangle(ctx, cx, cy, r);
            break;
          case 'star':
            drawStar(ctx, cx, cy, r);
            break;
          case 'heart':
            drawHeart(ctx, cx, cy, r);
            break;
          case 'hexagon':
            drawHexagon(ctx, cx, cy, r);
            break;
        }
        ctx.stroke();
      }

      ctx.restore();

      frame++;
      if (animate) {
        animationId = requestAnimationFrame(drawShape);
      }
    };

    drawShape();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [type, color, size, isTarget, hasEyes, isHappy, animate]);

  return <canvas ref={canvasRef} width={size} height={size} className="pointer-events-none" />;
});

// Yardımcı çizim fonksiyonları
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawTriangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const h = r * 1.8;
  ctx.moveTo(cx, cy - h * 0.5);
  ctx.lineTo(cx + h * 0.55, cy + h * 0.4);
  ctx.lineTo(cx - h * 0.55, cy + h * 0.4);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const spikes = 5;
  const outerR = r;
  const innerR = r * 0.5;
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const w = r * 1.2;
  const h = r * 1.1;
  ctx.moveTo(cx, cy + h * 0.7);
  ctx.bezierCurveTo(cx - w * 1.5, cy, cx - w * 0.8, cy - h, cx, cy - h * 0.3);
  ctx.bezierCurveTo(cx + w * 0.8, cy - h, cx + w * 1.5, cy, cx, cy + h * 0.7);
}

function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Konfeti efekti
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
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#A855F7', '#22C55E', '#FF6B9D'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
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
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
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

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

// Ana oyun bileşeni
interface ShapeAdventureProps {
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

const ShapeAdventure: React.FC<ShapeAdventureProps> = ({ 
  soundEnabled = true, 
  onToggleSound 
}) => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [shapes, setShapes] = useState<DraggableShape[]>([]);
  const [targets, setTargets] = useState<TargetSlot[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  // Local state removed in favor of props
  const [currentMessage, setCurrentMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Internal toggle if prop is not provided (fallback)
  const [internalSound, setInternalSound] = useState(true);
  const isSoundEnabled = onToggleSound ? soundEnabled : internalSound;
  const handleToggleSound = onToggleSound || (() => setInternalSound(prev => !prev));

  // Seviye başlat
  const initLevel = useCallback((levelIndex: number) => {
    const levelConfig = LEVELS[levelIndex];
    const shapeTypes = levelConfig.shapes as ShapeType[];
    
    // Hedef slotları oluştur
    const newTargets: TargetSlot[] = shapeTypes.map((type, i) => ({
      type,
      x: 100 + (i % 3) * 120,
      y: 80 + Math.floor(i / 3) * 120,
      filled: false,
    }));

    // Sürüklenebilir şekilleri oluştur (karıştırılmış)
    const shuffled = [...shapeTypes].sort(() => Math.random() - 0.5);
    const newShapes: DraggableShape[] = shuffled.map((type, i) => {
      const shapeInfo = SHAPES.find(s => s.type === type)!;
      return {
        ...shapeInfo,
        id: `shape-${i}`,
        x: 50 + (i % 3) * 100,
        y: 350 + Math.floor(i / 3) * 100,
        placed: false,
      };
    });

    setTargets(newTargets);
    setShapes(newShapes);
    setCurrentMessage(`${LEVELS[levelIndex].name} seviye! Şekilleri yerlerine koy 🎯`);
  }, []);

  useEffect(() => {
    initLevel(level);
  }, [level, initLevel]);

  // Ses çal
  const playSound = useCallback((type: 'pickup' | 'drop' | 'success' | 'wrong' | 'levelup') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'pickup':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'drop':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
      case 'wrong':
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'levelup':
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.frequency.setValueAtTime(523, audioContext.currentTime);
        osc1.frequency.setValueAtTime(659, audioContext.currentTime + 0.15);
        osc1.frequency.setValueAtTime(784, audioContext.currentTime + 0.3);
        osc1.frequency.setValueAtTime(1047, audioContext.currentTime + 0.45);
        gain1.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        osc1.start();
        osc1.stop(audioContext.currentTime + 0.6);
        break;
    }
  }, [isSoundEnabled]);

  // Sürükleme başlat
  const handleDragStart = (id: string, clientX: number, clientY: number) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape || shape.placed) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragging(id);
    setDragOffset({
      x: clientX - rect.left - shape.x,
      y: clientY - rect.top - shape.y,
    });
    playSound('pickup');
  };

  // Sürükleme
  const handleDrag = (clientX: number, clientY: number) => {
    if (!dragging) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setShapes(prev => prev.map(s => 
      s.id === dragging 
        ? { ...s, x: clientX - rect.left - dragOffset.x, y: clientY - rect.top - dragOffset.y }
        : s
    ));
  };

  // Sürükleme bırak
  const handleDragEnd = () => {
    if (!dragging) return;

    const shape = shapes.find(s => s.id === dragging);
    if (!shape) {
      setDragging(null);
      return;
    }

    // En yakın hedefi bul
    let matchedTarget: TargetSlot | null = null;
    let minDistance = Infinity;

    targets.forEach(target => {
      if (target.filled) return;
      const dx = shape.x - target.x;
      const dy = shape.y - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 60 && distance < minDistance) {
        minDistance = distance;
        matchedTarget = target;
      }
    });

    if (matchedTarget && matchedTarget.type === shape.type) {
      // Doğru eşleşme!
      playSound('success');
      setScore(prev => prev + 10);
      setCurrentMessage(`Harika! ${shape.name} doğru yerde! 🎉`);

      setShapes(prev => prev.map(s => 
        s.id === dragging 
          ? { ...s, x: matchedTarget!.x, y: matchedTarget!.y, placed: true }
          : s
      ));

      setTargets(prev => prev.map(t => 
        t === matchedTarget ? { ...t, filled: true } : t
      ));

      // Seviye tamamlandı mı?
      const remainingTargets = targets.filter(t => !t.filled && t !== matchedTarget);
      if (remainingTargets.length === 0) {
        // Seviye tamamlandı!
        setTimeout(() => {
          playSound('levelup');
          setShowCelebration(true);
          setCompletedLevels(prev => [...prev, level]);
          setCurrentMessage('Tebrikler! Seviye tamamlandı! 🏆');
        }, 500);
      }
    } else if (matchedTarget) {
      // Yanlış şekil
      playSound('wrong');
      setCurrentMessage(`Bu şekil buraya uymuyor, tekrar dene! 💪`);
    } else {
      playSound('drop');
    }

    setDragging(null);
  };

  // Sonraki seviye
  const nextLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(prev => prev + 1);
      setShowCelebration(false);
    }
  };

  // Seviyeyi yeniden başlat
  const restartLevel = () => {
    initLevel(level);
    setShowCelebration(false);
  };

  return (
    <div 
      className="w-full h-full bg-gradient-to-b from-blue-100 via-purple-50 to-pink-100 rounded-3xl overflow-hidden relative select-none"
      ref={containerRef}
      onMouseMove={(e) => handleDrag(e.clientX, e.clientY)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleDrag(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleDragEnd}
    >
      {/* Konfeti */}
      <Confetti active={showCelebration} />

      {/* Arka plan dekorasyonları */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200/50 rounded-full blur-2xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-pink-200/50 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200/50 rounded-full blur-2xl" />
      </div>

      {/* Üst bar */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔷</span>
          <span className="font-bold text-gray-800">Şekil Macerası</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Skor */}
          <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
            <Star size={18} className="text-yellow-500" fill="currentColor" />
            <span className="font-bold text-yellow-700">{score}</span>
          </div>

          {/* Seviye */}
          <div className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full">
            <Sparkles size={18} className="text-purple-500" />
            <span className="font-bold text-purple-700">Seviye {level + 1}</span>
          </div>

          {/* Ses butonu */}
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
            onClick={restartLevel}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <RotateCcw size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mesaj alanı */}
      <div className="absolute top-16 left-0 right-0 flex justify-center z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
          <p className="text-gray-700 font-medium">{currentMessage}</p>
        </div>
      </div>

      {/* Hedef alanı */}
      <div className="absolute top-28 left-0 right-0 flex justify-center">
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-4 shadow-inner">
          <div className="relative" style={{ width: 360, height: targets.length > 3 ? 240 : 120 }}>
            {targets.map((target, i) => (
              <div
                key={i}
                className="absolute transition-all"
                style={{ left: target.x - 40, top: target.y - 40 }}
              >
                <ShapeRenderer
                  type={target.type}
                  color="#E5E7EB"
                  size={80}
                  isTarget={!target.filled}
                  hasEyes={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sürüklenebilir şekiller */}
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute cursor-grab active:cursor-grabbing transition-transform ${
            dragging === shape.id ? 'scale-110 z-30' : 'z-20'
          } ${shape.placed ? 'pointer-events-none' : ''}`}
          style={{ 
            left: shape.x - 40, 
            top: shape.y - 40,
            opacity: shape.placed ? 0 : 1,
          }}
          onMouseDown={(e) => handleDragStart(shape.id, e.clientX, e.clientY)}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            handleDragStart(shape.id, touch.clientX, touch.clientY);
          }}
        >
          <ShapeRenderer
            type={shape.type}
            color={shape.color}
            size={80}
            hasEyes={true}
            isHappy={shape.placed}
            animate={!shape.placed}
          />
        </div>
      ))}

      {/* Seviye tamamlandı modalı */}
      {showCelebration && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Harika!</h2>
            <p className="text-gray-600 mb-4">Seviye {level + 1} tamamlandı!</p>
            
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: LEVELS[level].stars }).map((_, i) => (
                <Star key={i} size={32} className="text-yellow-400" fill="currentColor" />
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={restartLevel}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-full font-bold transition-colors"
              >
                <RotateCcw size={20} />
                Tekrarla
              </button>
              
              {level < LEVELS.length - 1 && (
                <button
                  onClick={nextLevel}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                  Sonraki
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seviye seçici */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
        {LEVELS.map((l, i) => (
          <button
            key={i}
            onClick={() => {
              setLevel(i);
              setShowCelebration(false);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              level === i
                ? 'bg-purple-500 text-white scale-110'
                : completedLevels.includes(i)
                ? 'bg-green-400 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            {completedLevels.includes(i) ? '✓' : i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShapeAdventure;
