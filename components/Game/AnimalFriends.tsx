import React, { useState, useCallback } from 'react';
import { Heart, Star, RefreshCw, Volume2 } from 'lucide-react';

interface Animal {
  id: number;
  name: string;
  emoji: string;
  problem: string;
  solutions: Solution[];
  correctSolution: number;
}

interface Solution {
  id: number;
  text: string;
  emoji: string;
  isCorrect: boolean;
  feedback: string;
}

const ANIMALS: Animal[] = [
  {
    id: 1,
    name: 'Kedi Minnoş',
    emoji: '🐱',
    problem: 'Minnoş çok üzgün çünkü arkadaşları onunla oynamak istemiyor.',
    solutions: [
      { id: 1, text: 'Ona sarıl ve "Seninle ben oynarım!" de', emoji: '🤗', isCorrect: true, feedback: 'Harika! Minnoş çok mutlu oldu! Arkadaşlık en güzel hediye!' },
      { id: 2, text: 'Onu yalnız bırak', emoji: '👋', isCorrect: false, feedback: 'Hmm, Minnoş daha da üzüldü. Belki başka bir şey deneyelim?' },
      { id: 3, text: 'Arkadaşlarına kız', emoji: '😠', isCorrect: false, feedback: 'Kızmak sorunu çözmez. Minnoş hâlâ üzgün.' },
    ],
    correctSolution: 1
  },
  {
    id: 2,
    name: 'Köpek Karamel',
    emoji: '🐕',
    problem: 'Karamel parkta oyuncağını kaybetti ve çok endişeli.',
    solutions: [
      { id: 1, text: '"Merak etme, birlikte arayalım!" de', emoji: '🔍', isCorrect: true, feedback: 'Süper! Birlikte aramak Karamel\'i rahatlattı ve oyuncağı buldunuz!' },
      { id: 2, text: '"Önemli değil" de ve git', emoji: '🚶', isCorrect: false, feedback: 'Karamel\'in duyguları önemli. Belki ona yardım edebiliriz?' },
      { id: 3, text: 'Onun yerine ağla', emoji: '😢', isCorrect: false, feedback: 'Ağlamak yardım etmedi. Birlikte bir çözüm bulalım!' },
    ],
    correctSolution: 1
  },
  {
    id: 3,
    name: 'Tavşan Pamuk',
    emoji: '🐰',
    problem: 'Pamuk kardeşiyle kavga etti ve şimdi pişman.',
    solutions: [
      { id: 1, text: '"Kavga olur, özür dileyebilirsin" de', emoji: '💕', isCorrect: true, feedback: 'Mükemmel! Pamuk özür diledi ve kardeşiyle barıştı!' },
      { id: 2, text: '"Kardeşinle bir daha konuşma" de', emoji: '🚫', isCorrect: false, feedback: 'Bu iyi bir fikir değil. Aile önemli!' },
      { id: 3, text: 'Kavgayı devam ettir', emoji: '💢', isCorrect: false, feedback: 'Kavga devam ederse herkes üzülür. Barışmak daha güzel!' },
    ],
    correctSolution: 1
  },
  {
    id: 4,
    name: 'Ayı Bal',
    emoji: '🐻',
    problem: 'Bal yeni bir okula başlayacak ve çok korkuyor.',
    solutions: [
      { id: 1, text: '"Korkma, yeni arkadaşlar edineceksin!" de', emoji: '🌟', isCorrect: true, feedback: 'Harika! Bal cesaretlendi ve okula heyecanla gitti!' },
      { id: 2, text: '"Ben de korkardım, gitme" de', emoji: '😰', isCorrect: false, feedback: 'Bu Bal\'ı daha da korkuttu. Cesaret verelim!' },
      { id: 3, text: 'Korkusunu önemseme', emoji: '🙄', isCorrect: false, feedback: 'Herkesin duyguları önemli. Bal\'ı anlayalım ve destekleyelim.' },
    ],
    correctSolution: 1
  },
  {
    id: 5,
    name: 'Penguen Buz',
    emoji: '🐧',
    problem: 'Buz paylaşmayı bilmiyor ve arkadaşları kızgın.',
    solutions: [
      { id: 1, text: '"Paylaşınca herkes mutlu olur, deneyelim!" de', emoji: '🤝', isCorrect: true, feedback: 'Süper! Buz paylaşmayı öğrendi ve herkes mutlu!' },
      { id: 2, text: '"Paylaşmak zorunda değilsin" de', emoji: '👎', isCorrect: false, feedback: 'Hmm, arkadaşları hâlâ üzgün. Paylaşmak güzel!' },
      { id: 3, text: 'Arkadaşlarından kaç', emoji: '🏃', isCorrect: false, feedback: 'Kaçmak sorunu çözmez. Birlikte çözüm bulalım!' },
    ],
    correctSolution: 1
  },
  {
    id: 6,
    name: 'Fil Dumbo',
    emoji: '🐘',
    problem: 'Dumbo bir hata yaptı ve çok utanıyor.',
    solutions: [
      { id: 1, text: '"Hata yapmak normal, önemli olan düzeltmek" de', emoji: '💪', isCorrect: true, feedback: 'Mükemmel! Dumbo hatasını düzeltti ve kendini daha iyi hissediyor!' },
      { id: 2, text: 'Hatası için onu suçla', emoji: '😤', isCorrect: false, feedback: 'Suçlamak Dumbo\'yu daha kötü hissettirdi. Destekleyelim!' },
      { id: 3, text: '"Bir daha deneme" de', emoji: '⛔', isCorrect: false, feedback: 'Vazgeçmek çözüm değil. Tekrar denemek önemli!' },
    ],
    correctSolution: 1
  },
];

const AnimalFriends: React.FC = () => {
  const [currentAnimal, setCurrentAnimal] = useState(0);
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [happyAnimals, setHappyAnimals] = useState<number[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const animal = ANIMALS[currentAnimal];

  const handleSolutionClick = useCallback((solution: Solution) => {
    if (showFeedback) return;
    
    setSelectedSolution(solution.id);
    setShowFeedback(true);
    setIsCorrect(solution.isCorrect);

    if (solution.isCorrect) {
      setScore(s => s + 100);
      setHappyAnimals(prev => [...prev, animal.id]);
      
      setTimeout(() => {
        if (currentAnimal < ANIMALS.length - 1) {
          setCurrentAnimal(c => c + 1);
          setSelectedSolution(null);
          setShowFeedback(false);
        } else {
          setGameComplete(true);
        }
      }, 2500);
    }
  }, [showFeedback, animal.id, currentAnimal]);

  const tryAgain = () => {
    setSelectedSolution(null);
    setShowFeedback(false);
  };

  const restartGame = () => {
    setCurrentAnimal(0);
    setSelectedSolution(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setScore(0);
    setHappyAnimals([]);
    setGameComplete(false);
  };

  const getFeedback = () => {
    const solution = animal.solutions.find(s => s.id === selectedSolution);
    return solution?.feedback || '';
  };

  if (gameComplete) {
    return (
      <div className="bg-gradient-to-br from-green-100 via-yellow-50 to-pink-100 rounded-[2rem] p-6 shadow-xl h-full flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">Tebrikler!</h2>
        <p className="text-xl text-gray-700 mb-6">
          Tüm hayvan dostlarını mutlu ettin!
        </p>
        
        <div className="bg-white/80 rounded-2xl p-4 mb-6">
          <div className="text-4xl mb-2">
            {ANIMALS.map(a => (
              <span key={a.id} className="inline-block mx-1 animate-pulse">
                {a.emoji}
              </span>
            ))}
          </div>
          <p className="text-lg text-purple-600 font-bold">
            {score} Puan Kazandın!
          </p>
        </div>

        <div className="bg-yellow-100 rounded-xl p-4 mb-6 max-w-sm">
          <p className="text-yellow-800 font-semibold">
            💡 Öğrendiklerimiz:
          </p>
          <ul className="text-sm text-yellow-700 mt-2 text-left">
            <li>• Arkadaşlarımıza yardım etmek güzel</li>
            <li>• Paylaşmak herkesi mutlu eder</li>
            <li>• Hata yapmak normal, düzeltmek önemli</li>
            <li>• Empati kurmak arkadaşlığı güçlendirir</li>
          </ul>
        </div>

        <button
          onClick={restartGame}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <RefreshCw size={20} />
          Tekrar Oyna
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-100 via-yellow-50 to-pink-100 rounded-[2rem] p-4 sm:p-6 shadow-xl h-full overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Heart className="text-pink-500" size={24} />
          <h2 className="text-lg font-bold text-green-700">Hayvan Dostları</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/80 rounded-full px-4 py-1 flex items-center gap-2">
            <Star className="text-yellow-500" size={18} />
            <span className="font-bold text-green-600">{score}</span>
          </div>
          <div className="bg-white/80 rounded-full px-3 py-1 text-sm text-green-600 font-semibold">
            {currentAnimal + 1}/{ANIMALS.length}
          </div>
        </div>
      </div>

      {/* Animal Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex items-center gap-4 mb-3">
          <div className={`text-5xl ${isCorrect && showFeedback ? 'animate-bounce' : 'animate-pulse'}`}>
            {animal.emoji}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{animal.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
              happyAnimals.includes(animal.id) 
                ? 'bg-green-200 text-green-700' 
                : 'bg-orange-200 text-orange-700'
            }`}>
              {happyAnimals.includes(animal.id) ? '😊 Mutlu' : '😢 Yardıma İhtiyacı Var'}
            </span>
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-xl p-3 border-l-4 border-yellow-400">
          <p className="text-gray-700 font-medium">{animal.problem}</p>
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`rounded-xl p-4 mb-4 ${
          isCorrect 
            ? 'bg-green-100 border-2 border-green-400' 
            : 'bg-red-100 border-2 border-red-400'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{isCorrect ? '✨' : '💭'}</span>
            <div>
              <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {getFeedback()}
              </p>
              {!isCorrect && (
                <button
                  onClick={tryAgain}
                  className="mt-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-1 px-4 rounded-full text-sm transition-all"
                >
                  Tekrar Dene
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Solutions */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-600 mb-2">
          {animal.name}'e nasıl yardım edersin?
        </p>
        {animal.solutions.map(solution => (
          <button
            key={solution.id}
            onClick={() => handleSolutionClick(solution)}
            disabled={showFeedback && isCorrect}
            className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              selectedSolution === solution.id
                ? solution.isCorrect
                  ? 'bg-green-200 border-2 border-green-500 scale-102'
                  : 'bg-red-200 border-2 border-red-500'
                : 'bg-white/70 hover:bg-white hover:shadow-md border-2 border-transparent'
            } ${showFeedback && isCorrect ? 'opacity-60' : ''}`}
          >
            <span className="text-2xl">{solution.emoji}</span>
            <span className="font-medium text-gray-700">{solution.text}</span>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4 flex justify-center gap-2">
        {ANIMALS.map((a, i) => (
          <div
            key={a.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              happyAnimals.includes(a.id)
                ? 'bg-green-400 scale-110'
                : i === currentAnimal
                ? 'bg-yellow-400 animate-pulse'
                : 'bg-gray-200'
            }`}
          >
            <span className="text-sm">{a.emoji}</span>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 bg-blue-50 rounded-xl p-3">
        <p className="text-xs text-blue-700 text-center">
          💡 <strong>İpucu:</strong> Empati kur! Hayvanların yerine kendini koy ve nasıl hissettiğini düşün.
        </p>
      </div>
    </div>
  );
};

export default AnimalFriends;
