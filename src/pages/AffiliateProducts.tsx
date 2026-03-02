import { useState, useEffect } from "react";
import { Product, User } from "../types";
import { 
  Search, 
  Copy, 
  ExternalLink, 
  Check, 
  Package,
  DollarSign,
  Percent,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AffiliateProductsProps {
  user: User;
}

export default function AffiliateProducts({ user }: AffiliateProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/affiliate/products/${user.id}`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, [user.id]);

  const handleAffiliate = async (productId: number) => {
    const response = await fetch("/api/affiliate/affiliate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, productId })
    });

    if (response.ok) {
      const data = await response.json();
      setProducts(products.map(p => p.id === productId ? { ...p, affiliate_code: data.code } : p));
    }
  };

  const copyLink = (code: string, id: number) => {
    const link = `${window.location.origin}/l/${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input
          type="text"
          placeholder="Buscar produtos disponíveis..."
          className="w-full bg-white border border-zinc-200 pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

              <div className="mt-6 pt-6 border-t border-zinc-100">
                {product.affiliate_code ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <input 
                        readOnly 
                        value={`${window.location.origin}/l/${product.affiliate_code}`} 
                        className="bg-transparent text-xs text-zinc-500 flex-1 outline-none"
                      />
                      <button 
                        onClick={() => copyLink(product.affiliate_code!, product.id)}
                        className="text-emerald-600 hover:text-emerald-500 transition-colors"
                      >
                        {copiedId === product.id ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 text-center uppercase font-bold tracking-widest">Seu link de divulgação exclusivo</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAffiliate(product.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Afiliar-se Agora
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
