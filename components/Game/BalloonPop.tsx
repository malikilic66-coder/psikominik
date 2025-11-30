import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Balloon {
  id: number;
  x: number;
  y: number;
  isBomb: boolean;
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

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

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
  const [showMessage, setShowMessage] = useState<{ emoji: string; type: 'good' | 'bad' } | null>(null);
  const [highScore, setHighScore] = useState(0);
  
  const balloonsRef = useRef<Balloon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  const lastSpawnRef = useRef(0);
  const balloonIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext>();

  useEffect(() => {
    const saved = localStorage.getItem('balloonPopHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('balloonPopHighScore', score.toString());
    }
  }, [score, highScore]);

  const playSound = useCallback((type: 'pop' | 'bomb' | 'levelup') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === 'pop') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
      } else if (type === 'bomb') {
        oscillator.frequency.value = 150;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
      } else if (type === 'levelup') {
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  }, []);

  const displayMessage = useCallback((emoji: string, type: 'good' | 'bad') => {
    setShowMessage({ emoji, type });
    setTimeout(() => setShowMessage(null), 800);
  }, []);

  const createBalloon = useCallback((canvasWidth: number, canvasHeight: number): Balloon => {
    const isBomb = Math.random() < 0.2 + level * 0.02;
    const size = 50 + Math.random() * 25;
    
    return {
      id: ++balloonIdRef.current,
      x: size + Math.random() * (canvasWidth - size * 2),
      y: canvasHeight + size,
      isBomb,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      size,
      speed: 1.2 + Math.random() * (0.4 + level * 0.2),
      wobble: 0,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
      popped: false
    };
  }, [level]);

  const createParticles = useCallback((x: number, y: number, color: string, isBomb: boolean) => {
    const newParticles: Particle[] = [];
    const count = isBomb ? 25 : 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 4),
        vy: Math.sin(angle) * (2 + Math.random() * 4) - 2,
        color: isBomb ? (Math.random() > 0.5 ? '#FF6600' : '#333') : color,
        size: isBomb ? 5 + Math.random() * 8 : 4 + Math.random() * 6,
        life: 1
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  const createStars = useCallback((x: number, y: number) => {
    const newStars: Star[] = [];
    for (let i = 0; i < 5; i++) {
      newStars.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        size: 15 + Math.random() * 10,
        opacity: 1,
        speed: 0.03 + Math.random() * 0.02
      });
    }
    starsRef.current = [...starsRef.current, ...newStars];
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

    for (const balloon of balloonsRef.current) {
      if (balloon.popped) continue;
      
      const dx = x - balloon.x;
      const dy = y - balloon.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < balloon.size) {
        balloon.popped = true;
        balloon.popTime = Date.now();
        createParticles(balloon.x, balloon.y, balloon.color, balloon.isBomb);

        if (balloon.isBomb) {
          playSound('bomb');
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameState('gameover');
            }
            return newLives;
          });
          setCombo(0);
          displayMessage('💥', 'bad');
        } else {
          playSound('pop');
          const points = 10 * (1 + Math.floor(combo / 3) * 0.5);
          setScore(s => s + Math.round(points));
          setCombo(c => c + 1);
          createStars(balloon.x, balloon.y);
          if (combo > 0 && combo % 5 === 4) {
            displayMessage('⭐', 'good');
          }
        }
        break;
      }
    }
  }, [gameState, combo, createParticles, createStars, playSound, displayMessage]);

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

    const drawBalloon = (ctx: CanvasRenderingContext2D, x: number, y: number, balloon: Balloon, timestamp: number) => {
      const { size, color, isBomb } = balloon;
      
      ctx.save();
      ctx.translate(x, y);

      if (isBomb) {
        // Bomb body - dark sphere
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
        const bombGradient = ctx.createRadialGradient(-size * 0.2, -size * 0.2, 0, 0, 0, size * 0.8);
        bombGradient.addColorStop(0, '#555555');
        bombGradient.addColorStop(0.5, '#2a2a2a');
        bombGradient.addColorStop(1, '#111111');
        ctx.fillStyle = bombGradient;
        ctx.fill();

        // Shine
        ctx.beginPath();
        ctx.ellipse(-size * 0.3, -size * 0.3, size * 0.15, size * 0.2, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fill();

        // Fuse
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.75);
        ctx.quadraticCurveTo(size * 0.3, -size * 1.1, size * 0.1, -size * 1.2);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Animated spark
        const sparkTime = timestamp * 0.01;
        ctx.beginPath();
        ctx.arc(size * 0.1, -size * 1.2, 5 + Math.sin(sparkTime) * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${30 + Math.sin(sparkTime * 2) * 20}, 100%, 60%)`;
        ctx.fill();
        
        // Spark glow
        ctx.beginPath();
        ctx.arc(size * 0.1, -size * 1.2, 10 + Math.sin(sparkTime) * 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 0, ${0.3 + Math.sin(sparkTime) * 0.2})`;
        ctx.fill();

        // X mark
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-size * 0.25, -size * 0.25);
        ctx.lineTo(size * 0.25, size * 0.25);
        ctx.moveTo(size * 0.25, -size * 0.25);
        ctx.lineTo(-size * 0.25, size * 0.25);
        ctx.stroke();

      } else {
        // Cute balloon with happy face
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.75, size, 0, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(-size * 0.25, -size * 0.3, 0, 0, 0, size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.2, color);
        gradient.addColorStop(1, shadeColor(color, -40));
        ctx.fillStyle = gradient;
        ctx.fill();

        // Shine
        ctx.beginPath();
        ctx.ellipse(-size * 0.25, -size * 0.4, size * 0.12, size * 0.25, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // Knot
        ctx.beginPath();
        ctx.moveTo(-6, size);
        ctx.lineTo(0, size + 12);
        ctx.lineTo(6, size);
        ctx.quadraticCurveTo(0, size + 5, -6, size);
        ctx.fillStyle = shadeColor(color, -50);
        ctx.fill();

        // String
        ctx.beginPath();
        ctx.moveTo(0, size + 12);
        ctx.quadraticCurveTo(8, size + 35, -5, size + 55);
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Happy face - eyes
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(-size * 0.2, -size * 0.15, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.2, -size * 0.15, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-size * 0.17, -size * 0.18, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.23, -size * 0.18, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.beginPath();
        ctx.arc(0, size * 0.1, size * 0.25, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Rosy cheeks
        ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-size * 0.35, size * 0.1, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size * 0.35, size * 0.1, size * 0.1, size * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.35, y + size * 0.1, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - size * 0.35, y + size * 0.05, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + size * 0.15, y - size * 0.25, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, timestamp: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      ctx.rotate(timestamp * 0.003);
      
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const px = Math.cos(angle) * size;
        const py = Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    };

    const gameLoop = (timestamp: number) => {
      if (!canvas || !ctx) return;

      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.5, '#B0E0E6');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sun
      const sunX = canvas.width - 60;
      const sunY = 60;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
      const sunGradient = ctx.createRadialGradient(sunX - 10, sunY - 10, 0, sunX, sunY, 45);
      sunGradient.addColorStop(0, '#FFFF80');
      sunGradient.addColorStop(0.5, '#FFD700');
      sunGradient.addColorStop(1, '#FFA500');
      ctx.fillStyle = sunGradient;
      ctx.fill();

      // Sun rays
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 + timestamp * 0.001;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(angle) * 45, sunY + Math.sin(angle) * 45);
        ctx.lineTo(sunX + Math.cos(angle) * 60, sunY + Math.sin(angle) * 60);
        ctx.stroke();
      }

      // Clouds
      const cloudY1 = 50 + Math.sin(timestamp * 0.0005) * 10;
      drawCloud(ctx, 80 + (timestamp * 0.015) % (canvas.width + 200) - 100, cloudY1, 50);
      drawCloud(ctx, canvas.width - 120, 80 + Math.sin(timestamp * 0.0007) * 8, 60);

      // Spawn balloons
      const spawnInterval = Math.max(600, 1500 - level * 100);
      if (timestamp - lastSpawnRef.current > spawnInterval) {
        balloonsRef.current.push(createBalloon(canvas.width, canvas.height));
        lastSpawnRef.current = timestamp;
      }

      // Update balloons
      balloonsRef.current = balloonsRef.current.filter(balloon => {
        if (balloon.popped) {
          return Date.now() - (balloon.popTime || 0) < 150;
        }

        balloon.y -= balloon.speed;
        balloon.wobble += balloon.wobbleSpeed;
        const wobbleX = Math.sin(balloon.wobble) * 12;

        if (balloon.y < -balloon.size - 20) {
          if (!balloon.isBomb) {
            // Missed a balloon - lose life
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState('gameover');
              }
              return newLives;
            });
            setCombo(0);
          }
          return false;
        }

        if (!balloon.popped) {
          drawBalloon(ctx, balloon.x + wobbleX, balloon.y, balloon, timestamp);
        }

        return true;
      });

      // Update stars
      starsRef.current = starsRef.current.filter(star => {
        star.opacity -= star.speed;
        star.y -= 1;
        if (star.opacity > 0) {
          drawStar(ctx, star.x, star.y, star.size, star.opacity, timestamp);
          return true;
        }
        return false;
      });

      // Update particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.15;
        particle.life -= 0.025;

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
      if (score > level * 80 && score > 0) {
        setLevel(l => {
          playSound('levelup');
          return l + 1;
        });
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, createBalloon, level, score, playSound]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setCombo(0);
    balloonsRef.current = [];
    particlesRef.current = [];
    starsRef.current = [];
    lastSpawnRef.current = 0;
    setGameState('playing');
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-300 to-sky-100 overflow-hidden">
      {/* Back button - icon only */}
      <button
        onClick={onBack}
        className="absolute top-3 left-3 z-50 bg-white/90 hover:bg-white text-gray-700 font-bold p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      {/* Game HUD - Visual icons only, no text */}
      {gameState === 'playing' && (
        <div className="absolute top-3 right-3 z-40 flex flex-col items-end gap-2">
          {/* Score with stars */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2">
            <span className="text-3xl">⭐</span>
            <span className="text-2xl font-bold text-purple-600">{score}</span>
          </div>
          
          {/* Lives as hearts */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-3xl transition-all ${i < lives ? 'scale-100' : 'scale-75 opacity-30 grayscale'}`}>
                ❤️
              </span>
            ))}
          </div>

          {/* Combo as multiple stars */}
          {combo >= 3 && (
            <div className="bg-yellow-400/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg animate-bounce flex items-center gap-1">
              {[...Array(Math.min(Math.floor(combo / 3), 5))].map((_, i) => (
                <span key={i} className="text-2xl">🌟</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message popup - emoji only */}
      {showMessage && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`rounded-3xl px-8 py-4 shadow-2xl animate-bounce ${
            showMessage.type === 'good' ? 'bg-green-400' : 'bg-red-400'
          }`}>
            <span className="text-6xl">{showMessage.emoji}</span>
          </div>
        </div>
      )}

      {/* Menu - Visual only, no text */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            {/* Visual balloon title */}
            <div className="text-7xl mb-6 flex justify-center gap-2 animate-bounce">
              🎈🎈🎈
            </div>
            
            {/* Visual instructions - tap balloon = star, tap bomb = broken heart */}
            <div className="bg-gray-100 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-5xl">🎈</div>
                <div className="text-3xl">👆</div>
                <div className="text-4xl">⭐</div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-5xl">💣</div>
                <div className="text-3xl">🚫</div>
                <div className="text-4xl">💔</div>
              </div>
            </div>
            
            {highScore > 0 && (
              <div className="bg-yellow-100 rounded-2xl p-4 mb-6 flex items-center justify-center gap-3">
                <span className="text-4xl">🏆</span>
                <span className="text-3xl font-bold text-yellow-700">{highScore}</span>
              </div>
            )}

            <button
              onClick={startGame}
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-5 px-12 rounded-full text-2xl shadow-lg transform transition-all duration-300 hover:scale-110 flex items-center gap-3 mx-auto"
            >
              <span className="text-4xl">▶️</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over - Visual */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/30">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            <div className="text-7xl mb-4">😢</div>
            
            <div className="bg-purple-100 rounded-2xl p-4 mb-4 flex items-center justify-center gap-3">
              <span className="text-4xl">⭐</span>
              <span className="text-4xl font-bold text-purple-700">{score}</span>
            </div>

            {score >= highScore && score > 0 && (
              <div className="bg-yellow-100 rounded-2xl p-4 mb-4 animate-pulse flex items-center justify-center gap-2">
                <span className="text-5xl">🎉</span>
                <span className="text-5xl">🏆</span>
                <span className="text-5xl">🎉</span>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold p-5 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110"
              >
                <span className="text-4xl">🔄</span>
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold p-5 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110"
              >
                <span className="text-4xl">🏠</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
