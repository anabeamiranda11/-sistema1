import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "../types";
import { 
  LayoutDashboard, 
  Package, 
  Wallet, 
  UsersRound, 
  LogOut,
  Menu,
  X,
  Trophy
} from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

export default function AffiliateLayout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: "/affiliate", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/affiliate/products", icon: Package, label: "Produtos" },
    { path: "/affiliate/withdrawals", icon: Wallet, label: "Saques" },
    { path: "/affiliate/leads", icon: UsersRound, label: "Indicações" },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-zinc-900 text-zinc-100 flex flex-col transition-all duration-300 border-r border-zinc-800"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">Afiliado Pro</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-zinc-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-emerald-600 text-white" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-zinc-800">
            {menuItems.find(i => i.path === location.pathname)?.label || "Painel do Afiliado"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">{user.name}</p>
              <p className="text-xs text-zinc-500 capitalize">Afiliado</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {user.name[0]}
            </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
