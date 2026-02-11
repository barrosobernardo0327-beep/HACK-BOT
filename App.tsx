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

const GANHADORES_EXEMPLO = ["Carlos Manuel", "Maria da Costa", "João Kapango", "Ana de Sousa", "Pedro Benguela", "Teresa Luanda"];

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

  // Som de notificação de saque
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const nome = GANHADORES_EXEMPLO[Math.floor(Math.random() * GANHADORES_EXEMPLO.length)];
      const valor = (Math.floor(Math.random() * 25) + 5) * 10000;
      const newNotif = { id: Date.now(), text: `${nome} acabou de sacar ${valor.toLocaleString('pt-AO')} Kz!` };
      setNotifications(prev => [...prev.slice(-1), newNotif]);
      playNotificationSound();
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== newNotif.id)), 5000);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleQuizComplete = (score: number, correctCount: number, kz: number) => {
    setStats({ score, correctAnswers: correctCount, totalQuestions: 15, accumulatedKz: kz, bestScoreKz: Math.max(stats.bestScoreKz, kz) });
    setGameState(GameState.RESULTS);
  };

  const handleWithdrawRequest = () => {
    setShowFlyingNotes(true);
    setTimeout(() => setShowFlyingNotes(false), 3000);
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
      <div className="mb-16 relative z-10">
        <h1 className="text-7xl font-black text-white italic tracking-tighter mb-4 leading-none">
          SOU <span className="text-angola-yellow">ANGOLANO</span>
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs">Onde o conhecimento vira Kwanza</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <button onClick={() => setGameState(GameState.QUIZ)} className="p-10 bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] hover:border-angola-yellow transition-all text-left group">
          <h3 className="text-2xl font-black text-white mb-2 uppercase italic group-hover:text-angola-yellow">Iniciar Quiz</h3>
          <p className="text-zinc-500 text-sm font-bold">GANHA ATÉ 500.000 Kz</p>
        </button>
        <button onClick={() => setGameState(GameState.RANKING)} className="p-10 bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] hover:border-white transition-all text-left">
          <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Meus Saques</h3>
          <p className="text-zinc-500 text-sm font-bold">HISTÓRICO</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <main className="max-w-7xl mx-auto py-12">
        {gameState === GameState.HOME && renderHome()}
        {gameState === GameState.QUIZ && <Quiz onComplete={handleQuizComplete} onQuit={() => setGameState(GameState.HOME)} triggerNotification={() => {}} />}
        {gameState === GameState.RESULTS && (
          <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div className="glass-card p-12 rounded-[4rem] w-full max-w-2xl border-zinc-700 relative overflow-hidden">
              <h2 className="text-5xl font-black italic mb-8">🏆 PARABÉNS!</h2>
              <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 mb-10">
                <p className="text-6xl font-black text-angola-yellow">{stats.accumulatedKz.toLocaleString()} Kz</p>
              </div>
              <button onClick={() => setGameState(GameState.WITHDRAW_METHOD)} className="w-full py-6 bg-angola-yellow text-black font-black rounded-3xl text-2xl shadow-xl uppercase italic">SACAR AGORA</button>
            </div>
          </div>
        )}
        {gameState === GameState.WITHDRAW_METHOD && (
          <div className="max-w-xl mx-auto p-6">
            <div className="glass-card p-10 rounded-[3rem]">
              <h2 className="text-2xl font-black text-angola-yellow italic mb-8 uppercase">MÉTODO DE SAQUE</h2>
              <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Seu Nome Completo" className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl p-4 mb-4 outline-none focus:border-angola-yellow" />
              <div className="space-y-3 mb-8">
                <div onClick={() => setSelectedMethod(WithdrawMethod.BANK_TRANSFER)} className={`opcao-deposito ${selectedMethod === WithdrawMethod.BANK_TRANSFER ? 'selecionado' : ''}`}>BANCO (IBAN)</div>
                <div onClick={() => setSelectedMethod(WithdrawMethod.MULTICAIXA)} className={`opcao-deposito ${selectedMethod === WithdrawMethod.MULTICAIXA ? 'selecionado' : ''}`}>MULTICAIXA EXPRESS</div>
              </div>
              <button disabled={!selectedMethod || !userName} onClick={() => setGameState(selectedMethod === WithdrawMethod.BANK_TRANSFER ? GameState.WITHDRAW_BANK : GameState.WITHDRAW_FORM)} className="w-full py-5 bg-angola-yellow text-black font-black rounded-2xl uppercase">Continuar</button>
            </div>
          </div>
        )}
        {gameState === GameState.WITHDRAW_BANK && (
          <div className="max-w-xl mx-auto p-6">
            <div className="glass-card p-10 rounded-[3rem]">
              <h2 className="text-2xl font-black italic mb-6">🏦 BANCO</h2>
              <div className="space-y-2 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar">
                {BANCOS_ANGOLA.map(b => (
                  <div key={b.id} onClick={() => setSelectedBank(b)} className={`p-4 bg-zinc-900 rounded-xl cursor-pointer border-2 ${selectedBank?.id === b.id ? 'border-angola-yellow' : 'border-transparent'}`}>{b.name}</div>
                ))}
              </div>
              <button disabled={!selectedBank} onClick={() => setGameState(GameState.WITHDRAW_FORM)} className="w-full py-5 bg-angola-yellow text-black font-black rounded-2xl uppercase">Próximo</button>
            </div>
          </div>
        )}
        {gameState === GameState.WITHDRAW_FORM && (
          <div className="max-w-xl mx-auto p-6">
            <div className="glass-card p-10 rounded-[3rem]">
              <h2 className="text-2xl font-black italic mb-8 uppercase text-center">DADOS</h2>
              <input value={withdrawInput} onChange={e => setWithdrawInput(e.target.value)} className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl p-5 mb-8 outline-none focus:border-angola-yellow font-mono text-xl" placeholder={selectedMethod === WithdrawMethod.BANK_TRANSFER ? "IBAN (AO06...)" : "9... (Número Express)"} />
              <button onClick={handleWithdrawRequest} className="w-full py-6 bg-angola-yellow text-black font-black rounded-3xl uppercase tracking-widest shadow-2xl">Confirmar Saque</button>
            </div>
          </div>
        )}
        {gameState === GameState.WITHDRAW_CONFIRM && (
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="comprovante">
              <div className="bg-green-600 text-white p-4 rounded-xl mb-6 text-center shadow-lg font-bold">✅ LEVANTAMENTO SOLICITADO!</div>
              <div className="space-y-3 text-xs font-mono border-b-2 border-dashed border-zinc-300 pb-6 mb-6 text-black">
                <div className="flex justify-between"><span>JOGADOR:</span> <span className="font-bold uppercase">{lastTransaction?.name}</span></div>
                <div className="flex justify-between"><span>VALOR:</span> <span className="font-bold text-lg">{lastTransaction?.amount.toLocaleString('pt-AO')} Kz</span></div>
                <div className="flex justify-between text-angola-red font-black"><span>TAXA VERIFICAÇÃO:</span> <span>5.000 Kz</span></div>
              </div>
              <button onClick={() => setGameState(GameState.VERIFY_TAX)} className="w-full py-5 bg-angola-yellow text-black font-black rounded-xl text-sm uppercase shadow-xl hover:bg-yellow-400 border-b-4 border-yellow-700 transition-all">VERIFICAR TAXA</button>
            </div>
          </div>
        )}
        {gameState === GameState.VERIFY_TAX && (
          <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <div className="glass-card p-12 rounded-[3.5rem] border-angola-red border-2 shadow-2xl overflow-hidden relative">
              <h2 className="text-2xl font-black text-angola-red italic uppercase mb-8 animate-pulse-red">⚠️ Verificação de Taxa - Sou Angolano</h2>
              <div className="bg-zinc-900/60 p-10 rounded-[2.5rem] mb-10">
                 <div className="text-5xl mb-6 animate-bounce">⏳</div>
                 <p className="text-zinc-300 font-bold text-lg mb-4">Aguardando confirmação da isenção fiscal</p>
                 <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden max-w-xs mx-auto"><div className="h-full bg-angola-red w-[65%] animate-pulse"></div></div>
              </div>
              <button onClick={() => window.open('https://www.kintu.org/product/2aeff560-f13b-4814-9305-cba3f58e2a80', '_blank')} className="w-full py-6 bg-angola-yellow text-black font-black rounded-2xl text-xl uppercase shadow-xl border-b-4 border-yellow-700 transition-all animate-pulse hover:bg-yellow-400">EMITIR A FATURA DE VERIFICAÇÃO</button>
              <p className="text-[11px] text-zinc-400 font-bold uppercase italic mt-4">Verifique a taxa para receber o seu ganho.</p>
              <button onClick={() => setGameState(GameState.HOME)} className="mt-8 text-zinc-500 font-bold uppercase text-xs">Página Inicial</button>
            </div>
          </div>
        )}
        {gameState === GameState.RANKING && (
          <div className="max-w-2xl mx-auto p-6">
            <div className="glass-card p-10 rounded-[3rem]">
              <h2 className="text-3xl font-black text-angola-yellow mb-8 uppercase italic">Histórico de Saques</h2>
              <div className="space-y-4">
                {allTransactions.map((t, i) => (
                  <div key={i} className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-zinc-500">{t.date}</p>
                      <p className="font-bold uppercase text-xs">{t.name}</p>
                      <p className="text-angola-red text-[10px] font-black uppercase">PENDENTE</p>
                    </div>
                    <p className="text-xl font-black text-angola-yellow">{t.amount.toLocaleString()} Kz</p>
                  </div>
                ))}
                <button onClick={() => setGameState(GameState.HOME)} className="w-full py-4 mt-6 bg-zinc-800 rounded-xl">VOLTAR</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {notifications.map(n => (<div key={n.id} className="notificacao-ganhador"><span className="text-xl">💰</span><span className="text-[10px] font-black uppercase text-white italic">{n.text}</span></div>))}
      </div>
      {showFlyingNotes && <div className="fixed inset-0 pointer-events-none z-[200]">{[...Array(20)].map((_, i) => <div key={i} className="notas-saque" style={{ left: `${Math.random() * 100}%`, top: '100%', animationDelay: `${Math.random() * 2}s` }}>Kz</div>)}</div>}
    </div>
  );
};

export default App;