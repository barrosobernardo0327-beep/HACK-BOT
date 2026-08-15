import React, { useState, useEffect, useRef } from 'react';
import { generateQuizQuestions } from '../services/gemini';
import { QuizQuestion, Difficulty } from '../types';
import { User as UserIcon, Scissors, FastForward, Check, X, Award, Lightbulb } from 'lucide-react';

interface QuizProps {
  userName?: string;
  onComplete: (score: number, correctCount: number, kz: number) => void;
  onQuit: () => void;
  triggerNotification?: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ userName = "Ffdd", onComplete, onQuit }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(30);
  const [accumulatedKz, setAccumulatedKz] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhrase, setLoadingPhrase] = useState("A ligar ao servidor de recompensas angolano...");

  // Power-ups (50/50 e Pular)
  const [fiftyFiftyUses, setFiftyFiftyUses] = useState(2);
  const [skipUses, setSkipUses] = useState(2);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

  const timerRef = useRef<any>(null);

  // Rolagem automática para o topo ao avançar perguntas, abrir feedback ou carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, isLoading, showFeedback]);

  // Sistema de som sintetizado para feedback auditivo
  const playSound = (type: 'win' | 'loss' | 'powerup') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.linearRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      } else if (type === 'loss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      }

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingPhrase("A ligar ao servidor de recompensas angolano...");

    const questionsPromise = generateQuizQuestions(Difficulty.INTERMEDIATE);

    const totalTime = 4000;
    const intervalTime = 100;
    const steps = totalTime / intervalTime;
    let currentStep = 0;

    const phrases = [
      { max: 25, text: "A ligar ao servidor de recompensas angolano..." },
      { max: 50, text: "A carregar 10 perguntas de cultura e tradição..." },
      { max: 75, text: "A preparar saldo de 15.000 Kz por resposta certa..." },
      { max: 100, text: "Sincronização concluída! A iniciar o Quiz..." }
    ];

    const progressInterval = setInterval(() => {
      currentStep++;
      const progressValue = Math.min(Math.round((currentStep / steps) * 100), 100);
      setLoadingProgress(progressValue);

      const matchedPhrase = phrases.find(p => progressValue <= p.max);
      if (matchedPhrase) {
        setLoadingPhrase(matchedPhrase.text);
      }
    }, intervalTime);

    const [data] = await Promise.all([
      questionsPromise,
      new Promise(resolve => setTimeout(resolve, totalTime))
    ]);

    clearInterval(progressInterval);
    setQuestions(data.slice(0, 10));
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

  // Ativação do Power-up 50/50
  const handleFiftyFifty = () => {
    if (fiftyFiftyUses <= 0 || selectedOption !== null || !questions[currentIndex]) return;
    const currentQ = questions[currentIndex];
    const incorrectIndices = currentQ.options
      .map((_, i) => i)
      .filter(i => i !== currentQ.correctAnswer);

    // Seleciona 2 opções incorretas para ocultar
    const shuffled = [...incorrectIndices].sort(() => 0.5 - Math.random());
    const toHide = shuffled.slice(0, 2);
    setHiddenOptions(toHide);
    setFiftyFiftyUses(prev => prev - 1);
    playSound('powerup');
  };

  // Ativação do Power-up Pular
  const handleSkip = () => {
    if (skipUses <= 0 || selectedOption !== null) return;
    setSkipUses(prev => prev - 1);
    playSound('powerup');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setHiddenOptions([]);
      startTimer();
    } else {
      onComplete(correctAnswersCount * 10, correctAnswersCount, accumulatedKz);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(idx);
    
    const isCorrect = idx === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      playSound('win');
      const gain = 15000; // 15.000 Kz por quiz correto
      setAccumulatedKz(p => p + gain);
      setCorrectAnswersCount(p => p + 1);
    } else {
      playSound('loss');
      setWrongAnswersCount(p => p + 1);
    }

    setShowFeedback(true);
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setHiddenOptions([]);
      startTimer();
    } else {
      onComplete(correctAnswersCount * 10, correctAnswersCount, accumulatedKz);
    }
  };

  useEffect(() => { 
    fetchQuestions(); 
    return () => clearInterval(timerRef.current); 
  }, []);

  // Tela de Carregamento
  if (isLoading || questions.length === 0 || !questions[currentIndex]) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#4a0808] via-[#240404] to-[#0d0101] text-white flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 md:p-10 rounded-3xl bg-[#1c0505]/95 border border-[#3e0f0f] text-center shadow-2xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-[#F8D308] to-red-600"></div>
          
          {/* Spinner */}
          <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[#300a0a] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#F8D308] border-t-red-600 rounded-full animate-spin"></div>
            <span className="text-2xl">🇦🇴</span>
          </div>

          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
            PREPARANDO QUIZ
          </h3>

          <p className="text-zinc-400 font-medium min-h-[44px] text-xs px-2 mb-6 leading-relaxed">
            {loadingPhrase}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Sincronizando</span>
              <span className="text-[#F8D308]">{loadingProgress}%</span>
            </div>
            <div className="h-3 w-full bg-[#120303] rounded-full overflow-hidden p-0.5 border border-[#300a0a]">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-[#F8D308] rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(248,211,8,0.4)]"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const timerRadius = 32;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerStrokeDashoffset = timerCircumference - (timer / 30) * timerCircumference;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#520909] via-[#240404] to-[#0a0101] text-white flex flex-col items-center justify-start p-4 sm:p-6 select-none relative overflow-hidden">
      
      {/* Background soft red ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-4 relative z-10">
        
        {/* 1. TOP HEADER: User Info on Left & Pergunta Count on Right */}
        <div className="flex items-center justify-between w-full pt-1 pb-1">
          
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#d4af37]/80 bg-[#250808] flex items-center justify-center text-[#F8D308] shadow-md">
              <UserIcon className="w-6 h-6 text-[#F8D308]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white font-extrabold text-base leading-tight tracking-wide">
                {userName || "Ffdd"}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-[#F8D308] mt-0.5">
                <span className="text-sm">🪙</span>
                <span>{accumulatedKz.toLocaleString()} Kz</span>
              </div>
            </div>
          </div>

          {/* Question Badge Card */}
          <div className="bg-[#240707]/90 border border-[#481212] px-5 py-2 rounded-2xl flex flex-col items-center shadow-lg">
            <span className="text-[11px] font-bold text-rose-300/80 uppercase tracking-wide">
              Pergunta
            </span>
            <div className="text-xl font-black leading-none mt-1">
              <span className="text-white">{currentIndex + 1}</span>
              <span className="text-zinc-500">/{questions.length}</span>
            </div>
          </div>

        </div>

        {/* 2. PROGRESS BAR & PERCENTAGE */}
        <div className="w-full space-y-1.5 pt-1">
          <div className="w-full h-3 bg-[#1e0606] rounded-full overflow-hidden p-0.5 border border-[#3e1010]">
            <div 
              className="h-full bg-gradient-to-r from-[#F8D308] to-[#ffd736] rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(248,211,8,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-center text-xs font-black text-white tracking-wide">
            {progressPercent}%
          </div>
        </div>

        {/* 3. ACCUMULATED BALANCE & NEXT PRIZE CARD */}
        <div className="w-full bg-[#1c0505]/95 border border-[#3e1010] rounded-3xl p-5 shadow-2xl backdrop-blur-sm flex justify-between items-center">
          <div className="text-left">
            <span className="text-[11px] font-extrabold uppercase text-zinc-400 tracking-wider block mb-1">
              SALDO ACUMULADO
            </span>
            <div className="text-3xl font-black text-[#F8D308] tracking-tight leading-none">
              {accumulatedKz.toLocaleString()} Kz
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-zinc-300 block mb-1">
              Próximo prêmio
            </span>
            <div className="text-xl font-black text-white tracking-tight leading-none">
              +15 000 Kz
            </div>
          </div>
        </div>

        {/* 4. CIRCULAR COUNTDOWN TIMER */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center my-2">
          <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={timerRadius}
              className="stroke-[#2d0a0a]"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="40"
              cy="40"
              r={timerRadius}
              className="stroke-[#F8D308] transition-all duration-1000 ease-linear"
              strokeWidth="5"
              strokeDasharray={timerCircumference}
              strokeDashoffset={timerStrokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-[#F8D308] drop-shadow-[0_0_8px_rgba(248,211,8,0.5)]">
              {timer}
            </span>
          </div>
        </div>

        {/* 5. POWER-UPS / LIFELINES (50/50 & PULAR) */}
        <div className="flex justify-center items-center gap-4 w-full my-2">
          
          {/* 50/50 Button */}
          <button
            type="button"
            onClick={handleFiftyFifty}
            disabled={fiftyFiftyUses <= 0 || selectedOption !== null || hiddenOptions.length > 0}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1c0505] border border-[#3e1010] text-[#F8D308] font-black text-sm shadow-lg transition-all active:scale-95 duration-150 ${
              fiftyFiftyUses > 0 && selectedOption === null && hiddenOptions.length === 0
                ? 'hover:border-[#F8D308] hover:bg-[#280808] cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <Scissors className="w-4 h-4 text-[#F8D308]" />
            <span>50/50</span>
            <span className="flex gap-1 ml-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${fiftyFiftyUses >= 1 ? 'bg-[#F8D308]' : 'bg-zinc-700'}`} />
              <span className={`w-1.5 h-1.5 rounded-full ${fiftyFiftyUses >= 2 ? 'bg-[#F8D308]' : 'bg-zinc-700'}`} />
            </span>
          </button>

          {/* Pular Button */}
          <button
            type="button"
            onClick={handleSkip}
            disabled={skipUses <= 0 || selectedOption !== null}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1c0505] border border-[#3e1010] text-[#F8D308] font-black text-sm shadow-lg transition-all active:scale-95 duration-150 ${
              skipUses > 0 && selectedOption === null
                ? 'hover:border-[#F8D308] hover:bg-[#280808] cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            <FastForward className="w-4 h-4 text-[#F8D308]" />
            <span>Pular</span>
            <span className="flex gap-1 ml-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${skipUses >= 1 ? 'bg-[#F8D308]' : 'bg-zinc-700'}`} />
              <span className={`w-1.5 h-1.5 rounded-full ${skipUses >= 2 ? 'bg-[#F8D308]' : 'bg-zinc-700'}`} />
            </span>
          </button>

        </div>

        {/* 6. QUESTION CARD */}
        <div className="w-full bg-[#1c0505]/95 border border-[#3e1010] rounded-3xl p-6 sm:p-8 shadow-2xl text-center min-h-[110px] flex items-center justify-center">
          <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed tracking-tight">
            {currentQ.question}
          </h2>
        </div>

        {/* 7. OPTIONS (ANSWER CARDS) */}
        <div className="w-full space-y-3 pt-1">
          {currentQ.options.map((optionText, idx) => {
            const isHidden = hiddenOptions.includes(idx);
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswer;
            
            let cardClasses = "bg-[#1c0505] border-[#3e1010] hover:border-[#F8D308]/70 hover:bg-[#280707]";
            let badgeClasses = "bg-[#F8D308] text-black";

            if (selectedOption !== null) {
              if (isCorrect) {
                cardClasses = "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                badgeClasses = "bg-emerald-500 text-white";
              } else if (isSelected) {
                cardClasses = "bg-rose-950/80 border-rose-600 text-rose-200 ring-2 ring-rose-600/50 animate-shake";
                badgeClasses = "bg-rose-600 text-white";
              } else {
                cardClasses = "bg-[#140303] border-[#250707] opacity-30";
                badgeClasses = "bg-zinc-800 text-zinc-500";
              }
            }

            if (isHidden) {
              return (
                <div
                  key={idx}
                  className="w-full bg-[#140303]/40 border border-[#200505] rounded-2xl p-3 sm:p-4 opacity-15 pointer-events-none transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-11 h-11 rounded-xl bg-zinc-900 text-zinc-700 font-black text-lg flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-zinc-700 font-bold text-base sm:text-lg line-through">
                      Opção eliminada (50/50)
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswer(idx)}
                disabled={selectedOption !== null}
                className={`w-full border rounded-2xl p-3 sm:p-4 flex items-center gap-4 transition-all duration-200 text-left shadow-lg group active:scale-[0.98] ${cardClasses}`}
              >
                {/* Letter badge */}
                <span className={`w-11 h-11 rounded-xl font-black text-lg flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${badgeClasses}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                
                {/* Option text */}
                <span className="text-white font-bold text-base sm:text-lg flex-1 leading-snug">
                  {optionText}
                </span>

                {selectedOption !== null && isCorrect && (
                  <Check className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
                )}
                {selectedOption !== null && isSelected && !isCorrect && (
                  <X className="w-6 h-6 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* 8. QUIT BUTTON */}
        <div className="pt-4 pb-6">
          <button 
            type="button"
            onClick={onQuit} 
            className="text-zinc-500 hover:text-rose-400 font-extrabold uppercase tracking-widest text-[11px] transition-colors py-2 w-full flex items-center justify-center gap-2"
          >
            <span>🏃</span> Voltar ao Menu Principal
          </button>
        </div>

      </div>

      {/* 9. FEEDBACK MODAL (Result of answer - matching reference design) */}
      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
          
          {/* Confetti / Sparkles floating in the background for correct answers */}
          {selectedOption === currentQ.correctAnswer && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[15%] left-[20%] w-2.5 h-2.5 bg-yellow-400 rotate-45 rounded-sm opacity-80 animate-ping" />
              <div className="absolute top-[25%] right-[22%] w-3 h-1.5 bg-emerald-400 -rotate-12 opacity-80" />
              <div className="absolute top-[40%] left-[10%] w-2 h-3 bg-amber-400 rotate-12 opacity-75" />
              <div className="absolute top-[35%] right-[12%] w-2 h-2 bg-yellow-300 rounded-full opacity-90" />
              <div className="absolute bottom-[30%] left-[18%] w-3 h-2 bg-emerald-500 rotate-45 opacity-80" />
              <div className="absolute bottom-[20%] right-[15%] w-2.5 h-2.5 bg-yellow-400 rotate-12 opacity-75" />
              <div className="absolute top-[18%] right-[35%] w-2 h-2 bg-yellow-500 rounded-sm opacity-70" />
              <div className="absolute bottom-[35%] right-[30%] w-2 h-3 bg-emerald-400 -rotate-45 opacity-80" />
            </div>
          )}

          {/* Modal Container */}
          <div className="w-full max-w-[360px] sm:max-w-sm rounded-[2rem] bg-[#0c0404] border border-[#2a0c0c] p-6 sm:p-8 text-center shadow-[0_15px_40px_rgba(0,0,0,0.9)] relative overflow-hidden animate-zoom-in">
            
            {/* Subtle Close 'X' Button on top right */}
            <button
              type="button"
              onClick={next}
              className="absolute top-5 right-5 text-zinc-600 hover:text-zinc-300 transition-colors p-1"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedOption === currentQ.correctAnswer ? (
              /* VICTORY VIEW - Exact clone of the reference image */
              <div className="flex flex-col items-center">
                
                {/* Money Bag Icon with glowing background */}
                <div className="relative mb-3 mt-1 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#F8D308]/10 blur-xl absolute inset-0 m-auto" />
                  <span className="text-5xl sm:text-6xl drop-shadow-[0_4px_12px_rgba(248,211,8,0.4)]">
                    💰
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[#F8D308] text-2xl sm:text-3xl font-black tracking-tight mb-1">
                  Parabéns!
                </h3>

                {/* Subtitle */}
                <p className="text-zinc-400 text-sm font-medium mb-3">
                  Você ganhou
                </p>

                {/* Reward Amount */}
                <div className="text-[#F8D308] text-3xl sm:text-4xl font-black tracking-tight mb-2">
                  15 000 KZS
                </div>

                {/* Sub-label */}
                <p className="text-zinc-500 text-xs sm:text-sm font-medium mb-6">
                  Adicionado ao seu saldo
                </p>

                {/* Curiosity Note (compact & elegant) */}
                {currentQ.curiosity && (
                  <div className="w-full mb-6 p-3 bg-[#150505] border border-[#2e0b0b] rounded-xl text-left">
                    <p className="text-[10px] font-bold text-[#F8D308] uppercase mb-0.5 tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-[#F8D308]" /> Sabias que?
                    </p>
                    <p className="text-zinc-300 italic text-[11px] leading-snug">
                      "{currentQ.curiosity}"
                    </p>
                  </div>
                )}

                {/* Continuar Action Button */}
                <button
                  type="button"
                  onClick={next}
                  className="w-full py-4 px-6 bg-[#FFA800] hover:bg-[#FFB726] active:scale-95 text-black font-black text-base sm:text-lg rounded-2xl sm:rounded-full tracking-wide shadow-[0_4px_20px_rgba(255,168,0,0.35)] transition-all cursor-pointer"
                >
                  Continuar
                </button>

              </div>
            ) : (
              /* INCORRECT ANSWER VIEW */
              <div className="flex flex-col items-center">
                
                <div className="mb-3 mt-1 text-5xl">
                  ❌
                </div>

                <h3 className="text-rose-500 text-2xl sm:text-3xl font-black tracking-tight mb-2">
                  Não foi desta vez!
                </h3>

                <p className="text-zinc-400 text-xs sm:text-sm mb-1">
                  A resposta correta era:
                </p>

                <div className="text-white text-base sm:text-lg font-bold bg-[#1a0505] border border-[#3e0f0f] rounded-xl px-4 py-2 w-full my-2 text-center text-[#F8D308]">
                  {currentQ.options[currentQ.correctAnswer]}
                </div>

                {currentQ.curiosity && (
                  <div className="w-full my-3 p-3 bg-[#150505] border border-[#2e0b0b] rounded-xl text-left">
                    <p className="text-[10px] font-bold text-[#F8D308] uppercase mb-0.5 tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-[#F8D308]" /> Sabias que?
                    </p>
                    <p className="text-zinc-300 italic text-[11px] leading-snug">
                      "{currentQ.curiosity}"
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={next}
                  className="w-full mt-4 py-3.5 px-6 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold text-base rounded-2xl transition-all cursor-pointer"
                >
                  Continuar
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
