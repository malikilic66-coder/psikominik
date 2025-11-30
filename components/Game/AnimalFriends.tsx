import React, { useState, useCallback, useRef, useEffect } from 'react';

// Hayvan çizimi için Canvas bileşeni
interface AnimalCanvasProps {
  type: 'cat' | 'dog' | 'rabbit' | 'bear' | 'penguin' | 'elephant';
  mood: 'sad' | 'happy';
  size?: number;
}

const AnimalCanvas: React.FC<AnimalCanvasProps> = ({ type, mood, size = 120 }) => {
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

    // Hayvan tipine göre renk
    const colors: Record<string, { body: string; accent: string }> = {
      cat: { body: '#FFA726', accent: '#FF8A00' },
      dog: { body: '#8D6E63', accent: '#6D4C41' },
      rabbit: { body: '#F8BBD9', accent: '#EC407A' },
      bear: { body: '#795548', accent: '#5D4037' },
      penguin: { body: '#37474F', accent: '#FFFFFF' },
      elephant: { body: '#78909C', accent: '#546E7A' },
    };

    const color = colors[type];

    // Gölge
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    // Ana vücut/yüz
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = color.body;
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Hayvan tipine özel özellikler
    if (type === 'cat') {
      // Kulaklar (üçgen)
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.7, cy - r * 0.6);
      ctx.lineTo(cx - r * 0.4, cy - r * 1.1);
      ctx.lineTo(cx - r * 0.1, cy - r * 0.6);
      ctx.fillStyle = color.body;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.7, cy - r * 0.6);
      ctx.lineTo(cx + r * 0.4, cy - r * 1.1);
      ctx.lineTo(cx + r * 0.1, cy - r * 0.6);
      ctx.fill();

      // İç kulak
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.55, cy - r * 0.65);
      ctx.lineTo(cx - r * 0.4, cy - r * 0.95);
      ctx.lineTo(cx - r * 0.25, cy - r * 0.65);
      ctx.fillStyle = '#FFB74D';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + r * 0.55, cy - r * 0.65);
      ctx.lineTo(cx + r * 0.4, cy - r * 0.95);
      ctx.lineTo(cx + r * 0.25, cy - r * 0.65);
      ctx.fill();

      // Bıyıklar
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 1.5;
      for (let i = -1; i <= 1; i += 2) {
        ctx.beginPath();
        ctx.moveTo(cx + i * r * 0.3, cy + r * 0.1);
        ctx.lineTo(cx + i * r * 0.9, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + i * r * 0.3, cy + r * 0.2);
        ctx.lineTo(cx + i * r * 0.9, cy + r * 0.2);
        ctx.stroke();
      }
    } else if (type === 'dog') {
      // Kulaklar (sarkık)
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.8, cy - r * 0.2, r * 0.35, r * 0.6, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = color.accent;
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.8, cy - r * 0.2, r * 0.35, r * 0.6, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Burun bölgesi
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.3, r * 0.4, r * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#A1887F';
      ctx.fill();
    } else if (type === 'rabbit') {
      // Uzun kulaklar
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.4, cy - r * 1.2, r * 0.2, r * 0.6, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = color.body;
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.4, cy - r * 1.2, r * 0.2, r * 0.6, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // İç kulak
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.4, cy - r * 1.2, r * 0.1, r * 0.45, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#F48FB1';
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.4, cy - r * 1.2, r * 0.1, r * 0.45, 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'bear') {
      // Yuvarlak kulaklar
      ctx.beginPath();
      ctx.arc(cx - r * 0.7, cy - r * 0.7, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = color.body;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(cx + r * 0.7, cy - r * 0.7, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // İç kulak
      ctx.beginPath();
      ctx.arc(cx - r * 0.7, cy - r * 0.7, r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = color.accent;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(cx + r * 0.7, cy - r * 0.7, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Burun bölgesi
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.2, r * 0.35, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#A1887F';
      ctx.fill();
    } else if (type === 'penguin') {
      // Beyaz karın
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.15, r * 0.6, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fillStyle = color.accent;
      ctx.fill();

      // Gaga
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.1);
      ctx.lineTo(cx - r * 0.15, cy + r * 0.35);
      ctx.lineTo(cx + r * 0.15, cy + r * 0.35);
      ctx.closePath();
      ctx.fillStyle = '#FF9800';
      ctx.fill();
    } else if (type === 'elephant') {
      // Büyük kulaklar
      ctx.beginPath();
      ctx.ellipse(cx - r * 1, cy, r * 0.5, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fillStyle = color.body;
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(cx + r * 1, cy, r * 0.5, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // İç kulak
      ctx.beginPath();
      ctx.ellipse(cx - r * 1, cy, r * 0.3, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#90A4AE';
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(cx + r * 1, cy, r * 0.3, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hortum
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.15, cy + r * 0.3);
      ctx.quadraticCurveTo(cx, cy + r * 1.2, cx + r * 0.3, cy + r * 0.9);
      ctx.quadraticCurveTo(cx + r * 0.1, cy + r * 1.0, cx + r * 0.15, cy + r * 0.3);
      ctx.fillStyle = color.body;
      ctx.fill();
    }

    // Gözler
    const eyeY = cy - r * 0.1;
    const eyeOffset = r * 0.3;
    const eyeSize = r * 0.15;

    // Göz akı
    ctx.beginPath();
    ctx.arc(cx - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Göz bebeği
    ctx.beginPath();
    ctx.arc(cx - eyeOffset, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffset, eyeY, eyeSize * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    // Göz parıltısı
    ctx.beginPath();
    ctx.arc(cx - eyeOffset + 2, eyeY - 2, eyeSize * 0.25, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffset + 2, eyeY - 2, eyeSize * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Mood'a göre ifade
    if (mood === 'sad') {
      // Üzgün gözyaşları
      ctx.beginPath();
      ctx.ellipse(cx - eyeOffset - r * 0.1, eyeY + r * 0.25, r * 0.06, r * 0.1, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + eyeOffset + r * 0.1, eyeY + r * 0.3, r * 0.05, r * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#64B5F6';
      ctx.fill();

      // Üzgün kaşlar
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - eyeOffset - r * 0.15, eyeY - r * 0.25);
      ctx.lineTo(cx - eyeOffset + r * 0.15, eyeY - r * 0.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + eyeOffset + r * 0.15, eyeY - r * 0.25);
      ctx.lineTo(cx + eyeOffset - r * 0.15, eyeY - r * 0.35);
      ctx.stroke();

      // Üzgün ağız
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.6, r * 0.25, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    } else {
      // Mutlu kaşlar
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - eyeOffset, eyeY - r * 0.3, r * 0.12, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + eyeOffset, eyeY - r * 0.3, r * 0.12, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();

      // Mutlu gülümseme
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.25, r * 0.3, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      // Pembe yanaklar
      ctx.beginPath();
      ctx.arc(cx - r * 0.5, cy + r * 0.15, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.5, cy + r * 0.15, r * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 138, 128, 0.5)';
      ctx.fill();

      // Yıldızlar
      drawStar(ctx, cx - r * 1.1, cy - r * 0.6, 8, '#FFD700');
      drawStar(ctx, cx + r * 1.1, cy - r * 0.4, 6, '#FFD700');
    }

    // Burun (tüm hayvanlar için)
    if (type !== 'penguin') {
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.25, r * 0.1, r * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = type === 'dog' || type === 'bear' ? '#1a1a1a' : '#FF8A80';
      ctx.fill();
    }

  }, [type, mood, size]);

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) => {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  return <canvas ref={canvasRef} width={size} height={size} />;
};

// Yardım seçenekleri için Canvas
interface HelpOptionCanvasProps {
  type: 'hug' | 'give' | 'play' | 'share' | 'help' | 'heart';
  isCorrect: boolean;
  selected?: boolean;
  size?: number;
}

const HelpOptionCanvas: React.FC<HelpOptionCanvasProps> = ({ type, isCorrect, selected, size = 80 }) => {
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

    // Arka plan daire
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = isCorrect ? '#C8E6C9' : '#FFCDD2';
    ctx.fill();

    if (type === 'hug' || type === 'heart') {
      // Kalp çiz
      const heartSize = r * 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy + heartSize * 0.3);
      ctx.bezierCurveTo(cx, cy - heartSize * 0.2, cx - heartSize, cy - heartSize * 0.2, cx - heartSize, cy + heartSize * 0.1);
      ctx.bezierCurveTo(cx - heartSize, cy + heartSize * 0.6, cx, cy + heartSize, cx, cy + heartSize);
      ctx.bezierCurveTo(cx, cy + heartSize, cx + heartSize, cy + heartSize * 0.6, cx + heartSize, cy + heartSize * 0.1);
      ctx.bezierCurveTo(cx + heartSize, cy - heartSize * 0.2, cx, cy - heartSize * 0.2, cx, cy + heartSize * 0.3);
      ctx.fillStyle = '#E91E63';
      ctx.fill();
    } else if (type === 'give' || type === 'share') {
      // İki el/paylaşma sembolü
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.3, cy, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      
      // Ok
      ctx.strokeStyle = '#F57C00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.1, cy);
      ctx.lineTo(cx + r * 0.1, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + r * 0.05, cy - r * 0.15);
      ctx.lineTo(cx + r * 0.15, cy);
      ctx.lineTo(cx + r * 0.05, cy + r * 0.15);
      ctx.stroke();
    } else if (type === 'play') {
      // Oyuncak/top
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#2196F3';
      ctx.fill();
      
      // Top deseni
      ctx.strokeStyle = '#1976D2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy);
      ctx.lineTo(cx + r * 0.6, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.15, r * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'help') {
      // Yardım eli
      ctx.fillStyle = '#FFCC80';
      
      // Avuç içi
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.2, r * 0.5, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Parmaklar
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(cx + i * r * 0.2, cy - r * 0.3, r * 0.1, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Kalp içinde
      ctx.fillStyle = '#E91E63';
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.1, r * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Seçiliyse parıltı
    if (selected) {
      ctx.strokeStyle = isCorrect ? '#4CAF50' : '#F44336';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
      ctx.stroke();
    }

  }, [type, isCorrect, selected, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
};

// Ses çalma fonksiyonu
const playSound = (type: 'happy' | 'sad' | 'select' | 'complete') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'happy' || type === 'complete') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialDecayTo?.(0.01, audioContext.currentTime + 0.5) ||
        gainNode.gain.setValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'sad') {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'select') {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  } catch (e) {
    console.log('Ses çalınamadı');
  }
};

interface Animal {
  id: number;
  type: 'cat' | 'dog' | 'rabbit' | 'bear' | 'penguin' | 'elephant';
  helpOptions: {
    type: 'hug' | 'give' | 'play' | 'share' | 'help' | 'heart';
    isCorrect: boolean;
  }[];
}

const ANIMALS: Animal[] = [
  {
    id: 1,
    type: 'cat',
    helpOptions: [
      { type: 'heart', isCorrect: true },
      { type: 'play', isCorrect: false },
      { type: 'share', isCorrect: false },
    ],
  },
  {
    id: 2,
    type: 'dog',
    helpOptions: [
      { type: 'help', isCorrect: true },
      { type: 'share', isCorrect: false },
      { type: 'heart', isCorrect: false },
    ],
  },
  {
    id: 3,
    type: 'rabbit',
    helpOptions: [
      { type: 'hug', isCorrect: true },
      { type: 'play', isCorrect: false },
      { type: 'give', isCorrect: false },
    ],
  },
  {
    id: 4,
    type: 'bear',
    helpOptions: [
      { type: 'heart', isCorrect: true },
      { type: 'share', isCorrect: false },
      { type: 'help', isCorrect: false },
    ],
  },
  {
    id: 5,
    type: 'penguin',
    helpOptions: [
      { type: 'share', isCorrect: true },
      { type: 'play', isCorrect: false },
      { type: 'hug', isCorrect: false },
    ],
  },
  {
    id: 6,
    type: 'elephant',
    helpOptions: [
      { type: 'help', isCorrect: true },
      { type: 'give', isCorrect: false },
      { type: 'heart', isCorrect: false },
    ],
  },
];

const AnimalFriends: React.FC = () => {
  const [currentAnimal, setCurrentAnimal] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [happyAnimals, setHappyAnimals] = useState<number[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const animal = ANIMALS[currentAnimal];

  // Parçacık efekti
  const createParticles = (x: number, y: number, success: boolean) => {
    const colors = success 
      ? ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107']
      : ['#F44336', '#FF5722', '#FF9800'];
    
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const handleOptionClick = useCallback((index: number, e: React.MouseEvent) => {
    if (showResult) return;
    
    playSound('select');
    setSelectedOption(index);
    setShowResult(true);
    
    const option = animal.helpOptions[index];
    setIsCorrect(option.isCorrect);
    
    createParticles(e.clientX, e.clientY, option.isCorrect);
    
    if (option.isCorrect) {
      playSound('happy');
      setHappyAnimals(prev => [...prev, animal.id]);
      
      setTimeout(() => {
        if (currentAnimal < ANIMALS.length - 1) {
          setCurrentAnimal(c => c + 1);
          setSelectedOption(null);
          setShowResult(false);
        } else {
          playSound('complete');
          setGameComplete(true);
        }
      }, 2000);
    } else {
      playSound('sad');
    }
  }, [showResult, animal, currentAnimal]);

  const tryAgain = () => {
    setSelectedOption(null);
    setShowResult(false);
  };

  const restartGame = () => {
    setCurrentAnimal(0);
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setHappyAnimals([]);
    setGameComplete(false);
  };

  if (gameComplete) {
    return (
      <div className="bg-gradient-to-br from-green-100 via-yellow-50 to-pink-100 rounded-[2rem] p-6 shadow-xl h-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* Konfeti efekti */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`,
            }}
          />
        ))}

        {/* Mutlu hayvanlar */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {ANIMALS.map(a => (
            <div key={a.id} className="animate-bounce" style={{ animationDelay: `${a.id * 0.1}s` }}>
              <AnimalCanvas type={a.type} mood="happy" size={70} />
            </div>
          ))}
        </div>

        {/* Büyük kalp */}
        <div className="relative mb-6">
          <svg width="100" height="100" viewBox="0 0 100 100" className="animate-pulse">
            <path
              d="M50 88 C20 60, 0 40, 25 20 C40 10, 50 25, 50 25 C50 25, 60 10, 75 20 C100 40, 80 60, 50 88"
              fill="#E91E63"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
            {happyAnimals.length}
          </div>
        </div>

        {/* Yıldızlar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <svg key={i} width="40" height="40" viewBox="0 0 40 40" className="animate-spin" style={{ animationDuration: '3s' }}>
              <polygon
                points="20,2 25,15 39,15 28,24 32,38 20,30 8,38 12,24 1,15 15,15"
                fill="#FFD700"
              />
            </svg>
          ))}
        </div>

        {/* Tekrar oyna butonu */}
        <button
          onClick={restartGame}
          className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-3"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-100 via-yellow-50 to-pink-100 rounded-[2rem] p-4 sm:p-6 shadow-xl h-full overflow-hidden relative flex flex-col">
      {/* Parçacık efektleri */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-4 h-4 rounded-full animate-ping pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* İlerleme göstergesi */}
      <div className="flex justify-center gap-2 mb-4">
        {ANIMALS.map((a, i) => (
          <div
            key={a.id}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              happyAnimals.includes(a.id)
                ? 'bg-green-400 scale-110 shadow-lg'
                : i === currentAnimal
                ? 'bg-yellow-400 animate-pulse shadow-md'
                : 'bg-gray-200'
            }`}
          >
            <AnimalCanvas 
              type={a.type} 
              mood={happyAnimals.includes(a.id) ? 'happy' : 'sad'} 
              size={36} 
            />
          </div>
        ))}
      </div>

      {/* Ana hayvan kartı */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl transition-all duration-500 ${
          showResult && isCorrect ? 'scale-105 ring-4 ring-green-400' : ''
        } ${showResult && !isCorrect ? 'animate-shake' : ''}`}>
          
          {/* Hayvan */}
          <div className={`flex justify-center mb-4 ${isCorrect && showResult ? 'animate-bounce' : ''}`}>
            <AnimalCanvas 
              type={animal.type} 
              mood={happyAnimals.includes(animal.id) ? 'happy' : 'sad'} 
              size={150} 
            />
          </div>

          {/* Durum göstergesi */}
          <div className="flex justify-center mb-4">
            {!happyAnimals.includes(animal.id) ? (
              <div className="bg-orange-100 rounded-full px-4 py-2 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF9800">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="8" cy="10" r="1.5" fill="#5D4037"/>
                  <circle cx="16" cy="10" r="1.5" fill="#5D4037"/>
                  <path d="M8 15 Q12 13, 16 15" stroke="#5D4037" strokeWidth="2" fill="none"/>
                  <ellipse cx="7" cy="12" rx="1" ry="1.5" fill="#64B5F6"/>
                </svg>
                <span className="text-orange-600 font-bold">?</span>
              </div>
            ) : (
              <div className="bg-green-100 rounded-full px-4 py-2 flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#4CAF50">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="8" cy="10" r="1.5" fill="#2E7D32"/>
                  <circle cx="16" cy="10" r="1.5" fill="#2E7D32"/>
                  <path d="M8 14 Q12 17, 16 14" stroke="#2E7D32" strokeWidth="2" fill="none"/>
                </svg>
                <span className="text-green-600 font-bold">✓</span>
              </div>
            )}
          </div>

          {/* Yardım seçenekleri */}
          <div className="flex justify-center gap-4">
            {animal.helpOptions.map((option, index) => (
              <button
                key={index}
                onClick={(e) => handleOptionClick(index, e)}
                disabled={showResult && isCorrect}
                className={`p-2 rounded-2xl transition-all duration-300 ${
                  selectedOption === index
                    ? option.isCorrect
                      ? 'bg-green-200 scale-110 shadow-lg'
                      : 'bg-red-200 animate-shake'
                    : 'bg-white/50 hover:bg-white hover:scale-105 hover:shadow-md'
                } ${showResult && isCorrect && selectedOption !== index ? 'opacity-50' : ''}`}
              >
                <HelpOptionCanvas 
                  type={option.type} 
                  isCorrect={option.isCorrect} 
                  selected={selectedOption === index}
                  size={70} 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Yanlış cevap - tekrar dene butonu */}
        {showResult && !isCorrect && (
          <button
            onClick={tryAgain}
            className="mt-4 bg-white/80 hover:bg-white text-gray-700 font-bold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Alt dekorasyon */}
      <div className="flex justify-center gap-4 mt-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD'][i - 1],
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AnimalFriends;
