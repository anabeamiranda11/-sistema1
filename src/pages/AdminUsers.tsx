import { useState, useEffect, FormEvent } from "react";
import { User } from "../types";
import { 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Plus, 
  X,
  Save,
  Key,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Notification from "../components/Notification";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const isNew = !editingUser.id;
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/users" : `/api/admin/users/${editingUser.id}`;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingUser)
    });

    if (response.ok) {
      const updatedUsers = await fetch("/api/admin/users").then(res => res.json());
      setUsers(updatedUsers);
      setIsModalOpen(false);
      setEditingUser(null);
      setNotification({ message: `Afiliado ${isNew ? 'criado' : 'atualizado'} com sucesso!`, type: "success" });
    } else {
      setNotification({ message: "Erro ao salvar afiliado.", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este afiliado?")) return;
    
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setUsers(users.filter(u => u.id !== id));
      setNotification({ message: "Afiliado excluído com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao excluir afiliado.", type: "error" });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getBadge = (sales: number) => {
    if (sales >= 10000) return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">10K</span>;
    if (sales >= 5000) return <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full text-[10px] font-bold">5K</span>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="Buscar afiliados..."
            className="w-full bg-white border border-zinc-200 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingUser({ name: "", email: "", password: "", whatsapp: "", pix: "", balance: 0 } as any); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Novo Afiliado
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Afiliado</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">WhatsApp</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Saldo</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data Cadastro</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-zinc-900">{user.name}</p>
                          {getBadge(user.total_sales || 0)}
                        </div>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{user.whatsapp || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-emerald-600">R$ {user.balance.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="text-lg font-bold text-zinc-900">{editingUser.id ? "Editar Afiliado" : "Novo Afiliado"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nome</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">E-mail</label>
                    <input
                      type="email"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">WhatsApp</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={editingUser.whatsapp || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Chave PIX</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={editingUser.pix || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, pix: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2">
                    <Key size={14} /> Senha (Alterar)
                  </label>
                  <input
                    type="text"
                    placeholder="Deixe em branco para não alterar"
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2">
                    <DollarSign size={14} /> Saldo (Ajuste Manual)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editingUser.balance}
                    onChange={(e) => setEditingUser({ ...editingUser, balance: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Salvar Alterações
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
