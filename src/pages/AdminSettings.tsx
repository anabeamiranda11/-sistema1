import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Save, 
  Shield, 
  Bell, 
  Globe, 
  DollarSign,
  Percent,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Notification from "../components/Notification";

import { User } from "../types";

interface AdminSettingsProps {
  user: User;
}

export default function AdminSettings({ user }: AdminSettingsProps) {
  const [settings, setSettings] = useState<any[]>([]);
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    name: user.name,
    email: user.email,
    password: user.password || ""
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        const local: Record<string, string> = {};
        data.forEach((s: any) => {
          local[s.key] = s.value;
        });
        setLocalSettings(local);
        setLoading(false);
      });
  }, []);

  const handleLocalChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(localSettings)) {
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value })
        });
      }
      setNotification({ message: "Configurações salvas com sucesso!", type: "success" });
    } catch (e) {
      setNotification({ message: "Erro ao salvar configurações.", type: "error" });
    } finally {
      setSaving(false);
      // Refresh settings
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    const response = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, ...adminProfile })
    });
    if (response.ok) {
      const updatedUser = await response.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setNotification({ message: "Perfil atualizado com sucesso!", type: "success" });
    } else {
      setNotification({ message: "Erro ao atualizar perfil.", type: "error" });
    }
    setSavingProfile(false);
  };

  const sections = [
    {
      title: "Geral",
      icon: Globe,
      items: [
        { key: "site_name", label: "Nome da Plataforma", type: "text", default: "Affiliate Pro" },
        { key: "support_email", label: "E-mail de Suporte", type: "email", default: "suporte@exemplo.com" },
      ]
    },
    {
      title: "Financeiro",
      icon: DollarSign,
      items: [
        { key: "min_withdrawal", label: "Saque Mínimo (R$)", type: "number", default: "10" },
        { key: "default_commission", label: "Comissão Padrão (%)", type: "number", default: "10" },
      ]
    },
    {
      title: "Segurança",
      icon: Shield,
      items: [
        { key: "allow_registration", label: "Permitir Novos Cadastros", type: "select", options: ["Sim", "Não"], default: "Sim" },
        { key: "allow_deletion", label: "Permitir Exclusão de Dados", type: "select", options: ["Sim", "Não"], default: "Sim" },
      ]
    },
    {
      title: "Metas de Desempenho",
      icon: Bell,
      items: [
        { key: "goal_5k", label: "Meta Placa 5K (R$)", type: "number", default: "5000" },
        { key: "goal_10k", label: "Meta Placa 10K (R$)", type: "number", default: "10000" },
      ]
    }
  ];

  const getValue = (key: string, def: string) => {
    return localSettings[key] !== undefined ? localSettings[key] : def;
  };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Admin Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-200 text-zinc-600">
            <SettingsIcon size={20} />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Administrador</h3>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Nome</label>
            <div className="md:col-span-2 flex gap-2">
              <input
                type="text"
                className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={adminProfile.name}
                onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">E-mail</label>
            <div className="md:col-span-2 flex gap-2">
              <input
                type="email"
                className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={adminProfile.email}
                onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Senha</label>
            <div className="md:col-span-2 flex gap-2">
              <input
                type="password"
                className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={adminProfile.password}
                onChange={(e) => setAdminProfile({ ...adminProfile, password: e.target.value })}
              />
              <button 
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <Save size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-200 text-zinc-600">
              <section.icon size={20} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">{section.title}</h3>
          </div>
          
          <div className="p-8 space-y-6">
            {section.items.map((item, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{item.label}</label>
                <div className="md:col-span-2 flex gap-2">
                  {item.type === 'select' ? (
                    <select 
                      className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={getValue(item.key, item.default)}
                      onChange={(e) => handleLocalChange(item.key, e.target.value)}
                    >
                      {item.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={item.type}
                      className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={getValue(item.key, item.default)}
                      onChange={(e) => handleLocalChange(item.key, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <div className="bg-zinc-900 p-8 rounded-[2rem] text-white flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold">Configurações do Sistema</h4>
          <p className="text-zinc-400 text-sm mt-1">Clique no botão ao lado para salvar todas as alterações.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
          {saving ? "Salvando..." : <><Save size={20} /> Salvar Configurações</>}
        </button>
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
