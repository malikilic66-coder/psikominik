import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Balloon {
  id: number;
  x: number;
  y: number;
  word: string;
  isPositive: boolean;
  color: string;
  size: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
  popped: boolean;
  popTime?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

const POSITIVE_WORDS = [
  'Mutluluk', 'Sevgi', 'Arkadaşlık', 'Paylaşım', 'Yardım',
  'Gülen Yüz', 'Teşekkür', 'Özür', 'Sarılmak', 'Şefkat',
  'Kibarlık', 'Sabır', 'Cesaret', 'Dürüstlük', 'Empati',
  'Umut', 'Neşe', 'Huzur', 'Merhamet', 'Hoşgörü'
];

const NEGATIVE_WORDS = [
  'Kızgınlık', 'Kavga', 'Bağırmak', 'Vurmak', 'Kıskançlık',
  'Yalan', 'Alay', 'İnatçılık', 'Bencillik', 'Küsmek'
];

const BALLOON_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
  '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F9F', '#88D8B0'
];

interface BalloonPopProps {
  onBack: () => void;
}

const BalloonPop: React.FC<BalloonPopProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState('');
  const [highScore, setHighScore] = useState(0);
  
  const balloonsRef = useRef<Balloon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const lastSpawnRef = useRef(0);
  const balloonIdRef = useRef(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('balloonPopHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('balloonPopHighScore', score.toString());
    }
  }, [score, highScore]);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 1500);
  }, []);

  const createBalloon = useCallback((canvasWidth: number, canvasHeight: number): Balloon => {
    const isPositive = Math.random() > 0.3; // 70% positive
    const words = isPositive ? POSITIVE_WORDS : NEGATIVE_WORDS;
    const word = words[Math.floor(Math.random() * words.length)];
    const size = 50 + Math.random() * 30;
    
    return {
      id: ++balloonIdRef.current,
      x: size + Math.random() * (canvasWidth - size * 2),
      y: canvasHeight + size,
      word,
      isPositive,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      size,
      speed: 1 + Math.random() * (0.5 + level * 0.3),
      wobble: 0,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
      popped: false
    };
  }, [level]);

  const createParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        color,
        size: 3 + Math.random() * 5,
        life: 1
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    // Check balloon clicks
    for (const balloon of balloonsRef.current) {
      if (balloon.popped) continue;
      
      const dx = x - balloon.x;
      const dy = y - balloon.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < balloon.size) {
        balloon.popped = true;
        balloon.popTime = Date.now();
        createParticles(balloon.x, balloon.y, balloon.color);

        if (balloon.isPositive) {
          // Popped positive - good!
          const points = 10 * (1 + combo * 0.1);
          setScore(s => s + Math.round(points));
          setCombo(c => c + 1);
          showMessage(`+${Math.round(points)} ✨`);
        } else {
          // Popped negative - bad!
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameState('gameover');
            }
            return newLives;
          });
          setCombo(0);
          showMessage('Olumsuz kelime! ❌');
        }
        break;
      }
    }
  }, [gameState, combo, createParticles, showMessage]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gameLoop = (timestamp: number) => {
      if (!canvas || !ctx) return;

      // Clear canvas with sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const cloudY = 50 + Math.sin(timestamp * 0.001) * 10;
      drawCloud(ctx, 100, cloudY, 60);
      drawCloud(ctx, canvas.width - 150, cloudY + 30, 50);
      drawCloud(ctx, canvas.width / 2, cloudY + 20, 70);

      // Spawn balloons
      const spawnInterval = Math.max(800, 2000 - level * 200);
      if (timestamp - lastSpawnRef.current > spawnInterval) {
        balloonsRef.current.push(createBalloon(canvas.width, canvas.height));
        lastSpawnRef.current = timestamp;
      }

      // Update and draw balloons
      balloonsRef.current = balloonsRef.current.filter(balloon => {
        if (balloon.popped) {
          // Remove after pop animation
          return Date.now() - (balloon.popTime || 0) < 200;
        }

        // Move balloon up
        balloon.y -= balloon.speed;
        balloon.wobble += balloon.wobbleSpeed;
        const wobbleX = Math.sin(balloon.wobble) * 15;

        // Check if escaped (positive word missed)
        if (balloon.y < -balloon.size) {
          if (balloon.isPositive) {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState('gameover');
              }
              return newLives;
            });
            setCombo(0);
            showMessage('Pozitif kelime kaçtı! 💨');
          }
          return false;
        }

        if (!balloon.popped) {
          drawBalloon(ctx, balloon.x + wobbleX, balloon.y, balloon);
        }

        return true;
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.life -= 0.02;

        if (particle.life > 0) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.globalAlpha = particle.life;
          ctx.fill();
          ctx.globalAlpha = 1;
          return true;
        }
        return false;
      });

      // Level up
      if (score > level * 100) {
        setLevel(l => l + 1);
        showMessage(`Seviye ${level + 1}! 🎉`);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.4, y, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - size * 0.4, y, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.2, y - size * 0.3, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBalloon = (ctx: CanvasRenderingContext2D, x: number, y: number, balloon: Balloon) => {
      const { size, color, word, isPositive } = balloon;

      // Balloon body
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.8, size, 0, 0, Math.PI * 2);
      
      // Gradient fill
      const gradient = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, color);
      gradient.addColorStop(1, shadeColor(color, -30));
      ctx.fillStyle = gradient;
      ctx.fill();

      // Balloon knot
      ctx.beginPath();
      ctx.moveTo(x - 8, y + size);
      ctx.lineTo(x, y + size + 15);
      ctx.lineTo(x + 8, y + size);
      ctx.fillStyle = shadeColor(color, -40);
      ctx.fill();

      // String
      ctx.beginPath();
      ctx.moveTo(x, y + size + 15);
      ctx.quadraticCurveTo(x + 10, y + size + 40, x, y + size + 60);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shine
      ctx.beginPath();
      ctx.ellipse(x - size * 0.3, y - size * 0.4, size * 0.15, size * 0.25, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();

      // Word text
      ctx.font = `bold ${Math.min(14, size * 0.3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillText(word, x + 1, y + 1);
      
      // Text
      ctx.fillStyle = isPositive ? '#1a5f1a' : '#8b0000';
      ctx.fillText(word, x, y);

      // Border indicator
      if (!isPositive) {
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.85, size * 1.05, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139, 0, 0, 0.3)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, createBalloon, level, score, showMessage]);

  const shadeColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + 
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setCombo(0);
    balloonsRef.current = [];
    particlesRef.current = [];
    lastSpawnRef.current = 0;
    setGameState('playing');
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-300 to-sky-100 overflow-hidden">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-50 bg-white/90 hover:bg-white text-gray-700 font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
      >
        ← Geri
      </button>

      {/* Game HUD */}
      {gameState === 'playing' && (
        <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <span className="text-2xl font-bold text-purple-600">{score}</span>
            <span className="text-sm text-gray-500 ml-2">puan</span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-2xl ${i < lives ? '' : 'opacity-30'}`}>
                🎈
              </span>
            ))}
          </div>
          {combo > 1 && (
            <div className="bg-yellow-400/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg animate-bounce">
              <span className="text-xl font-bold text-yellow-900">x{combo} Kombo!</span>
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg">
            <span className="text-sm font-semibold text-blue-600">Seviye {level}</span>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-2xl animate-bounce">
            <span className="text-2xl font-bold text-purple-600">{message}</span>
          </div>
        </div>
      )}

      {/* Menu */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <h1 className="text-4xl font-bold text-purple-600 mb-4">🎈 Balon Patlatma</h1>
            <p className="text-gray-600 mb-6">
              Pozitif kelimeleri taşıyan balonları patlat!<br/>
              <span className="text-green-600 font-semibold">✓ Pozitif kelimeler = Puan</span><br/>
              <span className="text-red-600 font-semibold">✗ Olumsuz kelimeler = Can kaybı</span><br/>
              <span className="text-orange-600 font-semibold">⚠ Kaçan pozitifler = Can kaybı</span>
            </p>
            
            {highScore > 0 && (
              <div className="bg-yellow-100 rounded-xl p-3 mb-4">
                <span className="text-yellow-700 font-semibold">🏆 En Yüksek: {highScore}</span>
              </div>
            )}

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              Başla! 🚀
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <h3 className="font-bold text-blue-700 mb-2">Pozitif Kelimeler:</h3>
              <p className="text-sm text-blue-600">
                Mutluluk, Sevgi, Arkadaşlık, Paylaşım, Yardım, Teşekkür, Özür, Sarılmak...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/30">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <h2 className="text-4xl font-bold text-purple-600 mb-4">Oyun Bitti!</h2>
            
            <div className="bg-purple-100 rounded-xl p-4 mb-4">
              <p className="text-3xl font-bold text-purple-700">{score} Puan</p>
              <p className="text-purple-600">Seviye {level}</p>
            </div>

            {score >= highScore && score > 0 && (
              <div className="bg-yellow-100 rounded-xl p-3 mb-4 animate-pulse">
                <span className="text-yellow-700 font-bold text-xl">🎉 Yeni Rekor! 🎉</span>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                Tekrar Oyna
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                Menü
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onTouchStart={handleClick}
        className="w-full h-full cursor-pointer touch-none"
      />
    </div>
  );
};

export default BalloonPop;
