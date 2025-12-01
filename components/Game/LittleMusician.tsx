import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Music, Star, Volume2, VolumeX, Trash2, Play, Pause, RotateCcw } from 'lucide-react';

// Nota tanımları
interface Note {
  name: string;
  frequency: number;
  color: string;
  emoji: string;
}

const PIANO_NOTES: Note[] = [
  { name: 'Do', frequency: 261.63, color: '#FF6B6B', emoji: '🔴' },
  { name: 'Re', frequency: 293.66, color: '#FF9F43', emoji: '🟠' },
  { name: 'Mi', frequency: 329.63, color: '#FFE66D', emoji: '🟡' },
  { name: 'Fa', frequency: 349.23, color: '#4ECDC4', emoji: '🟢' },
  { name: 'Sol', frequency: 392.00, color: '#45B7D1', emoji: '🔵' },
  { name: 'La', frequency: 440.00, color: '#A855F7', emoji: '🟣' },
  { name: 'Si', frequency: 493.88, color: '#EC4899', emoji: '💗' },
  { name: 'Do²', frequency: 523.25, color: '#F43F5E', emoji: '❤️' },
];

// Davul sesleri
interface DrumSound {
  name: string;
  emoji: string;
  color: string;
  type: 'kick' | 'snare' | 'hihat' | 'tom' | 'cymbal';
}

const DRUM_SOUNDS: DrumSound[] = [
  { name: 'Bas', emoji: '🥁', color: '#DC2626', type: 'kick' },
  { name: 'Trampet', emoji: '🪘', color: '#EA580C', type: 'snare' },
  { name: 'Hi-Hat', emoji: '🔔', color: '#CA8A04', type: 'hihat' },
  { name: 'Tom', emoji: '🎵', color: '#16A34A', type: 'tom' },
  { name: 'Zil', emoji: '✨', color: '#2563EB', type: 'cymbal' },
];

// Ksilofon notaları
const XYLOPHONE_NOTES: Note[] = [
  { name: 'Do', frequency: 523.25, color: '#FF6B6B', emoji: '🎹' },
  { name: 'Re', frequency: 587.33, color: '#FF9F43', emoji: '🎹' },
  { name: 'Mi', frequency: 659.25, color: '#FFE66D', emoji: '🎹' },
  { name: 'Fa', frequency: 698.46, color: '#4ECDC4', emoji: '🎹' },
  { name: 'Sol', frequency: 783.99, color: '#45B7D1', emoji: '🎹' },
  { name: 'La', frequency: 880.00, color: '#A855F7', emoji: '🎹' },
  { name: 'Si', frequency: 987.77, color: '#EC4899', emoji: '🎹' },
];

// Enstrüman tipleri
type InstrumentType = 'piano' | 'drum' | 'xylophone';

// Kayıtlı nota
interface RecordedNote {
  instrument: InstrumentType;
  noteIndex: number;
  time: number;
}

// Animasyonlu piyano tuşu
const PianoKey: React.FC<{
  note: Note;
  index: number;
  isPressed: boolean;
  onPress: () => void;
  onRelease: () => void;
}> = React.memo(({ note, index, isPressed, onPress, onRelease }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 60;
    const h = 140;
    ctx.clearRect(0, 0, w, h);

    // Tuş gölgesi
    if (!isPressed) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.roundRect(3, 5, w - 6, h - 5, [0, 0, 10, 10]);
      ctx.fill();
    }

    // Tuş arka planı
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, isPressed ? note.color : '#FFFFFF');
    gradient.addColorStop(0.7, isPressed ? adjustColor(note.color, -20) : '#F8F8F8');
    gradient.addColorStop(1, isPressed ? adjustColor(note.color, -40) : '#E8E8E8');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(2, isPressed ? 3 : 0, w - 4, h - (isPressed ? 3 : 5), [0, 0, 10, 10]);
    ctx.fill();

    // Tuş kenarlığı
    ctx.strokeStyle = isPressed ? adjustColor(note.color, -30) : '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Renkli alt çizgi
    ctx.fillStyle = note.color;
    ctx.beginPath();
    ctx.roundRect(8, h - 35, w - 16, 25, 6);
    ctx.fill();

    // Nota adı
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(note.name, w / 2, h - 22);

    // Basılı efekti - parıltı
    if (isPressed) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(w / 2, h / 3, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [note, isPressed]);

  return (
    <div
      className="relative cursor-pointer select-none transition-transform"
      style={{ transform: isPressed ? 'translateY(3px)' : 'translateY(0)' }}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      onTouchStart={(e) => { e.preventDefault(); onPress(); }}
      onTouchEnd={onRelease}
    >
      <canvas ref={canvasRef} width={60} height={140} />
      {isPressed && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
          {note.emoji}
        </div>
      )}
    </div>
  );
});

// Davul pedi
const DrumPad: React.FC<{
  drum: DrumSound;
  isPressed: boolean;
  onPress: () => void;
}> = React.memo(({ drum, isPressed, onPress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 90;
    ctx.clearRect(0, 0, size, size);

    // Gölge
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(size / 2 + 2, size / 2 + 4, 38, 0, Math.PI * 2);
    ctx.fill();

    // Ana daire
    const gradient = ctx.createRadialGradient(size / 2, size / 2 - 10, 0, size / 2, size / 2, 40);
    gradient.addColorStop(0, adjustColor(drum.color, 30));
    gradient.addColorStop(0.7, drum.color);
    gradient.addColorStop(1, adjustColor(drum.color, -30));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 + (isPressed ? 3 : 0), 38, 0, Math.PI * 2);
    ctx.fill();

    // Kenarlık
    ctx.strokeStyle = adjustColor(drum.color, -40);
    ctx.lineWidth = 3;
    ctx.stroke();

    // İç halka
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 + (isPressed ? 3 : 0), 28, 0, Math.PI * 2);
    ctx.stroke();

    // Basılı efekti
    if (isPressed) {
      // Dalga efekti
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 3;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2 + 3, 38 + i * 8, 0, Math.PI * 2);
        ctx.globalAlpha = 0.3 / i;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }, [drum, isPressed]);

  return (
    <div
      className="relative cursor-pointer select-none flex flex-col items-center gap-1"
      onMouseDown={onPress}
      onTouchStart={(e) => { e.preventDefault(); onPress(); }}
    >
      <canvas ref={canvasRef} width={90} height={90} className={`transition-transform ${isPressed ? 'scale-95' : ''}`} />
      <div className="text-2xl">{drum.emoji}</div>
      <div className="text-xs font-bold text-gray-600">{drum.name}</div>
    </div>
  );
});

// Ksilofon çubuğu
const XylophoneBar: React.FC<{
  note: Note;
  index: number;
  isPressed: boolean;
  onPress: () => void;
}> = React.memo(({ note, index, isPressed, onPress }) => {
  const barHeight = 80 - index * 6;
  const barWidth = 45 - index * 2;

  return (
    <div
      className="relative cursor-pointer select-none flex flex-col items-center"
      onMouseDown={onPress}
      onTouchStart={(e) => { e.preventDefault(); onPress(); }}
    >
      {/* Çubuk */}
      <div
        className={`rounded-lg shadow-lg transition-all ${isPressed ? 'brightness-110 scale-105' : ''}`}
        style={{
          width: barWidth,
          height: barHeight,
          background: `linear-gradient(180deg, ${adjustColor(note.color, 20)} 0%, ${note.color} 50%, ${adjustColor(note.color, -20)} 100%)`,
          boxShadow: isPressed 
            ? `0 0 20px ${note.color}80` 
            : `0 4px 6px rgba(0,0,0,0.2)`,
        }}
      />
      
      {/* Vida efekti */}
      <div 
        className="absolute top-2 w-2 h-2 rounded-full bg-gray-400"
        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }}
      />
      <div 
        className="absolute bottom-8 w-2 h-2 rounded-full bg-gray-400"
        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }}
      />

      {/* Nota adı */}
      <div className="mt-2 text-xs font-bold" style={{ color: note.color }}>
        {note.name}
      </div>

      {/* Basılı efekti */}
      {isPressed && (
        <div className="absolute -top-6 text-xl animate-ping">
          ✨
        </div>
      )}
    </div>
  );
});

// Renk ayarlama fonksiyonu
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Ana bileşen
interface LittleMusicianProps {
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

const LittleMusician: React.FC<LittleMusicianProps> = ({
  soundEnabled = true,
  onToggleSound
}) => {
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());
  // Local state removed
  const [recording, setRecording] = useState<RecordedNote[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Internal toggle fallback
  const [internalSound, setInternalSound] = useState(true);
  const isSoundEnabled = onToggleSound ? soundEnabled : internalSound;
  const handleToggleSound = onToggleSound || (() => setInternalSound(prev => !prev));

  // Audio context oluştur
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Piyano/ksilofon sesi çal
  const playNote = useCallback((frequency: number, type: 'piano' | 'xylophone' = 'piano') => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'piano') {
      oscillator.type = 'sine';
      // Harmonikler ekle
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
      gain2.gain.setValueAtTime(0.1, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.8);
    } else {
      // Ksilofon - daha metalik ses
      oscillator.type = 'triangle';
    }

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (type === 'xylophone' ? 1.5 : 1));

    oscillator.start();
    oscillator.stop(ctx.currentTime + (type === 'xylophone' ? 1.5 : 1));
  }, [isSoundEnabled]);

  // Davul sesi çal
  const playDrum = useCallback((type: DrumSound['type']) => {
    if (!isSoundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;

    switch (type) {
      case 'kick': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      case 'snare': {
        // Noise + tone
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
        noise.start();
        break;
      }
      case 'hihat': {
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.02));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000, ctx.currentTime);
        const noiseGain = ctx.createGain();
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
        noise.start();
        break;
      }
      case 'tom': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      case 'cymbal': {
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(5000, ctx.currentTime);
        filter.Q.setValueAtTime(2, ctx.currentTime);
        const noiseGain = ctx.createGain();
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseGain.gain.setValueAtTime(0.25, ctx.currentTime);
        noise.start();
        break;
      }
    }
  }, [soundEnabled]);

  // Tuşa bas
  const handleKeyPress = useCallback((index: number) => {
    setPressedKeys(prev => new Set([...prev, index]));

    // Kayıt yapılıyorsa ekle
    if (isRecording && recordStartTime) {
      setRecording(prev => [...prev, {
        instrument,
        noteIndex: index,
        time: Date.now() - recordStartTime,
      }]);
    }

    // Ses çal
    if (instrument === 'piano') {
      playNote(PIANO_NOTES[index].frequency, 'piano');
    } else if (instrument === 'xylophone') {
      playNote(XYLOPHONE_NOTES[index].frequency, 'xylophone');
    } else if (instrument === 'drum') {
      playDrum(DRUM_SOUNDS[index].type);
    }

    // Kısa süre sonra bırak
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 200);
  }, [instrument, isRecording, recordStartTime, playNote, playDrum]);

  // Kayıt başlat/durdur
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordStartTime(null);
    } else {
      setRecording([]);
      setIsRecording(true);
      setRecordStartTime(Date.now());
    }
  };

  // Kaydı oynat
  const playRecording = useCallback(() => {
    if (recording.length === 0 || isPlaying) return;
    setIsPlaying(true);

    recording.forEach(({ instrument: inst, noteIndex, time }) => {
      setTimeout(() => {
        // Tuşu göster
        setPressedKeys(prev => new Set([...prev, noteIndex]));
        
        // Ses çal
        if (inst === 'piano') {
          playNote(PIANO_NOTES[noteIndex].frequency, 'piano');
        } else if (inst === 'xylophone') {
          playNote(XYLOPHONE_NOTES[noteIndex].frequency, 'xylophone');
        } else if (inst === 'drum') {
          playDrum(DRUM_SOUNDS[noteIndex].type);
        }

        setTimeout(() => {
          setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(noteIndex);
            return newSet;
          });
        }, 200);
      }, time);
    });

    // Bitirme
    const lastTime = recording[recording.length - 1]?.time || 0;
    setTimeout(() => setIsPlaying(false), lastTime + 500);
  }, [recording, isPlaying, playNote, playDrum]);

  return (
    <div className="w-full h-full bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 rounded-3xl overflow-hidden flex flex-col">
      {/* Üst bar */}
      <div className="bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="font-bold text-gray-800">Küçük Müzisyen</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Kayıt kontrolleri */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-full transition-all ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200'
              }`}
              title={isRecording ? 'Kaydı Durdur' : 'Kaydet'}
            >
              <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-white' : 'bg-red-500'}`} />
            </button>
            
            <button
              onClick={playRecording}
              disabled={recording.length === 0 || isPlaying}
              className={`p-2 rounded-full transition-all ${
                recording.length === 0 || isPlaying ? 'opacity-50' : 'hover:bg-gray-200'
              }`}
              title="Kaydı Oynat"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={() => setRecording([])}
              disabled={recording.length === 0}
              className={`p-2 rounded-full transition-all ${
                recording.length === 0 ? 'opacity-50' : 'hover:bg-gray-200'
              }`}
              title="Kaydı Sil"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {recording.length > 0 && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {recording.length} nota
            </div>
          )}

          {/* Ses */}
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
        </div>
      </div>

      {/* Enstrüman seçici */}
      <div className="flex justify-center gap-2 p-4">
        {[
          { type: 'piano' as InstrumentType, emoji: '🎹', name: 'Piyano' },
          { type: 'drum' as InstrumentType, emoji: '🥁', name: 'Davul' },
          { type: 'xylophone' as InstrumentType, emoji: '🎶', name: 'Ksilofon' },
        ].map((inst) => (
          <button
            key={inst.type}
            onClick={() => setInstrument(inst.type)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${
              instrument === inst.type
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 shadow-lg'
                : 'bg-white/80 text-gray-700 hover:bg-white hover:scale-105'
            }`}
          >
            <span className="text-xl">{inst.emoji}</span>
            <span>{inst.name}</span>
          </button>
        ))}
      </div>

      {/* Enstrüman alanı */}
      <div className="flex-1 flex items-center justify-center p-4">
        {instrument === 'piano' && (
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 pt-10 rounded-3xl shadow-2xl">
            <div className="flex gap-1">
              {PIANO_NOTES.map((note, i) => (
                <PianoKey
                  key={i}
                  note={note}
                  index={i}
                  isPressed={pressedKeys.has(i)}
                  onPress={() => handleKeyPress(i)}
                  onRelease={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {instrument === 'drum' && (
          <div className="bg-gradient-to-b from-amber-100 to-orange-100 p-8 rounded-3xl shadow-xl">
            <div className="grid grid-cols-3 gap-6">
              {DRUM_SOUNDS.slice(0, 3).map((drum, i) => (
                <DrumPad
                  key={i}
                  drum={drum}
                  isPressed={pressedKeys.has(i)}
                  onPress={() => handleKeyPress(i)}
                />
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-6">
              {DRUM_SOUNDS.slice(3).map((drum, i) => (
                <DrumPad
                  key={i + 3}
                  drum={drum}
                  isPressed={pressedKeys.has(i + 3)}
                  onPress={() => handleKeyPress(i + 3)}
                />
              ))}
            </div>
          </div>
        )}

        {instrument === 'xylophone' && (
          <div className="relative">
            {/* Ksilofon çerçevesi */}
            <div className="absolute inset-x-0 bottom-8 h-6 bg-amber-700 rounded-full shadow-lg" />
            <div className="absolute inset-x-0 bottom-24 h-6 bg-amber-700 rounded-full shadow-lg" />
            
            {/* Çubuklar */}
            <div className="flex items-end gap-2 relative z-10 pb-12">
              {XYLOPHONE_NOTES.map((note, i) => (
                <XylophoneBar
                  key={i}
                  note={note}
                  index={i}
                  isPressed={pressedKeys.has(i)}
                  onPress={() => handleKeyPress(i)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alt bilgi */}
      <div className="bg-white/60 backdrop-blur-sm py-3 px-4 text-center text-sm text-gray-600">
        <span className="flex items-center justify-center gap-2">
          <Music size={16} />
          {instrument === 'piano' && 'Piyano tuşlarına dokunarak müzik yap!'}
          {instrument === 'drum' && 'Davul padlerine vurarak ritim tut!'}
          {instrument === 'xylophone' && 'Ksilofon çubuklarına dokun ve melodi çal!'}
        </span>
      </div>
    </div>
  );
};

export default LittleMusician;
