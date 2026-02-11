import React, { useState } from 'react';
import { getLearningAssistantResponse, speakPronunciation } from '../services/gemini';

export const LearningAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: 'Olá! Sou seu guia cultural de Angola. Posso te ensinar sobre as nossas 18 províncias, figuras históricas como a Rainha Njinga, ou até te ensinar algumas palavras em Kimbundu e Umbundu. O que gostaria de saber?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const response = await getLearningAssistantResponse(userMsg);
    setMessages(prev => [...prev, { role: 'bot', content: response }]);
    setIsTyping(false);
  };

  const pronunciations = [
    { word: 'Ndapandula', lang: 'Umbundu', meaning: 'Obrigado' },
    { word: 'Sakidila', lang: 'Kimbundu', meaning: 'Obrigado' },
    { word: 'Mulemba', lang: 'Kimbundu', meaning: 'Árvore sagrada' },
    { word: 'Kandandu', lang: 'Kimbundu', meaning: 'Abraço' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 h-[600px]">
      {/* Chat Area */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden shadow-2xl border-zinc-800">
        <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="font-bold text-angola-yellow">Sábio Digital</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                m.role === 'user' 
                  ? 'bg-angola-red text-white rounded-tr-none' 
                  : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-zinc-500 text-sm animate-pulse">Assistente está a pensar...</div>}
        </div>

        <div className="p-4 bg-zinc-900 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre história, culinária ou língua..."
              className="flex-1 bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-angola-yellow transition-colors"
            />
            <button
              onClick={handleSend}
              className="bg-angola-yellow text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Pronunciation Tools */}
      <div className="w-full md:w-72 space-y-4">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-angola-yellow">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            🗣️ Pronúncia
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Ouça palavras em línguas nacionais de Angola.</p>
          <div className="space-y-3">
            {pronunciations.map((p, i) => (
              <button
                key={i}
                onClick={() => speakPronunciation(p.word, p.lang)}
                className="w-full p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl text-left border border-zinc-800 hover:border-angola-yellow transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-200 group-hover:text-angola-yellow">{p.word}</span>
                  <span className="text-[10px] uppercase text-zinc-500">{p.lang}</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">{p.meaning}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-angola-red/10 p-6 rounded-2xl border border-angola-red/30">
          <h3 className="font-bold text-angola-red mb-2">Dica Cultural</h3>
          <p className="text-sm text-zinc-300">
            A Rainha Njinga Mbandi é um símbolo nacional de resistência contra a colonização portuguesa.
          </p>
        </div>
      </div>
    </div>
  );
};