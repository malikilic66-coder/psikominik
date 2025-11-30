import React, { useState, useRef, useEffect, useCallback } from 'react';

// Renkler - parlak, çocuk dostu
const COLORS = [
  { name: 'Kırmızı', hex: '#FF6B6B', rgb: [255, 107, 107] },
  { name: 'Turuncu', hex: '#FFA94D', rgb: [255, 169, 77] },
  { name: 'Sarı', hex: '#FFE066', rgb: [255, 224, 102] },
  { name: 'Yeşil', hex: '#69DB7C', rgb: [105, 219, 124] },
  { name: 'Mavi', hex: '#74C0FC', rgb: [116, 192, 252] },
  { name: 'Mor', hex: '#DA77F2', rgb: [218, 119, 242] },
  { name: 'Pembe', hex: '#F783AC', rgb: [247, 131, 172] },
  { name: 'Kahverengi', hex: '#A0522D', rgb: [160, 82, 45] },
];

// Ses çalma fonksiyonu
const playSound = (type: 'paint' | 'select' | 'clear' | 'celebrate') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'paint':
        oscillator.frequency.value = 400 + Math.random() * 200;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialDecayTo && gainNode.gain.exponentialDecayTo(0.01, audioContext.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
        break;
      case 'select':
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'clear':
        oscillator.frequency.value = 300;
        oscillator.type = 'triangle';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'celebrate':
        // Kutlama melodisi
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
          osc.start(audioContext.currentTime + i * 0.1);
          osc.stop(audioContext.currentTime + i * 0.1 + 0.15);
        });
        break;
    }
  } catch (e) {
    // Ses API'si desteklenmiyor
  }
};

// Renk seçici buton bileşeni (Canvas tabanlı)
const ColorButton: React.FC<{
  color: typeof COLORS[0];
  isSelected: boolean;
  onClick: () => void;
  size?: number;
}> = ({ color, isSelected, onClick, size = 50 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Temizle
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 4;

    // Seçili ise parlak halka
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Işıltı efekti
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;
    }

    // Ana renk dairesi
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = color.hex;
    ctx.fill();

    // Parlak vurgu
    ctx.shadowBlur = 0;
    const gradient = ctx.createRadialGradient(
      centerX - radius * 0.3,
      centerY - radius * 0.3,
      0,
      centerX,
      centerY,
      radius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Kenarlık
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [color, isSelected, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, cursor: 'pointer' }}
      onClick={onClick}
      className="transform hover:scale-110 transition-transform"
    />
  );
};

// Fırça boyutu göstergesi (Canvas tabanlı)
const BrushSizeIndicator: React.FC<{
  size: number;
  color: string;
  onClick: () => void;
  isSelected: boolean;
}> = ({ size, color, onClick, isSelected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displaySize = 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, displaySize, displaySize);

    const centerX = displaySize / 2;
    const centerY = displaySize / 2;

    // Seçili ise arka plan
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, displaySize / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Fırça boyutu göstergesi
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

  }, [size, color, isSelected]);

  return (
    <canvas
      ref={canvasRef}
      width={displaySize}
      height={displaySize}
      style={{ width: displaySize, height: displaySize, cursor: 'pointer' }}
      onClick={onClick}
      className="transform hover:scale-110 transition-transform"
    />
  );
};

// Silgi ikonu (Canvas tabanlı)
const EraserIcon: React.FC<{
  onClick: () => void;
  isSelected: boolean;
  size?: number;
}> = ({ onClick, isSelected, size = 50 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;

    // Seçili ise parlak halka
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Silgi gövdesi
    ctx.fillStyle = '#FFF5F5';
    ctx.strokeStyle = '#E8B4B4';
    ctx.lineWidth = 2;
    
    // Silgi şekli (dikdörtgen)
    const w = size * 0.5;
    const h = size * 0.35;
    ctx.beginPath();
    ctx.roundRect(centerX - w/2, centerY - h/2, w, h, 4);
    ctx.fill();
    ctx.stroke();

    // Silgi üst kısmı (pembe)
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.roundRect(centerX - w/2, centerY - h/2, w, h * 0.4, [4, 4, 0, 0]);
    ctx.fill();

  }, [isSelected, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, cursor: 'pointer' }}
      onClick={onClick}
      className="transform hover:scale-110 transition-transform"
    />
  );
};

// Temizle butonu (Canvas tabanlı)
const ClearButton: React.FC<{
  onClick: () => void;
  size?: number;
}> = ({ onClick, size = 50 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 4;

    // Arka plan daire
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE4E1';
    ctx.fill();
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Çöp kutusu ikonu
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Çöp kutusu gövdesi
    const bw = size * 0.35;
    const bh = size * 0.4;
    ctx.beginPath();
    ctx.moveTo(centerX - bw/2, centerY - bh/2 + 5);
    ctx.lineTo(centerX - bw/2 + 3, centerY + bh/2);
    ctx.lineTo(centerX + bw/2 - 3, centerY + bh/2);
    ctx.lineTo(centerX + bw/2, centerY - bh/2 + 5);
    ctx.stroke();

    // Kapak
    ctx.beginPath();
    ctx.moveTo(centerX - bw/2 - 3, centerY - bh/2 + 5);
    ctx.lineTo(centerX + bw/2 + 3, centerY - bh/2 + 5);
    ctx.stroke();

    // Tutamak
    ctx.beginPath();
    ctx.arc(centerX, centerY - bh/2, 4, Math.PI, 0);
    ctx.stroke();

  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, cursor: 'pointer' }}
      onClick={onClick}
      className="transform hover:scale-110 transition-transform"
    />
  );
};

// Ana çizim canvas'ı
const DrawingCanvas: React.FC<{
  color: string;
  brushSize: number;
  isEraser: boolean;
  clearTrigger: number;
}> = ({ color, brushSize, isEraser, clearTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Canvas boyutunu ayarla
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }, []);

  // Temizle
  useEffect(() => {
    if (clearTrigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [clearTrigger]);

  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const draw = useCallback((pos: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    if (isEraser) {
      ctx.strokeStyle = '#FFFFFF';
    } else {
      ctx.strokeStyle = color;
    }

    if (lastPosRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = isEraser ? '#FFFFFF' : color;
      ctx.fill();
    }

    lastPosRef.current = pos;
  }, [color, brushSize, isEraser]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPosition(e);
    lastPosRef.current = null;
    draw(pos);
    playSound('paint');
  }, [getPosition, draw]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPosition(e);
    draw(pos);
  }, [isDrawing, getPosition, draw]);

  const handleEnd = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-2xl cursor-crosshair touch-none"
      style={{ backgroundColor: '#FFFFFF' }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    />
  );
};

// Konfeti animasyonu
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
  }>>([]);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Konfeti parçacıkları oluştur
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * rect.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)].hex,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    }));

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      // Hala görünür parçacık var mı?
      if (particlesRef.current.some(p => p.y < rect.height + 20)) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();
    playSound('celebrate');

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// Ana bileşen
const ColorEmotion: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(15);
  const [isEraser, setIsEraser] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleColorSelect = (color: typeof COLORS[0]) => {
    setSelectedColor(color);
    setIsEraser(false);
    playSound('select');
  };

  const handleClear = () => {
    setClearTrigger(prev => prev + 1);
    playSound('clear');
  };

  const handleCelebrate = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const brushSizes = [8, 15, 25, 40];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-4 shadow-xl border-4 border-white relative overflow-hidden">
      <Confetti active={showConfetti} />
      
      {/* Çizim alanı */}
      <div className="bg-white rounded-2xl shadow-inner h-[320px] mb-4 relative overflow-hidden">
        <DrawingCanvas
          color={selectedColor.hex}
          brushSize={brushSize}
          isEraser={isEraser}
          clearTrigger={clearTrigger}
        />
      </div>

      {/* Araç çubuğu */}
      <div className="flex flex-col gap-3">
        {/* Renk seçici */}
        <div className="flex justify-center gap-2 flex-wrap">
          {COLORS.map((color) => (
            <ColorButton
              key={color.hex}
              color={color}
              isSelected={selectedColor.hex === color.hex && !isEraser}
              onClick={() => handleColorSelect(color)}
              size={40}
            />
          ))}
        </div>

        {/* Alt araçlar */}
        <div className="flex justify-between items-center">
          {/* Fırça boyutları */}
          <div className="flex gap-2">
            {brushSizes.map((size) => (
              <BrushSizeIndicator
                key={size}
                size={size}
                color={isEraser ? '#FFB6C1' : selectedColor.hex}
                isSelected={brushSize === size}
                onClick={() => {
                  setBrushSize(size);
                  playSound('select');
                }}
              />
            ))}
          </div>

          {/* Silgi ve temizle */}
          <div className="flex gap-2">
            <EraserIcon
              isSelected={isEraser}
              onClick={() => {
                setIsEraser(!isEraser);
                playSound('select');
              }}
              size={40}
            />
            <ClearButton onClick={handleClear} size={40} />
          </div>
        </div>

        {/* Kutlama butonu */}
        <button
          onClick={handleCelebrate}
          className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-transform active:scale-95"
        >
          🎉 ✨ 🌟
        </button>
      </div>
    </div>
  );
};

export default ColorEmotion;
