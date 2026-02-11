import React, { useState, useEffect, useRef } from 'react';
import { generateQuizQuestions } from '../services/gemini';
import { QuizQuestion, Difficulty } from '../types';

interface QuizProps {
  onComplete: (score: number, correctCount: number, kz: number) => void;
  onQuit: () => void;
  triggerNotification: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ onComplete, onQuit }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(30);
  const [accumulatedKz, setAccumulatedKz] = useState(0);
  const [floatingText, setFloatingText] = useState<{ id: number; text: string; color: string }[]>([]);

  const timerRef = useRef<any>(null);

  const playSound = (freqs: number[], type: OscillatorType = 'sine', duration: number = 0.2) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type;
      freqs.forEach((f, i) => osc.frequency.setValueAtTime(f, ctx.currentTime + (i * 0.1)));
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start(); osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const addFloatingText = (text: string, color: string) => {
    const id = Date.now();
    setFloatingText(prev => [...prev, { id, text, color }]);
    setTimeout(() => setFloatingText(p => p.filter(t => t.id !== id)), 1000);
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    const data = await generateQuizQuestions(Difficulty.INTERMEDIATE);
    setQuestions(data.slice(0, 15));
    setIsLoading(false);
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer(p => { if (p <= 1) { handleAnswer(-1); return 0; } return p - 1; });
    }, 1000);
  };

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(idx);
    const isCorrect = idx === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      playSound([523.25, 659.25, 783.99], 'triangle', 0.4);
      const gain = 10000 + (timer * 500);
      setAccumulatedKz(p => p + gain);
      addFloatingText(`+${gain.toLocaleString()} Kz`, "text-green-500");
    } else {
      playSound([220, 110], 'sawtooth', 0.3);
      addFloatingText("ERROU!", "text-angola-red");
    }
    setShowFeedback(true);
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      startTimer();
    } else {
      onComplete(currentIndex * 10, 0, accumulatedKz);
    }
  };

  useEffect(() => { fetchQuestions(); return () => clearInterval(timerRef.current); }, []);

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><div className="w-16 h-16 border-4 border-angola-yellow border-t-angola-red rounded-full animate-spin"></div><p className="mt-6 text-angola-yellow font-black animate-pulse">CARREGANDO...</p></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8 animate-fade-in relative">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100]">
        {floatingText.map(t => <div key={t.id} className={`text-4xl font-black uppercase italic animate-float-up ${t.color}`}>{t.text}</div>)}
      </div>
      <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-3xl border border-zinc-800 sticky top-4 z-30">
        <div className="text-xl font-black">Questão {currentIndex + 1}/15</div>
        <div className="text-3xl font-black text-angola-yellow">{accumulatedKz.toLocaleString()} Kz</div>
        <div className={`text-xl font-black ${timer < 10 ? 'text-angola-red animate-pulse' : ''}`}>{timer}s</div>
      </div>
      <div className="glass-card p-10 rounded-[3rem] border-zinc-800 shadow-inner">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-zinc-100">{questions[currentIndex].question}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions[currentIndex].options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)} disabled={selectedOption !== null}
              className={`p-6 rounded-2xl text-left border-2 transition-all duration-300 font-bold ${
                selectedOption === null ? 'border-zinc-800 bg-zinc-900/40 hover:border-angola-yellow hover:scale-[1.02]' 
                : i === questions[currentIndex].correctAnswer ? 'border-green-500 bg-green-500/20 text-green-400' 
                : i === selectedOption ? 'border-angola-red bg-angola-red/20 text-angola-red' 
                : 'border-zinc-800 opacity-40'}`}>
              <span className="text-zinc-600 mr-4 font-mono">{String.fromCharCode(65 + i)})</span>
              <span className="text-lg">{opt}</span>
            </button>
          ))}
        </div>
      </div>
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-lg p-10 rounded-[3.5rem] border-zinc-700 text-center shadow-2xl">
            <h3 className={`text-4xl font-black italic uppercase mb-8 ${selectedOption === questions[currentIndex].correctAnswer ? 'text-green-500' : 'text-angola-red'}`}>{selectedOption === questions[currentIndex].correctAnswer ? '✓ CORRETO!' : 'ERRASTE!'}</h3>
            <p className="text-zinc-200 leading-relaxed italic text-sm mb-8">"{questions[currentIndex].curiosity}"</p>
            <button onClick={next} className="w-full py-5 bg-angola-yellow text-black font-black rounded-2xl uppercase shadow-xl">PRÓXIMA QUESTÃO</button>
          </div>
        </div>
      )}
      <button onClick={onQuit} className="text-zinc-700 hover:text-zinc-500 font-black uppercase tracking-widest text-[10px] py-4 w-full">Sair do Jogo</button>
    </div>
  );
};