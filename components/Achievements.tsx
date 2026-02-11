import React from 'react';
import { Achievement } from '../types';

interface AchievementProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementProps> = ({ achievements }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-white mb-2">Conquistas</h2>
        <p className="text-zinc-500 italic">O seu progresso na jornada cultural angolana.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach) => (
          <div 
            key={ach.id}
            className={`p-6 rounded-2xl border-2 transition-all flex items-center gap-6 ${
              ach.unlocked 
                ? 'bg-zinc-900 border-angola-yellow shadow-[0_0_20px_rgba(248,211,8,0.1)]' 
                : 'bg-zinc-950 border-zinc-800 opacity-50 grayscale'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-zinc-800 shadow-inner`}>
              {ach.icon}
            </div>
            <div>
              <h3 className={`font-bold text-xl ${ach.unlocked ? 'text-angola-yellow' : 'text-zinc-400'}`}>
                {ach.title}
              </h3>
              <p className="text-zinc-500 text-sm mt-1">{ach.description}</p>
              {ach.unlocked && (
                <span className="inline-block mt-2 text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                  Desbloqueado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};