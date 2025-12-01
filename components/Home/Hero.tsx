import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Blobs - Neumorphic decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-psiko-teal/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sun-yellow/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6 animate-fade-in-up">
              <Star className="text-sun-yellow fill-current" size={16} />
              <span className="text-sm font-bold text-deep-slate">Uzman Psikologlar Eşliğinde</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-6xl text-deep-slate mb-6 leading-tight">
              Oyunla <span className="text-psiko-teal">Büyüyor,</span><br />
              Bilimle <span className="text-soft-coral">Gelişiyoruz.</span>
            </h1>
            
            <p className="font-body text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
              0-6 yaş grubu çocuklar için güvenli, geliştirici ve psikolojik temellere dayalı bir oyun ortamı. Potansiyellerini keşfetmeleri için buradayız.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start flex-wrap">
              <NavLink 
                to="/contact" 
                className="bg-psiko-teal text-white font-heading text-lg px-8 py-4 rounded-2xl shadow-lg shadow-psiko-teal/30 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Tanışma Randevusu Al
                <ArrowRight size={20} />
              </NavLink>
              <NavLink 
                to="/games" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-heading text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                🎮 Oyunları Oyna
              </NavLink>
              <NavLink 
                to="/services" 
                className="bg-white text-deep-slate border-2 border-gray-100 font-heading text-lg px-8 py-4 rounded-2xl hover:border-psiko-teal hover:text-psiko-teal transition-colors w-full sm:w-auto justify-center flex"
              >
                Grupları İncele
              </NavLink>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-soft transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://picsum.photos/seed/kidsplaying/800/600" 
                alt="Mutlu çocuklar oyun oynarken" 
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-sun-yellow rounded-full z-0 animate-bounce delay-700" />
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-soft-coral rounded-full z-0 animate-pulse" />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
