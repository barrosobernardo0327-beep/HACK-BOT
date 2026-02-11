import React, { useState, useEffect } from 'react';
import { ANGOLAN_SYMBOLS } from '../constants';

interface Card {
  id: number;
  name: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onComplete: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const symbols = [...ANGOLAN_SYMBOLS, ...ANGOLAN_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((s, i) => ({ ...s, id: i, isFlipped: false, isMatched: false }));
    setCards(symbols);
  }, []);

  const handleFlip = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);

    if (flippedCards.length === 1) {
      setMoves(m => m + 1);
      const firstId = flippedCards[0];
      const secondId = id;

      if (cards[firstId].name === cards[secondId].name) {
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstId].isMatched = true;
          matchedCards[secondId].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          if (matchedCards.every(c => c.isMatched)) onComplete();
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstId].isFlipped = false;
          resetCards[secondId].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-xl">
        <h2 className="text-2xl font-black text-angola-yellow italic tracking-tighter">MEMÓRIA DA BANDA</h2>
        <div className="bg-zinc-800 px-6 py-2 rounded-full font-bold border border-zinc-700">
          Jogadas: <span className="text-angola-red">{moves}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square cursor-pointer transition-all duration-500 transform preserve-3d relative ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}
          >
            <div className={`absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center text-4xl shadow-2xl transition-all border-4 ${
              card.isMatched 
                ? 'bg-green-500/20 border-green-500 opacity-60' 
                : card.isFlipped 
                  ? 'bg-zinc-800 border-angola-yellow' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
            }`}>
              {(card.isFlipped || card.isMatched) ? card.icon : '🇦🇴'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};