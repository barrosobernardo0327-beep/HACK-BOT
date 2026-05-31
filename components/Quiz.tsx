
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhrase, setLoadingPhrase] = useState("A ligar ao servidor de recompensas angolano...");

  // Novos Estados Gamificados Super Premium
  const [answersHistory, setAnswersHistory] = useState<('correct' | 'wrong' | 'pending')[]>(Array(15).fill('pending'));
  const [streak, setStreak] = useState(0);
  const [spectatorsCount, setSpectatorsCount] = useState(1480);
  const [currentComment, setCurrentComment] = useState("A torcida angolana está ligada! Mostra o teu valor! 🇦🇴");

  const timerRef = useRef<any>(null);

  // Rolagem automática para o topo ao avançar perguntas ou carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentIndex, isLoading]);

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
    setLoadingProgress(0);
    setLoadingPhrase("A ligar ao servidor de recompensas angolano...");

    // Começar a gerar ou buscar as perguntas em paralelo
    const questionsPromise = generateQuizQuestions(Difficulty.INTERMEDIATE);

    const totalTime = 5000; // Exatamente 5 segundos de processamento!
    const intervalTime = 100;
    const steps = totalTime / intervalTime; // 50 passos
    let currentStep = 0;

    const phrases = [
      { max: 20, text: "A ligar ao servidor de recompensas angolano..." },
      { max: 40, text: "A carregar 15 perguntas de cultura e tradição..." },
      { max: 60, text: "A preparar saldo de 10.000 Kz por resposta certa..." },
      { max: 80, text: "A verificar autenticidade das chaves fiscais..." },
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

    // Esperar simultaneamente pelo fim dos 5 segundos E o carregamento das perguntas
    const [data] = await Promise.all([
      questionsPromise,
      new Promise(resolve => setTimeout(resolve, totalTime))
    ]);

    clearInterval(progressInterval);
    setQuestions(data.slice(0, 15));
    setIsLoading(false);
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(30);
    // Periodicamente muda os espectadores levemente para dar dinamismo orgânico
    timerRef.current = setInterval(() => {
      setTimer(p => { 
        if (p <= 1) { 
          handleAnswer(-1); 
          return 0; 
        } 
        // Flutuação orgânica do contador de pessoas a assistir
        setSpectatorsCount(s => s + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 8 + 1));
        return p - 1; 
      });
    }, 1000);
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
      const gain = 10000; // 10.000 Kz por quiz correto
      setAccumulatedKz(p => p + gain);
      setCorrectAnswersCount(p => p + 1);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Aumento substancial na audiência por sucesso consecutivo
      setSpectatorsCount(s => s + Math.floor(Math.random() * 320 + 150));
      
      if (newStreak >= 2) {
        addFloatingText(`🔥 COMBO ${newStreak}x! +10.000 Kz`, "text-yellow-400 font-extrabold");
      } else {
        addFloatingText(`+10.000 Kz`, "text-green-500 font-black");
      }

      const correctPhrases = [
        "Mário Manuel: QUE CRAQUE! Conhece mesmo a nossa terra! 🔥",
        "Gervásio: É isso kamba! +10.000 Kz directo para o bolso!",
        "Sílvia Neto: Sou Angolano com muito orgulho! Cabeça cheia! 🤩",
        "Caxito_Boy: Essa foi brincadeira de crianças para quem estuda!",
        "Tandala: Ele sabe tudo kkk, lenda viva coroada! 👑",
        "Yuri Capolo: Assim as férias de dezembro já estão totalmente pagas!",
        "Ndala_Huambo: Sem hipóteses para a concorrência! Brilha mano! 🎉"
      ];
      setCurrentComment(correctPhrases[Math.floor(Math.random() * correctPhrases.length)]);
    } else {
      playSound('loss');
      setWrongAnswersCount(p => p + 1);
      setStreak(0);
      
      // Perda de alguma audiência ao errar
      setSpectatorsCount(s => Math.max(850, s - Math.floor(Math.random() * 190 + 90)));
      addFloatingText("ERROU!", "text-angola-red font-black");

      const incorrectPhrases = [
        "Beto Lobito: Eiaaaa! Bloqueou de repente poxa! 😭",
        "Clara Santos: Ah pá, vacilou logo no mais fácil!",
        "Nara_Huambo: Não faz mal mano, foca na próxima pergunta! 🙏",
        "Dinis C.: Kkkk a pressão do relógio faz tremer os dedos!",
        "Zola: Uii k dor, essa eu sabia de cor no Semáforo!",
        "Bernardo_Kz: Calma mano! Tu consegues recuperar nos próximos!"
      ];
      setCurrentComment(incorrectPhrases[Math.floor(Math.random() * incorrectPhrases.length)]);
    }

    setAnswersHistory(prev => {
      const copy = [...prev];
      copy[currentIndex] = isCorrect ? 'correct' : 'wrong';
      return copy;
    });

    setShowFeedback(true);
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      startTimer();
      
      // Novo comentário instigante da audiência na transição da pergunta
      const transitions = [
        "Yara: Vamos à próxima! O campeonato está lindo!",
        "Adilson: Mostra o que vale, a herança é nossa!",
        "Salo Caxito: Quero ver qual é o próximo tema de Angola!",
        "Nzinga: O tempo é curto, foca aí kamba!",
        "Kiesse: Força herói! Estamos todos na torcida viva!"
      ];
      setCurrentComment(transitions[Math.floor(Math.random() * transitions.length)]);
    } else {
      onComplete(correctAnswersCount * 10, correctAnswersCount, accumulatedKz);
    }
  };

  useEffect(() => { fetchQuestions(); return () => clearInterval(timerRef.current); }, []);

  if (isLoading || questions.length === 0 || !questions[currentIndex]) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4 py-12 animate-zoom-in">
      <div className="glass-card w-full p-8 md:p-12 rounded-[4rem] border-zinc-800 text-center shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-angola-yellow rounded-full opacity-10 blur-2xl"></div>
        
        {/* Animated spinner */}
        <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-zinc-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-angola-yellow border-t-angola-red rounded-full animate-spin"></div>
          <span className="text-3xl animate-bounce">🇦🇴</span>
        </div>

        {/* Processing badge */}
        <span className="text-[10px] bg-red-600/10 text-angola-red border border-red-600/20 px-4 py-1 rounded-full font-black uppercase tracking-[0.2em] mb-4 inline-block animate-pulse">
          A Processar...
        </span>

        {/* Title */}
        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
          PREPARANDO CAMPEONATO
        </h3>

        {/* Active Phrase */}
        <p className="text-zinc-400 font-bold min-h-[48px] text-sm px-2 mb-8 leading-relaxed">
          {loadingPhrase}
        </p>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-black uppercase tracking-wider text-zinc-500">
            <span>Servidor Central</span>
            <span className="text-angola-yellow">{loadingProgress}%</span>
          </div>
          <div className="h-4 w-full bg-zinc-950 rounded-full overflow-hidden p-1 border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-angola-red to-angola-yellow rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(248,211,8,0.3)]"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Extra notice */}
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-8 italic">
          Ganho Máximo Possível: <span className="text-green-500 font-black">150.000 Kz</span>
        </p>
      </div>
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

      {/* Top sticky live dashboard bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/95 p-5 rounded-3xl border border-zinc-800 sticky top-4 z-30 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
          <div className="flex gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Questão</span>
              <div className="text-lg font-black">{currentIndex + 1}<span className="text-zinc-600">/15</span></div>
            </div>
            <div className="flex flex-col border-l border-zinc-800 pl-3">
              <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">Acertos</span>
              <div className="text-lg font-black text-green-500">{correctAnswersCount}</div>
            </div>
            <div className="flex flex-col border-l border-zinc-800 pl-3">
              <span className="text-[9px] text-angola-red font-black uppercase tracking-widest">Erros</span>
              <div className="text-lg font-black text-angola-red">{wrongAnswersCount}</div>
            </div>
          </div>

          {/* Live broadcast stream simulation badge */}
          <div className="bg-red-600/10 border border-red-600/30 px-3 py-1.5 rounded-full text-[9px] font-black text-white flex items-center gap-1.5 tracking-wider uppercase select-none shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
            <span>EM DIRETO • {spectatorsCount.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Animated Combo Streak indicator */}
        <div className="flex flex-col items-center">
          {streak >= 2 ? (
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-3 py-1 rounded-full text-[9px] font-black text-black tracking-widest uppercase mb-1 flex items-center gap-1 shadow-lg animate-bounce">
              🔥 COMBO x{streak}
            </div>
          ) : (
            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Saldo do Jogo</span>
          )}
          <div className="text-3xl font-black text-angola-yellow hover:scale-105 transition-transform drop-shadow-md leading-none">
            {accumulatedKz.toLocaleString()} <span className="text-xs">Kz</span>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-zinc-800 sm:border-t-0">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Tempo Limite</span>
            <div className={`text-lg font-black ${timer < 10 ? 'text-angola-red animate-pulse scale-110' : 'text-white'}`}>{timer}s</div>
          </div>
        </div>
      </div>

      {/* QUESTION PROGRESS MAP (Horizontal Stepper of Pins representing 15 questions) */}
      <div className="bg-zinc-950 p-4 rounded-3xl border border-zinc-900 shadow-inner">
        <div className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-3 text-left pl-1 flex justify-between items-center">
          <span>MAPA DE PROGRESSÃO AO PRÉMIO MÁXIMO</span>
          <span className="text-angola-yellow">Rumo aos 150.000 Kz</span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-15 gap-1 md:gap-1.5">
          {answersHistory.map((status, index) => {
            let innerContent = String(index + 1);
            let cssClass = "bg-zinc-900 border-zinc-800 text-zinc-500";
            
            if (index === currentIndex && status === 'pending') {
              cssClass = "bg-yellow-500/20 border-angola-yellow text-angola-yellow font-extrabold shadow-md ring-2 ring-angola-yellow/40 animate-pulse";
              innerContent = "★";
            } else if (status === 'correct') {
              cssClass = "bg-green-600/20 border-green-500 text-green-400 font-black";
              innerContent = "✓";
            } else if (status === 'wrong') {
              cssClass = "bg-red-600/20 border-red-500 text-red-400 font-semibold";
              innerContent = "✗";
            }
            
            return (
              <div key={index} title={`Questão ${index + 1}`} className={`h-8 rounded-lg border flex items-center justify-center font-mono text-xs transition-all ${cssClass} hover:scale-105 duration-100 select-none`}>
                {innerContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Question Plate Glass Card */}
      <div className="glass-card p-6 md:p-12 rounded-[3.5rem] border-zinc-800 shadow-2xl relative overflow-hidden space-y-8">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none">
          <span className="text-[12rem]">🇦🇴</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[9px] bg-zinc-900 hover:bg-zinc-800 transition-colors text-angola-yellow px-4 py-1.5 rounded-full font-black uppercase border border-zinc-800 tracking-wider">
            {questions[currentIndex].category}
          </span>
          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
            VALOR: 10.000 Kz
          </span>
        </div>

        <h2 className="text-xl md:text-3 text-3xl font-black text-zinc-100 leading-snug drop-shadow-sm italic text-left">
          {questions[currentIndex].question}
        </h2>
        
        {/* Interactive Live Audience Comment Bubble integrated directly on core plate */}
        <div className="bg-zinc-950/85 border border-zinc-900 rounded-3xl p-4 md:p-5 flex gap-4 items-center text-xs text-left shadow-lg scale-100 hover:border-zinc-800 transition-all">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shrink-0 select-none shadow">
            💬
          </div>
          <div>
            <span className="text-zinc-500 font-extrabold uppercase text-[9px] block tracking-wider mb-0.5">Torcida Ao Vivo em Angola</span>
            <span className="text-zinc-200 font-bold italic block text-sm select-all">"{currentComment}"</span>
          </div>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {questions[currentIndex].options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(i)} disabled={selectedOption !== null}
              className={`p-5 sm:p-6 rounded-3xl text-left border-4 transition-all duration-200 font-black text-sm sm:text-base flex items-center gap-4 ${
                selectedOption === null 
                  ? 'border-zinc-800 bg-zinc-900/60 hover:border-angola-yellow hover:scale-[1.01] hover:bg-zinc-900 shadow-lg' 
                  : i === questions[currentIndex].correctAnswer 
                    ? 'border-green-500 bg-green-500/20 text-green-400 scale-[1.03] z-10' 
                    : i === selectedOption 
                      ? 'border-angola-red bg-angola-red/20 text-angola-red animate-shake' 
                      : 'border-zinc-900 opacity-20'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                selectedOption === null ? 'bg-zinc-800 text-zinc-300' : i === questions[currentIndex].correctAnswer ? 'bg-green-500 text-black font-extrabold' : 'bg-zinc-900 text-zinc-700'
              }`}>{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {showFeedback && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/92 backdrop-blur-lg animate-fade-in">
          <div className="glass-card w-full max-w-lg p-10 md:p-12 rounded-[4rem] border-zinc-700 text-center shadow-2xl animate-bounce-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
            
            <div className="mb-6">
              {selectedOption === questions[currentIndex].correctAnswer ? (
                <div className="space-y-2">
                  <div className="text-7xl mb-4">🏆</div>
                  <h3 className="text-green-500 text-4xl sm:text-5xl font-black italic uppercase tracking-tighter">CORRECTO!</h3>
                  <p className="text-white font-black text-xl sm:text-2xl mt-1">+10.000 Kz Adicionados ao Balanço</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-7xl mb-4">❌</div>
                  <h3 className="text-angola-red text-4xl sm:text-5xl font-black italic uppercase tracking-tighter">ERRADO!</h3>
                  <p className="text-zinc-400 font-bold">A resposta certa era:<br/>
                    <span className="text-white text-lg sm:text-xl uppercase mt-2 block border-b border-zinc-900 pb-2">{questions[currentIndex].options[questions[currentIndex].correctAnswer]}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 p-5 bg-zinc-950 border border-zinc-900 rounded-3xl text-left border-l-4 border-l-angola-yellow shadow-inner">
              <p className="text-[10px] font-black text-angola-yellow uppercase mb-2 tracking-widest flex items-center gap-2">
                <span>💡</span> SABIAS QUE?
              </p>
              <p className="text-zinc-100 leading-relaxed italic text-xs sm:text-sm font-semibold">"{questions[currentIndex].curiosity}"</p>
            </div>

            <button onClick={next} className="mt-8 w-full py-5 btn-ganho text-black font-black rounded-3xl uppercase tracking-widest text-lg hover:scale-[1.03] transition-transform shadow-lg animate-pulse">
              CONTINUAR GANHANDO
            </button>
          </div>
        </div>
      )}

      <button onClick={onQuit} className="text-zinc-700 hover:text-angola-red font-black uppercase tracking-widest text-[9px] py-4 w-full transition-colors flex items-center justify-center gap-2">
        <span>🏃</span> Desistir e salvar prémio atual
      </button>
    </div>
  );
};
