import { useState, useEffect, FormEvent } from "react";
import { Product } from "../types";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Link as LinkIcon, 
  DollarSign, 
  Percent,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Notification from "../components/Notification";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const isNew = !editingProduct.id;
    const method = isNew ? "POST" : "PUT";
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${editingProduct.id}`;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProduct)
    });

    if (response.ok) {
      const updatedProducts = await fetch("/api/admin/products").then(res => res.json());
      setProducts(updatedProducts);
      setIsModalOpen(false);
      setEditingProduct(null);
      setNotification({ message: `Produto ${isNew ? 'criado' : 'atualizado'} com sucesso!`, type: "success" });
    } else {
      setNotification({ message: "Erro ao salvar produto.", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    const response = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setProducts(products.filter(p => p.id !== id));
      setNotification({ message: "Produto excluído com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao excluir produto.", type: "error" });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="w-full bg-white border border-zinc-200 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingProduct({}); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="aspect-video bg-zinc-100 relative overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                  className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-xl text-zinc-600 hover:text-emerald-600 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-zinc-900">{product.name}</h3>
              <p className="text-sm text-zinc-500 mt-1 line-clamp-2 h-10">{product.description}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Preço</p>
                  <p className="text-sm font-bold text-zinc-900">R$ {product.price.toFixed(2)}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Comissão</p>
                  <p className="text-sm font-bold text-emerald-600">{product.commission_rate}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="text-lg font-bold text-zinc-900">
                  {editingProduct.id ? "Editar Produto" : "Novo Produto"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Descrição</label>
                  <textarea
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2">
                      <DollarSign size={14} /> Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={editingProduct.price || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2">
                      <Percent size={14} /> Comissão (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={editingProduct.commission_rate || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, commission_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2">
                    <LinkIcon size={14} /> Link de Compra
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://checkout.exemplo.com/..."
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editingProduct.purchase_url || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, purchase_url: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1 flex items-center gap-2">
                    <ImageIcon size={14} /> URL da Imagem
                  </label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editingProduct.image_url || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Salvar Produto
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
