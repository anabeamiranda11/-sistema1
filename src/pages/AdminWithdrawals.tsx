import { useState, useEffect } from "react";
import { Withdrawal } from "../types";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  MoreVertical,
  CreditCard,
  AlertCircle,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Notification from "../components/Notification";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/withdrawals")
      .then(res => res.json())
      .then(data => setWithdrawals(data));

    // WebSocket for real-time updates
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_WITHDRAWAL") {
        setWithdrawals(prev => [data.withdrawal, ...prev]);
        setNotification({ message: "Nova solicitação de saque recebida!", type: "success" });
      }
    };

    return () => ws.close();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    const response = await fetch(`/api/admin/withdrawals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: status as any } : w));
      setNotification({ message: "Status do saque atualizado!", type: "success" });
    } else {
      setNotification({ message: "Erro ao atualizar status.", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta solicitação? Se estiver pendente, o saldo será devolvido ao afiliado.")) return;
    
    const response = await fetch(`/api/admin/withdrawals/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setWithdrawals(withdrawals.filter(w => w.id !== id));
      setNotification({ message: "Solicitação excluída com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao excluir solicitação.", type: "error" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Pagamento Concluído</span>;
      case 'rejected':
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12} /> Recusado</span>;
      case 'analysis':
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle size={12} /> Em Análise</span>;
      default:
        return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Pendente</span>;
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por afiliado..."
          className="w-full bg-white border border-zinc-200 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Afiliado</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Chave PIX</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredWithdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold">
                        {w.user_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{w.user_name}</p>
                        <p className="text-xs text-zinc-500">{new Date(w.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-zinc-900">R$ {w.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <CreditCard size={14} className="text-zinc-400" />
                      {w.user_pix}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(w.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        className="bg-zinc-50 border border-zinc-200 text-xs font-bold px-2 py-1 rounded-lg focus:outline-none"
                        value={w.status}
                        onChange={(e) => handleStatusUpdate(w.id, e.target.value)}
                      >
                        <option value="pending">Pendente</option>
                        <option value="analysis">Em Análise</option>
                        <option value="completed">Pagamento Concluído</option>
                        <option value="rejected">Recusado</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
