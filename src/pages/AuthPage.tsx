import { useState, FormEvent } from "react";
import { User } from "../types";
import { motion } from "motion/react";
import { Mail, Lock, User as UserIcon, Phone, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    whatsapp: "",
    pix: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    const endpoint = isLogin ? "/api/login" : "/api/register";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (response.ok) {
      onLogin(data);
      navigate(data.role === 'admin' ? "/admin" : "/affiliate");
    } else {
      setError(data.error || "Algo deu errado");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="text-zinc-400 mt-2">
            {isLogin ? "Acesse seu painel de afiliado" : "Comece a lucrar hoje mesmo"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="(00) 00000-0000"
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Chave PIX</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="CPF, E-mail ou Telefone"
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    value={formData.pix}
                    onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all mt-4"
          >
            {isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre agora"}
          </button>
          
          {isLogin && (
            <div>
              <button className="text-emerald-500 hover:text-emerald-400 text-xs font-medium uppercase tracking-widest">
                Redefinir Senha
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
