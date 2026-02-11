import React, { useState } from 'react';
import { PROVINCES } from '../constants';
import { Province } from '../types';

interface TravelProps {
  onVisit: (provinceId: string) => void;
  visited: string[];
}

export const TravelSimulator: React.FC<TravelProps> = ({ onVisit, visited }) => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);

  const handleVisit = (p: Province) => {
    setSelectedProvince(p);
    onVisit(p.id);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-2">Explora Angola 🇦🇴</h1>
        <p className="text-zinc-400">Descobre as maravilhas das 18 províncias da nossa terra.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROVINCES.map((p) => (
          <div 
            key={p.id}
            className="group relative h-72 rounded-3xl overflow-hidden cursor-pointer shadow-2xl transition-transform hover:-translate-y-2 border-2 border-zinc-800 hover:border-angola-yellow"
            onClick={() => handleVisit(p)}
          >
            <img 
              src={`https://picsum.photos/seed/${p.id}/600/400`} 
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-angola-yellow mb-1 block">Província</span>
                  <h3 className="text-2xl font-bold text-white">{p.name}</h3>
                  <p className="text-sm text-zinc-300 flex items-center gap-1 mt-1">
                    <span className="text-zinc-500">Capital:</span> {p.capital}
                  </p>
                </div>
                {visited.includes(p.id) && (
                  <div className="w-10 h-10 bg-angola-yellow rounded-full flex items-center justify-center text-black font-bold shadow-lg animate-pulse-yellow">
                    ✅
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="glass-card max-w-2xl w-full rounded-3xl overflow-hidden animate-zoom-in relative">
            <button 
              onClick={() => setSelectedProvince(null)}
              className="absolute top-4 right-4 text-white hover:text-angola-yellow text-2xl"
            >
              ✕
            </button>
            <img 
              src={`https://picsum.photos/seed/${selectedProvince.id}/800/400`} 
              className="w-full h-64 object-cover"
            />
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-angola-red p-4 rounded-2xl">
                  <span className="text-3xl">🏛️</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-angola-yellow">{selectedProvince.name}</h2>
                  <p className="text-zinc-400">Ponto Turístico: <span className="text-white font-medium">{selectedProvince.attraction}</span></p>
                </div>
              </div>
              
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <h4 className="font-bold text-white mb-2 uppercase text-xs tracking-widest text-zinc-500">Destaque Cultural</h4>
                <p className="text-zinc-300 leading-relaxed">{selectedProvince.culture}</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedProvince(null)}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
                >
                  Voltar ao Mapa
                </button>
                <button 
                  className="flex-1 py-4 bg-angola-red hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                  onClick={() => alert('Em breve: Vista 360º de ' + selectedProvince.attraction)}
                >
                  Ver em 360º
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};