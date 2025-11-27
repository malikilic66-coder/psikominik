import React from 'react';
import { NavLink } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t-4 border-psiko-teal pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading text-2xl text-psiko-teal mb-4">Psikominik</h3>
            <p className="font-body text-gray-600 mb-6 leading-relaxed">
              Oyunla büyüyen, bilimle gelişen mutlu çocuklar için güvenli bir liman.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-warm-cream rounded-full flex items-center justify-center text-psiko-teal hover:bg-psiko-teal hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-warm-cream rounded-full flex items-center justify-center text-psiko-teal hover:bg-psiko-teal hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-heading text-lg text-deep-slate mb-6">Hızlı Erişim</h4>
            <ul className="space-y-3 font-body text-gray-600">
              <li><NavLink to="/about" className="hover:text-psiko-teal">Hakkımızda</NavLink></li>
              <li><NavLink to="/services" className="hover:text-psiko-teal">Hizmetler</NavLink></li>
              <li><NavLink to="/academy" className="hover:text-psiko-teal">Ebeveyn Akademisi</NavLink></li>
              <li><NavLink to="/contact" className="hover:text-psiko-teal">İletişim</NavLink></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h4 className="font-heading text-lg text-deep-slate mb-6">Hizmetlerimiz</h4>
            <ul className="space-y-3 font-body text-gray-600">
              <li><NavLink to="/services" className="hover:text-psiko-teal">Oyun Grupları</NavLink></li>
              <li><NavLink to="/services" className="hover:text-psiko-teal">Oyun Terapisi</NavLink></li>
              <li><NavLink to="/services" className="hover:text-psiko-teal">Filial Terapi</NavLink></li>
              <li><NavLink to="/services" className="hover:text-psiko-teal">Gelişim Testleri</NavLink></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="font-heading text-lg text-deep-slate mb-6">İletişim</h4>
            <ul className="space-y-4 font-body text-gray-600">
              <li className="flex items-start gap-3">
                <MapPin className="text-soft-coral shrink-0 mt-1" size={18} />
                <span>Bağdat Caddesi No:123/4<br />Kadıköy, İstanbul</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-sage-green shrink-0" size={18} />
                <span>+90 (216) 123 45 67</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-sun-yellow shrink-0" size={18} />
                <span>info@psikominik.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-body">
          <p>&copy; 2025 Psikominik. Tüm hakları saklıdır.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-psiko-teal">KVKK Aydınlatma Metni</a>
            <a href="#" className="hover:text-psiko-teal">Çerez Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
