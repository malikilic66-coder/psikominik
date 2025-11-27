import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { NAV_ITEMS } from '../../constants';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-psiko-teal rounded-full flex items-center justify-center text-white font-heading text-xl group-hover:rotate-12 transition-transform">
            P
          </div>
          <span className="font-heading text-2xl text-psiko-teal tracking-wide">
            Psikominik
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `font-body font-bold text-lg transition-colors ${
                  isActive ? 'text-psiko-teal' : 'text-deep-slate hover:text-psiko-teal'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a 
            href="tel:+905551234567"
            className="bg-sun-yellow text-deep-slate font-heading px-6 py-2 rounded-full hover:bg-yellow-400 transition-colors shadow-md flex items-center gap-2"
          >
            <Phone size={18} />
            Randevu Al
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-deep-slate p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menüyü Aç"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: '60px' }}
      >
        <nav className="flex flex-col p-8 gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `font-heading text-2xl ${
                  isActive ? 'text-psiko-teal' : 'text-deep-slate'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <hr className="border-gray-100 my-4" />
          <a 
            href="tel:+905551234567"
            className="bg-psiko-teal text-white font-heading text-center py-4 rounded-xl shadow-lg"
          >
            Hemen Ara
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
