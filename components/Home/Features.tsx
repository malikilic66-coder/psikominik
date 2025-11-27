import React from 'react';
import { NavLink } from 'react-router-dom';
import { SERVICES } from '../../constants';
import { ArrowRight } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl text-deep-slate mb-4">
            Neler Yapıyoruz?
          </h2>
          <p className="font-body text-gray-600 max-w-2xl mx-auto">
            Çocuğunuzun gelişimsel ihtiyaçlarına uygun, bilimsel temelli programlar hazırladık.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, index) => (
            <div 
              key={service.id} 
              className="group bg-warm-cream rounded-3xl p-8 hover:shadow-card transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-gray-100 relative overflow-hidden"
            >
              <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                <service.icon size={28} />
              </div>
              
              <h3 className="font-heading text-xl text-deep-slate mb-3">
                {service.title}
              </h3>
              
              <p className="font-body text-gray-600 mb-6 text-sm leading-relaxed">
                {service.shortDescription}
              </p>
              
              <NavLink 
                to="/services" 
                className="inline-flex items-center text-psiko-teal font-bold text-sm hover:underline"
              >
                Detaylı Bilgi <ArrowRight size={16} className="ml-1" />
              </NavLink>

              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-16 h-16 ${service.color} opacity-5 rounded-bl-full`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
