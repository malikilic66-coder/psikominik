import React, { useState, useEffect, useRef, useCallback } from 'react';

// Nefes dairesi Canvas bileşeni
interface BreathCircleCanvasProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'idle';
  scale: number;
  countdown: number;
  color: string;
  size?: number;
}

const BreathCircleCanvas: React.FC<BreathCircleCanvasProps> = ({ 
  phase, 
  scale, 
  countdown,
  color,
  size = 200 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      timeRef.current += 0.03;
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = size * 0.25;

      // Arka plan parıltıları
      for (let i = 0; i < 3; i++) {
        const pulseScale = 1 + Math.sin(timeRef.current - i * 0.3) * 0.1;
        const alpha = 0.15 - i * 0.04;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * scale * (1.2 + i * 0.2) * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      }

      // Ana daire
      const gradient = ctx.createRadialGradient(
        cx - baseRadius * 0.2, cy - baseRadius * 0.2, 0,
        cx, cy, baseRadius * scale
      );
      gradient.addColorStop(0, adjustColorBrightness(color, 40));
      gradient.addColorStop(0.7, color);
      gradient.addColorStop(1, adjustColorBrightness(color, -30));

      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * scale, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // İç parıltı
      ctx.beginPath();
      ctx.arc(cx - baseRadius * 0.15 * scale, cy - baseRadius * 0.15 * scale, baseRadius * 0.25 * scale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // Yüz çiz (faz'a göre)
      const faceScale = scale * 0.8;
      
      // Gözler
      ctx.fillStyle = '#fff';
      const eyeY = cy - baseRadius * 0.15 * faceScale;
      const eyeOffset = baseRadius * 0.25 * faceScale;
      
      // Göz akı
      ctx.beginPath();
      ctx.ellipse(cx - eyeOffset, eyeY, baseRadius * 0.12 * faceScale, baseRadius * 0.15 * faceScale, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + eyeOffset, eyeY, baseRadius * 0.12 * faceScale, baseRadius * 0.15 * faceScale, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Göz bebekleri
      ctx.fillStyle = '#333';
      const pupilOffset = phase === 'inhale' ? -2 : phase === 'exhale' ? 2 : 0;
      ctx.beginPath();
      ctx.arc(cx - eyeOffset + pupilOffset, eyeY, baseRadius * 0.06 * faceScale, 0, Math.PI * 2);
      ctx.arc(cx + eyeOffset + pupilOffset, eyeY, baseRadius * 0.06 * faceScale, 0, Math.PI * 2);
      ctx.fill();

      // Ağız (faz'a göre)
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      const mouthY = cy + baseRadius * 0.2 * faceScale;
      const mouthWidth = baseRadius * 0.3 * faceScale;
      
      if (phase === 'inhale') {
        // Açık ağız (nefes alıyor)
        ctx.beginPath();
        ctx.ellipse(cx, mouthY, mouthWidth * 0.3, mouthWidth * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      } else if (phase === 'exhale') {
        // Öpücük ağız (nefes veriyor)
        ctx.beginPath();
        ctx.arc(cx, mouthY, mouthWidth * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        // Hava kabarcıkları
        const bubbleProgress = (5 - countdown) / 5;
        for (let i = 0; i < 3; i++) {
          const bx = cx + (i - 1) * 15 + Math.sin(timeRef.current * 3 + i) * 5;
          const by = mouthY - 20 - bubbleProgress * 30 - i * 10;
          const br = 5 - i;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 - i * 0.15})`;
          ctx.fill();
        }
      } else if (phase === 'hold') {
        // Kapalı gülümseme (tutma)
        ctx.beginPath();
        ctx.moveTo(cx - mouthWidth, mouthY);
        ctx.quadraticCurveTo(cx, mouthY + mouthWidth * 0.3, cx + mouthWidth, mouthY);
        ctx.stroke();
      } else {
        // Hafif gülümseme (idle)
        ctx.beginPath();
        ctx.arc(cx, mouthY - 5, mouthWidth, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }

      // Yanaklar
      if (phase !== 'idle') {
        ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
        ctx.beginPath();
        ctx.ellipse(cx - baseRadius * 0.45 * faceScale, cy + baseRadius * 0.05 * faceScale, baseRadius * 0.12 * faceScale, baseRadius * 0.08 * faceScale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + baseRadius * 0.45 * faceScale, cy + baseRadius * 0.05 * faceScale, baseRadius * 0.12 * faceScale, baseRadius * 0.08 * faceScale, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Geri sayım (büyük sayı)
      if (phase !== 'idle' && countdown > 0) {
        ctx.font = `bold ${baseRadius * 0.6 * scale}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdown.toString(), cx, cy + baseRadius * 0.6 * scale);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase, scale, countdown, color, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="mx-auto" />;
};

// Renk parlaklık ayarlama
const adjustColorBrightness = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Balon Canvas bileşeni
interface BalloonCanvasProps {
  inflated: number; // 0-1
  color: string;
  size?: number;
}

const BalloonCanvas: React.FC<BalloonCanvasProps> = ({ inflated, color, size = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size * 0.4;
    
    const minRadius = size * 0.1;
    const maxRadius = size * 0.35;
    const radius = minRadius + (maxRadius - minRadius) * inflated;

    // Balon gölgesi
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy + radius + 5, radius * 0.8, radius, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fill();

    // Balon
    const gradient = ctx.createRadialGradient(
      cx - radius * 0.3, cy - radius * 0.3, 0,
      cx, cy, radius
    );
    gradient.addColorStop(0, adjustColorBrightness(color, 60));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, adjustColorBrightness(color, -40));

    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 0.85, radius, 0, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Parıltı
    ctx.beginPath();
    ctx.ellipse(cx - radius * 0.35, cy - radius * 0.35, radius * 0.15, radius * 0.25, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Düğüm noktası
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + radius - 5);
    ctx.lineTo(cx, cy + radius + 10);
    ctx.lineTo(cx + 5, cy + radius - 5);
    ctx.fillStyle = adjustColorBrightness(color, -50);
    ctx.fill();

    // İp
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + radius + 10);
    ctx.quadraticCurveTo(cx - 10, cy + radius + 30, cx + 5, cy + radius + 50);
    ctx.quadraticCurveTo(cx + 15, cy + radius + 60, cx, size - 10);
    ctx.stroke();

  }, [inflated, color, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

// Dalga Canvas bileşeni
interface WaveCanvasProps {
  progress: number; // 0-1 dalga pozisyonu
  incoming: boolean;
  size?: number;
}

const WaveCanvas: React.FC<WaveCanvasProps> = ({ progress, incoming, size = 150 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      timeRef.current += 0.05;
      ctx.clearRect(0, 0, size, size);

      // Gökyüzü
      const skyGradient = ctx.createLinearGradient(0, 0, 0, size * 0.5);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(1, '#E0F7FA');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, size, size * 0.5);

      // Güneş
      ctx.beginPath();
      ctx.arc(size * 0.8, size * 0.15, size * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD54F';
      ctx.fill();

      // Deniz
      const seaY = size * 0.5;
      const waveHeight = size * 0.1;
      const waveOffset = incoming ? progress * size * 0.3 : (1 - progress) * size * 0.3;

      // Dalga deseni
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, size);
        
        for (let x = 0; x <= size; x += 5) {
          const wave1 = Math.sin(x * 0.05 + timeRef.current + layer) * waveHeight * 0.3;
          const wave2 = Math.sin(x * 0.02 - timeRef.current * 0.5) * waveHeight * 0.5;
          const baseY = seaY + layer * 15 - waveOffset + waveHeight;
          ctx.lineTo(x, baseY + wave1 + wave2);
        }
        
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        
        const alpha = 0.6 - layer * 0.15;
        ctx.fillStyle = `rgba(30, 136, 229, ${alpha})`;
        ctx.fill();
      }

      // Köpükler
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 8; i++) {
        const fx = (i * size / 8 + timeRef.current * 30) % size;
        const fy = seaY + Math.sin(timeRef.current + i) * 10 - waveOffset + waveHeight;
        ctx.beginPath();
        ctx.ellipse(fx, fy, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress, incoming, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-2xl" />;
};

// Oynat/Duraklat butonu Canvas
interface PlayButtonCanvasProps {
  isPlaying: boolean;
  size?: number;
}

const PlayButtonCanvas: React.FC<PlayButtonCanvasProps> = ({ isPlaying, size = 60 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.4;

    // Arka plan daire
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = isPlaying ? '#EF5350' : '#66BB6A';
    ctx.fill();

    // İkon
    ctx.fillStyle = 'white';
    if (isPlaying) {
      // Pause ikonu
      ctx.fillRect(cx - r * 0.35, cy - r * 0.4, r * 0.25, r * 0.8);
      ctx.fillRect(cx + r * 0.1, cy - r * 0.4, r * 0.25, r * 0.8);
    } else {
      // Play ikonu
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.25, cy - r * 0.4);
      ctx.lineTo(cx + r * 0.4, cy);
      ctx.lineTo(cx - r * 0.25, cy + r * 0.4);
      ctx.closePath();
      ctx.fill();
    }
  }, [isPlaying, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

// Ses çalma fonksiyonu
const playBreathSound = (type: 'inhale' | 'exhale' | 'hold' | 'complete', isMuted: boolean) => {
  if (isMuted) return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    
    if (type === 'inhale') {
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'exhale') {
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(300, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'hold') {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
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

// Nefes desenleri
interface BreathPattern {
  id: number;
  type: 'circle' | 'balloon' | 'wave';
  phases: Array<{
    type: 'inhale' | 'hold' | 'exhale';
    duration: number;
  }>;
  color: string;
}

const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 1,
    type: 'circle',
    phases: [
      { type: 'inhale', duration: 4 },
      { type: 'hold', duration: 4 },
      { type: 'exhale', duration: 4 },
    ],
    color: '#4ECDC4',
  },
  {
    id: 2,
    type: 'balloon',
    phases: [
      { type: 'inhale', duration: 3 },
      { type: 'hold', duration: 2 },
      { type: 'exhale', duration: 4 },
    ],
    color: '#FF69B4',
  },
  {
    id: 3,
    type: 'wave',
    phases: [
      { type: 'inhale', duration: 5 },
      { type: 'exhale', duration: 5 },
    ],
    color: '#2196F3',
  },
];

const RhythmBreath: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [circleScale, setCircleScale] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [balloonInflation, setBalloonInflation] = useState(0);
  const [waveProgress, setWaveProgress] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout>();

  const pattern = BREATH_PATTERNS[selectedPattern];
  const phase = pattern.phases[currentPhase];

  // Başlat/Durdur
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsPlaying(true);
      setCurrentPhase(0);
      setCountdown(pattern.phases[0].duration);
      playBreathSound('inhale', isMuted);
    }
  }, [isPlaying, pattern, isMuted]);

  // Geri sayım
  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const nextPhase = (currentPhase + 1) % pattern.phases.length;
          setCurrentPhase(nextPhase);
          
          const nextPhaseType = pattern.phases[nextPhase].type;
          playBreathSound(nextPhaseType, isMuted);
          
          if (nextPhase === 0) {
            setCyclesCompleted(c => c + 1);
            playBreathSound('complete', isMuted);
          }
          
          return pattern.phases[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentPhase, pattern, isMuted]);

  // Animasyonlar
  useEffect(() => {
    if (!isPlaying || !phase) {
      setCircleScale(1);
      setBalloonInflation(0);
      setWaveProgress(0);
      return;
    }

    const progress = (phase.duration - countdown) / phase.duration;

    if (phase.type === 'inhale') {
      setCircleScale(1 + progress * 0.5);
      setBalloonInflation(progress);
      setWaveProgress(progress);
    } else if (phase.type === 'exhale') {
      setCircleScale(1.5 - progress * 0.5);
      setBalloonInflation(1 - progress);
      setWaveProgress(1 - progress);
    } else {
      setCircleScale(1.5);
      setBalloonInflation(1);
    }
  }, [isPlaying, phase, countdown]);

  const selectPattern = (index: number) => {
    if (isPlaying) return;
    setSelectedPattern(index);
    setCurrentPhase(0);
    setCyclesCompleted(0);
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentPhase(0);
    setCyclesCompleted(0);
    setCountdown(0);
    setCircleScale(1);
    setBalloonInflation(0);
    setWaveProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Faz rengini al
  const getPhaseColor = () => {
    if (!phase) return pattern.color;
    if (phase.type === 'inhale') return '#4ECDC4';
    if (phase.type === 'hold') return '#FFD54F';
    return '#FF7043';
  };

  return (
    <div className="bg-gradient-to-b from-indigo-200 via-purple-100 to-pink-100 rounded-[2rem] p-4 shadow-xl h-full overflow-hidden flex flex-col">
      {/* Üst bar */}
      <div className="flex justify-between items-center mb-3">
        {/* Ses butonu */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center"
        >
          {isMuted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#999">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#6366F1">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>

        {/* Döngü sayacı */}
        <div className="flex items-center gap-1 bg-white/70 rounded-full px-3 py-1">
          {Array.from({ length: Math.min(cyclesCompleted, 10) }).map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 16 16">
              <polygon points="8,1 10,6 16,6 11,9 13,15 8,11 3,15 5,9 0,6 6,6" fill="#FFD700" />
            </svg>
          ))}
          {cyclesCompleted === 0 && (
            <svg width="16" height="16" viewBox="0 0 16 16">
              <polygon points="8,1 10,6 16,6 11,9 13,15 8,11 3,15 5,9 0,6 6,6" fill="#ddd" />
            </svg>
          )}
        </div>

        {/* Reset butonu */}
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
      </div>

      {/* Desen seçici */}
      <div className="flex justify-center gap-3 mb-4">
        {BREATH_PATTERNS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => selectPattern(i)}
            disabled={isPlaying}
            className={`w-16 h-16 rounded-2xl transition-all ${
              selectedPattern === i
                ? 'bg-white shadow-lg scale-110 ring-2 ring-indigo-400'
                : 'bg-white/60 hover:bg-white/80'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            {p.type === 'circle' && (
              <div className="w-10 h-10 mx-auto rounded-full" style={{ backgroundColor: p.color }} />
            )}
            {p.type === 'balloon' && (
              <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto">
                <ellipse cx="20" cy="16" rx="12" ry="14" fill={p.color} />
                <polygon points="17,28 20,35 23,28" fill={p.color} />
              </svg>
            )}
            {p.type === 'wave' && (
              <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto">
                <path d="M0 25 Q10 15, 20 25 T40 25 L40 40 L0 40 Z" fill={p.color} />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Ana görsel */}
      <div className="flex-1 flex items-center justify-center">
        {pattern.type === 'circle' && (
          <BreathCircleCanvas
            phase={isPlaying ? phase?.type || 'idle' : 'idle'}
            scale={circleScale}
            countdown={countdown}
            color={getPhaseColor()}
            size={220}
          />
        )}
        {pattern.type === 'balloon' && (
          <div className="flex flex-col items-center">
            <BalloonCanvas
              inflated={isPlaying ? balloonInflation : 0.3}
              color={pattern.color}
              size={180}
            />
            {isPlaying && (
              <div className="mt-2 text-4xl font-bold text-pink-500">{countdown}</div>
            )}
          </div>
        )}
        {pattern.type === 'wave' && (
          <div className="flex flex-col items-center">
            <WaveCanvas
              progress={waveProgress}
              incoming={phase?.type === 'inhale'}
              size={200}
            />
            {isPlaying && (
              <div className="mt-2 text-4xl font-bold text-blue-500">{countdown}</div>
            )}
          </div>
        )}
      </div>

      {/* Faz göstergesi */}
      {isPlaying && (
        <div className="flex justify-center gap-2 mb-4">
          {pattern.phases.map((p, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                i === currentPhase ? 'scale-125 shadow-lg' : 'opacity-50'
              }`}
              style={{
                backgroundColor: i === currentPhase
                  ? p.type === 'inhale' ? '#4ECDC4' : p.type === 'hold' ? '#FFD54F' : '#FF7043'
                  : '#ddd'
              }}
            >
              {p.type === 'inhale' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
              )}
              {p.type === 'hold' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              )}
              {p.type === 'exhale' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Oynat butonu */}
      <div className="flex justify-center">
        <button
          onClick={togglePlay}
          className="transform hover:scale-110 active:scale-95 transition-all"
        >
          <PlayButtonCanvas isPlaying={isPlaying} size={70} />
        </button>
      </div>
    </div>
  );
};

export default RhythmBreath;
