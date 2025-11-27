import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const StickyBar: React.FC = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex border-t border-gray-100">
      <a 
        href="tel:+905551234567" 
        className="flex-1 flex flex-col items-center justify-center py-3 bg-white text-deep-slate active:bg-gray-50"
      >
        <Phone size={20} className="text-psiko-teal mb-1" />
        <span className="text-xs font-bold">Hemen Ara</span>
      </a>
      <a 
        href="https://wa.me/905551234567" 
        className="flex-1 flex flex-col items-center justify-center py-3 bg-psiko-teal text-white active:bg-psiko-dark-teal"
      >
        <MessageCircle size={20} className="mb-1" />
        <span className="text-xs font-bold">WhatsApp</span>
      </a>
    </div>
  );
};

export default StickyBar;
