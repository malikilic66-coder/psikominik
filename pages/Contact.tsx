import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FAQS } from '../constants';

const Contact: React.FC = () => {
  return (
    <div className="pt-32 pb-20 animate-fade-in">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl text-center text-deep-slate mb-12">İletişim & SSS</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Info */}
          <div className="bg-white rounded-3xl p-8 shadow-soft h-full">
            <h2 className="font-heading text-2xl text-psiko-teal mb-6">Bize Ulaşın</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warm-cream rounded-full flex items-center justify-center text-soft-coral shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-deep-slate">Adres</h4>
                  <p className="text-gray-600">Bağdat Caddesi No:123/4<br />Kadıköy, İstanbul</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warm-cream rounded-full flex items-center justify-center text-sage-green shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-deep-slate">Telefon</h4>
                  <p className="text-gray-600">+90 (216) 123 45 67</p>
                  <p className="text-sm text-gray-500">Hafta içi 09:00 - 18:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warm-cream rounded-full flex items-center justify-center text-sun-yellow shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-deep-slate">E-posta</h4>
                  <p className="text-gray-600">info@psikominik.com</p>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="w-full h-48 bg-gray-200 rounded-2xl mt-6 relative overflow-hidden group">
                <img 
                   src="https://picsum.photos/seed/map/600/300" 
                   alt="Harita Konumu" 
                   className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 transition-all"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-white/80 px-4 py-2 rounded-lg font-bold text-deep-slate shadow-sm">
                    Haritada Göster
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-psiko-teal rounded-3xl p-8 shadow-lg text-white">
            <h2 className="font-heading text-2xl mb-2">Tanışma Randevusu</h2>
            <p className="mb-6 opacity-90">Formu doldurun, sizi arayıp en uygun zamanı planlayalım.</p>
            
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold mb-1">Adınız Soyadınız</label>
                <input type="text" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 focus:outline-none focus:bg-white focus:text-deep-slate transition-colors" placeholder="Veli Adı" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Telefon</label>
                <input type="tel" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 focus:outline-none focus:bg-white focus:text-deep-slate transition-colors" placeholder="0555..." />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Çocuğun Yaşı (Ay)</label>
                <input type="number" className="w-full p-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 focus:outline-none focus:bg-white focus:text-deep-slate transition-colors" placeholder="Örn: 24" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Konu</label>
                <select className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:bg-white focus:text-deep-slate transition-colors [&>option]:text-deep-slate">
                  <option value="">Seçiniz...</option>
                  <option value="playgroup">Oyun Grubu Başvurusu</option>
                  <option value="therapy">Terapi Desteği</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <button className="w-full bg-sun-yellow text-deep-slate font-heading text-lg py-4 rounded-xl hover:bg-white transition-colors mt-4">
                Gönder
              </button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl text-center text-deep-slate mb-8">Sıkça Sorulan Sorular</h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-heading text-lg text-psiko-teal mb-2 flex items-start gap-2">
                  <span className="text-soft-coral">Q.</span> {faq.question}
                </h3>
                <p className="font-body text-gray-600 pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
