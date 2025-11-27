import React from 'react';
import Hero from '../components/Home/Hero';
import Features from '../components/Home/Features';
import { TESTIMONIALS } from '../constants';
import { Quote, CheckCircle2 } from 'lucide-react';

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
