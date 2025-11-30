import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, Play, Pause, Volume2, VolumeX, Star, RefreshCw } from 'lucide-react';

interface BreathPhase {
  name: string;
  duration: number;
  instruction: string;
  color: string;
}

const BREATH_PATTERNS: { name: string; phases: BreathPhase[]; description: string }[] = [
  {
    name: '4-4-4 Nefes',
    description: 'Sakinleşmek için temel nefes egzersizi',
    phases: [
      { name: 'Nefes Al', duration: 4, instruction: 'Burnundan derin nefes al...', color: '#4ECDC4' },
      { name: 'Tut', duration: 4, instruction: 'Nefesini tut...', color: '#FFE66D' },
      { name: 'Nefes Ver', duration: 4, instruction: 'Ağzından yavaşça ver...', color: '#FF6B6B' },
    ]
  },
  {
    name: 'Balon Nefesi',
    description: 'Küçükler için eğlenceli nefes egzersizi',
    phases: [
      { name: 'Şişir', duration: 3, instruction: 'Balonu şişirmek için nefes al...', color: '#FF69B4' },
      { name: 'Tut', duration: 2, instruction: 'Balonu tut...', color: '#9B59B6' },
      { name: 'Bırak', duration: 4, instruction: 'Balonu yavaşça bırak...', color: '#4ECDC4' },
    ]
  },
  {
    name: 'Deniz Dalgası',
    description: 'Uyumadan önce rahatlatıcı nefes',
    phases: [
      { name: 'Dalga Geliyor', duration: 5, instruction: 'Dalga gibi derin nefes al...', color: '#4A90D9' },
      { name: 'Dalga Gidiyor', duration: 5, instruction: 'Dalga çekilirken nefes ver...', color: '#87CEEB' },
    ]
  },
];

const RhythmBreath: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalBreaths, setTotalBreaths] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [circleScale, setCircleScale] = useState(1);

  const intervalRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();

  const pattern = BREATH_PATTERNS[selectedPattern];
  const phase = pattern.phases[currentPhase];

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('rhythmBreathData');
    if (saved) {
      const data = JSON.parse(saved);
      setTotalBreaths(data.totalBreaths || 0);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('rhythmBreathData', JSON.stringify({ totalBreaths }));
  }, [totalBreaths]);

  // Play tone
  const playTone = useCallback((frequency: number, duration: number) => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      // Audio not supported
    }
  }, [isMuted]);

  // Start/Stop
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsPlaying(true);
      setCurrentPhase(0);
      setCountdown(pattern.phases[0].duration);
      playTone(440, 200);
    }
  };

  // Countdown effect
  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhase = (currentPhase + 1) % pattern.phases.length;
          setCurrentPhase(nextPhase);
          
          // Play transition sound
          playTone(nextPhase === 0 ? 523 : 392, 150);
          
          // Completed a cycle
          if (nextPhase === 0) {
            setCyclesCompleted(c => c + 1);
            setTotalBreaths(t => t + 1);
          }
          
          return pattern.phases[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentPhase, pattern, playTone]);

  // Circle animation
  useEffect(() => {
    if (!isPlaying) {
      setCircleScale(1);
      return;
    }

    const phaseName = phase.name;
    const progress = (phase.duration - countdown) / phase.duration;

    if (phaseName.includes('Al') || phaseName.includes('Şişir') || phaseName.includes('Geliyor')) {
      setCircleScale(1 + progress * 0.5);
    } else if (phaseName.includes('Ver') || phaseName.includes('Bırak') || phaseName.includes('Gidiyor')) {
      setCircleScale(1.5 - progress * 0.5);
    } else {
      setCircleScale(1.5);
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
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="bg-gradient-to-b from-indigo-200 via-purple-100 to-pink-100 rounded-[2rem] p-4 shadow-xl h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Wind className="text-indigo-500" size={24} />
          <h2 className="text-lg font-bold text-indigo-700">Ritim ve Nefes</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/60 hover:bg-white/80 transition-all"
          >
            {isMuted ? <VolumeX size={18} className="text-gray-500" /> : <Volume2 size={18} className="text-indigo-500" />}
          </button>
          <div className="bg-white/80 rounded-full px-3 py-1 flex items-center gap-1">
            <Star className="text-yellow-500" size={16} />
            <span className="font-bold text-indigo-600 text-sm">{totalBreaths}</span>
          </div>
        </div>
      </div>

      {/* Pattern Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {BREATH_PATTERNS.map((p, i) => (
          <button
            key={i}
            onClick={() => selectPattern(i)}
            disabled={isPlaying}
            className={`flex-shrink-0 px-3 py-2 rounded-xl font-semibold text-sm transition-all ${
              selectedPattern === i
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'bg-white/60 text-indigo-700 hover:bg-white/80'
            } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Breathing Circle */}
      <div className="flex flex-col items-center justify-center py-6">
        <div 
          className="relative w-40 h-40 flex items-center justify-center"
        >
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full opacity-30 transition-all duration-1000"
            style={{
              backgroundColor: isPlaying ? phase.color : '#E0E0E0',
              transform: `scale(${circleScale * 1.2})`,
              filter: 'blur(20px)'
            }}
          />
          
          {/* Main circle */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-1000 flex items-center justify-center shadow-xl"
            style={{
              backgroundColor: isPlaying ? phase.color : '#E5E7EB',
              transform: `scale(${circleScale})`
            }}
          >
            {/* Inner content */}
            <div className="text-center">
              {isPlaying ? (
                <>
                  <div className="text-4xl font-bold text-white drop-shadow-lg">
                    {countdown}
                  </div>
                  <div className="text-sm text-white/90 font-semibold mt-1">
                    {phase.name}
                  </div>
                </>
              ) : (
                <div className="text-4xl">🧘</div>
              )}
            </div>
          </div>

          {/* Ripple effects */}
          {isPlaying && (
            <>
              <div
                className="absolute inset-0 rounded-full border-4 animate-ping opacity-20"
                style={{ borderColor: phase.color }}
              />
            </>
          )}
        </div>

        {/* Instruction */}
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-indigo-700">
            {isPlaying ? phase.instruction : pattern.description}
          </p>
          {isPlaying && (
            <p className="text-sm text-indigo-500 mt-1">
              Döngü: {cyclesCompleted + 1}
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 py-3 px-8 rounded-full font-bold text-lg shadow-lg transition-all hover:scale-105 ${
            isPlaying
              ? 'bg-red-400 hover:bg-red-500 text-white'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause size={24} />
              Durdur
            </>
          ) : (
            <>
              <Play size={24} />
              Başla
            </>
          )}
        </button>
        
        {(isPlaying || cyclesCompleted > 0) && (
          <button
            onClick={reset}
            className="p-3 rounded-full bg-white/60 hover:bg-white/80 text-gray-600 transition-all"
          >
            <RefreshCw size={24} />
          </button>
        )}
      </div>

      {/* Phase indicator */}
      {isPlaying && (
        <div className="mt-4 flex justify-center gap-2">
          {pattern.phases.map((p, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentPhase ? 'scale-125' : ''
              }`}
              style={{
                backgroundColor: i === currentPhase ? p.color : '#D1D5DB'
              }}
            />
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 bg-white/40 rounded-xl p-3">
        <p className="text-xs text-indigo-700 text-center">
          💡 <strong>İpucu:</strong> Rahat bir pozisyonda otur, gözlerini kapat ve daire ile birlikte nefes al-ver.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-3 flex justify-between text-xs text-gray-600">
        <span>🧘 {cyclesCompleted} döngü</span>
        <span>🌬️ {totalBreaths} toplam nefes</span>
        <span>⭐ {Math.floor(totalBreaths / 10)} rozet</span>
      </div>
    </div>
  );
};

export default RhythmBreath;
