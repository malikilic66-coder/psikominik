import React from 'react';
import { TEAM } from '../constants';
import { Award, Heart, ShieldCheck } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="pt-32 pb-20 animate-fade-in">
      <div className="container mx-auto px-4">
        
        {/* Mission / Vision */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <span className="text-psiko-teal font-bold tracking-wider text-sm uppercase mb-2 block">Biz Kimiz?</span>
          <h1 className="font-heading text-4xl md:text-5xl text-deep-slate mb-8">
            Çocukların Dilini Konuşuyoruz
          </h1>
          <p className="font-body text-lg text-gray-600 leading-relaxed mb-8">
            Psikominik olarak varoluş amacımız; erken çocukluk dönemindeki bireylerin bilişsel, 
            duygusal ve sosyal gelişimlerini, oyunun evrensel ve iyileştirici diliyle desteklemektir.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-psiko-teal">
              <Heart className="text-psiko-teal mb-4" size={32} />
              <h3 className="font-heading text-xl mb-2">Çocuğa Saygı</h3>
              <p className="text-sm text-gray-600">Her çocuk biriciktir ve kendi gelişim hızına sahiptir.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-sun-yellow">
              <Award className="text-sun-yellow mb-4" size={32} />
              <h3 className="font-heading text-xl mb-2">Bilimsellik</h3>
              <p className="text-sm text-gray-600">Uyguladığımız tüm programlar kanıta dayalıdır.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-sage-green">
              <ShieldCheck className="text-sage-green mb-4" size={32} />
              <h3 className="font-heading text-xl mb-2">Güvenlik</h3>
              <p className="text-sm text-gray-600">Fiziksel ve duygusal güvenlik kırmızı çizgimizdir.</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-24">
          <h2 className="font-heading text-3xl md:text-4xl text-center text-deep-slate mb-12">
            Uzman Kadromuz
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <div key={member.id} className="bg-white rounded-[2rem] overflow-hidden shadow-soft hover:shadow-lg transition-shadow">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-8">
                  <h3 className="font-heading text-xl text-deep-slate">{member.name}</h3>
                  <span className="text-psiko-teal font-bold text-sm block mb-4">{member.role}</span>
                  
                  <div className="flex flex-wrap gap-2">
                    {member.credentials.map((cred, idx) => (
                      <span key={idx} className="bg-warm-cream text-deep-slate text-xs px-3 py-1 rounded-full border border-orange-100">
                        {cred}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
