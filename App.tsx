
import React, { useState, useEffect } from 'react';
import { Quiz } from './components/Quiz';
import { GumletPlayer } from './components/GumletPlayer';
import { GameState, UserStats, WithdrawMethod, Transaction } from './types';
import heroImage from './src/assets/images/sou_angolano_hero_1779623430505.png';
import { initMetaPixel, trackInitiateCheckout, trackAddPaymentInfo, trackPurchase, getPixelId } from './src/pixel';

const BANCOS_ANGOLA = [
  { id: 'BAI', name: 'BAI - Banco Angolano de Investimentos', code: '94' },
  { id: 'BPC', name: 'BPC - Banco de Poupança e Crédito', code: '95' },
  { id: 'BIC', name: 'Banco BIC', code: '96' },
  { id: 'SBA', name: 'Standard Bank Angola', code: '97' },
  { id: 'BEC', name: 'Banco Económico', code: '98' },
  { id: 'BFA', name: 'Banco de Fomento Angola', code: '99' },
  { id: 'ATL', name: 'Banco Atlântico', code: '93' },
  { id: 'BMA', name: 'Banco Millenium Atlântico', code: '92' }
];

const GANHADORES_EXEMPLO = [
  "Carlos Manuel", "Maria da Costa", "João Kapango", 
  "Ana de Sousa", "Pedro Benguela", "Teresa Luanda",
  "José Malanje", "Sérgio Namibe", "Katia Huambo"
];

const MOCK_CHAT_USERS = [
  "Yuri Manuel", "Jandira Santos", "Ndalu de Castro", "Bernardo Kz", "Kianda F.", 
  "Domingos António", "Josefa de Sousa", "Mateus Pedro", "Sofia Benguela", "Pedro K.", 
  "Moisés", "Adilson Capolo", "Matias Ngola", "Clélia Ndala", "Zola Fernandes", 
  "Mauro Nzaji", "Kianda Manuel", "Kiesse Santos", "Yara de Gouveia", "Nzinga Costa", 
  "Salo Caxito", "Gelson Lobito", "Tuanaza Neto", "Benvinda Cruz", "Heitor Kassanje", 
  "Valter Semedo", "Janete Cruz", "António B.", "Isabel L.", "Catarina Ndalatando", 
  "Marcos Viana", "Filipe Cabinda", "Nara de Sousa", "Simão Malanje", "Duarte Namibe"
];

const MOCK_SINGLE_COMMENTS = [
  "Acabei de pagar os 3.950 Kz e os 150.000 Kz caíram directo na minha conta! Chocadooo!",
  "Muito bom o vídeo explicativo, agora percebi o processo de libertação no BNA.",
  "Isto é sério! Glória ao criador desta plataforma, cultura nacional valorizada!",
  "Estou a assistir e a ver o saldo a ser libertado! Brutal!",
  "O vídeo explica exactamente a lei 12/23 sobre isenção de impostos. Muito bem pensado.",
  "Melhor jogo de Angola de longe! Já faturei 200.000 Kz",
  "Já paguei e já recebi o sms do multicaixa express 🤑🤑",
  "Obrigada Sou Angolano! Comprei saldo de dados para a família toda agora",
  "Basta seguir as instruções, a Kintu é o nosso portal oficial de faturação.",
  "Estava com receio, mas a verificação é mesmo obrigatória por lei.",
  "Super rápido! Valeu a pena passar o tempo a aprender sobre a nossa história.",
  "Finalmente um jogo sério que enaltece a nossa cultura angolana!",
  "Recomendo a todos! Dinheiro na conta e muito aprendizado.",
  "Minha conta do BAI recebeu em 2 minutos. Top!",
  "Já espalhei o link nos grupos da família, isto é ouro!",
  "O suporte deles é óptimo, mas nem precisei, o vídeo explica tudo de primeira.",
  "Apenas 3.950 Kz de taxa para libertar 180.000 Kz? Muito justo!",
  "Fiz agora mesmo o pagamento e o saldo já mudou de reservado para disponível, rumo ao banco!",
  "Simplesmente perfeito! Angola unida no conhecimento e nos prémios!"
];

const MOCK_CHAT_THREADS = [
  {
    messages: [
      { sender: "Sofia Benguela", text: "Quem conseguiu acertar tudo e fazer as 10 questões impecáveis?" },
      { sender: "Mauro Nzaji", text: "@Sofia Benguela Eu consegui acertar tudo! Mas tive de pensar bem na do rio Kwanza kkk." },
      { sender: "Tuanaza Neto", text: "Eu só acertei 8, mas mesmo assim fiz 120.000 Kz! Já é um bom Kwanza!" }
    ]
  },
  {
    messages: [
      { sender: "Gelson Lobito", text: "Aquela pergunta de história sobre a rainha Ginga foi um bocado difícil, vacilei e errei." },
      { sender: "Kiesse Santos", text: "@Gelson Lobito A de história exige atenção, mas acertei 9! Quase perfeito." },
      { sender: "Jandira Santos", text: "Acertei as 10 completas! O orgulho angolano e o estudo valeram a pena." }
    ]
  },
  {
    messages: [
      { sender: "Simão Malanje", text: "Fiz apenas 8 acertos por causa da pressão do cronómetro kkkk 😭" },
      { sender: "Nara de Sousa", text: "@Simão Malanje Pelo menos levaste 120.000 Kz! Vale muito a pena." },
      { sender: "Simão Malanje", text: "Simmm, já fiz a ativação e caiu em segundos!" }
    ]
  },
  {
    messages: [
      { sender: "Duarte Namibe", text: "Alguém errou a das Quedas de Kalandula? Estava na ponta da língua mas baralhei." },
      { sender: "Adilson Capolo", text: "@Duarte Namibe Eu quase falhei essa! Mas consegui 10/10 no final." },
      { sender: "Katia Huambo", text: "Eu fiz 8/10, falhei Kalandula também kkk. Mas o dinheiro já está na minha conta!" }
    ]
  },
  {
    messages: [
      { sender: "Bernardo Kz", text: "Alguém do Huambo já conseguiu tirar?" },
      { sender: "Kianda F.", text: "@Bernardo Kz Sim mano! Eu sou do Huambo, fiz com o Banco BIC e caiu agora mesmo!" },
      { sender: "Valter Semedo", text: "@Bernardo Kz Também sou do Huambo, no Express demorou nem 3 minutos." }
    ]
  },
  {
    messages: [
      { sender: "Adilson Capolo", text: "Alguém aí que usa o BAI? Quanto tempo demorou?" },
      { sender: "Benvinda Cruz", text: "@Adilson Capolo O meu no BAI caiu em menos de 1 minuto, foi super rápido!" },
      { sender: "Matias Ngola", text: "@Adilson Capolo BAI e BFA são quase instantâneos aqui." }
    ]
  },
  {
    messages: [
      { sender: "Yara de Gouveia", text: "Consigo fazer o levantamento hoje sendo domingo?" },
      { sender: "Marcos Viana", text: "@Yara de Gouveia Funciona 24h por dia, o sistema de liberação é automático pelo BNA." },
      { sender: "Kiesse Santos", text: "@Yara Sim! Eu fiz de madrugada ontem e deu super certo." }
    ]
  },
  {
    messages: [
      { sender: "Zola Fernandes", text: "Esse imposto de 5 mil Kz vai pro BNA direto?" },
      { sender: "Clélia Ndala", text: "@Zola Fernandes Sim, é a guia fiscal unificada de isenção, eles geram a fatura na Kintu." },
      { sender: "Zola Fernandes", text: "Ah excelente, entendi agora!" }
    ]
  },
  {
    messages: [
      { sender: "Janete Cruz", text: "É obrigatório pagar pela Kintu?" },
      { sender: "António B.", text: "@Janete Cruz Sim, a Kintu é o portal oficial de faturação integrada deles para o imposto." },
      { sender: "Mauro Nzaji", text: "Exatamente, é seguro e rastreável pelo código da fatura." }
    ]
  },
  {
    messages: [
      { sender: "Filipe Cabinda", text: "Epa, alguém de Cabinda que já sacou?" },
      { sender: "Isabel L.", text: "@Filipe Cabinda Já sim, manguito! Eu tirei pelo Multicaixa Express aqui em Cabinda!" },
      { sender: "Filipe Cabinda", text: "Sensacional! Vou fazer o meu agora." }
    ]
  },
  {
    messages: [
      { sender: "Catarina Ndalatando", text: "Se eu tiver saldo do BFA tem algum problema de atraso?" },
      { sender: "Nzinga Costa", text: "@Catarina Ndalatando Nenhum! BFA aceita super bem a liberação eletrônica, o meu caiu logo." }
    ]
  },
  {
    messages: [
      { sender: "Salo Caxito", text: "Eles dão comprovativo da taxa?" },
      { sender: "Heitor Kassanje", text: "@Salo Caxito Sim, a fatura sai com o número de verificação fiscal tudo certinho." }
    ]
  }
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
  const [stats, setStats] = useState<UserStats>({
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    bestScoreKz: Number(localStorage.getItem('bestKz')) || 0,
    accumulatedKz: 0
  });
  
  const [userName, setUserName] = useState('');
  const [showNameError, setShowNameError] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  
  // Estados do Novo Checkout Personalizado
  const [paymentEntity, setPaymentEntity] = useState(() => localStorage.getItem('cfg_entity') || '10116');
  const [paymentReference, setPaymentReference] = useState(() => localStorage.getItem('cfg_ref') || '976 471 332');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempEntity, setTempEntity] = useState(() => localStorage.getItem('cfg_entity') || '10116');
  const [tempReference, setTempReference] = useState(() => localStorage.getItem('cfg_ref') || '976 471 332');
  const [pixelIdState, setPixelIdState] = useState(() => localStorage.getItem('meta_pixel_id') || '');
  const [tempPixelId, setTempPixelId] = useState(() => localStorage.getItem('meta_pixel_id') || '');
  
  // Estado do comprovativo
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'analyzing' | 'verifying' | 'sptr' | 'success' | 'frozen'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'entity' | 'ref' | 'amount' | null>(null);
  const [validationCount, setValidationCount] = useState<number>(0);

  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [withdrawInput, setWithdrawInput] = useState('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(JSON.parse(localStorage.getItem('transacoes') || '[]'));
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);
  const [showFlyingNotes, setShowFlyingNotes] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(2415);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Estados do Novo Checkout Personalizado (Controlo de tempo/urgência)
  const [countdownSeconds, setCountdownSeconds] = useState(899); // 14 mins 59 secs

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Som de notificação de saque para causar impacto
  const playNotifSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nome = GANHADORES_EXEMPLO[Math.floor(Math.random() * GANHADORES_EXEMPLO.length)];
      const valor = (Math.floor(Math.random() * 40) + 10) * 10000;
      const newNotif = { id: Date.now(), text: `${nome} acabou de sacar ${valor.toLocaleString('pt-AO')} Kz!` };
      setNotifications(prev => [...prev.slice(-1), newNotif]);
      playNotifSound();
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 5000);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Inicializar o Pixel do Meta de forma cautelosa no arranque do aplicativo
  useEffect(() => {
    initMetaPixel();
    // Atualizar os estados internos do admin se houver pixel detetado na inicialização
    const activePixel = getPixelId();
    if (activePixel) {
      setPixelIdState(activePixel);
      setTempPixelId(activePixel);
    }
  }, []);

  // Efeito do Temporizador do Checkout
  useEffect(() => {
    let timer: any = null;
    if (gameState === GameState.CHECKOUT) {
      // Registo cauteloso do evento InitiateCheckout no Meta Pixel
      trackInitiateCheckout();

      timer = setInterval(() => {
        setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 899));
      }, 1000);
    } else {
      setCountdownSeconds(899);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  // Rolagem automática para o topo ao trocar de tela / gameState
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.VERIFY_TAX) {
      // Inicia com 4 mensagens aleatórias e bem distribuídas
      const initial = [];
      const shuffledComments = [...MOCK_SINGLE_COMMENTS].sort(() => 0.5 - Math.random());
      for (let i = 0; i < 4; i++) {
        const name = MOCK_CHAT_USERS[Math.floor(Math.random() * MOCK_CHAT_USERS.length)];
        initial.push({
          id: i,
          name: name,
          text: shuffledComments[i]
        });
      }
      setChatMessages(initial);

      // Flutuação de Espectadores
      const specInterval = setInterval(() => {
        setSpectatorCount(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 6 + 1));
      }, 3500);

      // Fila interna para suporte a sequências conversacionais (perguntas e respostas sequenciais)
      let pendingMessages: { name: string, text: string }[] = [];
      let msgId = 4;

      // Fluxo contínuo de novas mensagens
      const chatInterval = setInterval(() => {
        if (pendingMessages.length === 0) {
          // 45% de hipótese de iniciar um diálogo/pergunta e resposta realista, otherwise mensagem solta
          if (Math.random() < 0.45) {
            const randomThread = MOCK_CHAT_THREADS[Math.floor(Math.random() * MOCK_CHAT_THREADS.length)];
            pendingMessages = randomThread.messages.map(m => ({
              name: m.sender,
              text: m.text
            }));
          } else {
            const comment = MOCK_SINGLE_COMMENTS[Math.floor(Math.random() * MOCK_SINGLE_COMMENTS.length)];
            const name = MOCK_CHAT_USERS[Math.floor(Math.random() * MOCK_CHAT_USERS.length)];
            pendingMessages = [{ name, text: comment }];
          }
        }

        const nextMsg = pendingMessages.shift();
        if (nextMsg) {
          setChatMessages(prev => {
            const updated = [...prev, {
              id: msgId++,
              name: nextMsg.name,
              text: nextMsg.text
            }];
            return updated.slice(-6); // Mantém as últimas 6 mensagens visíveis no chat
          });
        }
      }, 3000);

      return () => {
        clearInterval(specInterval);
        clearInterval(chatInterval);
      };
    }
  }, [gameState]);

  const playVictoryCascadeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const baseFreqs = [261.63, 329.63, 392.00, 523.25, 587.33, 659.25, 783.99, 1046.50];
      baseFreqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.4);
        
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.4);
      });
    } catch (e) {}
  };

  const handleQuizComplete = (score: number, correctCount: number, kz: number) => {
    setStats({ 
      score, 
      correctAnswers: correctCount, 
      totalQuestions: 10, 
      accumulatedKz: kz, 
      bestScoreKz: Math.max(stats.bestScoreKz, kz) 
    });
    setGameState(GameState.RESULTS);
    setShowFlyingNotes(true);
    playVictoryCascadeSound();
    // Keep triggering money shower for victory screen
    const interval = setInterval(() => {
      setShowFlyingNotes(prev => {
        if (!prev) clearInterval(interval);
        return prev;
      });
    }, 2000);
    setTimeout(() => {
      setShowFlyingNotes(false);
      clearInterval(interval);
    }, 8000);
  };

  const handleWithdrawRequest = () => {
    setShowFlyingNotes(true);
    setTimeout(() => setShowFlyingNotes(false), 4000);
    const transaction: Transaction = {
      id: 'LEV-ANG-' + Date.now(),
      date: new Date().toLocaleDateString('pt-AO'),
      amount: stats.accumulatedKz,
      method: selectedMethod === WithdrawMethod.MULTICAIXA ? 'Multicaixa Express' : 'Transferência Bancária',
      bank: selectedBank?.name,
      code: withdrawInput,
      name: userName,
      status: 'pendente'
    };
    const newTrans = [transaction, ...allTransactions];
    setAllTransactions(newTrans);
    localStorage.setItem('transacoes', JSON.stringify(newTrans));
    setLastTransaction(transaction);
    setGameState(GameState.WITHDRAW_CONFIRM);
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-center relative">
      <div className="samakaka-pattern"></div>
      
      <div className="mb-8 md:mb-16 relative z-10 animate-bounce-in">
        <div className="inline-block bg-angola-red px-3 py-1 mb-4 md:mb-6 rounded-lg rotate-[-2deg] shadow-lg">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">Conhecimento vale Kwanza</span>
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white italic tracking-tighter mb-4 leading-none drop-shadow-2xl">
          SOU <span className="text-angola-yellow">ANGOLANO</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] sm:tracking-[0.5em] text-[8px] sm:text-[10px]">A plataforma número 1 de recompensas culturais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
        <button onClick={() => setGameState(GameState.QUIZ)} 
          className="group p-6 md:p-10 btn-ganho rounded-3xl md:rounded-[3rem] text-left transform transition-all hover:scale-[1.03] active:scale-95">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-black uppercase italic leading-none">JOGAR &<br/>GANHAR</h3>
            <span className="text-3xl sm:text-4xl md:text-5xl drop-shadow-md">💰</span>
          </div>
          <p className="text-black/60 font-black uppercase text-[10px] md:text-xs">GANHE 11.000 Kz POR ACERTO</p>
        </button>

        <button onClick={() => setGameState(GameState.INSTRUCTIONS)} 
          className="p-6 md:p-10 bg-zinc-900 border-2 md:border-4 border-zinc-800 rounded-3xl md:rounded-[3rem] hover:border-angola-red transition-all text-left transform hover:scale-[1.03]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase italic">REGRAS DO<br/>JOGO</h3>
            <span className="text-3xl sm:text-4xl opacity-40">📜</span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[10px] md:text-xs">VEJA COMO FUNCIONA</p>
        </button>

        <button onClick={() => setGameState(GameState.RANKING)} 
          className="p-6 md:p-10 bg-zinc-900 border-2 md:border-4 border-zinc-800 rounded-3xl md:rounded-[3rem] hover:border-white transition-all text-left transform hover:scale-[1.03]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase italic">MEUS<br/>SAQUES</h3>
            <span className="text-3xl sm:text-4xl opacity-40">🏦</span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[10px] md:text-xs">HISTÓRICO DE LUCROS</p>
        </button>

        <button onClick={() => setGameState(GameState.AWARDS)} 
          className="p-6 md:p-10 bg-zinc-900 border-2 md:border-4 border-zinc-800 rounded-3xl md:rounded-[3rem] hover:border-angola-yellow transition-all text-left transform hover:scale-[1.03]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase italic">PRÉMIOS<br/>CULTURAIS</h3>
            <span className="text-3xl sm:text-4xl opacity-40">🎁</span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[10px] md:text-xs">SORTEIOS MENSAIS</p>
        </button>

        <div className="p-6 md:p-10 bg-gradient-to-br from-zinc-900 to-black border-2 md:border-4 border-zinc-800 rounded-3xl md:rounded-[3rem] text-left relative overflow-hidden group md:col-span-2">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><span className="text-5xl md:text-7xl">🏆</span></div>
          <h3 className="text-lg md:text-2xl font-black text-zinc-400 uppercase italic mb-4">RANKING TOP 3</h3>
          <div className="space-y-3 relative z-10 text-sm">
            <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-2xl"><span className="text-zinc-100 font-bold">1. Carlos M.</span><span className="text-angola-yellow font-black">1.450.000 Kz</span></div>
            <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-2xl"><span className="text-zinc-400 font-bold">2. Maria C.</span><span className="text-angola-yellow/80 font-black">1.120.000 Kz</span></div>
            <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-2xl"><span className="text-zinc-500 font-bold">3. João K.</span><span className="text-angola-yellow/60 font-black">890.000 Kz</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  const playWelcomeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      // High-energy positive chime chord
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C-E-G-C-E chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.8);
        
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.8);
      });
    } catch (e) {}
  };

  const playErrorSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const playAfricaDaySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      const freqs = [196.00, 246.94, 293.66, 392.00, 493.88, 587.33, 783.99];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.10, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.5);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.5);
      });
    } catch (e) {}
  };

  const handleCopy = (text: string, field: 'entity' | 'ref' | 'amount') => {
    try {
      navigator.clipboard.writeText(text.replace(/\s+/g, ''));
      setCopiedField(field);
      // Play a small clicky sound chime
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const selectFile = (file: File) => {
    // Check if image or pdf
    if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Por favor submeta um ficheiro de imagem válido (PNG, JPG, JPEG) ou ficheiro PDF.');
      return;
    }
    setUploadedFile(file);
    setUploadError('');
    
    // Registo do upload de comprovativo no Meta Pixel
    trackAddPaymentInfo();

    try {
      const url = URL.createObjectURL(file);
      setReceiptUrl(url);
    } catch (err) {}
  };

  const triggerValidation = () => {
    if (!uploadedFile) {
      setUploadError('Aviso: Nenhum comprovativo detetado! Por favor, faça primeiro o upload do seu comprovativo de pagamento (PNG, JPG ou PDF) ou selecione um comprovativo de teste antes de clicar em validar.');
      // Som de aviso/erro
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {}
      return;
    }

    const nextCount = validationCount + 1;
    setValidationCount(nextCount);

    // Se for a segunda tentativa ou superior, dispara o Pixel Purchase imediatamente no clique de "Já Paguei"
    if (nextCount >= 2) {
      console.log('[Meta Pixel] Segunda submissão detetada ao clicar em validar. Disparando Purchase...');
      trackPurchase(3950);
    }

    setUploadError('');
    setUploadStatus('analyzing');
    setUploadProgress(15);
    
    // Simulate progress: Step 1 (analyzing image fields)
    let curProgress = 15;
    const intervalId = setInterval(() => {
      curProgress += Math.floor(Math.random() * 8) + 5;
      if (curProgress >= 45) {
        clearInterval(intervalId);
        setUploadProgress(45);
        
        // Transition to Step 2: Verifying with BNA digital signature protocol
        setTimeout(() => {
          setUploadStatus('verifying');
          setUploadProgress(60);
          
          let verProgress = 60;
          const verInterval = setInterval(() => {
            verProgress += Math.floor(Math.random() * 5) + 3;
            if (verProgress >= 80) {
              clearInterval(verInterval);
              setUploadProgress(80);
              
              // Transition to Step 3: SPTR instant real-time compensation clearance
              setTimeout(() => {
                setUploadStatus('sptr');
                setUploadProgress(90);
                
                let sptrProgress = 90;
                const sptrInterval = setInterval(() => {
                  sptrProgress += Math.floor(Math.random() * 3) + 2;
                  if (sptrProgress >= 98) {
                    clearInterval(sptrInterval);
                    setUploadProgress(98);
                    
                    // Final confirmation step: FROZEN / CONTA DE RECEÇÃO NÃO VERIFICADA EMIS
                    setTimeout(() => {
                      setUploadStatus('frozen');
                      setUploadProgress(100);
                      
                      // Registo do evento Purchase no Meta Pixel apenas na segunda tentativa de validação
                      if (nextCount >= 2) {
                        trackPurchase(3950);
                      }
                      
                      // Som de alerta grave (alarme antifraude)
                      try {
                        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                        const ctx = new AudioCtx();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(220, ctx.currentTime);
                        osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);
                        gain.gain.setValueAtTime(0.12, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.4);
                      } catch (e) {}
                    }, 1500);
                  } else {
                    setUploadProgress(sptrProgress);
                  }
                }, 300);
              }, 2000);
            } else {
              setUploadProgress(verProgress);
            }
          }, 400);
        }, 1500);
      } else {
        setUploadProgress(curProgress);
      }
    }, 300);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0]);
    }
  };

  const savePaymentConfig = () => {
    if (!tempEntity.trim() || !tempReference.trim()) {
      return;
    }
    setPaymentEntity(tempEntity);
    setPaymentReference(tempReference);
    localStorage.setItem('cfg_entity', tempEntity);
    localStorage.setItem('cfg_ref', tempReference);
    
    // Salvar o Meta Pixel ID configurado
    const cleanedPixel = tempPixelId.trim();
    setPixelIdState(cleanedPixel);
    localStorage.setItem('meta_pixel_id', cleanedPixel);
    
    // Re-inicializar com o novo Pixel se houver alteração
    if (cleanedPixel) {
      setTimeout(() => {
        initMetaPixel();
      }, 100);
    }

    setShowConfigModal(false);
    
    // Play sound callback
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const handleEnterPlatform = () => {
    if (!userName.trim()) {
      playErrorSound();
      setShowNameError(true);
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return;
    }
    playWelcomeSound();
    setGameState(GameState.HOME);
  };

  const renderWelcome = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-center relative animate-zoom-in min-h-[85vh] flex flex-col justify-center overflow-visible">
      
      {/* Background Glowing Ambient Fields (National Colors: Red & Yellow) */}
      <div className="absolute top-10 left-10 w-[200px] h-[200px] md:w-[450px] md:h-[450px] bg-angola-red rounded-full opacity-35 blur-[100px] md:blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-angola-yellow rounded-full opacity-25 blur-[110px] md:blur-[130px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-angola-red rounded-full opacity-20 blur-[120px] md:blur-[150px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      <div className="samakaka-pattern opacity-10"></div>
      
      {/* Immersive Badge */}
      <div className="mb-6 md:mb-8 relative z-10">
        <div className="inline-block bg-zinc-950/90 border border-zinc-800 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-[0_4px_30px_rgba(227,27,35,0.3)] animate-pulse">
          <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-zinc-100 block sm:inline">
            🏆 <span className="text-angola-yellow">CAMPEONATO NACIONAL</span> DE <span className="text-angola-red">CULTURA & RECOMPENSAS</span>
          </span>
        </div>
      </div>

      {/* Main Titles */}
      <div className="mb-8 md:mb-12 relative z-10">
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-white italic tracking-tighter mb-4 leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] animate-pulse">
          SOU <span className="text-angola-yellow text-glow-yellow">ANGOLANO</span>
        </h1>
        <p className="text-zinc-300 font-extrabold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[10px] sm:text-xs max-w-2xl mx-auto leading-relaxed">
          Prepara-te para testar a tua sabedoria. Cada resposta certa vale <span className="text-angola-yellow font-black">11.000 Kz reais</span> na tua carteira.
        </p>
      </div>

      {/* Main Cinematic Screen Stack */}
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative z-10 mb-8 md:mb-12">
        
        {/* Upper Cinematic Hero Banner */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border-2 md:border-4 border-zinc-800 rounded-3xl md:rounded-[3rem] p-3 md:p-4 shadow-2xl overflow-hidden relative group hover:border-zinc-700 hover:shadow-[0_0_40px_rgba(248,211,8,0.3)] transition-all">
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 bg-black/90 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[8px] md:text-[10px] font-black text-angola-yellow flex items-center gap-1.5 md:gap-2 border border-zinc-800 tracking-wider md:tracking-widest shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-angola-yellow animate-pulse"></span>
            RECOMPENSAS EXCLUSIVAS CULTURAIS
          </div>
          
          <div className="aspect-video w-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-black border border-zinc-800 relative group-hover:scale-[1.01] transition-transform duration-500">
            <GumletPlayer />
          </div>
          
          <div className="mt-3 px-1 flex flex-col sm:flex-row justify-between items-center text-[8px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest gap-1 sm:gap-0">
            <span>🌟 Mostra a tua paixão e sabedoria angolana</span>
            <span className="text-angola-yellow flex items-center gap-1 animate-pulse">Santuário dos Prêmios Activo 🇦🇴</span>
          </div>
        </div>

        {/* Action Card: Name Entry & Launcher */}
        <div className={`bg-zinc-900/70 backdrop-blur-2xl p-6 sm:p-10 md:p-12 rounded-3xl md:rounded-[4rem] border-2 border-zinc-800 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden text-center hover:border-zinc-700 hover:shadow-[0_0_40px_rgba(227,27,35,0.2)] transition-all ${shakeInput ? 'animate-shake' : ''}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-angola-yellow rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-angola-red rounded-full opacity-5 blur-3xl"></div>
          
          <div className="max-w-lg mx-auto space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
                Como Te Chamas? <span className="text-angola-yellow animate-pulse">(Nome do Jogador)</span>
              </label>
              
              {!userName.trim() && (
                <div className="text-[11px] sm:text-xs font-black text-angola-yellow tracking-[0.1em] uppercase animate-pulse flex items-center justify-center gap-1.5 py-1">
                  <span>👇 DIGITALIZA O TEU NOME ABAIXO PARA LIBERAR O ACESSO 👇</span>
                </div>
              )}

              <input 
                type="text" 
                value={userName} 
                autoFocus={true}
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (showNameError) setShowNameError(false);
                }}
                placeholder="Ex: Carlos Manuel" 
                className={`w-full bg-black/90 border-4 rounded-2xl sm:rounded-3xl p-4 sm:p-5 outline-none text-white font-black text-center text-base sm:text-lg transition-all placeholder:text-zinc-800 text-uppercase ${
                  showNameError 
                    ? 'border-angola-red shadow-[0_0_25px_rgba(227,27,35,0.6)] focus:border-angola-red ring-4 ring-red-500/20' 
                    : !userName.trim()
                    ? 'border-angola-yellow shadow-[0_0_20px_rgba(248,211,8,0.35)] focus:border-angola-yellow ring-4 ring-angola-yellow/20 animate-pulse'
                    : 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)] text-green-400 focus:border-green-400'
                }`}
              />

              {showNameError && (
                <p className="text-[10px] sm:text-xs text-angola-red font-black uppercase tracking-widest animate-pulse py-1">
                  ⚠️ erro: por favor, diz-nos o teu nome para começar!
                </p>
              )}
            </div>

            <button 
              onClick={handleEnterPlatform}
              className="w-full py-5 sm:py-7 font-black rounded-2xl sm:rounded-[2.5rem] uppercase text-sm sm:text-lg md:text-xl transition-all shadow-2xl tracking-wider active:scale-95 duration-150 relative overflow-hidden group btn-ganho text-black hover:scale-[1.02] cursor-pointer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>ENTRAR NO CAMPEONATO NACIONAL</span>
                <span className="text-xl sm:text-2xl animate-bounce">🏆</span>
              </span>
            </button>
            
            <p className="text-[8px] sm:text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest italic">
              * Apenas contas legítimas de cidadãos nacionais residentes são elegíveis aos saques rápidos
            </p>
          </div>
        </div>

      </div>

      {/* Decorative summary footer */}
      <p className="text-zinc-500 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] relative z-10">
        Plataforma em total conformidade com os regulamentos de promoção cultural do território nacional
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden selection:bg-angola-yellow selection:text-black">
      <main className="max-w-7xl mx-auto py-12">
        {gameState === GameState.WELCOME && renderWelcome()}
        {gameState === GameState.HOME && renderHome()}
        {gameState === GameState.QUIZ && <Quiz onComplete={handleQuizComplete} onQuit={() => setGameState(GameState.HOME)} triggerNotification={() => {}} />}
        
        {gameState === GameState.INSTRUCTIONS && (
           <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 animate-zoom-in">
             <div className="glass-card p-12 rounded-[4rem] border-zinc-700 text-center shadow-2xl relative">
               <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 bg-angola-yellow text-black px-4 sm:px-8 py-1.5 sm:py-2 rounded-full font-black uppercase text-xs sm:text-sm italic whitespace-nowrap">O Manual do Ganhador</div>
               <h2 className="text-2xl sm:text-4xl font-black text-white mt-4 mb-8 sm:mb-10 italic uppercase tracking-tighter">COMO LUCRAR?</h2>
               <div className="text-left space-y-8 text-zinc-300 mb-12">
                 <div className="flex items-center gap-6 group">
                    <span className="bg-angola-yellow text-black w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl group-hover:rotate-12 transition-transform shadow-lg">1</span>
                    <p className="font-bold text-sm sm:text-base md:text-lg">Acerte as questões de cultura. Cada acerto vale <span className="text-angola-yellow font-black">11.000 Kz REAIS</span>.</p>
                 </div>
                 <div className="flex items-center gap-6 group">
                    <span className="bg-angola-yellow text-black w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl group-hover:rotate-12 transition-transform shadow-lg">2</span>
                    <p className="font-bold text-sm sm:text-base md:text-lg">Quanto mais rápido responder, maior a sua pontuação no ranking semanal!</p>
                 </div>
                 <div className="flex items-center gap-6 group">
                    <span className="bg-angola-yellow text-black w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl group-hover:rotate-12 transition-transform shadow-lg">3</span>
                    <p className="font-bold text-sm sm:text-base md:text-lg">O levantamento é imediato após a <span className="text-angola-red font-black">Verificação Fiscal (3.950 Kz)</span> para isenção de impostos.</p>
                 </div>
               </div>
               <button onClick={() => setGameState(GameState.HOME)} className="w-full py-5 bg-zinc-800 text-white font-black rounded-xl sm:rounded-[2rem] hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs sm:text-sm border-b-4 border-zinc-950">ENTENDI, QUERO JOGAR</button>
             </div>
           </div>
        )}

        {gameState === GameState.AWARDS && (
           <div className="max-w-2xl mx-auto px-4 py-12 animate-zoom-in">
             <div className="glass-card p-12 rounded-[4rem] border-zinc-700 text-center shadow-2xl relative">
               <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 bg-angola-yellow text-black px-4 sm:px-8 py-1.5 sm:py-2 rounded-full font-black uppercase text-xs sm:text-sm italic whitespace-nowrap">Sorteios Mensais</div>
               <h2 className="text-2xl sm:text-4xl font-black text-white mt-4 mb-4 sm:mb-6 italic uppercase tracking-tighter">PRÉMIOS CULTURAIS</h2>
               <p className="text-zinc-400 font-bold mb-8 sm:mb-10 text-xs sm:text-sm">Todos os meses sorteamos prémios para os jogadores que mais se destacam no conhecimento da nossa cultura!</p>
               
               <div className="text-left space-y-8 text-zinc-300 mb-12">
                 <div className="bg-zinc-900/80 p-6 rounded-3xl border-2 border-zinc-800">
                   <h3 className="text-angola-yellow font-black uppercase mb-4 text-xl">COMO FUNCIONA</h3>
                   <ul className="space-y-3 font-bold text-sm">
                     <li className="flex items-center gap-3"><span className="text-angola-yellow">🎯</span> Joga o quiz e acumula pontos</li>
                     <li className="flex items-center gap-3"><span className="text-angola-yellow">🎟️</span> Cada ponto = 1 bilhete virtual</li>
                     <li className="flex items-center gap-3"><span className="text-angola-yellow">🎲</span> No fim do mês, sorteamos entre os top 10</li>
                     <li className="flex items-center gap-3"><span className="text-angola-yellow">📈</span> Quanto mais jogas, mais chances tens</li>
                   </ul>
                 </div>

                 <div className="bg-zinc-900/80 p-6 rounded-3xl border-2 border-zinc-800">
                   <h3 className="text-angola-yellow font-black uppercase mb-4 text-xl">PRÉMIOS DO MÊS</h3>
                   <ul className="space-y-4 font-bold text-sm">
                     <li className="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800"><span className="text-3xl">🥇</span> <span>Kit Cultura Angolana (Livro + CD + Artesanato)</span></li>
                     <li className="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800"><span className="text-3xl">🥈</span> <span>Vale 5.000 Kz numa livraria</span></li>
                     <li className="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800"><span className="text-3xl">🥉</span> <span>Destaque na página + Menção honrosa</span></li>
                   </ul>
                 </div>

                 <div className="bg-zinc-900/80 p-6 rounded-3xl border-2 border-zinc-800">
                   <h3 className="text-angola-yellow font-black uppercase mb-4 text-xl">REGRAS</h3>
                   <ul className="space-y-3 font-bold text-sm">
                     <li className="flex items-center gap-3"><span className="text-zinc-500">📌</span> Só jogadores com conta válida</li>
                     <li className="flex items-center gap-3"><span className="text-zinc-500">📌</span> Um vencedor por mês</li>
                     <li className="flex items-center gap-3"><span className="text-zinc-500">📌</span> Resultado divulgado no dia 1 de cada mês</li>
                   </ul>
                 </div>

                 <div className="bg-zinc-900/80 p-6 rounded-3xl border-2 border-zinc-800">
                   <h3 className="text-angola-yellow font-black uppercase mb-4 text-xl">VENCEDORES ANTERIORES</h3>
                   <ul className="space-y-3 font-bold text-sm">
                     <li className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                       <span className="text-white">Janeiro: Maria da Costa (Luanda)</span>
                       <span className="text-angola-yellow">2.500 pts</span>
                     </li>
                     <li className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                       <span className="text-white">Fevereiro: João Kapango (Benguela)</span>
                       <span className="text-angola-yellow">2.300 pts</span>
                     </li>
                   </ul>
                 </div>
               </div>
               <button onClick={() => setGameState(GameState.HOME)} className="w-full py-6 bg-zinc-800 text-white font-black rounded-[2rem] hover:bg-zinc-700 transition-all uppercase tracking-widest text-sm border-b-4 border-zinc-950">VOLTAR AO MENU</button>
             </div>
           </div>
        )}

        {gameState === GameState.RANKING && (
           <div className="max-w-2xl mx-auto px-4 py-12 animate-zoom-in">
             <div className="glass-card p-12 rounded-[4rem] border-zinc-700 text-center shadow-2xl">
               <div className="flex items-center justify-center gap-4 mb-8">
                  <span className="text-4xl">💰</span>
                  <h1 className="text-glow-yellow text-2xl sm:text-4xl font-black text-angola-yellow italic uppercase tracking-tighter">MINHA BANCA</h1>
               </div>
               <div className="space-y-4 mb-10 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                 {allTransactions.length > 0 ? allTransactions.map((t, i) => (
                   <div key={i} className="flex flex-col p-6 bg-zinc-900/80 rounded-3xl border-2 border-zinc-800 text-left hover:border-angola-yellow transition-all group">
                     <div className="flex justify-between items-center">
                        <div>
                           <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none mb-2">{t.date}</p>
                           <p className="font-black text-white text-sm leading-none uppercase">{t.method}</p>
                           <p className="text-[9px] text-zinc-500 mt-2 uppercase font-black italic">Protocolo: #ANG-{t.id.slice(-8)}</p>
                        </div>
                        <div className="text-right">
                           <span className="text-xl sm:text-2xl font-black text-angola-yellow group-hover:scale-110 block transition-transform">{t.amount.toLocaleString('pt-AO')} Kz</span>
                           <div className="inline-flex items-center gap-1 bg-angola-red/10 px-3 py-1 rounded-full mt-2">
                              <div className="w-1.5 h-1.5 bg-angola-red rounded-full animate-pulse"></div>
                              <span className="text-[8px] sm:text-[9px] text-angola-red uppercase font-black tracking-widest">Status Pendente</span>
                           </div>
                        </div>
                     </div>
                     <p className="text-[9px] text-zinc-400 italic mt-3 font-medium">
                        * O seu saque está pendente, verifique primeiro a taxa.
                     </p>
                     <button 
                       onClick={() => {
                          playAfricaDaySound();
                          setGameState(GameState.AFRICA_DAY_PROMO);
                        }}
                       className="mt-4 w-full py-3.5 sm:py-4 bg-angola-red text-white font-black rounded-xl sm:rounded-2xl uppercase tracking-widest text-[9px] sm:text-[10px] animate-pulse shadow-lg hover:scale-105 transition-all border-b-4 border-red-900"
                     >
                       EMITIR A FATURA DE VERIFICAÇÃO
                     </button>
                   </div>
                 )) : (
                   <div className="py-20 border-4 border-dashed border-zinc-900 rounded-[3rem]">
                      <div className="text-6xl mb-4 opacity-20">💸</div>
                      <p className="text-zinc-600 font-black uppercase text-xs sm:text-sm italic">Sua carteira está vazia.<br/>Vá ganhar algum Kwanza!</p>
                   </div>
                 )}
               </div>
               <button onClick={() => setGameState(GameState.HOME)} className="w-full py-6 bg-zinc-800 text-white font-black rounded-[2rem] hover:bg-zinc-700 transition-all uppercase tracking-widest text-sm border-b-4 border-zinc-950">VOLTAR AO MENU</button>
             </div>
           </div>
        )}

        {gameState === GameState.RESULTS && (
          <div className="min-h-[90vh] flex items-center justify-center p-4 text-center relative overflow-visible">
            {/* Ambient Background Glowing Areas */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] bg-angola-yellow rounded-full opacity-10 blur-[150px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute top-10 right-10 w-[250px] h-[250px] bg-angola-red rounded-full opacity-10 blur-[130px] pointer-events-none animate-pulse-slow"></div>

            <div className="glass-card p-4 sm:p-8 md:p-16 rounded-3xl md:rounded-[4.5rem] w-full max-w-3xl border-angola-yellow border-2 md:border-4 gold-glow relative overflow-hidden animate-bounce-in shadow-[0_30px_70px_rgba(248,211,8,0.25)]">
              {/* Top Flag Banner */}
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
              
              <div className="relative z-10 space-y-8">
                {/* Big Floating Reward Icon */}
                <div className="relative inline-block select-none pointer-events-auto cursor-pointer group" onClick={() => { playVictoryCascadeSound(); setShowFlyingNotes(true); }}>
                  <div className="absolute inset-0 bg-angola-yellow opacity-25 rounded-full blur-2xl animate-ping"></div>
                  <div className="text-8xl md:text-9xl transform active:scale-90 hover:scale-105 duration-100 ease-out transition-all animate-bounce relative z-10 filter drop-shadow-[0_10px_15px_rgba(248,211,8,0.4)]">
                    💰
                  </div>
                  {/* Floating helpful micro-notice */}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full text-[10px] font-black text-angola-yellow tracking-widest uppercase border border-zinc-800 whitespace-nowrap shadow-lg">
                    Clica para Chover 💸
                  </span>
                </div>

                {/* Explosive Congratulations! */}
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                    DETONASTE! 🏆
                  </h2>
                  <p className="text-angola-yellow text-glow-yellow font-black uppercase text-base sm:text-lg md:text-xl tracking-[0.1em] sm:tracking-[0.2em]">
                    O TEU DINHEIRO JÁ FOI EMITIDO!
                  </p>
                  <p className="text-zinc-400 font-extrabold uppercase text-[11px] tracking-widest max-w-lg mx-auto leading-relaxed">
                    Parabéns <span className="text-white text-glow-yellow underline">{userName || 'Campeão'}</span>! Foste consagrado no grande campeonato angolano de cultura geral.
                  </p>
                </div>

                {/* Official Payout Slip Certificate */}
                <div className="bg-zinc-950/90 rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 md:p-10 border-2 border-zinc-800 relative shadow-inner text-left space-y-4 sm:space-y-6">
                  {/* Micro header */}
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <span className="text-[8px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-[0.1em] sm:tracking-[0.2em] block sm:inline">SOU ANGOLANO SISTEMA GERAL DE RECOMPENSAS</span>
                    <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full font-black uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Saldo Reservado
                    </span>
                  </div>

                  {/* Large dynamic payout balance */}
                  <div className="text-center py-4 bg-black/40 rounded-2xl border border-zinc-900 shadow-md">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">TOTAL LÍQUIDO DISPONÍVEL</p>
                    <p className="text-3xl sm:text-5xl md:text-8xl font-black text-angola-yellow italic text-glow-yellow drop-shadow-[0_5px_15px_rgba(248,211,8,0.4)] tracking-tighter leading-none py-2">
                      {stats.accumulatedKz.toLocaleString('pt-AO')} <span className="text-2xl font-bold not-italic">Kz</span>
                    </p>
                  </div>

                  {/* Certificate Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-zinc-400">
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider mb-1">BENEFICIÁRIO LEITITIMO</p>
                      <p className="font-black text-white uppercase text-sm truncate">{userName || 'Jogador Anónimo'}</p>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider mb-1">CULTURA GERAL DE ANGOLA</p>
                      <p className="font-black text-white text-sm">PROVA DE {stats.correctAnswers} / 10 ACERTOS ✅</p>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider mb-1">STATUS ADMINISTRATIVO</p>
                      <p className="font-black text-green-500 uppercase flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                        APROVADO PARA TRANSFERÊNCIA
                      </p>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider mb-1">IMPOSTO DE SOBERANIA</p>
                      <p className="font-black text-glow-yellow text-angola-yellow">ISENTO - LEI N.º 12/23 (ISENÇÃO FISCAL)</p>
                    </div>
                  </div>

                  {/* Payout assurance statement */}
                  <div className="inner-glow-zinc p-4 rounded-2xl border border-zinc-900 text-[10px] text-zinc-400 leading-relaxed font-bold italic">
                    📌 * Parabéns pela excelência! O fundo de recompensa nacional garante a integridade desse pagamento. Transfere todo o saldo acumulado diretamente para a tua conta agora mesmo.
                  </div>
                </div>

                {/* Big Excitement Actions */}
                <div className="flex justify-center pt-2">
                  <button 
                    onClick={() => setGameState(GameState.WITHDRAW_METHOD)} 
                    className="w-full py-5 md:py-7 btn-ganho text-black font-black rounded-2xl md:rounded-[2.5rem] text-sm sm:text-lg md:text-xl shadow-[0_12px_40px_rgba(248,211,8,0.55)] hover:scale-105 active:scale-95 uppercase italic animate-pulse cursor-pointer relative overflow-hidden group select-none"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span>SACAR TODO O MEU SALDO CASHOUT</span>
                      <span className="text-3xl">🏧</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Decorative side blurs */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-angola-red rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-angola-yellow rounded-full opacity-30 blur-3xl"></div>
            </div>
          </div>
        )}

        {gameState === GameState.WITHDRAW_METHOD && (
          <div className="max-w-xl mx-auto p-4 sm:p-6 animate-zoom-in">
            <div className="glass-card p-5 sm:p-10 rounded-3xl sm:rounded-[4rem] border-zinc-800 shadow-2xl relative overflow-hidden">
              {/* Dynamic Flag Accent Side */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-angola-yellow italic mb-2 uppercase text-center mt-2">RECEPÇÃO DE VALORES</h2>
              
              {/* Game Payout Progress Stepper Tracker */}
              <div className="flex justify-center items-center gap-2 mb-8 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <span className="text-angola-yellow">1. ID de Elite</span>
                <span className="text-zinc-700">➔</span>
                <span>2. Rede</span>
                <span className="text-zinc-700">➔</span>
                <span>3. Finalizar</span>
              </div>

              {/* Dynamic Interactive Angolan Winner ID Card ("Bilhete de Cidadão Premiado") */}
              <div className="bg-gradient-to-br from-zinc-900 to-black p-4 sm:p-6 rounded-2xl border-2 border-angola-yellow/50 shadow-inner relative overflow-hidden mb-8 group hover:border-angola-yellow transition-all duration-300">
                {/* Micro holographic crest pattern & flag ribbon lines */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-l from-angola-red/20 via-angola-yellow/20 to-transparent rounded-bl-full pointer-events-none"></div>
                
                {/* Header of the ID Card */}
                <div className="flex justify-between items-start border-b border-zinc-800 pb-3 mb-4">
                  <div>
                    <span className="text-[7px] sm:text-[8px] font-black text-zinc-500 uppercase tracking-widest block">REPÚBLICA DE ANGOLA</span>
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-white uppercase tracking-wider block">BILHETE DE JOGADOR PATRIOTA</span>
                  </div>
                  <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">
                    🇦🇴
                  </div>
                </div>

                {/* ID Card Body */}
                <div className="flex gap-4 items-center">
                  {/* Digital Avatar Hologram with live status */}
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-center items-center relative overflow-hidden shadow-inner font-black text-center">
                      <span className="text-3xl filter hover:scale-110 duration-200 transition-transform select-none">🏆</span>
                      <div className="absolute bottom-0 left-0 w-full bg-angola-yellow text-[7px] text-black font-black py-0.5 tracking-wider uppercase">
                        {stats.correctAnswers}/10 ACERTOS
                      </div>
                    </div>
                    {/* Glowing pulse indicator */}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-ping"></span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></span>
                  </div>

                  {/* Dynamic user information displayed in a neat grid */}
                  <div className="flex-1 space-y-1 text-xs">
                    <div>
                      <p className="text-[7px] sm:text-[8px] text-zinc-500 font-bold uppercase tracking-widest">NOME DO BENEFICIÁRIO</p>
                      <p className="font-extrabold text-white text-xs sm:text-sm tracking-tight uppercase min-h-[1.25rem] border-b border-zinc-850">
                        {userName ? userName : <span className="text-zinc-600 italic">Escreva o seu nome abaixo...</span>}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[8px] sm:text-[9px]">
                      <div>
                        <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider">SALDO ACUMULADO</p>
                        <p className="font-black text-angola-yellow uppercase">{stats.accumulatedKz.toLocaleString('pt-AO')} Kz</p>
                      </div>
                      <div>
                        <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider">ESTADO DO ALVARÁ</p>
                        <p className="font-black text-green-500 uppercase animate-pulse">AUTORIZADO ✓</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro Footnote */}
                <div className="mt-4 pt-2.5 border-t border-zinc-900 flex justify-between items-center text-[7px] text-zinc-500 font-bold uppercase tracking-widest">
                  <span>VALIDADO INTEGRALMENTE PELO BNA</span>
                  <span className="text-angola-yellow">SOU ANGOLANO PROVADO</span>
                </div>
              </div>

              {/* Inputs & options */}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest block mb-2 text-left pl-2">A QUEM SERÁ DIRECCIONADO O REPASSE?</label>
                  <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Nome do Beneficiário" className="w-full bg-zinc-950 border-4 border-zinc-900 rounded-3xl p-6 outline-none focus:border-angola-yellow text-white font-black text-lg transition-all shadow-inner" />
                </div>
                
                <div className="pt-2">
                  <label className="text-zinc-400 text-[10px] font-black uppercase tracking-widest block mb-2 text-left pl-2">MÉTODO DE CASHOUT PREFERENCIAL</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div onClick={() => setSelectedMethod(WithdrawMethod.BANK_TRANSFER)} className={`opcao-deposito ${selectedMethod === WithdrawMethod.BANK_TRANSFER ? 'selecionado border-4 bg-zinc-900/40' : 'border-4 border-zinc-900 bg-zinc-950'} p-5 sm:p-6 rounded-2xl cursor-pointer transition-all hover:border-zinc-800`}>
                       <div className="flex justify-between items-center">
                          <div>
                            <p className="font-black text-sm">💳 BANCO (IBAN)</p>
                            <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Interbancária</p>
                          </div>
                          <span className="text-2xl">🏛️</span>
                       </div>
                    </div>
                    
                    <div onClick={() => setSelectedMethod(WithdrawMethod.MULTICAIXA)} className={`opcao-deposito ${selectedMethod === WithdrawMethod.MULTICAIXA ? 'selecionado border-4 bg-zinc-900/40' : 'border-4 border-zinc-900 bg-zinc-950'} p-5 sm:p-6 rounded-2xl cursor-pointer transition-all hover:border-zinc-800`}>
                       <div className="flex justify-between items-center">
                          <div>
                            <p className="font-black text-sm">🏧 MULTICAIXA</p>
                            <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Levantamento sem cartão</p>
                          </div>
                          <span className="text-2xl">📱</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button disabled={!selectedMethod || !userName} onClick={() => setGameState(selectedMethod === WithdrawMethod.BANK_TRANSFER ? GameState.WITHDRAW_BANK : GameState.WITHDRAW_FORM)} className={`w-full py-5 sm:py-7 font-black rounded-2xl sm:rounded-[2.5rem] uppercase text-sm sm:text-xl transition-all ${selectedMethod && userName ? 'btn-ganho text-black shadow-2xl scale-100 hover:scale-[1.02] active:scale-95' : 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed'}`}>
                CONTINUAR LEVANTAMENTO
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.WITHDRAW_BANK && (
          <div className="max-w-xl mx-auto p-4 sm:p-6 animate-zoom-in">
            <div className="glass-card p-5 sm:p-10 rounded-3xl sm:rounded-[4rem] border-zinc-800 relative overflow-hidden">
              {/* Dynamic Flag Accent Side */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
              
              <h2 className="text-2xl sm:text-3xl font-black italic mb-2 text-center mt-2">🏦 REDE BANCÁRIA</h2>
              
              {/* Game Payout Progress Stepper Tracker */}
              <div className="flex justify-center items-center gap-2 mb-8 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <span className="text-green-500">1. ID de Elite ✓</span>
                <span className="text-zinc-700">➔</span>
                <span className="text-angola-yellow">2. Rede</span>
                <span className="text-zinc-700">➔</span>
                <span>3. Finalizar</span>
              </div>

              <div className="space-y-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {BANCOS_ANGOLA.map(b => (
                  <div key={b.id} onClick={() => setSelectedBank(b)} className={`p-4 sm:p-5 bg-zinc-950 rounded-2xl sm:rounded-3xl cursor-pointer border-2 sm:border-4 transition-all ${selectedBank?.id === b.id ? 'border-angola-yellow bg-zinc-900 shadow-lg scale-[1.01]' : 'border-zinc-900 hover:border-zinc-800'}`}>
                    <p className="font-black text-white text-sm sm:text-base">{b.name}</p>
                    <p className="text-[10px] text-zinc-650 font-bold tracking-widest uppercase mt-1">Código Swift: {b.code}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setGameState(GameState.WITHDRAW_METHOD)} className="flex-1 py-4 sm:py-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase text-xs transition-colors">Voltar</button>
                <button disabled={!selectedBank} onClick={() => setGameState(GameState.WITHDRAW_FORM)} className={`flex-1 py-4 sm:py-5 font-black rounded-2xl uppercase text-xs sm:text-sm transition-all ${selectedBank ? 'bg-angola-yellow hover:bg-yellow-400 text-black shadow-lg scale-100' : 'bg-zinc-900 text-zinc-600 opacity-50 cursor-not-allowed'}`}>Confirmar Banco</button>
              </div>
            </div>
          </div>
        )}

        {gameState === GameState.WITHDRAW_FORM && (
          <div className="max-w-xl mx-auto p-4 sm:p-6 animate-zoom-in">
            <div className="glass-card p-5 sm:p-10 rounded-3xl sm:rounded-[4rem] border-zinc-800 text-center relative overflow-hidden">
              {/* Dynamic Flag Accent Side */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
              
              <div className="text-5xl mb-4 mt-2">🔒</div>
              <h2 className="text-2xl sm:text-3xl font-black italic mb-2 uppercase text-center">FINALIZAR DADOS</h2>
              
              {/* Game Payout Progress Stepper Tracker */}
              <div className="flex justify-center items-center gap-2 mb-8 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <span className="text-green-500">1. ID de Elite ✓</span>
                <span className="text-zinc-700">➔</span>
                <span className="text-green-500">2. Rede ✓</span>
                <span className="text-zinc-700">➔</span>
                <span className="text-angola-yellow animate-pulse">3. Finalizar</span>
              </div>

              <div className="space-y-6 mb-8">
                <p className="text-zinc-450 text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
                  {selectedMethod === WithdrawMethod.BANK_TRANSFER ? 'Digite o seu IBAN Completo (21 dígitos)' : 'Digite o seu Número Multicaixa (9 dígitos)'}
                </p>
                
                <input value={withdrawInput} onChange={e => setWithdrawInput(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-950 border-2 sm:border-4 border-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 outline-none focus:border-angola-yellow font-mono text-lg sm:text-2xl text-white text-center tracking-widest" placeholder={selectedMethod === WithdrawMethod.BANK_TRANSFER ? "00..." : "9..."} />
                
                <div className="bg-zinc-950 p-5 rounded-2xl text-left border border-zinc-900 space-y-2">
                  <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1.5 border-b border-zinc-900 pb-1.5">Resumo da Operação de Liberação</p>
                  <div className="flex justify-between text-xs text-zinc-400"><span>Beneficiário:</span> <span className="text-white font-black uppercase">{userName}</span></div>
                  {selectedMethod === WithdrawMethod.BANK_TRANSFER && selectedBank && (
                    <div className="flex justify-between text-xs text-zinc-400"><span>Banco Destino:</span> <span className="text-white font-black uppercase">{selectedBank.name.split(' - ')[0]}</span></div>
                  )}
                  <div className="flex justify-between text-xs text-zinc-400"><span>Canal de Rede:</span> <span className="text-white font-black">{selectedMethod === WithdrawMethod.BANK_TRANSFER ? 'Transferência IBAN' : 'Multicaixa Express'}</span></div>
                  <div className="flex justify-between text-xs text-zinc-400"><span>Valor Bruto:</span> <span className="text-angola-yellow font-black">{stats.accumulatedKz.toLocaleString()} Kz</span></div>
                  <div className="flex justify-between text-xs text-zinc-400"><span>Garantia Governamental:</span> <span className="text-green-500 font-extrabold uppercase">Totalmente Isento (Lei 12/23)</span></div>
                </div>
              </div>
              <button disabled={withdrawInput.length < (selectedMethod === WithdrawMethod.BANK_TRANSFER ? 10 : 9)} onClick={handleWithdrawRequest} className="w-full py-5 sm:py-7 btn-ganho text-black font-black rounded-2xl sm:rounded-[3rem] uppercase tracking-widest shadow-2xl text-base sm:text-lg animate-pulse">
                CONFIRMAR SAQUE AGORA
              </button>
              
              <button onClick={() => setGameState(selectedMethod === WithdrawMethod.BANK_TRANSFER ? GameState.WITHDRAW_BANK : GameState.WITHDRAW_METHOD)} className="w-full mt-4 py-3 bg-transparent hover:bg-zinc-900 text-zinc-500 text-xs font-black uppercase hover:text-zinc-300 transition-colors">Voltar</button>
            </div>
          </div>
        )}

        {gameState === GameState.WITHDRAW_CONFIRM && (
          <div className="max-w-xl mx-auto p-4 animate-bounce-in relative overflow-visible">
            
            {/* Glowing Aura Backplates */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-green-600 rounded-full opacity-15 blur-[120px] pointer-events-none animate-pulse-slow"></div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative z-10 transition-all hover:border-zinc-700">
              
              {/* Receipt Header Badge */}
              <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl mb-6 text-center shadow-[0_4px_20px_rgba(16,185,129,0.35)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <p className="text-[10px] font-black tracking-[0.2em] opacity-80 uppercase">AUTORIZAÇÃO DE TRANSACÇÃO CONCLUÍDA</p>
                <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase mt-1 flex items-center justify-center gap-2">
                  <span>ORDEM DE LEVANTAMENTO EMITIDA</span>
                  <span className="text-2xl animate-pulse">💸</span>
                </h3>
              </div>

              {/* Main Physical Bank Receipt Wrapper */}
              <div className="comprovante rounded-[2rem] shadow-[0_15px_35px_rgba(0,0,0,0.55)] p-6 md:p-8 border-t-8 border-b-8 border-dashed border-zinc-200 relative overflow-hidden">
                
                {/* Simulated Bank Hologram Security Stripe */}
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-angola-red via-angola-yellow to-angola-red opacity-15"></div>
                
                {/* Central Bank Crest / Seal header */}
                <div className="text-center border-b-2 border-dashed border-zinc-300 pb-6 mb-6 relative">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md relative group border border-amber-500 select-none">
                     <span className="text-2xl group-hover:rotate-12 transition-transform">🏦</span>
                     <div className="absolute inset-0 bg-yellow-400 opacity-20 rounded-full blur-md animate-ping"></div>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">REPÚBLICA DE ANGOLA</h4>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">SISTEMA DE PAGAMENTO EM TEMPO REAL (SPTR)</p>
                  <p className="text-[8px] font-extrabold text-amber-600 uppercase tracking-[0.2em] mt-0.5">SISTEMA INTEGRADO REVOLUCIONÁRIO • REGULADO PELO BNA</p>
                </div>

                {/* Substantive Payout Slips Table */}
                <div className="space-y-3.5 text-xs font-mono text-zinc-800 border-b-2 border-dashed border-zinc-300 pb-6 mb-6">
                  
                  {/* Transaction Reference ID Row */}
                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/60 font-mono text-[10px] space-y-1">
                    <p className="font-extrabold text-zinc-400 uppercase tracking-widest text-[8px]">ORDEM DE OPERAÇÃO REGISTADA</p>
                    <div className="flex justify-between items-center text-zinc-900 font-black">
                      <span>CHAVE DE ACESSO BNA:</span>
                      <span className="text-amber-600 underline text-right">{lastTransaction?.id || 'REF-BNA-' + Date.now()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500 uppercase font-black tracking-tight text-[10px]">ORGANIZAÇÃO EMISSORA:</span> 
                    <span className="font-black text-zinc-900 uppercase">SOU ANGOLANO RECOMPENSAS</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500 uppercase font-black tracking-tight text-[10px]">BENEFICIÁRIO TITULAR:</span> 
                    <span className="font-black text-zinc-900 uppercase">{lastTransaction?.name || userName}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500 uppercase font-black tracking-tight text-[10px]">INSTITUIÇÃO BANCÁRIA:</span> 
                    <span className="font-black text-amber-600 uppercase">{lastTransaction?.bank || 'Multicaixa Integrado'}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500 uppercase font-black tracking-tight text-[10px]">MÉTODO TRANSACCIONAL:</span> 
                    <span className="font-black text-zinc-900 uppercase">{lastTransaction?.method}</span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500 uppercase font-black tracking-tight text-[10px]">CONTA DESTINO (IBAN/TLF):</span> 
                    <span className="font-black text-zinc-900 font-mono">
                      {lastTransaction?.code ? (lastTransaction.code.length > 8 ? `***${lastTransaction.code.slice(-5)}` : lastTransaction.code) : 'Multicaixa Activo'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                    <span className="text-zinc-500 uppercase font-black tracking-tight text-[10px]">TARIFA DE TRANSFERÊNCIA:</span> 
                    <span className="font-black text-green-600 uppercase">0,00 Kz (ISENÇÃO FISCAL CULTURAL)</span>
                  </div>

                  {/* Nominal Winnings Cash Display */}
                  <div className="bg-zinc-950 text-center py-5 rounded-2xl my-3 border border-zinc-900 relative shadow-inner">
                    <p className="text-[8px] text-zinc-500 font-black tracking-widest mt-1">MONTANTE NOMINAL DE TRANSFERÊNCIA ADJUDICADO</p>
                    <p className="text-4xl md:text-5xl font-black text-glow-yellow text-angola-yellow italic tracking-tighter mt-1">
                      {lastTransaction?.amount.toLocaleString('pt-AO')} <span className="text-xl font-bold not-italic">Kz</span>
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-red-600 font-black pt-2">
                    <span className="text-zinc-900 uppercase font-black tracking-tight text-[10px]">ESTADO DE LIBERAÇÃO:</span> 
                    <span className="uppercase tracking-wider flex items-center gap-1.5 animate-pulse text-xs bg-red-100/80 px-3 py-1 rounded-full border border-red-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 animate-pulse"></span>
                      </span>
                      RETIDO EM LIQUIDAÇÃO SPTR
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-zinc-300 pt-3 text-amber-700 font-black text-[11px] leading-tight">
                    <span>TAXA DE VERIFICAÇÃO DE DADOS (AGT/BNA):</span> 
                    <span className="text-right">3.950 Kz</span>
                  </div>
                </div>

                {/* Circular "Verified Audit" Stamp (Selo de Certificação) */}
                <div className="relative h-20 w-full flex items-center justify-between pointer-events-none mt-4 select-none">
                  {/* CSS barcode strip */}
                  <div className="flex flex-col text-left">
                    <div className="flex justify-start items-center gap-0.5 tracking-[-0.2em] font-mono text-zinc-900 text-base leading-none">
                      ||||| | ||| || |||| | | |||||| ||| ||| | ||| |
                    </div>
                    <span className="text-[6px] text-zinc-400 font-mono tracking-widest uppercase mt-1">DISPOSITIVO DE VERIFICAÇÃO BNA-CERT-AO/12-23</span>
                  </div>

                  {/* Red/Amber Stamp Emblem */}
                  <div className="w-20 h-20 border-2 border-dashed border-red-500 rounded-full flex flex-col items-center justify-center p-1 transform rotate-12 bg-white scale-90 relative">
                    <span className="text-[6px] text-red-500 font-black text-center tracking-tighter leading-none uppercase">AUTENTICAÇÃO</span>
                    <span className="text-[9px] text-red-600 font-black text-center border-y border-red-400 py-0.5 my-0.5 tracking-tighter uppercase">REGULADO BNA</span>
                    <span className="text-[6px] text-red-500 font-bold text-center tracking-tight leading-none uppercase">MINFIN/AGT</span>
                  </div>
                </div>

              </div>

              {/* Informative Security Guarantee Card */}
              <div className="bg-zinc-950/80 border border-zinc-800 p-6 rounded-3xl mt-6 mb-6">
                <p className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">📌 NOTA EXPLICATIVA FINANCEIRA (BNA & AGT)</p>
                <p className="text-[11px] leading-relaxed italic font-bold text-zinc-300">
                  Sob regulamento do Banco Nacional de Angola, todos os prêmios culturais do concurso "Sou Angolano" estão totalmente isentos de encargos tributários de renda ou imposto de selo (Isenção Federal Lei n.º 12/23). Para a transferência ser imediata no Pix/IBAN nacional, proceda com o pagamento da taxa de verificação para desbloquear os seus milhões retidos com segurança.
                </p>
              </div>

              {/* Premium Interactive Action Triggers */}
              <button 
                onClick={() => setGameState(GameState.VERIFY_TAX)} 
                className="w-full py-7 bg-gradient-to-r from-angola-red to-red-600 text-white font-black rounded-[2rem] uppercase tracking-wider text-lg border-b-8 border-red-900 shadow-[0_12px_40px_rgba(227,27,35,0.4)] active:scale-95 duration-100 transition-all active:border-b-2 select-none cursor-pointer flex items-center justify-center gap-3"
              >
                <span>PAGAR TAXA PROCESSUAL & SACAR TUDO</span>
                <span className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>✨</span>
              </button>

            </div>
          </div>
        )}

        {gameState === GameState.VERIFY_TAX && (
          <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in relative overflow-visible">
            
            {/* National Ambient Blurs */}
            <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-angola-red rounded-full opacity-20 blur-[130px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-angola-yellow rounded-full opacity-15 blur-[130px] pointer-events-none animate-pulse-slow"></div>

            <div className="bg-zinc-900/90 backdrop-blur-2xl p-4 sm:p-6 md:p-12 rounded-3xl md:rounded-[4.5rem] border-2 border-zinc-800 shadow-[0_30px_80px_rgba(0,0,0,0.9)] relative overflow-hidden text-center">
              
              {/* Security Header Banner */}
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
              
              <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                
                {/* Emergency Notice Crest */}
                <div className="flex flex-col items-center gap-2">
                  <span className="bg-red-600/10 text-angola-red border border-red-500/20 px-6 py-2.5 rounded-full font-black uppercase text-xs tracking-[0.2em] animate-pulse flex items-center gap-2 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    SISTEMA CERTIFICADO BNA • PROTOCOLO ANTI-FRAUDE
                  </span>
                  
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-md">
                    RESERVA DE FUNDOS SOLICITADA
                  </h2>
                </div>

                {/* Sub-text instructional caption */}
                <div className="bg-zinc-950/60 p-3 sm:p-4 border border-zinc-800 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed text-zinc-300 font-bold max-w-2xl mx-auto">
                  📺 <span className="text-angola-yellow uppercase font-black tracking-wide">Vídeo Informativo Obrigatório:</span> Assista ao vídeo de instrução abaixo para entender exatamente como concluir a liberação com segurança e evitar bloqueios na sua conta bancária.
                </div>

                {/* Immersive Grid for Video Player and Real-Time Chat Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Left/Main Column: Video Streaming Center (Takes 2 blocks on desktop) */}
                  <div className="lg:col-span-2 bg-black border-2 sm:border-4 border-zinc-800 rounded-3xl sm:rounded-[2.5rem] p-2 sm:p-3 shadow-2xl relative overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all">
                    
                    {/* Live Badge Capsule Overlay */}
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                      <span className="bg-red-600 text-white font-black text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(227,27,35,0.6)] animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        AO VIVO
                      </span>
                      <span className="bg-black/80 backdrop-blur-md text-[10px] font-black text-zinc-300 px-3.5 py-1.5 rounded-full border border-zinc-800 tracking-wide flex items-center gap-1.5 shadow-md">
                        👥 <span className="text-angola-yellow font-bold">{spectatorCount.toLocaleString('pt-AO')}</span> assistindo agora
                      </span>
                    </div>

                    {/* Highly Compelling Video Frame Area */}
                    <div className="aspect-[30/47] w-full max-w-[350px] mx-auto rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 relative">
                      <iframe 
                        id="ifr_gumlet_mandatory" 
                        title="Gumlet video player" 
                        src="https://play.gumlet.io/embed/6a2602bffc14746995ba3c1d?background=false&amp;autoplay=false&amp;loop=false&amp;disable_player_controls=false" 
                        className="absolute left-0 top-0 h-full w-full border-0" 
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write;" 
                        allowFullScreen={true} 
                        loading="lazy" 
                        referrerPolicy="origin"
                      ></iframe>
                      
                      {/* Audio mute notice / Real-time stamp overlay */}
                      <div className="absolute bottom-4 left-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-mono text-zinc-400 border border-zinc-800">
                        HD 1080p • TAXA EM TRANSMISSÃO AUTOMÁTICA
                      </div>
                    </div>

                    {/* Simulated stream telemetry bar */}
                    <div className="mt-3 px-3 flex justify-between items-center text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                        Transmissão Estabilizada SPTR
                      </span>
                      <span className="text-zinc-400">Canal Educacional Regulado</span>
                    </div>
                  </div>

                  {/* Right Column: Real-Time Ganhadores Chating module */}
                  <div className="bg-zinc-950 border-2 border-zinc-800 rounded-[2.5rem] p-5 flex flex-col justify-between shadow-inner text-left">
                    <div className="border-b border-zinc-900 pb-3 mb-3 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                        CHAT DO LEVANTAMENTO
                      </span>
                      <span className="text-[8px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full font-bold">MODERADO</span>
                    </div>

                    {/* Chat messages feed */}
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[160px] lg:max-h-[220px] font-mono pr-1 custom-chat-scrollbar">
                      {chatMessages.map((m) => (
                        <div key={m.id} className="text-[10px] leading-relaxed bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-colors animate-zoom-in">
                          <span className="font-black text-angola-yellow text-[11px] block">{m.name}</span>
                          <span className="text-zinc-300 font-medium block mt-0.5">{m.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chat input footer block (disabled/placeholder) */}
                    <div className="mt-4 pt-3 border-t border-zinc-900">
                      <div className="w-full bg-zinc-900 rounded-xl p-2.5 text-[9px] font-bold text-zinc-600 uppercase text-center border border-zinc-800">
                        🔒 Apenas participantes autorizados podem comentar
                      </div>
                    </div>
                  </div>

                </div>

                {/* Substantive Payout Block displaying dynamic balance to withdraw */}
                <div className="bg-zinc-950 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-zinc-800 max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="text-left">
                    <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-center sm:text-left">Saldo Reservado Aguardando Libertação</p>
                    <p className="text-2xl sm:text-3xl font-black text-angola-yellow italic tracking-tight text-center sm:text-left">{stats.accumulatedKz.toLocaleString('pt-AO')} Kz</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-center sm:text-right">Enquadramento Legal</p>
                    <p className="text-xs text-green-500 font-bold text-center sm:text-right">Livre de Impostos adicionais (Isento)</p>
                  </div>
                </div>

                {/* Core Anti-Fraud CTA Box */}
                <div className="space-y-6 max-w-2xl mx-auto">
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        playAfricaDaySound();
                        setGameState(GameState.AFRICA_DAY_PROMO);
                      }}
                      className="w-full py-5 sm:py-8 bg-gradient-to-r from-angola-red via-red-600 to-angola-red hover:from-red-600 hover:to-red-700 text-white font-black rounded-2xl sm:rounded-[3rem] text-lg sm:text-2xl uppercase tracking-wider shadow-[0_12px_45px_rgba(227,27,35,0.5)] border-b-4 sm:border-b-8 border-red-900 hover:scale-105 active:scale-95 duration-100 transition-all select-none cursor-pointer animate-pulse flex items-center justify-center gap-2 sm:gap-3"
                    >
                      <span>PAGAR TAXA ANTI-FRAUDE & SACAR TUDO</span>
                      <span className="text-3xl animate-bounce">💸</span>
                    </button>
                    
                    <p className="text-zinc-400 font-extrabold uppercase text-xs tracking-widest">
                      Valor Único Processual: <span className="text-angola-yellow text-[13px] font-black">3.950 Kz (Isenção Fiscal AGT/BNA)</span>
                    </p>
                  </div>

                  {/* Flow control utilities */}
                  <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-zinc-800/60">
                    <button 
                      onClick={() => setGameState(GameState.WITHDRAW_CONFIRM)} 
                      className="flex-1 py-5 bg-zinc-950 hover:bg-zinc-900 border-2 border-zinc-800 text-zinc-400 font-black rounded-3xl uppercase text-[10px] tracking-wider select-none cursor-pointer hover:border-zinc-700 transition-all"
                    >
                      🔙 Voltar ao Comprovante de Saque
                    </button>
                    <button 
                      onClick={() => setGameState(GameState.HOME)} 
                      className="flex-1 py-5 bg-zinc-950 hover:bg-zinc-900 border-2 border-zinc-800 text-zinc-500 font-black rounded-3xl uppercase text-[10px] tracking-wider select-none cursor-pointer hover:border-zinc-700 transition-all"
                    >
                      🏡 Menu Principal SOU ANGOLANO
                    </button>
                  </div>

                </div>

                {/* Fine Legal compliance lines */}
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight leading-normal">
                  * Em conformidade total com os regimes cambiais angolanos regulados pela Administração Geral Tributária (AGT) e BNA. O atraso na liquidação da taxa poderá resultar no estorno automático da sua recompensa ao tesouro cultural.
                </p>

              </div>

            </div>
          </div>
        )}

        {gameState === GameState.AFRICA_DAY_PROMO && (
          <div className="max-w-4xl mx-auto py-8 px-4 animate-bounce-in relative overflow-visible text-center">
            {/* Ambient Background Glowing Areas */}
            <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-red-600 rounded-full opacity-20 blur-[130px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-yellow-500 rounded-full opacity-25 blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-green-600 rounded-full opacity-15 blur-[140px] pointer-events-none animate-pulse-slow"></div>

            <div className="bg-zinc-950/90 backdrop-blur-3xl p-6 sm:p-12 rounded-[3.5rem] sm:rounded-[4.5rem] border-4 border-angola-yellow shadow-[0_0_60px_rgba(248,211,8,0.35)] relative overflow-hidden">
              {/* Dynamic Pan-African Accent Flag Bars */}
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600"></div>
              
              {/* Spinning/shining backdrop rays for celebration */}
              <div className="absolute -top-40 -left-40 w-96 h-96 bg-angola-yellow rounded-full opacity-5 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600 rounded-full opacity-5 blur-3xl animate-pulse"></div>

              <div className="relative z-10 space-y-8">
                {/* Core Header badge of celebration */}
                <div className="flex flex-col items-center gap-4">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/20 via-yellow-500/20 to-green-600/20 border border-yellow-500/30 px-6 py-2 rounded-full font-black text-xs sm:text-sm tracking-[0.2em] uppercase text-angola-yellow animate-pulse shadow-md">
                    🏆 VENCEDOR SOU ANGOLANO 🏆
                  </div>
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-glow-yellow text-white leading-none">
                    Parabéns, {userName ? userName.toUpperCase() : 'PARTICIPANTE'}!
                  </h2>
                  <p className="text-lg sm:text-2xl font-black max-w-2xl mx-auto leading-tight text-white uppercase italic tracking-tight">
                    Você é o nosso mais novo vencedor.
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-zinc-400 max-w-lg mx-auto">
                    O seu conhecimento de cultura geral garantiu a sua qualificação e o saque total da sua recompensa nacional.
                  </p>
                </div>

                {/* Subtitle / Certificate layout */}
                <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-5 sm:p-7 border-2 border-zinc-900 rounded-3xl text-zinc-300 font-bold max-w-2xl mx-auto space-y-3 text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-zinc-400 italic text-center leading-relaxed">
                    Todos os sistemas antifraude do Banco Nacional de Angola validaram a segurança do seu balanço acumulado de <span className="text-green-400 font-black">{(stats.accumulatedKz || 150000).toLocaleString('pt-AO')} Kz</span>. Efetue abaixo o saque imediato.
                  </p>
                </div>

                {/* Vertical Testimonial Images Stack (Fully Visible, High Resolution Stack) */}
                <div className="space-y-6 pt-4 max-w-xl mx-auto">
                  <p className="text-[10px] font-black tracking-widest uppercase text-zinc-500 text-center">
                    📸 COMPROVATIVOS DE RECEBIMENTO DO PRÉMIO
                  </p>
                  <div className="flex flex-col gap-6">
                    
                    {/* Image Space 1 */}
                    <div className="w-full bg-zinc-950 rounded-2xl md:rounded-3xl border-4 border-zinc-900 overflow-hidden shadow-2xl transition-all duration-300 hover:border-yellow-500/40">
                      <img 
                        src="https://i.postimg.cc/6qm0R0bX/testimonial-1-Df-EKVQq8.jpg" 
                        alt="Prova do Vencedor 1" 
                        className="w-full h-auto object-contain block opacity-100" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>

                    {/* Image Space 2 */}
                    <div className="w-full bg-zinc-950 rounded-2xl md:rounded-3xl border-4 border-zinc-900 overflow-hidden shadow-2xl transition-all duration-300 hover:border-yellow-500/40">
                      <img 
                        src="https://i.postimg.cc/sDwXP2z2/testimonial-2-BYoy9WD7.jpg" 
                        alt="Prova do Vencedor 2" 
                        className="w-full h-auto object-contain block opacity-100" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>

                    {/* Image Space 3 */}
                    <div className="w-full bg-zinc-950 rounded-2xl md:rounded-3xl border-4 border-zinc-900 overflow-hidden shadow-2xl transition-all duration-300 hover:border-yellow-500/40">
                      <img 
                        src="https://i.postimg.cc/HL5dNYq8/testimonial-3-B9Ttco-A.jpg" 
                        alt="Prova do Vencedor 3" 
                        className="w-full h-auto object-contain block opacity-100" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>

                    {/* Image Space 4 */}
                    <div className="w-full bg-zinc-950 rounded-2xl md:rounded-3xl border-4 border-zinc-900 overflow-hidden shadow-2xl transition-all duration-300 hover:border-yellow-500/40">
                      <img 
                        src="https://i.postimg.cc/6pvkWHYd/testimonial-4-Cf-FOMj-L.jpg" 
                        alt="Prova do Vencedor 4" 
                        className="w-full h-auto object-contain block opacity-100" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>

                  </div>
                </div>

                {/* Subvention Trust badge details */}
                <div className="max-w-xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] font-black tracking-wider text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">🛡️</span> REGULADO PELO BNA
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">⚡</span> LIQUIDAÇÃO IMEDIATA (SPTR)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">🔒</span> PROTOCOLO DE SAQUE AUTÊNTICO
                  </div>
                </div>

                {/* The Ultimate Unforgettable Glowing CTA Button */}
                <div className="space-y-4 max-w-xl mx-auto">
                  <button 
                    onClick={() => {
                      playWelcomeSound();
                      setGameState(GameState.CHECKOUT);
                    }}
                    className="w-full py-5 sm:py-8 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-500 hover:from-green-500 hover:to-green-600 text-white font-black rounded-2xl sm:rounded-[3rem] text-lg sm:text-2xl uppercase tracking-wider shadow-[0_15px_45px_rgba(16,185,129,0.4)] hover:scale-103 active:scale-95 duration-100 transition-all select-none cursor-pointer border-b-8 border-green-800 active:border-b-2 flex items-center justify-center gap-2.5"
                  >
                    <span>CONCLUIR E SACAR MEU PRÉMIO DE {(stats.accumulatedKz || 150000).toLocaleString('pt-AO')} Kz 🏧</span>
                    <span className="text-3xl animate-bounce">🌍</span>
                  </button>

                  <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                    * Ao clicar acima, a factura oficial subsidiada pelo Banco Nacional de Angola será emitida com sucesso.
                  </p>
                </div>

                {/* Back utilities */}
                <div className="flex justify-center gap-4 pt-4 border-t border-zinc-900/60 max-w-lg mx-auto">
                  <button 
                    onClick={() => setGameState(GameState.VERIFY_TAX)} 
                    className="py-3 px-6 bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 text-zinc-400 font-black rounded-2xl uppercase text-[10px] tracking-wider select-none cursor-pointer transition-all"
                  >
                    🔙 Voltar ao Vídeo Informativo
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {gameState === GameState.CHECKOUT && (
          <div className="max-w-4xl mx-auto py-8 px-4 animate-bounce-in relative overflow-visible">
            {/* Background glowing effects to keep consistency */}
            <div className="absolute top-10 left-10 w-[250px] h-[250px] bg-amber-600 rounded-full opacity-10 blur-[130px] pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-red-650 rounded-full opacity-10 blur-[130px] pointer-events-none"></div>

            <div className="bg-zinc-950/95 backdrop-blur-3xl p-5 sm:p-8 rounded-[2.5rem] sm:rounded-[3.5rem] border-4 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.25)] relative overflow-hidden">
              
              {/* Dynamic top bar signature with Angola Flag gradient style */}
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-red-600 via-zinc-900 to-amber-500"></div>

              {/* Configure Gear for administrators - Floating on top right */}
              <button 
                onClick={() => {
                  setTempEntity(paymentEntity);
                  setTempReference(paymentReference);
                  setShowConfigModal(true);
                }} 
                className="absolute top-6 right-6 p-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:text-amber-500 text-zinc-500 rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95 z-30"
                title="Configurar Parâmetros de Pagamento"
              >
                ⚙️
              </button>

              <div className="relative z-10 space-y-6">
                
                {/* Header Badge */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-5 py-2 rounded-full font-black text-[10px] sm:text-xs tracking-[0.2em] uppercase text-amber-400 shadow-[inset_0_0_15px_rgba(245,158,11,0.05)]">
                    🔒 CHECKOUT SEGURO • CANAL MULTICAIXA BNA
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">
                    VALIDAÇÃO DE IDENTIDADE E SAQUE 🏦
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 font-bold max-w-xl mx-auto">
                    Olá, <span className="text-amber-400">{userName ? userName.toUpperCase() : 'VENCEDOR'}</span>! O seu processo de transferência está no último passo. Conclua a ativação eletrónica contra robôs abaixo.
                  </p>
                </div>

                {uploadStatus === 'idle' ? (
                  <>
                    {/* Urgency countdown indicator */}
                    <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl animate-pulse">⏳</span>
                        <div>
                          <p className="text-xs font-black uppercase text-red-400 tracking-wider">A REFERÊNCIA IRÁ EXPIRAR EM BREVE</p>
                          <p className="text-[10px] text-zinc-400 font-bold">Faça o pagamento antes que os fundos retornem ao Tesouro Nacional.</p>
                        </div>
                      </div>
                      <div className="bg-black/60 border border-red-500/40 px-5 py-2 rounded-xl font-mono text-xl sm:text-2xl font-black text-red-500 tracking-wider">
                        {formatTime(countdownSeconds)}
                      </div>
                    </div>

                    {/* Rich Multicaixa Display Panel */}
                    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2x">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                          <span className="text-[11px] font-black uppercase text-zinc-300 tracking-widest">MULTICAIXA — PAGAMENTO DE SERVIÇOS</span>
                        </div>
                      </div>

                      {/* BNA 21% Subsidy Celebration & Explanation Banner */}
                      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 text-left">
                        <div className="text-3xl shrink-0 animate-bounce">🎉</div>
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                            CAMPANHA NACIONAL DE INCLUSÃO FINANCEIRA (EMIS & BNA)
                          </h4>
                          <p className="text-[11px] text-zinc-300 font-bold leading-relaxed">
                            <strong className="text-white">Aviso de Tarifa Reduzida:</strong> No vídeo explicativo padrão é mencionado o valor de <span className="line-through text-rose-450 font-black">5.000,00 Kz</span>. No entanto, por motivo de celebração do <strong className="text-white">Protocolo de Apoio ao Cidadão do Banco Nacional de Angola (BNA)</strong>, o Estado Angolano está a subsidiar <strong className="text-emerald-450">1.050,00 Kz (21% dos encargos)</strong> para encorajar as transações eletrónicas nacionais! Com isso, o valor real a transferir foi reduzido temporariamente para apenas <strong className="text-amber-400 font-black">3.950,00 Kz</strong> (e receberá de volta a totalidade no saque final).
                          </p>
                        </div>
                      </div>

                      {/* Payment Fields (Entidade, Referência, Montante) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Entidade Field */}
                        <div className="bg-black/40 border border-zinc-900 rounded-2xl p-4 text-center relative group hover:border-amber-500/25 transition-all">
                          <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase block mb-1.5">ENTIDADE</span>
                          <span className="text-2xl font-mono font-black text-white block tracking-widest">
                            {paymentEntity}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(paymentEntity.replace(/\s+/g, ''));
                              try {
                                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                                const ctx = new AudioCtx();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain); gain.connect(ctx.destination);
                                osc.frequency.setValueAtTime(800, ctx.currentTime);
                                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                                osc.start(); osc.stop(ctx.currentTime + 0.05);
                              } catch (e) {}
                              setCopiedField('entity');
                              setTimeout(() => setCopiedField(null), 2000);
                            }}
                            className="mt-3.5 w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-black text-amber-400 rounded-xl uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] border border-zinc-805"
                          >
                            <span>{copiedField === 'entity' ? '✅ COPIADO!' : '📋 COPIAR'}</span>
                          </button>
                        </div>

                        {/* Referência Field */}
                        <div className="bg-black/40 border border-zinc-900 rounded-2xl p-4 text-center relative group hover:border-amber-500/25 transition-all">
                          <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase block mb-1.5">REFERÊNCIA</span>
                          <span className="text-2xl font-mono font-black text-amber-400 block tracking-wider">
                            {paymentReference}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(paymentReference.replace(/\s+/g, ''));
                              try {
                                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                                const ctx = new AudioCtx();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain); gain.connect(ctx.destination);
                                osc.frequency.setValueAtTime(800, ctx.currentTime);
                                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                                osc.start(); osc.stop(ctx.currentTime + 0.05);
                              } catch (e) {}
                              setCopiedField('ref');
                              setTimeout(() => setCopiedField(null), 2000);
                            }}
                            className="mt-3.5 w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-black text-amber-400 rounded-xl uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] border border-zinc-805"
                          >
                            <span>{copiedField === 'ref' ? '✅ COPIADO!' : '📋 COPIAR'}</span>
                          </button>
                        </div>

                        {/* Valor / Montante Field */}
                        <div className="bg-black/40 border border-zinc-900 rounded-2xl p-4 text-center relative group hover:border-amber-500/25 transition-all">
                          <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase block mb-1.5">VALOR DA TAXA</span>
                          <span className="text-2xl font-mono font-black text-emerald-400 block tracking-tight">
                            3.950,00 Kz
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('3950');
                              try {
                                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                                const ctx = new AudioCtx();
                                const osc = ctx.createOscillator();
                                const gain = ctx.createGain();
                                osc.connect(gain); gain.connect(ctx.destination);
                                osc.frequency.setValueAtTime(800, ctx.currentTime);
                                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                                osc.start(); osc.stop(ctx.currentTime + 0.05);
                              } catch (e) {}
                              setCopiedField('amount');
                              setTimeout(() => setCopiedField(null), 2000);
                            }}
                            className="mt-3.5 w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-[10px] font-black text-emerald-400 rounded-xl uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] border border-zinc-805"
                          >
                            <span>{copiedField === 'amount' ? '✅ COPIADO!' : '📋 COPIAR'}</span>
                          </button>
                        </div>

                      </div>

                      {/* TUTORIAL PASSO-A-PASSO ANGO-PAGAMENTOS */}
                      <div className="bg-black/60 rounded-2xl p-4 border border-zinc-855 space-y-3">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <span className="text-amber-400 text-sm">💡</span>
                          <h4 className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider">
                            COMO EFETUAR O PAGAMENTO (TUTORIAL MULTICAIXA):
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-zinc-400 font-bold leading-normal">
                          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 relative">
                            <span className="absolute -top-2.5 -left-1 bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded-md">PASSO 1</span>
                            <p className="mt-1 text-zinc-300">
                              Aceda ao <strong className="text-white">Multicaixa Express</strong> no telemóvel, <strong className="text-white">Internet Banking</strong> do seu banco (BAI, BFA, BIC, SOL, etc.) ou dirija-se a um <strong className="text-white">Caixa ATM físico</strong>.
                            </p>
                          </div>
                          
                          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 relative">
                            <span className="absolute -top-2.5 -left-1 bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded-md">PASSO 2</span>
                            <p className="mt-1 text-zinc-300">
                              Selecione a opção de menu <strong className="text-white">"PAGAMENTOS"</strong> e de seguida selecione a opção <strong className="text-white">"PAGAMENTO DE SERVIÇOS / COMPRAS"</strong>.
                            </p>
                          </div>

                          <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 relative">
                            <span className="absolute -top-2.5 -left-1 bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.5 rounded-md">PASSO 3</span>
                            <p className="mt-1 text-zinc-300">
                              Introduza os dados fornecidos acima: a Entidade <strong className="text-amber-400 font-mono">{paymentEntity}</strong>, a Referência <strong className="text-amber-400 font-mono">{paymentReference}</strong> e o valor exato de <strong className="text-emerald-450 font-black">3.950 Kz</strong>.
                            </p>
                          </div>
                        </div>
                        <div className="bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10 text-[10px] text-zinc-400 font-bold text-center">
                          ℹ️ <strong className="text-white font-black">NOTA IMPORTANTE:</strong> Após pagar, descarregue o <span className="text-amber-400 underline">comprovativo em PDF ou capture um print</span> e faça o upload abaixo para a verificação eletrónica imediata SPTR.
                        </div>
                      </div>

                      {/* Guarantee of Instant automatic Refund Explanation */}
                      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-2.5">
                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider">
                          <span>🛡️ PROTOCOLO DE REEMBOLSO INTEGRAL AUTOMATIZADO</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-bold leading-relaxed">
                          Sob a Diretiva n.º 14/26 do Banco Nacional de Angola, o valor processual desta taxa de validação anti-spam de <strong className="text-white">3.950,00 Kz</strong> é somado ao total do saque aprovado de <strong className="text-emerald-400">{(stats.accumulatedKz || 150000).toLocaleString('pt-AO')} Kz</strong>. O depósito em conta de destino faturado será de:
                        </p>
                        <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850/60 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 w-full">
                          <div className="text-[10px] sm:text-xs text-zinc-400 font-black uppercase tracking-wider">
                            Saque: <strong className="text-white font-mono">{(stats.accumulatedKz || 150000).toLocaleString('pt-AO')} Kz</strong>
                          </div>
                          <span className="text-zinc-500 font-bold shrink-0 hidden sm:inline">+</span>
                          <div className="text-[10px] sm:text-xs text-zinc-400 font-black uppercase tracking-wider">
                            Reembolso Taxa: <strong className="text-white font-mono">3.950 Kz</strong>
                          </div>
                          <span className="text-zinc-500 font-bold shrink-0 hidden sm:inline text-lg">=</span>
                          <div className="text-xs sm:text-sm text-yellow-400 font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
                            Total a Receber: <strong className="text-yellow-400 font-mono text-sm sm:text-base">{((stats.accumulatedKz || 150000) + 3950).toLocaleString('pt-AO')} Kz</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Upload Dropzone / Auto Validator Form */}
                    <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 text-center space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">🧾 ENVIAR COMPROVATIVO DE PAGAMENTO</h4>
                        <p className="text-[10px] text-zinc-500 font-bold">Faça o upload do seu talão de pagamento para ativação imediata instantânea.</p>
                      </div>

                      {uploadError && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-3 rounded-xl text-[11px] font-bold text-center flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            <span>⚠️</span>
                            <span>{uploadError}</span>
                          </span>
                          <button 
                            onClick={() => setUploadError('')}
                            className="text-zinc-500 hover:text-white font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row items-center gap-3">
                        {/* Elegant Drag & Drop or Select Image Zone */}
                        {uploadedFile ? (
                          <div className="flex-1 w-full border-2 border-emerald-500/40 bg-emerald-500/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all relative">
                            <span className="text-3xl animate-pulse">📄</span>
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">COMPROVATIVO CARREGADO</span>
                            <span className="text-xs text-white font-mono font-bold truncate max-w-[250px]">{uploadedFile.name}</span>
                            <span className="text-[9px] text-zinc-400 font-bold">{(uploadedFile.size / 1024).toFixed(1)} KB • PRONTO PARA VALIDAR</span>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setUploadedFile(null);
                                setReceiptUrl('');
                              }}
                              className="absolute top-2 right-2 text-zinc-500 hover:text-rose-400 text-xs font-bold transition-all px-2 py-1 bg-zinc-950/80 rounded-lg border border-zinc-800"
                            >
                              Remover
                            </button>
                          </div>
                        ) : (
                          <label className="flex-1 w-full border-2 border-dashed border-zinc-800 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-zinc-900/30">
                            <span className="text-3xl animate-bounce">📤</span>
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">SUBMETER COMPROVATIVO</span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase">PNG, JPG, JPEG OU PDF</span>
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              onChange={handleFileUpload} 
                              className="hidden" 
                            />
                          </label>
                        )}
                        
                        <div className="w-full md:w-auto shrink-0 space-y-2">
                          <button
                            onClick={triggerValidation}
                            className="w-full px-6 py-5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-650 font-black text-black text-xs sm:text-sm uppercase rounded-2xl shadow-xl transition-all border-b-4 border-amber-700 active:scale-95 active:border-b-2 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>⚡ JÁ PAGUEI, VALIDAR AGORA</span>
                          </button>
                          <p className="text-[8px] font-black tracking-wide text-zinc-500 uppercase">DETEÇÃO ELETRÓNICA SMART-EMIS EM 30S</p>
                        </div>
                      </div>

                      {/* Fast-load simulator link */}
                      {!uploadedFile && (
                        <button
                          onClick={() => {
                            const mockFile = new File(["receipt"], "comprovativo_multicaixa.png", { type: "image/png" });
                            selectFile(mockFile);
                          }}
                          className="text-[10px] text-zinc-500 hover:text-amber-400 underline font-bold transition-all block text-center mt-2 mx-auto uppercase"
                        >
                          💡 Usar Comprovativo de Teste para Simulação Rápida
                        </button>
                      )}
                    </div>
                  </>
                ) : uploadStatus === 'frozen' ? (
                  /* Stunning official red security warning panel indicating account is unverified and withdrawal is frozen */
                  <div className="bg-gradient-to-b from-red-950/90 to-black border-4 border-red-500/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden animate-zoom-in shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                    
                    {/* Security warning background halo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-650 rounded-full opacity-10 blur-[120px] pointer-events-none"></div>

                    <div className="space-y-4">
                      {/* Big pulsing red warning badge */}
                      <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                        <span className="text-4xl">⚠️</span>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="inline-block text-[10px] font-black bg-red-600/20 border border-red-500/40 text-red-550 px-3 py-1 rounded-full uppercase tracking-widest">
                          SISTEMA DE SEGURANÇA EMIS • ALERTA DE COMPENSAÇÃO BNA
                        </span>
                        <h3 className="text-2xl sm:text-4xl font-black text-red-500 uppercase italic tracking-tighter leading-tight">
                          ❌ CONTA NÃO VERIFICADA!<br />
                          O SEU SAQUE ESTÁ CONGELADO 🔒
                        </h3>
                      </div>
                    </div>

                    {/* Official statement box */}
                    <div className="space-y-4 text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed bg-black/60 border-2 border-red-950 rounded-2xl p-4 sm:p-6 text-left relative">
                      <p className="font-bold text-red-200 border-b border-red-955 pb-3 uppercase text-[11px] tracking-wide flex items-center gap-2">
                        <span>📢</span> COMUNICADO EMITIDO PELO BANCO REGULADOR (AGT/BNA):
                      </p>
                      
                      <p className="font-extrabold text-white text-xs sm:text-sm leading-relaxed">
                        O comprovativo de pagamento submetido foi analisado eletronicamente, mas o sistema de compensação interbancário detetou que a sua <span className="text-red-400 font-black underline">CONTA DE RECEÇÃO NÃO SE ENCONTRA VERIFICADA</span> no protocolo fiscal Angolano da EMIS.
                      </p>

                      <p className="text-zinc-400 text-[11px] sm:text-xs">
                        Para combater atividades de spam e faturamento automatizado por robôs falsos, <span className="text-white font-bold">o seu saque de {((stats.accumulatedKz || 150000)).toLocaleString('pt-AO')} Kz permanecerá em estado de CONGELAMENTO TOTAL</span> até que o pagamento real ou compensação real da referida taxa única processual de <strong className="text-amber-400 font-extrabold underline">3.950,00 Kz</strong> seja efetuado e detectado nos canais interbancários sob a entidade e referência oficiais geradas para a sua conta.
                      </p>

                      {/* Summary status tracker HUD */}
                      <div className="bg-zinc-950/80 p-3 sm:p-4 rounded-xl border border-red-950 text-[10px] sm:text-xs text-zinc-400 space-y-1.5 uppercase font-mono tracking-tight">
                        <div>💵 BALANÇO CLIENTE: <span className="text-rose-450 font-bold">{((stats.accumulatedKz || 150000)).toLocaleString('pt-AO')} Kz (RETIDO)</span></div>
                        <div>📁 ANÁLISE COMPROVATIVO: <span className="text-rose-500 font-black">FALSO COMPROVATIVO DETETADO (REJEITADO PELA REDE INTERBANCÁRIA)</span></div>
                        <div>🧾 VALOR EM ATRAZO (TAXA BNA): <span className="text-amber-500 font-black">3.950,00 Kz (REEMBOLSÁVEL)</span></div>
                        <div className="text-[9px] text-zinc-500 pt-1 border-t border-red-950/40">CÓDIGO DE BLOQUEIO: BNA-REJ-ERR_604b_UNVERIFIED_ACCOUNT</div>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 font-bold leading-normal flex items-start gap-2">
                        <span className="shrink-0 text-sm">💡</span>
                        <span>
                          <strong>GARANTIA BNA:</strong> O seu prémio nacional está devidamente garantido e segregado no cofre eletrónico da EMIS. Assim que pagar a taxa protocolar de 3.950 Kz, <strong className="text-white underline">o valor será libertado juntamente com a devolução integral da taxa de 3.950 Kz</strong> em poucos segundos na sua conta de destino! Total a entrar na conta: <strong className="text-white">{((stats.accumulatedKz || 150000) + 3950).toLocaleString('pt-AO')} Kz</strong>.
                        </span>
                      </div>
                    </div>

                    {/* Action buttons (CTAs) to let user proceed with actual Multicaixa Payment */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadStatus('idle');
                          setUploadProgress(0);
                        }}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-black rounded-xl uppercase text-xs tracking-wider border-b-4 border-amber-700 active:scale-95 transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
                      >
                        ⚡ VER DADOS PARTICULARES DE PAGAMENTO MULTICAIXA
                      </button>
                      
                      <button 
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadStatus('idle');
                          setUploadProgress(0);
                        }}
                        className="px-6 py-4 bg-zinc-900 hover:bg-zinc-850 text-rose-450 hover:text-white font-extrabold rounded-xl uppercase text-xs tracking-wider border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer animate-pulse"
                      >
                        🔄 VOLTAR E ADERIR AO PAGAMENTO
                      </button>
                    </div>

                  </div>
                ) : (
                  /* High tech parsing HUD screen during validation phase */
                  <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-12 text-center space-y-8 animate-fade-in relative min-h-[350px] flex flex-col justify-center items-center">
                    
                    {/* Glowing radial progress circle */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="56" 
                          className="text-zinc-900" 
                          strokeWidth="8" 
                          stroke="currentColor" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="56" 
                          className="text-amber-500 transition-all duration-300" 
                          strokeWidth="8" 
                          strokeDasharray={2 * Math.PI * 56} 
                          strokeDashoffset={2 * Math.PI * 56 * (1 - uploadProgress / 100)} 
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-mono font-black text-white">{uploadProgress}%</span>
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">SINC</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-w-md mx-auto">
                      <h4 className="text-lg font-black text-white uppercase italic tracking-tight animate-pulse">
                        {uploadStatus === 'analyzing' && '📂 ESCANEANDO IMAGEM DO COMPROVATIVO...'}
                        {uploadStatus === 'verifying' && '🔍 CONSULTANDO REGISTO MULTICAIXA BNA...'}
                        {uploadStatus === 'sptr' && '📡 COMPENSANDO EM TEMPO REAL SPTR EMIS...'}
                        {uploadStatus === 'success' && '🟢 TRANSFERÊNCIA GERADA COM SUCESSO!'}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-bold leading-normal">
                        {uploadStatus === 'analyzing' && 'O algoritmo está a extrair os dados lidos do comprovativo, campos de entidade e data do faturamento.'}
                        {uploadStatus === 'verifying' && 'Conectando à API com chaves criptográficas do Banco Regulador para validar idoneidade da transação.'}
                        {uploadStatus === 'sptr' && 'O robô inteligente de compensação está a autorizar a transação da taxa anti-fraude e faturar o prémio.'}
                        {uploadStatus === 'success' && 'Tudo validado! O Kwanza está programado para entrar no seu saldo.'}
                      </p>
                    </div>

                    {/* Checklists */}
                    <div className="w-full max-w-sm bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900 border-dashed text-left space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                        <span>ESTADO DA OPERAÇÃO</span>
                        <span className="font-mono text-zinc-500">{uploadProgress >= 15 ? ' OK' : 'PENDENTE'}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Return button */}
                <div className="flex justify-center gap-4 pt-4 border-t border-zinc-900/60 max-w-lg mx-auto">
                  <button 
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadStatus('idle');
                      setUploadProgress(0);
                      setGameState(GameState.AFRICA_DAY_PROMO);
                    }} 
                    className="py-3 px-6 bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 text-zinc-400 font-black rounded-2xl uppercase text-[10px] tracking-wider select-none cursor-pointer transition-all"
                  >
                    🔙 Voltar ao Bilhete com Bónus BNA
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Payment Details Admin Configurator Drawer Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in font-mono">
          <div className="bg-zinc-950 p-6 sm:p-8 rounded-[2rem] border-4 border-angola-yellow max-w-md w-full relative space-y-6 shadow-[0_0_50px_rgba(248,211,8,0.2)]">
            <div className="text-center">
              <span className="text-3xl">⚙️</span>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase italic tracking-tight mt-2">
                PAINEL CONFIGURAÇÃO DE PAGAMENTO
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase mt-1">
                Apenas para o Administrador do Sistema (Não mostrar ao jogador)
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-[9px] sm:text-[10px] font-black tracking-widest text-zinc-400 uppercase block mb-1">
                  ENTIDADE DO PAGAMENTO (MULTICAIXA)
                </label>
                <input 
                  type="text" 
                  value={tempEntity} 
                  onChange={(e) => setTempEntity(e.target.value)}
                  placeholder="Ex: 23502" 
                  className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3.5 outline-none text-white font-mono text-center font-black text-sm uppercase focus:border-angola-yellow transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] sm:text-[10px] font-black tracking-widest text-zinc-400 uppercase block mb-1">
                  REFERÊNCIA DE PAGAMENTO
                </label>
                <input 
                  type="text" 
                  value={tempReference} 
                  onChange={(e) => setTempReference(e.target.value)}
                  placeholder="Ex: 902 415 832" 
                  className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3.5 outline-none text-white font-mono text-center font-black text-sm uppercase focus:border-angola-yellow transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] sm:text-[10px] font-black tracking-widest text-zinc-400 uppercase block mb-1">
                  ID DO PIXEL DO META (OPCIONAL)
                </label>
                <input 
                  type="text" 
                  value={tempPixelId} 
                  onChange={(e) => setTempPixelId(e.target.value)}
                  placeholder="Ex: 123456789012345" 
                  className="w-full bg-black border-2 border-zinc-800 rounded-xl p-3.5 outline-none text-white font-mono text-center font-black text-sm uppercase focus:border-angola-yellow transition-all"
                />
                <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1 leading-normal">
                  Dica: Também pode forçar via URL usando ?pixel=ID_AQUI para campanhas de afiliado!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setShowConfigModal(false)}
                className="py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded-xl font-black uppercase text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={savePaymentConfig}
                className="py-3 bg-angola-yellow hover:bg-yellow-400 text-black rounded-xl font-black uppercase text-xs transition-all shadow-md cursor-pointer"
              >
                Salvar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {notifications.map(n => (
          <div key={n.id} className="notificacao-ganhador scale-[1.1] shadow-2xl border-4 border-angola-yellow">
            <span className="text-2xl animate-bounce">🤑</span>
            <div className="flex flex-col">
              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-tighter">Saque em Tempo Real</span>
              <span className="text-[11px] font-black uppercase italic text-white">{n.text}</span>
            </div>
          </div>
        ))}
      </div>

      {showFlyingNotes && (
        <div className="fixed inset-0 pointer-events-none z-[200]">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="notas-saque text-3xl md:text-5xl"
              style={{ 
                left: `${Math.random() * 100}%`, 
                top: '-50px',
                animationDuration: `${2 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 1}s`
              }}
            >
              💸
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
