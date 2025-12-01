import React from 'react';
import Hero from '../components/Home/Hero';
import Features from '../components/Home/Features';
import { TESTIMONIALS } from '../constants';
import { Quote, CheckCircle2, Shapes, Grid3X3, Music, Puzzle, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

// Development Chart Component using Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '0 Ay', motor: 10, social: 10 },
  { name: '6 Ay', motor: 25, social: 20 },
  { name: '12 Ay', motor: 45, social: 35 },
  { name: '18 Ay', motor: 60, social: 55 },
  { name: '24 Ay', motor: 80, social: 75 },
  { name: '36 Ay', motor: 100, social: 95 },
];

const DevelopmentChart: React.FC = () => {
  return (
    <div className="h-[300px] w-full bg-white rounded-3xl p-4 shadow-sm">
      <h3 className="font-heading text-center text-deep-slate mb-4">Gelişimsel İlerleme Takibi</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FFF8E8', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            labelStyle={{ color: '#2C3E50', fontWeight: 'bold' }}
          />
          <Line type="monotone" dataKey="motor" stroke="#3DB6B1" strokeWidth={3} dot={{r: 4, fill: '#3DB6B1'}} name="Motor Beceriler" />
          <Line type="monotone" dataKey="social" stroke="#FF5656" strokeWidth={3} dot={{r: 4, fill: '#FF5656'}} name="Sosyal Beceriler" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <Hero />
      <Features />

      {/* Featured Games Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-purple-600 font-bold tracking-wider text-sm uppercase mb-2 block">Dijital Gelişim</span>
            <h2 className="font-heading text-3xl md:text-4xl text-deep-slate mb-4">
              Eğitici Oyunlarımızı Keşfedin
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Çocuklarınızın bilişsel, motor ve sanatsal becerilerini geliştiren, pedagog onaylı dijital oyunlarımızla tanışın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shapes,
                title: 'Şekil Macerası',
                desc: 'Geometrik şekilleri ve renkleri eğlenerek öğrenin.',
                color: 'bg-cyan-100 text-cyan-600',
                id: 'shapes'
              },
              {
                icon: Grid3X3,
                title: 'Hafıza Ustası',
                desc: 'Görsel hafızayı güçlendiren eşleştirme oyunu.',
                color: 'bg-pink-100 text-pink-600',
                id: 'memory'
              },
              {
                icon: Music,
                title: 'Küçük Müzisyen',
                desc: 'Ritim duygusunu geliştiren müzik aletleri.',
                color: 'bg-violet-100 text-violet-600',
                id: 'music'
              },
              {
                icon: Puzzle,
                title: 'Yapboz Bahçesi',
                desc: 'Problem çözme becerilerini geliştiren yapbozlar.',
                color: 'bg-emerald-100 text-emerald-600',
                id: 'puzzle'
              }
            ].map((game, i) => (
              <NavLink 
                key={i}
                to="/games"
                className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group border border-gray-100"
              >
                <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <game.icon size={28} />
                </div>
                <h3 className="font-heading text-xl text-deep-slate mb-2">{game.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{game.desc}</p>
                <div className="flex items-center text-psiko-teal font-bold text-sm group-hover:gap-2 transition-all">
                  Hemen Oyna <ArrowRight size={16} className="ml-1" />
                </div>
              </NavLink>
            ))}
          </div>
          
          <div className="text-center mt-12">
             <NavLink 
               to="/games" 
               className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-8 py-3 rounded-full hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
             >
               Tüm Oyunları Gör <ArrowRight size={20} />
             </NavLink>
          </div>
        </div>
      </section>

      {/* Why Us / Methodology Section */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="text-psiko-teal font-bold tracking-wider text-sm uppercase mb-2 block">Neden Psikominik?</span>
              <h2 className="font-heading text-3xl md:text-4xl text-deep-slate mb-6">
                Her Adımda Bilimsel Gözlem
              </h2>
              <p className="font-body text-gray-600 mb-6 leading-relaxed">
                Oyun gruplarımız sadece eğlence değil, aynı zamanda ciddi bir gelişim takip sürecidir. 
                Uzmanlarımız, çocuğunuzun motor ve sosyal gelişimini düzenli olarak raporlar.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Uzman Psikolog Liderliğinde Gruplar',
                  'Kişiye Özel Gelişim Karnesi',
                  'Düzenli Ebeveyn Görüşmeleri',
                  'Hijyenik ve Güvenli Materyaller'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-body text-deep-slate">
                    <CheckCircle2 className="text-sage-green shrink-0" size={20} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex-1 w-full max-w-lg">
              <DevelopmentChart />
              <p className="text-xs text-gray-400 text-center mt-4 italic">
                *Temsili gelişim eğrisidir. Her çocuk kendine özgüdür.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl text-center text-deep-slate mb-12">
            Ailelerimiz Ne Diyor?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-warm-cream p-8 rounded-3xl relative">
                <Quote className="text-psiko-teal/20 absolute top-6 right-6" size={48} />
                <p className="font-body text-gray-600 mb-6 italic relative z-10">
                  "{t.text}"
                </p>
                <div>
                  <h4 className="font-heading text-deep-slate">{t.author}</h4>
                  <span className="text-sm text-gray-500">{t.childAge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
