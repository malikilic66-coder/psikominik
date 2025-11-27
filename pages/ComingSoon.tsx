import React from 'react';
import HappinessCollector from '../components/Game/HappinessCollector';
import { Instagram, Mail } from 'lucide-react';
import { SERVICES } from '../constants';

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFF8E8] overflow-hidden relative font-body selection:bg-psiko-teal selection:text-white">
      
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-psiko-teal/20 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sun-yellow/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-soft-coral/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
            <span className="font-heading text-4xl text-psiko-teal tracking-tight font-black hover:scale-105 transition-transform cursor-default select-none">
              Psikominik
            </span>
            
            <a href="mailto:info@psikominik.com" className="hidden md:flex items-center gap-2 text-deep-slate font-bold hover:text-psiko-teal transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/40">
                <Mail size={18} />
                <span>info@psikominik.com</span>
            </a>
        </header>

        <main className="flex-grow grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-block mb-6">
                    <span className="bg-sun-yellow/20 text-deep-slate border border-sun-yellow/50 px-4 py-1.5 rounded-full text-sm font-bold animate-pulse">
                        🚧 Web Sitemiz Yenileniyor
                    </span>
                </div>
                
                <h1 className="font-heading text-5xl md:text-7xl text-deep-slate mb-6 leading-[1.1]">
                    Minik Adımlar, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-psiko-teal to-sage-green">
                        Büyük Yarınlar.
                    </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Sizlere daha iyi bir dijital deneyim sunmak için mutfakta harika şeyler pişiriyoruz. 
                    Bu sırada Psiko-Bulut ile stres atın!
                </p>

                {/* Services Pills */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start opacity-80">
                    {SERVICES.map(s => (
                        <div key={s.id} className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-lg text-sm text-deep-slate border border-white/50">
                            <s.icon size={14} className="text-psiko-teal"/>
                            {s.title}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Content - Game */}
            <div className="relative mt-4 lg:mt-0 order-1 lg:order-2">
                <div className="absolute -inset-4 bg-gradient-to-tr from-psiko-teal/20 to-soft-coral/20 rounded-[3rem] blur-2xl -z-10" />
                <HappinessCollector />
            </div>
        </main>

        <footer className="mt-8 py-6 border-t border-deep-slate/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; 2025 Psikominik. Tüm hakları saklıdır.</p>
            <div className="flex gap-6">
                <a href="https://instagram.com" className="hover:text-psiko-teal transition-colors flex items-center gap-1">
                    <Instagram size={16} /> Instagram
                </a>
                <a href="mailto:info@psikominik.com" className="hover:text-psiko-teal transition-colors flex items-center gap-1">
                    <Mail size={16} /> info@psikominik.com
                </a>
            </div>
        </footer>

      </div>
    </div>
  );
};

export default ComingSoon;