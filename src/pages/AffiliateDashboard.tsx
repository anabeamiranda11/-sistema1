import { useState, useEffect } from "react";
import { AffiliateStats, User } from "../types";
import { 
  TrendingUp, 
  MousePointer2, 
  UsersRound, 
  Wallet, 
  Trophy,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface AffiliateDashboardProps {
  user: User;
}

export default function AffiliateDashboard({ user }: AffiliateDashboardProps) {
  const [stats, setStats] = useState<AffiliateStats | null>(null);

  useEffect(() => {
    fetch(`/api/affiliate/stats/${user.id}`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [user.id]);

  if (!stats) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  const cards = [
    { 
      label: "Saldo Disponível", 
      value: `R$ ${stats.balance.toFixed(2)}`, 
      icon: Wallet, 
      color: "bg-emerald-500",
      trend: "+15.2%",
      isPositive: true
    },
    { 
      label: "Comissões Totais", 
      value: `R$ ${stats.totalSales.toFixed(2)}`, 
      icon: TrendingUp, 
      color: "bg-blue-500",
      trend: "+10.5%",
      isPositive: true
    },
    { 
      label: "Cliques no Link", 
      value: stats.totalClicks.toString(), 
      icon: MousePointer2, 
      color: "bg-purple-500",
      trend: "+4.1%",
      isPositive: true
    },
    { 
      label: "Indicações (Leads)", 
      value: stats.totalLeads.toString(), 
      icon: UsersRound, 
      color: "bg-orange-500",
      trend: "+2.4%",
      isPositive: true
    },
  ];

  const getBadge = (sales: number) => {
    if (sales >= stats.goals.goal10k) return { label: `Elite ${stats.goals.goal10k / 1000}K`, color: "bg-amber-500", icon: Trophy };
    if (sales >= stats.goals.goal5k) return { label: `Pro ${stats.goals.goal5k / 1000}K`, color: "bg-zinc-400", icon: Trophy };
    return null;
  };

  const badge = getBadge(stats.totalSales);

  return (
    <div className="space-y-8">
      {/* Welcome & Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 p-8 rounded-[2rem] text-white overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight">Olá, {user.name}! 👋</h2>
          <p className="text-zinc-400 mt-2">Veja como está o seu desempenho hoje.</p>
        </div>
        
        {badge && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${badge.color} p-6 rounded-3xl flex items-center gap-4 shadow-xl shadow-${badge.color.split('-')[1]}-500/20 relative z-10`}
          >
            <div className="bg-white/20 p-3 rounded-2xl">
              <badge.icon size={32} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Conquista</p>
              <h3 className="text-2xl font-black italic tracking-tighter">{badge.label}</h3>
            </div>
          </motion.div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[140%] bg-emerald-500/10 blur-[100px] rounded-full rotate-12" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`${card.color} p-3 rounded-2xl text-white shadow-lg shadow-${card.color.split('-')[1]}-500/20`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                card.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}>
                {card.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-zinc-900">Desempenho Semanal</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-zinc-500 uppercase">Cliques</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-zinc-500 uppercase">Vendas</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.performance}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { weekday: 'short' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
          <h3 className="text-xl font-bold text-zinc-900 mb-6">Metas de Desempenho</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-zinc-900">Placa {stats.goals.goal5k / 1000}K</p>
                  <p className="text-xs text-zinc-500">R$ {stats.totalSales.toFixed(2)} / R$ {stats.goals.goal5k.toLocaleString()}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">
                  {Math.min(100, (stats.totalSales / stats.goals.goal5k) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.totalSales / stats.goals.goal5k) * 100)}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-zinc-900">Placa {stats.goals.goal10k / 1000}K</p>
                  <p className="text-xs text-zinc-500">R$ {stats.totalSales.toFixed(2)} / R$ {stats.goals.goal10k.toLocaleString()}</p>
                </div>
                <span className="text-xs font-bold text-blue-600">
                  {Math.min(100, (stats.totalSales / stats.goals.goal10k) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (stats.totalSales / stats.goals.goal10k) * 100)}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mt-4">
              <p className="text-sm text-zinc-600 leading-relaxed">
                Continue vendendo para desbloquear suas placas de desempenho e ganhar destaque na plataforma!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
