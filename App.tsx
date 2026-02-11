
import React, { useState, useEffect } from 'react';
import { Quiz } from './components/Quiz';
import { GameState, UserStats, WithdrawMethod, Transaction } from './types';

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

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [stats, setStats] = useState<UserStats>({
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    bestScoreKz: Number(localStorage.getItem('bestKz')) || 0,
    accumulatedKz: 0
  });
  
  const [userName, setUserName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [withdrawInput, setWithdrawInput] = useState('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(JSON.parse(localStorage.getItem('transacoes') || '[]'));
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);
  const [showFlyingNotes, setShowFlyingNotes] = useState(false);

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

  const handleQuizComplete = (score: number, correctCount: number, kz: number) => {
    setStats({ 
      score, 
      correctAnswers: correctCount, 
      totalQuestions: 15, 
      accumulatedKz: kz, 
      bestScoreKz: Math.max(stats.bestScoreKz, kz) 
    });
    setGameState(GameState.RESULTS);
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
    <div className="max-w-4xl mx-auto px-4 py-12 text-center relative">
      <div className="samakaka-pattern"></div>
      
      <div className="mb-16 relative z-10 animate-bounce-in">
        <div className="inline-block bg-angola-red px-4 py-1 mb-6 rounded-lg rotate-[-2deg] shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Conhecimento vale Kwanza</span>
        </div>
        <h1 className="text-8xl md:text-9xl font-black text-white italic tracking-tighter mb-4 leading-none drop-shadow-2xl">
          SOU <span className="text-angola-yellow">ANGOLANO</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.5em] text-[10px]">A plataforma número 1 de recompensas culturais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <button onClick={() => setGameState(GameState.QUIZ)} 
          className="group p-10 btn-ganho rounded-[3rem] text-left transform transition-all hover:scale-[1.03] active:scale-95">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-3xl font-black text-black uppercase italic leading-none">JOGAR &<br/>GANHAR</h3>
            <span className="text-5xl drop-shadow-md">💰</span>
          </div>
          <p className="text-black/60 font-black uppercase text-xs">GANHE 10.000 Kz POR ACERTO</p>
        </button>

        <button onClick={() => setGameState(GameState.INSTRUCTIONS)} 
          className="p-10 bg-zinc-900 border-4 border-zinc-800 rounded-[3rem] hover:border-angola-red transition-all text-left transform hover:scale-[1.03]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-black text-white uppercase italic">REGRAS DO<br/>JOGO</h3>
            <span className="text-4xl opacity-40">📜</span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-xs">VEJA COMO FUNCIONA</p>
        </button>

        <button onClick={() => setGameState(GameState.RANKING)} 
          className="p-10 bg-zinc-900 border-4 border-zinc-800 rounded-[3rem] hover:border-white transition-all text-left transform hover:scale-[1.03]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-black text-white uppercase italic">MEUS<br/>SAQUES</h3>
            <span className="text-4xl opacity-40">🏦</span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-xs">HISTÓRICO DE LUCROS</p>
        </button>

        <div className="p-10 bg-gradient-to-br from-zinc-900 to-black border-4 border-zinc-800 rounded-[3rem] text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform"><span className="text-7xl">🏆</span></div>
          <h3 className="text-2xl font-black text-zinc-400 uppercase italic mb-4">RANKING TOP 3</h3>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-2xl"><span className="text-zinc-100 font-bold">1. Carlos M.</span><span className="text-angola-yellow font-black">1.450.000 Kz</span></div>
            <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-2xl"><span className="text-zinc-400 font-bold">2. Maria C.</span><span className="text-angola-yellow/80 font-black">1.120.000 Kz</span></div>
            <div className="flex justify-between items-center bg-zinc-800/50 p-3 rounded-2xl"><span className="text-zinc-500 font-bold">3. João K.</span><span className="text-angola-yellow/60 font-black">890.000 Kz</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden selection:bg-angola-yellow selection:text-black">
      <main className="max-w-7xl mx-auto py-12">
        {gameState === GameState.HOME && renderHome()}
        {gameState === GameState.QUIZ && <Quiz onComplete={handleQuizComplete} onQuit={() => setGameState(GameState.HOME)} triggerNotification={() => {}} />}
        
        {gameState === GameState.INSTRUCTIONS && (
           <div className="max-w-2xl mx-auto px-4 py-12 animate-zoom-in">
             <div className="glass-card p-12 rounded-[4rem] border-zinc-700 text-center shadow-2xl relative">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-angola-yellow text-black px-8 py-2 rounded-full font-black uppercase text-sm italic">O Manual do Ganhador</div>
               <h2 className="text-4xl font-black text-white mb-10 italic uppercase tracking-tighter">COMO LUCRAR?</h2>
               <div className="text-left space-y-8 text-zinc-300 mb-12">
                 <div className="flex items-center gap-6 group">
                    <span className="bg-angola-yellow text-black w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl group-hover:rotate-12 transition-transform shadow-lg">1</span>
                    <p className="font-bold text-lg">Acerte as questões de cultura. Cada acerto vale <span className="text-angola-yellow font-black">10.000 Kz REAIS</span>.</p>
                 </div>
                 <div className="flex items-center gap-6 group">
                    <span className="bg-angola-yellow text-black w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl group-hover:rotate-12 transition-transform shadow-lg">2</span>
                    <p className="font-bold text-lg">Quanto mais rápido responder, maior a sua pontuação no ranking semanal!</p>
                 </div>
                 <div className="flex items-center gap-6 group">
                    <span className="bg-angola-yellow text-black w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl group-hover:rotate-12 transition-transform shadow-lg">3</span>
                    <p className="font-bold text-lg">O levantamento é imediato após a <span className="text-angola-red font-black">Verificação Fiscal (5.000 Kz)</span> para isenção de impostos.</p>
                 </div>
               </div>
               <button onClick={() => setGameState(GameState.HOME)} className="w-full py-6 bg-zinc-800 text-white font-black rounded-[2rem] hover:bg-zinc-700 transition-all uppercase tracking-widest text-sm border-b-4 border-zinc-950">ENTENDI, QUERO JOGAR</button>
             </div>
           </div>
        )}

        {gameState === GameState.RANKING && (
           <div className="max-w-2xl mx-auto px-4 py-12 animate-zoom-in">
             <div className="glass-card p-12 rounded-[4rem] border-zinc-700 text-center shadow-2xl">
               <div className="flex items-center justify-center gap-4 mb-8">
                  <span className="text-4xl">💰</span>
                  <h2 className="text-4xl font-black text-angola-yellow italic uppercase tracking-tighter">MINHA BANCA</h2>
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
                           <span className="text-2xl font-black text-angola-yellow group-hover:scale-110 block transition-transform">{t.amount.toLocaleString('pt-AO')} Kz</span>
                           <div className="inline-flex items-center gap-1 bg-angola-red/10 px-3 py-1 rounded-full mt-2">
                              <div className="w-1.5 h-1.5 bg-angola-red rounded-full animate-pulse"></div>
                              <span className="text-[9px] text-angola-red uppercase font-black tracking-widest">Status Pendente</span>
                           </div>
                        </div>
                     </div>
                     {/* Observação solicitada */}
                     <p className="text-[9px] text-zinc-400 italic mt-3 font-medium">
                        * O seu saque está pendente, verifique primeiro a taxa.
                     </p>
                     {/* Botão de Verificar Taxa Atualizado */}
                     <button 
                       onClick={() => window.open('https://www.kintu.org/product/2aeff560-f13b-4814-9305-cba3f58e2a80', '_blank')}
                       className="mt-4 w-full py-3 bg-angola-red text-white font-black rounded-2xl uppercase tracking-widest text-[10px] animate-pulse shadow-lg hover:bg-red-700 transition-all border-b-4 border-red-900"
                     >
                       EMITIR A FATURA DE VERIFICAÇÃO
                     </button>
                   </div>
                 )) : (
                   <div className="py-20 border-4 border-dashed border-zinc-900 rounded-[3rem]">
                      <div className="text-6xl mb-4 opacity-20">💸</div>
                      <p className="text-zinc-600 font-black uppercase text-sm italic">Sua carteira está vazia.<br/>Vá ganhar algum Kwanza!</p>
                   </div>
                 )}
               </div>
               <button onClick={() => setGameState(GameState.HOME)} className="w-full py-6 bg-zinc-800 text-white font-black rounded-[2rem] hover:bg-zinc-700 transition-all uppercase tracking-widest text-sm border-b-4 border-zinc-950">VOLTAR AO MENU</button>
             </div>
           </div>
        )}

        {gameState === GameState.RESULTS && (
          <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
            <div className="glass-card p-12 md:p-20 rounded-[5rem] w-full max-w-3xl border-angola-yellow border-4 gold-glow relative overflow-hidden animate-bounce-in">
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-angola-red via-angola-yellow to-angola-red"></div>
              
              <div className="relative z-10">
                <div className="text-8xl mb-8 animate-bounce">🤑</div>
                <h2 className="text-6xl md:text-8xl font-black italic mb-4 tracking-tighter text-white">VITÓRIA!</h2>
                <p className="text-angola-yellow font-black uppercase text-xl mb-12 tracking-[0.3em]">O SEU LUCRO FOI COMPUTADO</p>
                
                <div className="bg-zinc-950 p-12 rounded-[3.5rem] border-2 border-zinc-800 mb-12 shadow-inner">
                  <p className="text-zinc-500 text-xs font-black uppercase mb-4 tracking-widest">Saldo Disponível para Saque</p>
                  <p className="text-7xl md:text-9xl font-black text-angola-yellow italic drop-shadow-[0_4px_10px_rgba(248,211,8,0.5)]">
                    {stats.accumulatedKz.toLocaleString()} <span className="text-2xl">Kz</span>
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <button onClick={() => setGameState(GameState.QUIZ)} className="flex-1 py-7 bg-zinc-900 text-white font-black rounded-[2.5rem] uppercase text-sm border-2 border-zinc-800 hover:bg-zinc-800 transition-all">
                    TURBINAR GANHOS
                  </button>
                  <button onClick={() => setGameState(GameState.WITHDRAW_METHOD)} className="flex-1 py-7 btn-ganho text-black font-black rounded-[2.5rem] text-2xl shadow-2xl uppercase italic animate-pulse">
                    SACAR TUDO AGORA
                  </button>
                </div>
              </div>

              {/* Decorative elements for euphoria */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-angola-red rounded-full opacity-10 blur-3xl"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-angola-yellow rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        )}

        {/* Reusing existing Withdraw views with styling enhancements */}
        {gameState === GameState.WITHDRAW_METHOD && (
          <div className="max-w-xl mx-auto p-6 animate-zoom-in">
            <div className="glass-card p-12 rounded-[4rem] border-zinc-800 shadow-2xl">
              <h2 className="text-3xl font-black text-angola-yellow italic mb-10 uppercase text-center">RECEPÇÃO DE VALORES</h2>
              <div className="space-y-4 mb-10">
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Nome do Beneficiário" className="w-full bg-zinc-950 border-4 border-zinc-900 rounded-3xl p-6 outline-none focus:border-angola-yellow text-white font-black text-lg transition-all" />
                
                <div onClick={() => setSelectedMethod(WithdrawMethod.BANK_TRANSFER)} className={`opcao-deposito ${selectedMethod === WithdrawMethod.BANK_TRANSFER ? 'selecionado border-4' : 'border-4 border-zinc-900'} p-8 rounded-[2.5rem] transition-all`}>
                   <div className="flex justify-between items-center">
                      <div>
                        <p className="font-black text-xl">💳 BANCO (IBAN)</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Transferência Interbancária</p>
                      </div>
                      <span className="text-3xl">🏛️</span>
                   </div>
                </div>
                
                <div onClick={() => setSelectedMethod(WithdrawMethod.MULTICAIXA)} className={`opcao-deposito ${selectedMethod === WithdrawMethod.MULTICAIXA ? 'selecionado border-4' : 'border-4 border-zinc-900'} p-8 rounded-[2.5rem] transition-all`}>
                   <div className="flex justify-between items-center">
                      <div>
                        <p className="font-black text-xl">🏧 MULTICAIXA EXPRESS</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Levantamento sem cartão</p>
                      </div>
                      <span className="text-3xl">📱</span>
                   </div>
                </div>
              </div>
              <button disabled={!selectedMethod || !userName} onClick={() => setGameState(selectedMethod === WithdrawMethod.BANK_TRANSFER ? GameState.WITHDRAW_BANK : GameState.WITHDRAW_FORM)} className={`w-full py-7 font-black rounded-[2.5rem] uppercase text-xl transition-all ${selectedMethod && userName ? 'btn-ganho text-black shadow-2xl' : 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed'}`}>
                CONTINUAR LEVANTAMENTO
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.WITHDRAW_BANK && (
          <div className="max-w-xl mx-auto p-6 animate-zoom-in">
            <div className="glass-card p-12 rounded-[4rem] border-zinc-800">
              <h2 className="text-3xl font-black italic mb-10 text-center">🏦 REDE BANCÁRIA</h2>
              <div className="space-y-3 mb-10 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                {BANCOS_ANGOLA.map(b => (
                  <div key={b.id} onClick={() => setSelectedBank(b)} className={`p-6 bg-zinc-950 rounded-3xl cursor-pointer border-4 transition-all ${selectedBank?.id === b.id ? 'border-angola-yellow bg-zinc-900 shadow-lg' : 'border-zinc-900 hover:border-zinc-800'}`}>
                    <p className="font-black text-white">{b.name}</p>
                    <p className="text-[10px] text-zinc-600 font-bold">Código Swift: {b.code}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setGameState(GameState.WITHDRAW_METHOD)} className="flex-1 py-5 bg-zinc-900 rounded-2xl font-black uppercase text-xs">Voltar</button>
                <button disabled={!selectedBank} onClick={() => setGameState(GameState.WITHDRAW_FORM)} className={`flex-1 py-5 font-black rounded-2xl uppercase text-sm ${selectedBank ? 'bg-angola-yellow text-black' : 'bg-zinc-900 opacity-50'}`}>Confirmar Banco</button>
              </div>
            </div>
          </div>
        )}

        {gameState === GameState.WITHDRAW_FORM && (
          <div className="max-w-xl mx-auto p-6 animate-zoom-in">
            <div className="glass-card p-12 rounded-[4rem] border-zinc-800 text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="text-3xl font-black italic mb-10 uppercase">FINALIZAR DADOS</h2>
              <div className="space-y-6 mb-12">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  {selectedMethod === WithdrawMethod.BANK_TRANSFER ? 'Digite o seu IBAN Completo (21 dígitos)' : 'Digite o seu Número Multicaixa (9 dígitos)'}
                </p>
                <input value={withdrawInput} onChange={e => setWithdrawInput(e.target.value.replace(/\D/g, ''))} className="w-full bg-zinc-950 border-4 border-zinc-900 rounded-3xl p-6 outline-none focus:border-angola-yellow font-mono text-2xl text-white text-center tracking-widest" placeholder={selectedMethod === WithdrawMethod.BANK_TRANSFER ? "00..." : "9..."} />
                <div className="bg-zinc-900/50 p-6 rounded-3xl text-left border border-zinc-800">
                  <p className="text-zinc-500 text-[9px] font-black uppercase mb-2">Resumo da Operação</p>
                  <div className="flex justify-between text-sm"><span>Valor Bruto:</span> <span className="text-white font-black">{stats.accumulatedKz.toLocaleString()} Kz</span></div>
                  <div className="flex justify-between text-sm"><span>Taxas:</span> <span className="text-angola-red font-black">0,00 Kz (Isento)</span></div>
                </div>
              </div>
              <button onClick={handleWithdrawRequest} className="w-full py-8 btn-ganho text-black font-black rounded-[3rem] uppercase tracking-widest shadow-2xl text-xl animate-pulse">
                CONFIRMAR SAQUE AGORA
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.WITHDRAW_CONFIRM && (
          <div className="max-w-xl mx-auto p-4 animate-bounce-in">
            <div className="comprovante rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="bg-green-600 text-white p-6 rounded-2xl mb-8 text-center font-black text-xl italic uppercase tracking-tighter shadow-lg">✅ LEVANTAMENTO SOLICITADO!</div>
              <div className="text-center border-b-4 border-black pb-6 mb-8">
                 <h3 className="text-2xl font-black uppercase italic">Comprovante de Saque</h3>
                 <p className="text-[10px] font-bold text-zinc-500 mt-2">SOU ANGOLANO RECOMPENSAS</p>
              </div>
              <div className="space-y-4 text-sm font-mono mb-10">
                <div className="flex justify-between border-b border-zinc-200 pb-2"><span>JOGADOR:</span> <span className="font-black uppercase">{lastTransaction?.name}</span></div>
                <div className="flex justify-between border-b border-zinc-200 pb-2"><span>VALOR TOTAL:</span> <span className="font-black text-2xl">{lastTransaction?.amount.toLocaleString()} Kz</span></div>
                <div className="flex justify-between border-b border-zinc-200 pb-2"><span>MÉTODO:</span> <span className="font-black uppercase">{lastTransaction?.method}</span></div>
                <div className="flex justify-between border-b-4 border-black pb-2 text-angola-red font-black"><span>TAXA DE VERIFICAÇÃO:</span> <span>5.000 Kz</span></div>
              </div>
              <div className="bg-zinc-100 p-6 rounded-2xl mb-8 border-2 border-dashed border-zinc-300">
                <p className="text-[10px] font-black text-zinc-400 uppercase mb-2">Atenção Jogador</p>
                <p className="text-[11px] leading-relaxed italic font-bold text-zinc-700">O seu prêmio está reservado. Para liberação imediata nos sistemas bancários angolanos, proceda com a verificação de isenção fiscal conforme a Lei n.º 12/23.</p>
              </div>
              <button onClick={() => setGameState(GameState.VERIFY_TAX)} className="w-full py-7 bg-angola-red text-white font-black rounded-3xl uppercase text-xl border-b-8 border-red-900 shadow-xl active:scale-95 transition-all">
                PAGAR TAXA & RECEBER TUDO
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.VERIFY_TAX && (
          <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in">
            <div className="glass-card p-12 md:p-16 rounded-[5rem] border-angola-red border-4 shadow-2xl relative text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-angola-red text-white px-8 py-2 rounded-full font-black uppercase text-xs animate-pulse">ALERTA DE SEGURANÇA</div>
              
              <h2 className="text-4xl md:text-5xl font-black text-angola-red italic uppercase mb-12 animate-pulse-red drop-shadow-lg">ÚLTIMO PASSO PARA O SAQUE</h2>
              
              <div className="bg-zinc-950 p-10 rounded-[3.5rem] mb-12 border-2 border-zinc-900 shadow-inner">
                <div className="text-7xl mb-8 animate-bounce">⏳</div>
                <h3 className="text-white font-black text-2xl mb-6">Aguardando Validação Fiscal</h3>
                <div className="max-w-sm mx-auto">
                   <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase mb-3">
                      <span>Processamento Bancário</span>
                      <span>88%</span>
                   </div>
                   <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border-2 border-zinc-800">
                      <div className="h-full bg-gradient-to-r from-angola-red to-angola-yellow w-[88%] shadow-[0_0_15px_rgba(227,27,35,0.5)]"></div>
                   </div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-6 font-black uppercase tracking-widest italic">O tempo de reserva expira em: <span className="text-angola-yellow">23h 59m</span></p>
              </div>

              <div className="space-y-6">
                <button 
                  onClick={() => window.open('https://www.kintu.org/product/2aeff560-f13b-4814-9305-cba3f58e2a80', '_blank')}
                  className="w-full py-8 btn-ganho text-black font-black rounded-[3rem] text-2xl uppercase shadow-[0_10px_40px_rgba(248,211,8,0.4)] border-b-8 border-yellow-700 hover:scale-105 active:scale-95 transition-all animate-pulse"
                >
                  EMITIR A FATURA DE VERIFICAÇÃO
                </button>
                
                {/* Observação solicitada pelo usuário */}
                <p className="text-zinc-500 font-bold uppercase mt-4">
                  Verifique a taxa para receber o seu ganho.
                </p>

                <div className="flex flex-col md:flex-row gap-4 mt-8">
                   <button onClick={() => setGameState(GameState.WITHDRAW_CONFIRM)} className="flex-1 py-5 bg-zinc-900 text-zinc-400 font-black rounded-3xl uppercase text-[10px] border-2 border-zinc-800">Voltar ao Comprovante</button>
                   <button onClick={() => setGameState(GameState.HOME)} className="flex-1 py-5 bg-zinc-900 text-zinc-600 font-black rounded-3xl uppercase text-[10px] border-2 border-zinc-800">Menu Principal</button>
                </div>
              </div>

              <p className="text-[10px] text-zinc-600 font-bold uppercase mt-8 tracking-tighter">
                * Conforme previsto nos termos de uso e leis de combate ao branqueamento de capitais.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Persistent UI elements for anxiety/excitement */}
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
