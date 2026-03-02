import { useState, useEffect, FormEvent } from "react";
import { User, Product } from "../types";
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Save, 
  DollarSign, 
  Package, 
  User as UserIcon,
  Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Notification from "../components/Notification";

interface Sale {
  id: number;
  affiliate_id: number;
  product_id: number;
  amount: number;
  commission: number;
  created_at: string;
  affiliate_name?: string;
  product_name?: string;
}

export default function AdminSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newSale, setNewSale] = useState({ affiliateId: "", productId: "", amount: "" });
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/sales").then(res => res.json()).then(data => setSales(data));
    fetch("/api/admin/users").then(res => res.json()).then(data => setUsers(data));
    fetch("/api/admin/products").then(res => res.json()).then(data => setProducts(data));
  }, []);

  const handleAddSale = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/admin/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliateId: parseInt(newSale.affiliateId),
        productId: parseInt(newSale.productId),
        amount: parseFloat(newSale.amount)
      })
    });

    if (response.ok) {
      const updatedSales = await fetch("/api/admin/sales").then(res => res.json());
      setSales(updatedSales);
      setIsModalOpen(false);
      setNewSale({ affiliateId: "", productId: "", amount: "" });
      setNotification({ message: "Venda registrada com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao registrar venda.", type: "error" });
    }
  };

  const handleEditSale = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;

    const response = await fetch(`/api/admin/sales/${editingSale.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: editingSale.amount,
        commission: editingSale.commission
      })
    });

    if (response.ok) {
      const updatedSales = await fetch("/api/admin/sales").then(res => res.json());
      setSales(updatedSales);
      setIsEditModalOpen(false);
      setEditingSale(null);
      setNotification({ message: "Venda atualizada com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao atualizar venda.", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta venda? O saldo do afiliado será estornado.")) return;
    const response = await fetch(`/api/admin/sales/${id}`, { method: "DELETE" });
    if (response.ok) {
      setSales(sales.filter(s => s.id !== id));
      setNotification({ message: "Venda excluída com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao excluir venda.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-900">Gerenciar Vendas</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Registrar Venda
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Afiliado</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor Venda</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Comissão</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                      <UserIcon size={14} className="text-zinc-400" />
                      {sale.affiliate_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Package size={14} className="text-zinc-400" />
                      {sale.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900">R$ {sale.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">R$ {sale.commission.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingSale(sale);
                          setIsEditModalOpen(true);
                        }}
                        className="text-zinc-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sale Modal */}
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
                <h3 className="text-lg font-bold text-zinc-900">Registrar Nova Venda</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddSale} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Afiliado</label>
                  <select 
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newSale.affiliateId}
                    onChange={(e) => setNewSale({ ...newSale, affiliateId: e.target.value })}
                  >
                    <option value="">Selecione o afiliado</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Produto</label>
                  <select 
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newSale.productId}
                    onChange={(e) => setNewSale({ ...newSale, productId: e.target.value })}
                  >
                    <option value="">Selecione o produto</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.commission_rate}%)</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Valor da Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newSale.amount}
                    onChange={(e) => setNewSale({ ...newSale, amount: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all mt-4"
                >
                  Registrar Venda
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Sale Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="text-lg font-bold text-zinc-900">Editar Venda #{editingSale.id}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditSale} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Afiliado</label>
                  <input
                    disabled
                    className="w-full bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-500 cursor-not-allowed"
                    value={editingSale.affiliate_name}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Produto</label>
                  <input
                    disabled
                    className="w-full bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-xl text-zinc-500 cursor-not-allowed"
                    value={editingSale.product_name}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Valor da Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editingSale.amount}
                    onChange={(e) => setEditingSale({ ...editingSale, amount: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Comissão (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editingSale.commission}
                    onChange={(e) => setEditingSale({ ...editingSale, commission: parseFloat(e.target.value) })}
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
