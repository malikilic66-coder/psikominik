import React, { useState, useRef, useCallback } from 'react';
import { Palette, RotateCcw, CheckCircle, Star, Sparkles } from 'lucide-react';

interface ColorOption {
  name: string;
  hex: string;
  emotion: string;
}

interface DrawingTemplate {
  id: number;
  name: string;
  emotion: string;
  correctColor: string;
  paths: string[];
  viewBox: string;
}

const COLORS: ColorOption[] = [
  { name: 'Sarı', hex: '#FFD700', emotion: 'Mutlu' },
  { name: 'Mavi', hex: '#4A90D9', emotion: 'Sakin' },
  { name: 'Kırmızı', hex: '#E74C3C', emotion: 'Kızgın' },
  { name: 'Mor', hex: '#9B59B6', emotion: 'Huzurlu' },
  { name: 'Yeşil', hex: '#2ECC71', emotion: 'Rahat' },
  { name: 'Turuncu', hex: '#F39C12', emotion: 'Heyecanlı' },
  { name: 'Pembe', hex: '#FF69B4', emotion: 'Sevgi' },
  { name: 'Gri', hex: '#95A5A6', emotion: 'Üzgün' },
];

const TEMPLATES: DrawingTemplate[] = [
  {
    id: 1,
    name: 'Gülen Yüz',
    emotion: 'Mutlu',
    correctColor: '#FFD700',
    viewBox: '0 0 100 100',
    paths: [
      'M50 10 a40 40 0 1 0 0.001 0', // Face circle
      'M30 35 a5 5 0 1 0 0.001 0', // Left eye
      'M70 35 a5 5 0 1 0 0.001 0', // Right eye
      'M30 60 Q50 80 70 60', // Smile
    ]
  },
  {
    id: 2,
    name: 'Kalp',
    emotion: 'Sevgi',
    correctColor: '#FF69B4',
    viewBox: '0 0 100 100',
    paths: [
      'M50 88 L15 50 A20 20 0 0 1 50 25 A20 20 0 0 1 85 50 L50 88',
    ]
  },
  {
    id: 3,
    name: 'Güneş',
    emotion: 'Heyecanlı',
    correctColor: '#F39C12',
    viewBox: '0 0 100 100',
    paths: [
      'M50 30 a20 20 0 1 0 0.001 0', // Sun circle
      'M50 5 L50 15', // Top ray
      'M50 85 L50 95', // Bottom ray
      'M5 50 L15 50', // Left ray
      'M85 50 L95 50', // Right ray
      'M18 18 L25 25', // Top-left ray
      'M82 18 L75 25', // Top-right ray
      'M18 82 L25 75', // Bottom-left ray
      'M82 82 L75 75', // Bottom-right ray
    ]
  },
  {
    id: 4,
    name: 'Üzgün Yüz',
    emotion: 'Üzgün',
    correctColor: '#95A5A6',
    viewBox: '0 0 100 100',
    paths: [
      'M50 10 a40 40 0 1 0 0.001 0', // Face circle
      'M30 35 a5 5 0 1 0 0.001 0', // Left eye
      'M70 35 a5 5 0 1 0 0.001 0', // Right eye
      'M30 70 Q50 55 70 70', // Sad mouth
      'M25 25 L35 30', // Left eyebrow
      'M75 25 L65 30', // Right eyebrow
    ]
  },
  {
    id: 5,
    name: 'Yıldız',
    emotion: 'Rahat',
    correctColor: '#2ECC71',
    viewBox: '0 0 100 100',
    paths: [
      'M50 5 L61 39 L97 39 L68 61 L79 95 L50 73 L21 95 L32 61 L3 39 L39 39 Z',
    ]
  },
  {
    id: 6,
    name: 'Bulut',
    emotion: 'Sakin',
    correctColor: '#4A90D9',
    viewBox: '0 0 100 100',
    paths: [
      'M25 65 A20 20 0 0 1 25 45 A15 15 0 0 1 40 35 A25 25 0 0 1 75 35 A15 15 0 0 1 85 50 A20 20 0 0 1 85 65 Z',
    ]
  },
];

const ColorEmotion: React.FC = () => {
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [filledPaths, setFilledPaths] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const template = TEMPLATES[currentTemplate];

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  }, []);

  const handlePathClick = (pathIndex: number) => {
    if (!selectedColor) {
      showMessage('Önce bir renk seç! 🎨');
      return;
    }

    setFilledPaths(prev => ({
      ...prev,
      [pathIndex]: selectedColor
    }));
  };

  const checkAnswer = () => {
    // Check if main path (first path) has the correct color
    const mainPathColor = filledPaths[0];
    
    if (!mainPathColor) {
      showMessage('Önce resmi boya! 🖌️');
      return;
    }

    if (mainPathColor === template.correctColor) {
      const points = 100 - Object.keys(filledPaths).length * 5; // Bonus for fewer tries
      setScore(s => s + Math.max(points, 50));
      setCompleted(prev => [...prev, template.id]);
      setShowConfetti(true);
      showMessage(`Harika! "${template.emotion}" = ${COLORS.find(c => c.hex === template.correctColor)?.name}! 🎉`);
      
      setTimeout(() => {
        setShowConfetti(false);
        if (currentTemplate < TEMPLATES.length - 1) {
          setCurrentTemplate(c => c + 1);
          setFilledPaths({});
          setSelectedColor(null);
        } else {
          showMessage('Tüm resimleri tamamladın! 🏆');
        }
      }, 2000);
    } else {
      showMessage('Bu duygu için doğru renk değil, tekrar dene! 🤔');
    }
  };

  const resetCanvas = () => {
    setFilledPaths({});
    setSelectedColor(null);
  };

  const getEmotionHint = () => {
    const color = COLORS.find(c => c.emotion === template.emotion);
    return color ? `İpucu: "${template.emotion}" duygusu hangi rengi çağrıştırıyor?` : '';
  };

  return (
    <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 rounded-[2rem] p-4 sm:p-6 shadow-xl h-full overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)].hex,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Palette className="text-purple-500" size={24} />
          <h2 className="text-xl font-bold text-purple-700">Renk ve Duygu</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/80 rounded-full px-4 py-1 flex items-center gap-2">
            <Star className="text-yellow-500" size={18} />
            <span className="font-bold text-purple-600">{score}</span>
          </div>
          <div className="bg-white/80 rounded-full px-3 py-1 text-sm text-purple-600 font-semibold">
            {currentTemplate + 1}/{TEMPLATES.length}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-xl animate-bounce">
            <span className="text-lg font-bold text-purple-600">{message}</span>
          </div>
        </div>
      )}

      {/* Current Emotion */}
      <div className="text-center mb-4">
        <div className="inline-block bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2">
          <p className="text-lg">
            <span className="text-gray-600">Bu duyguyu boya:</span>
            <span className="font-bold text-purple-600 ml-2 text-xl">{template.emotion}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">{getEmotionHint()}</p>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="bg-white rounded-2xl p-4 shadow-inner mb-4 flex justify-center">
        <svg
          viewBox={template.viewBox}
          className="w-48 h-48 sm:w-56 sm:h-56"
        >
          {template.paths.map((path, index) => (
            <path
              key={index}
              d={path}
              fill={filledPaths[index] || '#f3f4f6'}
              stroke="#374151"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200 hover:opacity-80"
              onClick={() => handlePathClick(index)}
            />
          ))}
        </svg>
      </div>

      {/* Color Palette */}
      <div className="bg-white/60 rounded-2xl p-3 mb-4">
        <p className="text-sm text-gray-600 mb-2 text-center font-semibold">Renk Seç:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {COLORS.map(color => (
            <button
              key={color.hex}
              onClick={() => setSelectedColor(color.hex)}
              className={`group relative w-10 h-10 rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
                selectedColor === color.hex ? 'ring-4 ring-purple-400 ring-offset-2 scale-110' : ''
              }`}
              style={{ backgroundColor: color.hex }}
              title={`${color.name} - ${color.emotion}`}
            >
              {selectedColor === color.hex && (
                <CheckCircle className="absolute inset-0 m-auto text-white drop-shadow-lg" size={20} />
              )}
              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={resetCanvas}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full transition-all"
        >
          <RotateCcw size={18} />
          Temizle
        </button>
        <button
          onClick={checkAnswer}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <Sparkles size={18} />
          Kontrol Et
        </button>
      </div>

      {/* Progress */}
      <div className="mt-4 flex justify-center gap-2">
        {TEMPLATES.map((t, i) => (
          <div
            key={t.id}
            className={`w-3 h-3 rounded-full transition-all ${
              completed.includes(t.id)
                ? 'bg-green-500'
                : i === currentTemplate
                ? 'bg-purple-500 animate-pulse'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Color Legend */}
      <div className="mt-4 bg-white/40 rounded-xl p-3">
        <p className="text-xs text-center text-gray-600 font-semibold mb-2">Renk-Duygu Rehberi:</p>
        <div className="flex flex-wrap gap-1 justify-center text-xs">
          {COLORS.map(c => (
            <span key={c.hex} className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
              <span className="text-gray-600">{c.emotion}</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};

export default ColorEmotion;
