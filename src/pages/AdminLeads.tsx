import { useState, useEffect, FormEvent } from "react";
import { Lead } from "../types";
import { 
  UsersRound, 
  Search, 
  Phone, 
  Package, 
  User,
  Calendar,
  Edit2,
  Trash2,
  X,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Notification from "../components/Notification";

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then(res => res.json())
      .then(data => setLeads(data));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const response = await fetch(`/api/admin/leads/${editingLead.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingLead.name, whatsapp: editingLead.whatsapp })
    });

    if (response.ok) {
      setLeads(leads.map(l => l.id === editingLead.id ? editingLead : l));
      setIsModalOpen(false);
      setEditingLead(null);
      setNotification({ message: "Lead atualizado com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao atualizar lead.", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta indicação?")) return;
    
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setLeads(leads.filter(l => l.id !== id));
      setNotification({ message: "Indicação excluída com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao excluir indicação.", type: "error" });
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.affiliate_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou afiliado..."
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
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">WhatsApp</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Afiliado</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                        {lead.name[0]}
                      </div>
                      <p className="text-sm font-bold text-zinc-900">{lead.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:underline"
                    >
                      <Phone size={14} />
                      {lead.whatsapp}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <User size={14} className="text-zinc-400" />
                      {lead.affiliate_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Package size={14} className="text-zinc-400" />
                      {lead.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Calendar size={14} className="text-zinc-400" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingLead(lead); setIsModalOpen(true); }}
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
        {isModalOpen && editingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="text-lg font-bold text-zinc-900">Editar Indicação</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nome do Lead</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editingLead.name}
                    onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">WhatsApp</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editingLead.whatsapp}
                    onChange={(e) => setEditingLead({ ...editingLead, whatsapp: e.target.value })}
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
