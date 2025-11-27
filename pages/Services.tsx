import React from 'react';
import { SERVICES } from '../constants';
import { Check } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Services: React.FC = () => {
  return (
    <div className="pt-32 pb-20 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl text-deep-slate mb-4">
            Hizmetlerimiz
          </h1>
          <p className="font-body text-xl text-gray-600 max-w-2xl mx-auto">
            Çocuğunuzun ihtiyaçlarına yönelik bütüncül ve bilimsel yaklaşımlar.
          </p>
        </div>

        <div className="space-y-20">
          {SERVICES.map((service, index) => (
            <div 
              key={service.id} 
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
            >
              {/* Image / Visual Side */}
              <div className="flex-1 w-full">
                <div className={`rounded-[3rem] overflow-hidden shadow-xl aspect-video relative`}>
                  <div className={`absolute inset-0 ${service.color} opacity-20 z-10 mix-blend-multiply`} />
                  <img 
                    src={`https://picsum.photos/seed/${service.id}/800/600`} 
                    alt={service.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute bottom-6 left-6 ${service.color} p-4 rounded-2xl text-white shadow-lg z-20`}>
                    <service.icon size={32} />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1">
                <h2 className="font-heading text-3xl text-deep-slate mb-4 flex items-center gap-3">
                  {service.title}
                  <span className={`w-3 h-3 rounded-full ${service.color}`} />
                </h2>
                <p className="font-body text-gray-600 text-lg mb-6 leading-relaxed">
                  {service.fullDescription}
                </p>
                
                <h3 className="font-bold text-deep-slate mb-4">Program İçeriği:</h3>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 font-body text-gray-600 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <div className={`w-6 h-6 rounded-full ${service.color} flex items-center justify-center text-white shrink-0`}>
                        <Check size={14} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <NavLink 
                  to="/contact"
                  className={`inline-block ${service.color} text-white font-heading px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-md`}
                >
                  Bilgi Al
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
