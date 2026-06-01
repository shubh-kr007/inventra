import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  User
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-transparent flex flex-col justify-between p-6 shrink-0 z-20">
      <div className="space-y-8">
        {/* App Logo */}
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" className="w-8 h-8 object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.3)] animate-pulse" alt="Inventra Logo" />
          <div>
            <h2 className="text-lg font-extrabold font-sans tracking-wide text-white">
              INVENTRA
            </h2>
            <span className="text-[9px] text-[#00D9FF] uppercase tracking-wider font-semibold">
              Operational OS
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative ${
                  isActive 
                    ? 'text-[#00D9FF] bg-[#00D9FF]/5 border-l-2 border-[#00D9FF]' 
                    : 'text-inventra-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#00D9FF]' : 'text-inventra-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Area */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <User className="w-4.5 h-4.5 text-[#00D9FF]" />
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate">{user.username}</p>
                {user.auth_provider === 'google' && (
                  <span className="text-[8px] bg-red-950/60 border border-red-500/30 text-red-200 px-1 rounded uppercase font-semibold scale-90">
                    Google
                  </span>
                )}
              </div>
              <p className="text-[10px] text-inventra-muted truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
