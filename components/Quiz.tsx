
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
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
  const [floatingText, setFloatingText] = useState<{ id: number; text: string; color: string }[]>([]);

  const timerRef = useRef<any>(null);

  // Sistema de som sintetizado para impacto
  const playSound = (type: 'win' | 'loss') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.linearRampToValueAtTime(783.99, ctx.currentTime + 0.1); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
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
      setTimer(p => { 
        if (p <= 1) { 
          handleAnswer(-1); 
          return 0; 
        } 
        return p - 1; 
      });
    }, 1000);
  };

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(idx);
    
    const isCorrect = idx === questions[currentIndex].correctAnswer;
    
    if (isCorrect) {
      playSound('win');
      const gain = 10000; // 10.000 Kz por quiz correto
      setAccumulatedKz(p => p + gain);
      setCorrectAnswersCount(p => p + 1);
      addFloatingText(`+10.000 Kz`, "text-green-500 font-black");
    } else {
      playSound('loss');
      setWrongAnswersCount(p => p + 1);
      addFloatingText("ERROU!", "text-angola-red font-black");
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
      onComplete(correctAnswersCount * 10, correctAnswersCount, accumulatedKz);
    }
  };

  useEffect(() => { fetchQuestions(); return () => clearInterval(timerRef.current); }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 border-4 border-angola-yellow border-t-angola-red rounded-full animate-spin"></div>
      <p className="mt-6 text-angola-yellow font-black animate-pulse tracking-widest">GERANDO DESAFIOS CULTURAIS...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8 animate-fade-in relative">
      {/* Floating Gain indicators */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[100]">
        {floatingText.map(t => (
          <div key={t.id} className={`text-5xl font-black uppercase italic animate-float-up ${t.color} drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]`}>
            {t.text}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800 sticky top-4 z-30 shadow-2xl backdrop-blur-md">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Questão</span>
            <div className="text-xl font-black">{currentIndex + 1}<span className="text-zinc-600">/15</span></div>
          </div>
          <div className="flex flex-col border-l border-zinc-800 pl-4">
            <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Ganhos</span>
            <div className="text-xl font-black text-green-500">{correctAnswersCount}</div>
          </div>
          <div className="flex flex-col border-l border-zinc-800 pl-4">
            <span className="text-[10px] text-angola-red font-black uppercase tracking-widest">Perdas</span>
            <div className="text-xl font-black text-angola-red">{wrongAnswersCount}</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Saldo do Jogo</span>
          <div className="text-4xl font-black text-angola-yellow animate-pulse drop-shadow-md">
            {accumulatedKz.toLocaleString()} <span className="text-xs">Kz</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Tempo</span>
          <div className={`text-xl font-black ${timer < 10 ? 'text-angola-red animate-pulse' : 'text-white'}`}>{timer}s</div>
        </div>
      </div>

      <div className="glass-card p-8 md:p-12 rounded-[3.5rem] border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><span className="text-8xl">🇦🇴</span></div>
        <span className="text-[10px] bg-zinc-800 text-angola-yellow px-4 py-1 rounded-full font-black uppercase mb-6 inline-block border border-zinc-700">
          {questions[currentIndex].category}
        </span>
        <h2 className="text-2xl md:text-4xl font-black mb-12 text-zinc-100 leading-tight drop-shadow-sm italic">
          {questions[currentIndex].question}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions[currentIndex].options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)} disabled={selectedOption !== null}
              className={`p-6 rounded-3xl text-left border-4 transition-all duration-200 font-black text-lg flex items-center gap-4 ${
                selectedOption === null 
                  ? 'border-zinc-800 bg-zinc-900/60 hover:border-angola-yellow hover:scale-[1.02] shadow-lg' 
                  : i === questions[currentIndex].correctAnswer 
                    ? 'border-green-500 bg-green-500/20 text-green-400 scale-[1.05] z-10' 
                    : i === selectedOption 
                      ? 'border-angola-red bg-angola-red/20 text-angola-red animate-shake' 
                      : 'border-zinc-900 opacity-20'}`}>
              <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="glass-card w-full max-w-lg p-12 rounded-[4rem] border-zinc-700 text-center shadow-2xl animate-bounce-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
            
            <div className="mb-8">
              {selectedOption === questions[currentIndex].correctAnswer ? (
                <div className="space-y-2">
                  <div className="text-7xl mb-4">🏆</div>
                  <h3 className="text-green-500 text-5xl font-black italic uppercase tracking-tighter">CORRECTO!</h3>
                  <p className="text-white font-black text-2xl">+10.000 Kz Adicionados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-7xl mb-4">❌</div>
                  <h3 className="text-angola-red text-5xl font-black italic uppercase tracking-tighter">ERRADO!</h3>
                  <p className="text-zinc-400 font-bold">A resposta certa era:<br/>
                    <span className="text-white text-xl uppercase mt-2 block">{questions[currentIndex].options[questions[currentIndex].correctAnswer]}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-zinc-900/80 rounded-3xl text-left border-l-8 border-angola-yellow shadow-inner">
              <p className="text-[10px] font-black text-angola-yellow uppercase mb-2 tracking-widest flex items-center gap-2">
                <span>💡</span> Sabias que?
              </p>
              <p className="text-zinc-100 leading-relaxed italic text-sm font-medium">"{questions[currentIndex].curiosity}"</p>
            </div>

            <button onClick={next} className="mt-10 w-full py-6 btn-ganho text-black font-black rounded-3xl uppercase tracking-widest text-xl hover:scale-105 transition-transform">
              CONTINUAR GANHANDO
            </button>
          </div>
        </div>
      )}

      <button onClick={onQuit} className="text-zinc-700 hover:text-angola-red font-black uppercase tracking-widest text-[10px] py-4 w-full transition-colors flex items-center justify-center gap-2">
        <span>🏃</span> Desistir e sair do jogo
      </button>
    </div>
  );
};
