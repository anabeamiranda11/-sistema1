import { useState, useEffect, FormEvent } from "react";
import { Withdrawal, User } from "../types";
import { 
  Plus, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AffiliateWithdrawalsProps {
  user: User;
}

export default function AffiliateWithdrawals({ user }: AffiliateWithdrawalsProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [minWithdrawal, setMinWithdrawal] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/affiliate/withdrawals/${user.id}`)
      .then(res => res.json())
      .then(data => setWithdrawals(data));

    fetch(`/api/affiliate/stats/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setBalance(data.balance);
        setMinWithdrawal(data.minWithdrawal || 10);
      });
  }, [user.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    const val = parseFloat(amount);
    if (val < minWithdrawal) {
      setError(`O valor mínimo para saque é R$ ${minWithdrawal.toFixed(2)}`);
      return;
    }

    const response = await fetch("/api/affiliate/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount: val })
    });

    if (response.ok) {
      const data = await fetch(`/api/affiliate/withdrawals/${user.id}`).then(res => res.json());
      setWithdrawals(data);
      setBalance(balance - val);
      setIsModalOpen(false);
      setAmount("");
    } else {
      const data = await response.json();
      setError(data.error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Concluído</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12} /> Recusado</span>;
      case 'analysis':
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12} /> Em Análise</span>;
      default:
        return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Pendente</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 p-8 rounded-[2rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Saldo Disponível</p>
          <h2 className="text-4xl font-black mt-2">R$ {balance.toFixed(2)}</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 relative z-10"
        >
          <Wallet size={20} /> Solicitar Saque
        </button>
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-emerald-500/10 blur-[100px] rounded-full rotate-12" />
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <h3 className="text-lg font-bold text-zinc-900">Histórico de Saques</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {new Date(w.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-zinc-900">R$ {w.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(w.status)}</td>
                  <td className="px-6 py-4 text-xs text-zinc-400 italic">
                    {w.status === 'completed' ? 'Pagamento realizado via PIX' : w.status === 'rejected' ? 'Dados bancários inválidos' : '-'}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic">
                    Nenhum saque solicitado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="text-lg font-bold text-zinc-900">Solicitar Saque</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Seu Saldo</p>
                  <p className="text-2xl font-black text-emerald-700">R$ {balance.toFixed(2)}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2">
                    <TrendingUp size={14} /> Valor do Saque (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-4 rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">* Valor mínimo de R$ {minWithdrawal.toFixed(2)}</p>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl flex items-center gap-3">
                  <CreditCard size={20} className="text-zinc-400" />
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Chave PIX Cadastrada</p>
                    <p className="text-sm font-bold text-zinc-900">{user.pix || "Não cadastrada"}</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  Confirmar Solicitação
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
