import { useState, useEffect } from "react";
import { Lead, User } from "../types";
import { 
  UsersRound, 
  Search, 
  Phone, 
  Package, 
  Calendar,
  MessageCircle
} from "lucide-react";
import { motion } from "motion/react";

interface AffiliateLeadsProps {
  user: User;
}

export default function AffiliateLeads({ user }: AffiliateLeadsProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/affiliate/leads/${user.id}`)
      .then(res => res.json())
      .then(data => setLeads(data));
  }, [user.id]);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome da indicação..."
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
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">WhatsApp</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Produto de Interesse</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Ação</th>
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
                    <span className="text-sm text-zinc-600 font-medium">{lead.whatsapp}</span>
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
                    <a 
                      href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle size={14} />
                      Chamar no Whats
                    </a>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">
                    Nenhuma indicação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
