import { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { User, Phone, ArrowRight, Package, CheckCircle2 } from "lucide-react";

export default function PublicLeadCapture() {
  const { code } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", whatsapp: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/product/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setProduct(data);
        }
        setLoading(false);
      });
  }, [code]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/public/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliateId: product.user_id,
        productId: product.product_id,
        name: formData.name,
        whatsapp: formData.whatsapp
      })
    });

    if (response.ok) {
      setIsSubmitted(true);
      setTimeout(() => {
        window.location.href = product.purchase_url;
      }, 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Ops! Link Inválido</h1>
        <p className="text-zinc-400">Este link de afiliado não existe ou foi desativado.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 md:p-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Package size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">{product.product_name}</h1>
                  <p className="text-zinc-400 text-sm">Verifique o produto agora mesmo</p>
                </div>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-3xl mb-8">
                <p className="text-zinc-300 text-sm leading-relaxed italic">
                  "{product.product_desc}"
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Seu Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="Como podemos te chamar?"
                      className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Seu WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="(00) 00000-0000"
                      className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-600/20 transition-all mt-4 flex items-center justify-center gap-3 group"
                >
                  Ver Produto Agora
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <p className="text-center text-zinc-500 text-xs mt-8">
                Ao prosseguir, você concorda com nossos termos de uso.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-8">
                <CheckCircle2 size={64} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Tudo pronto!</h2>
              <p className="text-zinc-400 mb-8">Estamos te redirecionando para a página oficial do produto...</p>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
