import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, X, Volume2, VolumeX, Sparkles, MessageCircle } from 'lucide-react';

// API Key - Gerçek uygulamada bu bir çevre değişkeni olmalı
const API_KEY = "AIzaSyCXkwNjljqx8EuLgkuqyvNZZWKi1khELww";

interface SmartMascotProps {
  initialPosition?: { x: number; y: number };
}

const SmartMascot: React.FC<SmartMascotProps> = ({ initialPosition = { x: 50, y: 100 } }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState(initialPosition);
  const [targetPosition, setTargetPosition] = useState(initialPosition);
  const [isWaving, setIsWaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeakTimer, setAutoSpeakTimer] = useState<NodeJS.Timeout | null>(null);

  // Oyunlar hakkında bilgi
  const GAMES_CONTEXT = `
    Mevcut oyunlar:
    1. Duygu Eşleştirme: Duyguları tanı ve eşleştir.
    2. Balon Patlatma: Renkli balonları patlat.
    3. Renk ve Duygu: Renklerin dünyasını keşfet.
    4. Hayvan Dostları: Üzgün hayvanlara yardım et.
    5. Mutluluk Bahçesi: Bahçe yetiştir.
    6. Ritim ve Nefes: Nefes egzersizleri.
    7. Şekil Macerası: Şekilleri tanı.
    8. Hafıza Ustası: Kart eşleştirme.
    9. Küçük Müzisyen: Müzik yap.
    10. Yapboz Bahçesi: Yapboz tamamla.
  `;

  // Canvas çizimi - Görsel düzeltmeler yapıldı (Tek parça bulut)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const drawMascot = () => {
      const size = 120; 
      ctx.clearRect(0, 0, size, size);
      
      const cx = size / 2;
      const cy = size / 2;
      const bounce = Math.sin(frame * 0.08) * 4;

      // Gölge
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 35, 25, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Vücut (bulut şeklinde) - Tamamen birleşik path
      ctx.fillStyle = '#4ECDC4';
      ctx.beginPath();
      // Merkez dikdörtgen (boşlukları doldurmak için)
      ctx.rect(cx - 20, cy - 10 + bounce, 40, 25);
      // Sol daire
      ctx.arc(cx - 20, cy + 5 + bounce, 22, 0, Math.PI * 2);
      // Sağ daire
      ctx.arc(cx + 20, cy + 5 + bounce, 22, 0, Math.PI * 2);
      // Üst daire
      ctx.arc(cx, cy - 15 + bounce, 25, 0, Math.PI * 2);
      // Alt kısımları birleştir
      ctx.arc(cx - 10, cy + 15 + bounce, 15, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy + 15 + bounce, 15, 0, Math.PI * 2);
      ctx.fill();

      // Yüz
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 5 + bounce, 5, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 5 + bounce, 5, 0, Math.PI * 2);
      ctx.fill();

      // Göz bebekleri
      const lookX = (targetPosition.x - position.x) * 0.02;
      const lookY = (targetPosition.y - position.y) * 0.02;
      
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(cx - 9 + lookX, cy - 4 + bounce + lookY, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 11 + lookX, cy - 4 + bounce + lookY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Gülümseme
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      
      if (isSpeaking) {
        const mouthOpen = Math.sin(frame * 0.5) * 3;
        ctx.ellipse(cx, cy + 8 + bounce, 6, 3 + mouthOpen, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
      } else {
        ctx.arc(cx, cy + 8 + bounce, 8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }

      // Yanaklar
      ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
      ctx.beginPath();
      ctx.ellipse(cx - 22, cy + 4 + bounce, 6, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 22, cy + 4 + bounce, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // El sallama
      if (isWaving || isSpeaking) {
        const waveAngle = Math.sin(frame * 0.3) * 0.5;
        ctx.save();
        ctx.translate(cx + 30, cy + bounce);
        ctx.rotate(waveAngle);
        ctx.fillStyle = '#4ECDC4';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Yıldız parıltıları
      if (frame % 60 < 20) {
        ctx.fillStyle = '#FFD700';
        const starX = cx + 30 + Math.sin(frame * 0.1) * 5;
        const starY = cy - 30 + bounce;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = starX + Math.cos(angle) * 6;
          const py = starY + Math.sin(angle) * 6;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }

      frame++;
      animationId = requestAnimationFrame(drawMascot);
    };

    drawMascot();

    return () => cancelAnimationFrame(animationId);
  }, [isWaving, isSpeaking, position, targetPosition]);

  // Otomatik etkileşim ve hareket
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (!isOpen) {
        // Ekranın farklı noktalarına git (Oyunların olduğu alanlar)
        const newX = 10 + Math.random() * 80; 
        const newY = 20 + Math.random() * 100;
        setTargetPosition({ x: newX, y: newY });
      }
    }, 8000); // Her 8 saniyede bir yer değiştir

    // Ara sıra konuşma başlat
    const talkInterval = setInterval(() => {
      if (!isOpen && !isSpeaking && Math.random() > 0.7) {
        const prompts = [
          "Burada çok eğlenceli oyunlar var! Hangisini oynamak istersin?",
          "Benimle sohbet etmek istersen üzerine tıklayabilirsin!",
          "Bugün kendini nasıl hissediyorsun?",
          "Hadi bir oyun seçelim!",
          "Seninle oynamak çok güzel!"
        ];
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        speak(randomPrompt);
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 3000);
      }
    }, 20000); // Her 20 saniyede bir şansını dene

    return () => {
      clearInterval(moveInterval);
      clearInterval(talkInterval);
    };
  }, [isOpen, isSpeaking]);

  // Pozisyon animasyonu
  useEffect(() => {
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.01, // Daha yavaş ve süzülerek
        y: prev.y + (targetPosition.y - prev.y) * 0.01,
      }));
    };
    const id = setInterval(animate, 20);
    return () => clearInterval(id);
  }, [targetPosition]);

  // Gemini API Çağrısı
  const askGemini = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setIsOpen(true); // Konuşurken pencereyi aç
    
    try {
      const systemPrompt = `Sen Psikominik uygulamasının sevimli bulut maskotu Bulutçuk'sun. 
      3-6 yaş arası çocuklarla konuşuyorsun. 
      Cevapların çok kısa (maksimum 2 cümle), neşeli, cesaretlendirici ve eğitici olsun. 
      Emojiler kullan.
      
      Sayfadaki oyunlar hakkında bilgin var:
      ${GAMES_CONTEXT}
      
      Çocuk sana bir şey sorduğunda bu oyunları önerebilirsin.`;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nÇocuk: ${text}\nBulutçuk:`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const reply = data.candidates[0].content.parts[0].text;
      setResponse(reply);
      speak(reply);
    } catch (error) {
      console.error('Gemini hatası:', error);
      const fallback = "Seninle konuşmak çok güzel! Hadi oyun oynayalım! 🎈";
      setResponse(fallback);
      speak(fallback);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  // Metin Okuma (TTS)
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    
    // Varsa önceki konuşmayı durdur
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.pitch = 1.2; // Biraz daha ince, çocuksu ses
    utterance.rate = 0.9; // Biraz yavaş ve anlaşılır
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Sesli Komut (STT) - Basit implementasyon
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tarayıcınız sesli komutları desteklemiyor.');
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      askGemini(transcript);
    };

    recognition.start();
  };

  return (
    <>
      {/* Maskot Karakteri */}
      <div
        className={`fixed z-50 cursor-pointer transition-all duration-500 hover:scale-110 ${
          isSpeaking || isOpen ? 'scale-125' : 'scale-100'
        }`}
        style={{ 
          right: `${100 - position.x}%`, 
          top: `${position.y}px`,
          transform: `translateX(50%) scale(${isSpeaking || isOpen ? 1.3 : 1})`
        }}
        onClick={() => {
          setIsWaving(true);
          setIsOpen(true);
          speak("Merhaba! Ben Bulutçuk. Seninle oyun oynamak için sabırsızlanıyorum!");
          setTimeout(() => setIsWaving(false), 2000);
        }}
      >
        <canvas ref={canvasRef} width={120} height={120} />
        
        {/* Konuşma balonu ipucu - Sadece konuşmuyorken ve kapalıyken göster */}
        {!isOpen && !isSpeaking && (
          <div className="absolute -top-2 right-0 bg-white px-3 py-1 rounded-full rounded-bl-none shadow-md text-xs font-bold animate-bounce">
            Benimle konuş! 🎤
          </div>
        )}
      </div>

      {/* Sohbet Penceresi */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-3xl shadow-2xl border-4 border-psiko-teal overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Başlık */}
          <div className="bg-psiko-teal p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white font-bold">
              <MessageCircle size={20} />
              <span>Bulutçuk ile Sohbet</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mesaj Alanı */}
          <div className="p-4 bg-blue-50 h-64 overflow-y-auto flex flex-col gap-3">
            {/* Maskot Mesajı */}
            <div className="flex gap-2 items-start">
              <div className="w-8 h-8 bg-psiko-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                ☁️
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">
                {isLoading ? (
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                  </div>
                ) : (
                  <>
                    {response}
                    <button 
                      onClick={() => speak(response)}
                      className="ml-2 inline-block align-middle text-psiko-teal hover:scale-110 transition-transform"
                    >
                      <Volume2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Giriş Alanı */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <button
              onClick={startListening}
              className={`p-3 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Mic size={20} />
            </button>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && askGemini(inputText)}
              placeholder="Bir şeyler söyle..."
              className="flex-1 bg-gray-100 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-psiko-teal/50"
            />
            
            <button
              onClick={() => askGemini(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-psiko-teal text-white rounded-full hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartMascot;
