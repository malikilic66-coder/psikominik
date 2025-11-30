import React, { useState, useEffect, useRef, useCallback } from 'react';

// Çiçek Canvas Bileşeni
interface FlowerCanvasProps {
  stage: number; // 0-4
  color: string;
  size?: number;
}

const FlowerCanvas: React.FC<FlowerCanvasProps> = ({ stage, color, size = 60 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    if (stage === 0) {
      // Tohum
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.15, size * 0.1, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#8B4513';
      ctx.fill();
      
      // Toprak
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.35, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#5D4037';
      ctx.fill();
    } else if (stage === 1) {
      // Filiz
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.35);
      ctx.quadraticCurveTo(cx, cy, cx, cy - size * 0.1);
      ctx.stroke();
      
      // İlk yapraklar
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.08, cy, size * 0.08, size * 0.12, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + size * 0.08, cy, size * 0.08, size * 0.12, 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Toprak
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.38, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#5D4037';
      ctx.fill();
    } else if (stage === 2) {
      // Tomurcuk
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.35);
      ctx.quadraticCurveTo(cx, cy, cx, cy - size * 0.15);
      ctx.stroke();
      
      // Yapraklar
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.12, cy + size * 0.1, size * 0.1, size * 0.15, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + size * 0.12, cy + size * 0.1, size * 0.1, size * 0.15, 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Tomurcuk
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Toprak
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.38, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#5D4037';
      ctx.fill();
    } else if (stage === 3) {
      // Açan çiçek
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.35);
      ctx.quadraticCurveTo(cx - size * 0.05, cy + size * 0.1, cx, cy - size * 0.1);
      ctx.stroke();
      
      // Yapraklar
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.15, cy + size * 0.15, size * 0.1, size * 0.18, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + size * 0.15, cy + size * 0.15, size * 0.1, size * 0.18, 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      // Çiçek yaprakları
      const petalCount = 6;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(angle) * size * 0.12,
          cy - size * 0.2 + Math.sin(angle) * size * 0.12,
          size * 0.08,
          size * 0.12,
          angle,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.fill();
      }
      
      // Çiçek merkezi
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.2, size * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      
      // Toprak
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.38, size * 0.2, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#5D4037';
      ctx.fill();
    } else {
      // Tam açmış çiçek (stage 4)
      ctx.strokeStyle = '#388E3C';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.35);
      ctx.quadraticCurveTo(cx - size * 0.08, cy + size * 0.1, cx, cy - size * 0.05);
      ctx.stroke();
      
      // Büyük yapraklar
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.2, cy + size * 0.15, size * 0.12, size * 0.2, -0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + size * 0.2, cy + size * 0.15, size * 0.12, size * 0.2, 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      // Büyük çiçek yaprakları
      const petalCount = 8;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(angle) * size * 0.15,
          cy - size * 0.18 + Math.sin(angle) * size * 0.15,
          size * 0.1,
          size * 0.16,
          angle,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.fill();
        
        // İç detay
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(angle) * size * 0.12,
          cy - size * 0.18 + Math.sin(angle) * size * 0.12,
          size * 0.04,
          size * 0.08,
          angle,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = adjustColor(color, -30);
        ctx.fill();
      }
      
      // Parlak merkez
      const gradient = ctx.createRadialGradient(cx, cy - size * 0.18, 0, cx, cy - size * 0.18, size * 0.1);
      gradient.addColorStop(0, '#FFEB3B');
      gradient.addColorStop(1, '#FFC107');
      ctx.beginPath();
      ctx.arc(cx, cy - size * 0.18, size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Parıltılar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(cx - size * 0.03, cy - size * 0.22, size * 0.02, 0, Math.PI * 2);
      ctx.fill();
      
      // Toprak
      ctx.beginPath();
      ctx.ellipse(cx, cy + size * 0.38, size * 0.22, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#5D4037';
      ctx.fill();
    }
  }, [stage, color, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

// Renk ayarlama yardımcı fonksiyonu
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `rgb(${r}, ${g}, ${b})`;
};

// Güneş Canvas Bileşeni
interface SunCanvasProps {
  size?: number;
  brightness?: number;
}

const SunCanvas: React.FC<SunCanvasProps> = ({ size = 80, brightness = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Işınlar
    ctx.strokeStyle = `rgba(255, 193, 7, ${0.5 * brightness})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * size * 0.25, cy + Math.sin(angle) * size * 0.25);
      ctx.lineTo(cx + Math.cos(angle) * size * 0.4, cy + Math.sin(angle) * size * 0.4);
      ctx.stroke();
    }

    // Güneş
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.25);
    gradient.addColorStop(0, `rgba(255, 235, 59, ${brightness})`);
    gradient.addColorStop(0.7, `rgba(255, 193, 7, ${brightness})`);
    gradient.addColorStop(1, `rgba(255, 152, 0, ${brightness})`);
    
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Gülümseme
    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // Gözler
    ctx.fillStyle = '#F57C00';
    ctx.beginPath();
    ctx.arc(cx - size * 0.06, cy - size * 0.03, size * 0.02, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.06, cy - size * 0.03, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
    
    // Gülümseme
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.02, size * 0.08, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }, [size, brightness]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

// Su damlası Canvas
interface WaterDropCanvasProps {
  size?: number;
  filled?: boolean;
}

const WaterDropCanvas: React.FC<WaterDropCanvasProps> = ({ size = 30, filled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.35);
    ctx.bezierCurveTo(
      cx - size * 0.3, cy,
      cx - size * 0.3, cy + size * 0.3,
      cx, cy + size * 0.35
    );
    ctx.bezierCurveTo(
      cx + size * 0.3, cy + size * 0.3,
      cx + size * 0.3, cy,
      cx, cy - size * 0.35
    );

    if (filled) {
      const gradient = ctx.createLinearGradient(cx - size * 0.2, cy, cx + size * 0.2, cy);
      gradient.addColorStop(0, '#64B5F6');
      gradient.addColorStop(1, '#2196F3');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Parıltı
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(cx - size * 0.08, cy - size * 0.05, size * 0.05, size * 0.08, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#90CAF9';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [size, filled]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

// Aksiyon ikonları Canvas
interface ActionIconCanvasProps {
  type: 'heart' | 'share' | 'help' | 'smile' | 'star' | 'hug';
  size?: number;
  color?: string;
}

const ActionIconCanvas: React.FC<ActionIconCanvasProps> = ({ type, size = 50, color = '#E91E63' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;

    if (type === 'heart') {
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.6);
      ctx.bezierCurveTo(cx - r * 1.2, cy - r * 0.2, cx - r * 0.6, cy - r, cx, cy - r * 0.4);
      ctx.bezierCurveTo(cx + r * 0.6, cy - r, cx + r * 1.2, cy - r * 0.2, cx, cy + r * 0.6);
      ctx.fillStyle = '#E91E63';
      ctx.fill();
    } else if (type === 'share') {
      // İki el
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(cx - r * 0.5, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.5, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Bağlantı
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.2, cy);
      ctx.lineTo(cx + r * 0.2, cy);
      ctx.stroke();
    } else if (type === 'help') {
      // Yardım eli
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      // Artı işareti
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.3, cy);
      ctx.lineTo(cx + r * 0.3, cy);
      ctx.moveTo(cx, cy - r * 0.3);
      ctx.lineTo(cx, cy + r * 0.3);
      ctx.stroke();
    } else if (type === 'smile') {
      // Gülümseyen yüz
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFEB3B';
      ctx.fill();
      
      // Gözler
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.arc(cx - r * 0.25, cy - r * 0.15, r * 0.1, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.25, cy - r * 0.15, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      
      // Gülümseme
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.1, r * 0.35, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else if (type === 'star') {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const px = cx + Math.cos(angle) * r * 0.8;
        const py = cy + Math.sin(angle) * r * 0.8;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else if (type === 'hug') {
      // Sarılma - iki kol
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, Math.PI * 0.7, Math.PI * 1.3, true);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, Math.PI * 1.7, Math.PI * 0.3, true);
      ctx.stroke();
      
      // Kalp
      ctx.fillStyle = '#E91E63';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [type, size, color]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

// Ses çalma fonksiyonu
const playSound = (type: 'plant' | 'water' | 'grow' | 'complete') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'plant') {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'water') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'grow') {
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'complete') {
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  } catch (e) {
    console.log('Ses çalınamadı');
  }
};

interface Flower {
  id: number;
  stage: number;
  x: number;
  y: number;
  color: string;
}

const FLOWER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF69B4', '#9B59B6', '#2ECC71', '#F39C12', '#E91E63'];
const ACTION_TYPES: Array<'heart' | 'share' | 'help' | 'smile' | 'star' | 'hug'> = ['heart', 'share', 'help', 'smile', 'star', 'hug'];

const HappinessGarden: React.FC = () => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [waterDrops, setWaterDrops] = useState(3);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sunBrightness, setSunBrightness] = useState(1);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const gardenRef = useRef<HTMLDivElement>(null);

  // Güneş animasyonu
  useEffect(() => {
    const interval = setInterval(() => {
      setSunBrightness(0.8 + Math.sin(Date.now() / 1000) * 0.2);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Su yenileme
  useEffect(() => {
    const interval = setInterval(() => {
      setWaterDrops(w => Math.min(w + 1, 5));
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Parçacık efekti
  const createParticles = (x: number, y: number) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 60,
      color: FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)],
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    const rect = gardenRef.current?.getBoundingClientRect();
    if (!rect) return;

    playSound('plant');
    
    // Yeni çiçek ekle
    const newFlower: Flower = {
      id: Date.now(),
      stage: 0,
      x: 10 + Math.random() * 80,
      y: 30 + Math.random() * 50,
      color: FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)],
    };
    
    setFlowers(prev => [...prev.slice(-11), newFlower]); // Max 12 çiçek
    createParticles(e.clientX - rect.left, e.clientY - rect.top);

    // Kutlama
    if (flowers.length > 0 && (flowers.length + 1) % 5 === 0) {
      playSound('complete');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const waterFlowers = () => {
    if (waterDrops <= 0 || flowers.length === 0) return;
    
    playSound('water');
    setWaterDrops(w => w - 1);
    
    // Çiçekleri büyüt
    setFlowers(prev => prev.map(f => ({
      ...f,
      stage: Math.min(f.stage + 1, 4),
    })));
    
    setTimeout(() => playSound('grow'), 300);
  };

  const resetGarden = () => {
    setFlowers([]);
    setWaterDrops(3);
  };

  return (
    <div className="bg-gradient-to-b from-sky-300 via-sky-200 to-green-300 rounded-[2rem] p-4 shadow-xl h-full overflow-hidden relative flex flex-col">
      {/* Parçacıklar */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-full animate-ping pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
          }}
        />
      ))}

      {/* Kutlama */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 rounded-[2rem]">
          <div className="bg-white/95 rounded-3xl p-6 text-center animate-bounce shadow-2xl">
            <div className="flex justify-center mb-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-spin" style={{ animationDuration: '2s' }}>
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <polygon points="20,2 25,15 39,15 28,24 32,38 20,30 8,38 12,24 1,15 15,15" fill="#FFD700" />
                  </svg>
                </div>
              ))}
            </div>
            <div className="text-4xl font-bold text-green-500">{flowers.length}</div>
          </div>
        </div>
      )}

      {/* Üst kısım - Güneş ve Su */}
      <div className="flex justify-between items-start mb-2">
        {/* Güneş */}
        <div className="animate-pulse">
          <SunCanvas size={60} brightness={sunBrightness} />
        </div>
        
        {/* Su damlaları */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <WaterDropCanvas key={i} size={25} filled={i < waterDrops} />
          ))}
        </div>
      </div>

      {/* Bahçe alanı */}
      <div 
        ref={gardenRef}
        className="flex-1 relative bg-gradient-to-b from-green-400 to-green-500 rounded-2xl overflow-hidden shadow-inner min-h-[150px]"
      >
        {/* Çimler */}
        <div className="absolute bottom-0 left-0 right-0 h-8">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-green-600 rounded-t-full"
              style={{
                left: `${(i / 30) * 100}%`,
                height: `${15 + Math.random() * 15}px`,
                bottom: 0,
              }}
            />
          ))}
        </div>

        {/* Çiçekler */}
        {flowers.map(flower => (
          <div
            key={flower.id}
            className="absolute transition-all duration-500"
            style={{
              left: `${flower.x}%`,
              top: `${flower.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <FlowerCanvas stage={flower.stage} color={flower.color} size={50 + flower.stage * 10} />
          </div>
        ))}

        {/* Boş bahçe göstergesi */}
        {flowers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/70 rounded-2xl p-4 flex flex-col items-center">
              <FlowerCanvas stage={0} color="#FF6B6B" size={50} />
              <div className="mt-2 text-2xl">👇</div>
            </div>
          </div>
        )}
      </div>

      {/* Aksiyon butonları */}
      <div className="mt-3">
        <div className="flex justify-center gap-2 mb-3">
          {ACTION_TYPES.slice(0, 4).map((type, i) => (
            <button
              key={type}
              onClick={handleActionClick}
              className="bg-white/80 hover:bg-white p-2 rounded-xl shadow-md transition-all hover:scale-110 active:scale-95"
            >
              <ActionIconCanvas type={type} size={45} />
            </button>
          ))}
        </div>
      </div>

      {/* Alt butonlar */}
      <div className="flex gap-2">
        {/* Sulama butonu */}
        <button
          onClick={waterFlowers}
          disabled={waterDrops <= 0 || flowers.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            waterDrops > 0 && flowers.length > 0
              ? 'bg-blue-400 hover:bg-blue-500 shadow-lg hover:scale-102'
              : 'bg-gray-300 opacity-50'
          }`}
        >
          <WaterDropCanvas size={30} filled={waterDrops > 0} />
          <span className="text-white font-bold text-lg">{waterDrops}</span>
        </button>

        {/* Sıfırla butonu */}
        <button
          onClick={resetGarden}
          className="bg-gray-200 hover:bg-gray-300 p-3 rounded-xl transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
      </div>

      {/* İstatistik göstergesi */}
      <div className="mt-2 flex justify-center gap-3">
        {Array.from({ length: Math.min(flowers.length, 12) }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: flowers[i]?.color || '#ccc' }}
          />
        ))}
      </div>
    </div>
  );
};

export default HappinessGarden;
