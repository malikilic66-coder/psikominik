import React, { useEffect, useRef, useState } from 'react';
import { Trophy, RefreshCw, Play, Crown, X, Heart } from 'lucide-react';

interface GameItem {
  x: number;
  y: number;
  type: 'heart' | 'star' | 'cloud';
  speed: number;
  swayOffset: number;
  swaySpeed: number;
  id: number;
  scale: number;
  rotation: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  id: number;
  color: string;
  velocity: number;
  size: number;
}

interface BackgroundCloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
}

const POSITIVE_WORDS = ["Harika!", "Süper!", "Sevgi", "Neşe", "Özgüven", "Başarı", "Mutluluk", "Aferin!"];

const HappinessCollector: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(4);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Load High Score on mount
  useEffect(() => {
    const saved = localStorage.getItem('psiko_highscore');
    if(saved) setHighScore(parseInt(saved));
  }, []);

  // State Refs for High Performance Loop
  const stateRef = useRef({
    playerX: 0,
    targetPlayerX: 0,
    items: [] as GameItem[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    bgClouds: [] as BackgroundCloud[],
    lastSpawn: 0,
    score: 0,
    combo: 1,
    lives: 4,
    difficultyMultiplier: 1,
    shake: 0, // Screen shake magnitude
    timeOfDay: 'day' as 'day' | 'night', // Day/Night cycle
    dayNightTransition: 0, // 0 = full day, 1 = full night (smooth transition)
    gameLoopId: 0,
    width: 0,
    height: 0,
    frameCount: 0
  });

  // --- DRAWING HELPERS ---

  const drawCloudShape = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color: string) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(-25, 0, 25, 0, Math.PI * 2);
    ctx.arc(25, 0, 35, 0, Math.PI * 2);
    ctx.arc(55, 0, 25, 0, Math.PI * 2);
    ctx.arc(0, -25, 25, 0, Math.PI * 2);
    ctx.arc(35, -20, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
    // Body (Psiko-Bulut)
    drawCloudShape(ctx, x, y, 1, '#FFFFFF');
    
    // Eyes
    ctx.fillStyle = '#2C3E50';
    const blink = Math.floor(frame / 60) % 5 === 0 && frame % 60 < 10;
    
    if (blink) {
      ctx.beginPath();
      ctx.moveTo(x + 5, y - 5);
      ctx.lineTo(x + 15, y - 5);
      ctx.moveTo(x + 35, y - 5);
      ctx.lineTo(x + 45, y - 5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x + 10, y - 5, 4, 0, Math.PI * 2);
      ctx.arc(x + 40, y - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cheeks
    ctx.fillStyle = '#FF5656';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x + 5, y + 10, 6, 0, Math.PI * 2);
    ctx.arc(x + 45, y + 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Smile
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 25, y + 5, 10, 0, Math.PI, false);
    ctx.stroke();
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#FF5656';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -10, -20, 5, 0, 20);
    ctx.bezierCurveTo(20, 5, 10, -10, 0, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; // Shine
    ctx.beginPath();
    ctx.arc(-5, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#F9E104';
    ctx.beginPath();
    for(let i = 0; i < 5; i++){
        ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*20, -Math.sin((18+i*72)/180*Math.PI)*20);
        ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*8, -Math.sin((54+i*72)/180*Math.PI)*8);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawAngryCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    // Darker, stormier cloud body
    drawCloudShape(ctx, x, y, scale * 1.0, '#1E293B'); // Darker Slate-800
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Glowing Angry Eyes
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF0000'; // Intense Red glow
    ctx.fillStyle = '#FF0000';
    
    // Left Eye (Triangular/Angry)
    ctx.beginPath();
    ctx.moveTo(-15, -8);
    ctx.lineTo(5, 8);
    ctx.lineTo(-10, 8);
    ctx.fill();

    // Right Eye
    ctx.beginPath();
    ctx.moveTo(45, -8);
    ctx.lineTo(25, 8);
    ctx.lineTo(40, 8);
    ctx.fill();
    
    ctx.shadowBlur = 0; // Reset glow for other parts

    // Sharp Eyebrows
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 5; // Thicker eyebrows
    ctx.lineCap = 'round';
    ctx.beginPath();
    // Left
    ctx.moveTo(-20, -18);
    ctx.lineTo(8, -4);
    // Right
    ctx.moveTo(50, -18);
    ctx.lineTo(22, -4);
    ctx.stroke();

    // Frown / Mouth
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(15, 25, 12, Math.PI * 1.1, Math.PI * 1.9); // Upside down arc
    ctx.stroke();

    // Lightning Bolt (Optional decoration on side)
    ctx.fillStyle = '#FACC15'; // Bright Yellow
    ctx.beginPath();
    ctx.moveTo(12, -35);
    ctx.lineTo(0, -20);
    ctx.lineTo(5, -17);
    ctx.lineTo(-2, -5);
    ctx.lineTo(15, -15);
    ctx.lineTo(10, -20);
    ctx.fill();

    ctx.restore();
  };

  // --- GAME LOGIC ---

  // Resize handler separated to call manually
  const resizeCanvas = () => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    stateRef.current.width = width;
    stateRef.current.height = height;
    // Keep player in bounds after resize
    stateRef.current.playerX = Math.min(stateRef.current.playerX, width);
    stateRef.current.targetPlayerX = Math.min(stateRef.current.targetPlayerX, width);
  };

  const initGame = () => {
    setIsFullScreen(true);
    // Use timeout to allow DOM to update to full screen before sizing canvas
    setTimeout(() => {
        resizeCanvas();
        resetGameLogic();
        setIsPlaying(true);
    }, 50);
  };

  const resetGameLogic = () => {
    const { width, height } = stateRef.current;
    
    stateRef.current.playerX = width / 2;
    stateRef.current.targetPlayerX = width / 2;
    stateRef.current.items = [];
    stateRef.current.particles = [];
    stateRef.current.floatingTexts = [];
    stateRef.current.score = 0;
    stateRef.current.combo = 1;
    stateRef.current.lives = 4;
    stateRef.current.difficultyMultiplier = 1;
    stateRef.current.frameCount = 0;
    stateRef.current.shake = 0;
    stateRef.current.timeOfDay = 'day';
    stateRef.current.dayNightTransition = 0;
    
    stateRef.current.bgClouds = [];
    for(let i=0; i<8; i++) { // More background clouds for larger screens
        stateRef.current.bgClouds.push({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 0.2 + Math.random() * 0.3,
            scale: 0.5 + Math.random() * 0.5,
            opacity: 0.1 + Math.random() * 0.2
        });
    }

    setScore(0);
    setCombo(1);
    setLives(4);
    setTimeOfDay('day');
  };

  const stopGame = () => {
    setIsPlaying(false);
    setIsFullScreen(false);
    // Wait for transition back to small size
    setTimeout(() => {
        resizeCanvas();
    }, 50);
  };

  const createExplosion = (x: number, y: number, color: string, amount: number = 12) => {
      for(let i=0; i<amount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 2;
          stateRef.current.particles.push({
              x, y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              color: color,
              size: Math.random() * 6 + 3
          });
      }
  };

  const spawnItem = () => {
    const { width, difficultyMultiplier } = stateRef.current;
    // Higher difficulty = more clouds
    const cloudChance = Math.min(0.4, 0.2 + (difficultyMultiplier - 1) * 0.1);
    const starChance = 0.2; 
    
    let type: 'heart' | 'star' | 'cloud' = 'heart';
    const rand = Math.random();
    
    if (rand < cloudChance) type = 'cloud';
    else if (rand < cloudChance + starChance) type = 'star';
    
    // Random X position within screen padding
    const padding = 50;
    stateRef.current.items.push({
      x: Math.random() * (width - padding * 2) + padding,
      y: -50,
      type,
      // Speed increases with difficulty
      speed: (Math.random() * 2 + 3) * difficultyMultiplier, 
      swayOffset: Math.random() * 100,
      swaySpeed: 0.02 + Math.random() * 0.03,
      id: Math.random(),
      scale: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI
    });
  };

  const update = () => {
    const state = stateRef.current;
    state.frameCount++;

    // Shake Decay
    if(state.shake > 0) state.shake *= 0.9;
    if(state.shake < 0.5) state.shake = 0;

    // Difficulty Scaling (Every 500 points increases speed by 10%)
    state.difficultyMultiplier = 1 + Math.floor(state.score / 500) * 0.1;

    // Day/Night Cycle based on score - Smooth Transition
    // 0-300: Day, 300-600: Night, 600-900: Day, 900+: Night (cycles every 300 points)
    const cyclePosition = Math.floor(state.score / 300) % 2;
    const targetTimeOfDay = cyclePosition === 0 ? 'day' : 'night';
    
    // Smooth transition over 60 frames (1 second at 60fps)
    const targetTransition = targetTimeOfDay === 'night' ? 1 : 0;
    const transitionSpeed = 0.02; // Slower = smoother
    
    if (state.dayNightTransition < targetTransition) {
      state.dayNightTransition = Math.min(targetTransition, state.dayNightTransition + transitionSpeed);
    } else if (state.dayNightTransition > targetTransition) {
      state.dayNightTransition = Math.max(targetTransition, state.dayNightTransition - transitionSpeed);
    }
    
    // Update state when transition completes
    if (state.timeOfDay !== targetTimeOfDay && Math.abs(state.dayNightTransition - targetTransition) < 0.01) {
      state.timeOfDay = targetTimeOfDay;
      setTimeOfDay(targetTimeOfDay);
    }

    // LERP Player
    state.playerX += (state.targetPlayerX - state.playerX) * 0.15;

    // Spawn Logic (Spawns faster as difficulty increases)
    const spawnRate = Math.max(400, 800 - (state.difficultyMultiplier * 100));
    if (Date.now() - state.lastSpawn > spawnRate) { 
      spawnItem();
      state.lastSpawn = Date.now();
    }

    // Update Background
    state.bgClouds.forEach(cloud => {
        cloud.y += cloud.speed;
        if(cloud.y > state.height + 50) {
            cloud.y = -50;
            cloud.x = Math.random() * state.width;
        }
    });

    // Update Items
    state.items.forEach(item => {
      item.y += item.speed;
      item.x += Math.sin(state.frameCount * item.swaySpeed + item.swayOffset) * 1.5;
      if(item.type === 'star') item.rotation += 0.05;
    });

    // Remove off-screen items & Reset combo if good items are missed
    state.items = state.items.filter(item => {
        const offScreen = item.y > state.height + 50;
        if (offScreen && item.type !== 'cloud') {
            // Missed a good item -> Reset Combo
            if(state.combo > 1) {
                state.combo = 1;
                setCombo(1);
            }
        }
        return !offScreen;
    });

    // Update Particles
    state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    // Update Text
    state.floatingTexts.forEach(ft => {
      ft.y -= ft.velocity;
      ft.life -= 0.015;
    });
    state.floatingTexts = state.floatingTexts.filter(ft => ft.life > 0);

    // Collision Detection
    const playerY = state.height - 100; // Player slightly higher in fullscreen
    const playerRadius = 40; 

    state.items = state.items.filter(item => {
      const dx = item.x - state.playerX - 25;
      const dy = item.y - playerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < playerRadius + 30) {
        if (item.type === 'cloud') {
           // BAD - Hit a cloud, lose a life
           state.shake = 20; // Trigger Screen Shake
           state.combo = 1;
           setCombo(1);
           
           // Lose a life
           state.lives -= 1;
           setLives(state.lives);
           
           createExplosion(item.x, item.y, '#1E293B', 20);
           
           state.floatingTexts.push({
             x: state.playerX,
             y: playerY - 40,
             text: `-1 ❤️`,
             life: 1,
             id: Math.random(),
             color: '#EF4444',
             velocity: 1,
             size: 30
           });
           
           // Check for game over
           if (state.lives <= 0) {
             setIsPlaying(false);
           }
        } else {
           // GOOD
           const basePoints = item.type === 'star' ? 20 : 10;
           const points = basePoints * state.combo;
           
           state.score += points;
           setScore(state.score);
           createExplosion(item.x, item.y, item.type === 'star' ? '#F9E104' : '#FF5656');
           
           // Combo Logic
           if(state.combo < 5) {
               state.combo += 1;
               setCombo(state.combo);
           }

           const word = POSITIVE_WORDS[Math.floor(Math.random() * POSITIVE_WORDS.length)];
           state.floatingTexts.push({
             x: state.playerX,
             y: playerY - 40,
             text: state.combo > 1 ? `${points} (x${state.combo})` : word,
             life: 1,
             id: Math.random(),
             color: item.type === 'star' ? '#F9E104' : '#FF5656',
             velocity: 2,
             size: state.combo > 2 ? 32 : 24
           });
        }
        return false; 
      }
      return true; 
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = stateRef.current;

    // Dynamic background based on time of day with smooth transition
    const transition = state.dayNightTransition; // 0 = day, 1 = night
    
    // Interpolate colors
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    
    // Day colors
    const dayStartR = 224, dayStartG = 247, dayStartB = 250; // #E0F7FA
    const dayEndR = 255, dayEndG = 248, dayEndB = 232; // #FFF8E8
    
    // Night colors
    const nightStartR = 26, nightStartG = 26, nightStartB = 46; // #1a1a2e
    const nightEndR = 22, nightEndG = 33, nightEndB = 62; // #16213e
    
    // Interpolated colors
    const bgStartR = lerp(dayStartR, nightStartR, transition);
    const bgStartG = lerp(dayStartG, nightStartG, transition);
    const bgStartB = lerp(dayStartB, nightStartB, transition);
    
    const bgEndR = lerp(dayEndR, nightEndR, transition);
    const bgEndG = lerp(dayEndG, nightEndG, transition);
    const bgEndB = lerp(dayEndB, nightEndB, transition);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
    gradient.addColorStop(0, `rgb(${bgStartR}, ${bgStartG}, ${bgStartB})`);
    gradient.addColorStop(1, `rgb(${bgEndR}, ${bgEndG}, ${bgEndB})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);
    
    // Draw stars with smooth fade in/out
    if (transition > 0.1) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % state.width;
        const y = (i * 73.2) % state.height;
        const twinkle = Math.sin(state.frameCount * 0.05 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.8 * transition; // Fade based on transition
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    
    ctx.save();
    
    // Apply Screen Shake
    if (state.shake > 0) {
        const dx = (Math.random() - 0.5) * state.shake;
        const dy = (Math.random() - 0.5) * state.shake;
        ctx.translate(dx, dy);
    }

    // Background Clouds (adjust opacity based on time)
    state.bgClouds.forEach(cloud => {
        const cloudOpacity = lerp(cloud.opacity, cloud.opacity * 0.3, transition);
        drawCloudShape(ctx, cloud.x, cloud.y, cloud.scale, `rgba(255, 255, 255, ${cloudOpacity})`);
    });

    // Particles
    state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        if (Math.random() > 0.5) ctx.rect(p.x, p.y, p.size, p.size);
        else ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Items
    state.items.forEach(item => {
      if (item.type === 'heart') drawHeart(ctx, item.x, item.y, item.scale);
      if (item.type === 'star') drawStar(ctx, item.x, item.y, item.scale, item.rotation);
      if (item.type === 'cloud') drawAngryCloud(ctx, item.x, item.y, item.scale);
    });

    // Player
    drawPlayer(ctx, state.playerX, state.height - 100, state.frameCount);

    // Floating Text
    state.floatingTexts.forEach(ft => {
      ctx.font = `bold ${ft.size}px Fredoka`;
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.globalAlpha = ft.life;
      ctx.strokeText(ft.text, ft.x - 20, ft.y);
      ctx.fillText(ft.text, ft.x - 20, ft.y);
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  };

  const loop = () => {
    if (!isPlaying) return;
    update();
    draw();
    stateRef.current.gameLoopId = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (isPlaying) {
        stateRef.current.gameLoopId = requestAnimationFrame(loop);
    } else {
        // Game Over or Pause - Check High Score
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('psiko_highscore', score.toString());
        }
    }
    return () => cancelAnimationFrame(stateRef.current.gameLoopId);
  }, [isPlaying]);

  useEffect(() => {
     window.addEventListener('resize', resizeCanvas);
     resizeCanvas();
     return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !isPlaying) return;
    const rect = canvasRef.current.getBoundingClientRect();
    stateRef.current.targetPlayerX = e.clientX - rect.left;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!canvasRef.current || !isPlaying) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    stateRef.current.targetPlayerX = touch.clientX - rect.left;
  };

  // Determine container classes based on fullscreen state
  const containerClasses = isFullScreen 
    ? `fixed inset-0 z-50 w-full h-full transition-colors duration-1000 ${timeOfDay === 'night' ? 'bg-[#1a1a2e]' : 'bg-[#E0F7FA]'}`
    : "w-full max-w-2xl mx-auto glass-panel rounded-3xl overflow-hidden relative shadow-2xl transform hover:scale-[1.01] transition-all duration-300 h-[500px]";

  return (
    <div className={containerClasses} ref={containerRef}>
      
      {/* Fullscreen Exit Button */}
      {isFullScreen && (
          <button 
            onClick={stopGame}
            className={`absolute top-4 left-4 z-50 backdrop-blur hover:bg-white p-2 rounded-full shadow-lg transition-all ${
              timeOfDay === 'night' ? 'bg-white/30 text-white' : 'bg-white/50 text-deep-slate'
            }`}
          >
            <X size={20} />
          </button>
      )}

      {/* Game Over / Start Screen Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8">
            <div className="bg-white p-6 rounded-full shadow-soft mb-6 animate-bounce">
                <Trophy className="text-sun-yellow w-16 h-16" />
            </div>
            <h3 className="font-heading text-3xl text-deep-slate mb-2">Mutluluk Toplayıcısı</h3>
            
            {score > 0 ? (
                <div className="mb-8">
                    <p className="text-gray-500 text-lg">Skorun</p>
                    <p className="text-4xl font-heading text-psiko-teal mb-2">{score}</p>
                    {lives === 0 && <p className="text-soft-coral font-bold text-xl mb-2">Oyun Bitti! 💔</p>}
                    {score >= highScore && score > 0 && <p className="text-sun-yellow font-bold animate-pulse">Yeni Rekor! 🏆</p>}
                    <div className="text-sm text-gray-400 mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">
                        En Yüksek: {highScore}
                    </div>
                </div>
            ) : (
                <p className="text-gray-600 mb-8 max-w-xs">
                   Psiko-Bulut ile gökyüzünden dökülen pozitif duyguları topla! Kötü bulutlardan kaç - 4 canın var!
                </p>
            )}

            <button 
                onClick={initGame}
                className="bg-psiko-teal text-white font-heading text-xl px-12 py-4 rounded-full shadow-lg hover:bg-psiko-dark-teal transition-all hover:scale-105 flex items-center gap-3"
            >
                {score > 0 ? <RefreshCw /> : <Play />}
                {score > 0 ? 'Tekrar Oyna' : 'Oyuna Başla'}
            </button>
            <p className="text-xs text-gray-400 mt-4">*Oyun tam ekran açılacaktır.</p>
        </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 left-2 right-2 sm:left-4 sm:right-4 z-10 pointer-events-none">
        <div className="flex justify-between items-start gap-2">
          {/* Left Side - Score and Combo */}
          <div className="flex gap-2 flex-wrap max-w-[60%] sm:max-w-none">
            <div className={`backdrop-blur px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl shadow-md flex items-center gap-1.5 sm:gap-2 border transition-colors duration-1000 ${
              timeOfDay === 'night' 
                ? 'bg-white/20 border-white/30 text-white' 
                : 'bg-white/90 border-white/50 text-deep-slate'
            }`}>
                <Trophy className={timeOfDay === 'night' ? 'text-sun-yellow' : 'text-psiko-teal'} size={18} />
                <span className="font-heading text-lg sm:text-xl">{score}</span>
            </div>
            {/* Combo Indicator */}
            <div className={`bg-sun-yellow text-deep-slate px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-md font-heading font-bold text-sm sm:text-base transition-all transform ${combo > 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                {combo}x
            </div>
          </div>
          
          {/* Right Side - Lives and High Score (Stacked) */}
          <div className="flex flex-col gap-2 items-end">
            {/* Lives Display */}
            <div className={`backdrop-blur px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl shadow-md flex items-center gap-1 sm:gap-1.5 border transition-colors duration-1000 ${
              timeOfDay === 'night' 
                ? 'bg-white/20 border-white/30' 
                : 'bg-white/90 border-white/50'
            }`}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Heart
                  key={index}
                  size={16}
                  className={`${
                    index < lives 
                      ? 'text-soft-coral fill-soft-coral' 
                      : timeOfDay === 'night'
                      ? 'text-white/30 fill-white/30'
                      : 'text-gray-300 fill-gray-300'
                  } transition-all duration-300`}
                />
              ))}
            </div>
            
            {/* High Score */}
            <div className={`backdrop-blur px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl shadow-sm flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold transition-colors duration-1000 ${
              timeOfDay === 'night' 
                ? 'bg-white/10 text-white/80' 
                : 'bg-white/60 text-gray-500'
            }`}>
                <Crown size={14} className="text-sun-yellow fill-current" />
                <span className="hidden sm:inline">{highScore}</span>
                <span className="sm:hidden">{highScore > 999 ? `${Math.floor(highScore/1000)}k` : highScore}</span>
            </div>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="w-full h-full cursor-none touch-none block"
      />

      {/* Instruction Footer - Only show if not full screen or if paused */}
      {!isFullScreen && (
        <div className="bg-white/50 backdrop-blur p-4 text-center border-t border-white/60 absolute bottom-0 w-full">
            <div className="flex justify-center gap-4 text-xs md:text-sm font-bold text-deep-slate/70">
                <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg"><span className="text-lg">❤️</span> +10</span>
                <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg"><span className="text-lg">🌟</span> +20</span>
                <span className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg"><span className="text-lg">☁️</span> -1 Can</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default HappinessCollector;