import { useState, useEffect } from "react";
import { Stats } from "../types";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  UsersRound,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from "lucide-react";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  const cards = [
    { 
      label: "Vendas Totais", 
      value: `R$ ${stats.totalSales.toFixed(2)}`, 
      icon: DollarSign, 
      color: "bg-emerald-500",
      trend: "+12.5%",
      isPositive: true
    },
    { 
      label: "Comissões Pagas", 
      value: `R$ ${stats.totalCommission.toFixed(2)}`, 
      icon: TrendingUp, 
      color: "bg-blue-500",
      trend: "+8.2%",
      isPositive: true
    },
    { 
      label: "Afiliados Ativos", 
      value: stats.totalUsers.toString(), 
      icon: Users, 
      color: "bg-purple-500",
      trend: "+4.1%",
      isPositive: true
    },
    { 
      label: "Novas Indicações", 
      value: stats.totalLeads.toString(), 
      icon: UsersRound, 
      color: "bg-orange-500",
      trend: "-2.4%",
      isPositive: false
    },
    { 
      label: "Saques Pendentes", 
      value: stats.pendingWithdrawals.toString(), 
      icon: Wallet, 
      color: "bg-red-500",
      trend: "Ação necessária",
      isPositive: false
    },
  ];

  const chartData = [
    { name: "Vendas (R$)", value: stats.totalSales, color: "#10b981" },
    { name: "Comissões (R$)", value: stats.totalCommission, color: "#3b82f6" },
    { name: "Afiliados", value: stats.totalUsers, color: "#a855f7" },
    { name: "Indicações", value: stats.totalLeads, color: "#f97316" },
    { name: "Saques", value: stats.pendingWithdrawals, color: "#ef4444" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
                card.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}>
                {card.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Visão Geral do Sistema</h3>
            <p className="text-sm text-zinc-500">Comparativo de métricas principais</p>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
