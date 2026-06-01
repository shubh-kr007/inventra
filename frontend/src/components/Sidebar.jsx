import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  User,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <>
      {/* Mobile Background Overlay Drawer Mask */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-[#050816]/98 border-r border-white/5 flex flex-col justify-between p-6 transition-transform duration-300 transform shrink-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:bg-transparent
        w-64 md:w-20 lg:w-64
      `}>
        <div className="space-y-8">
          {/* App Logo & Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-full justify-start md:justify-center lg:justify-start">
              <img src="/favicon.svg" className="w-8 h-8 object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.3)] animate-pulse shrink-0" alt="Inventra Logo" />
              <div className="block md:hidden lg:block min-w-0">
                <h2 className="text-lg font-extrabold font-sans tracking-wide text-white truncate">
                  INVENTRA
                </h2>
                <span className="text-[9px] text-[#00D9FF] uppercase tracking-wider font-semibold block">
                  Operational OS
                </span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 hover:bg-white/5 text-inventra-muted hover:text-white rounded-lg transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false); // Auto close drawer on mobile navigation selection
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative justify-start md:justify-center lg:justify-start ${
                    isActive 
                      ? 'text-[#00D9FF] bg-[#00D9FF]/5 border-l-2 border-[#00D9FF]' 
                      : 'text-inventra-muted hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#00D9FF]' : 'text-inventra-muted'}`} />
                  <span className="block md:hidden lg:block truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Area */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          {user && (
            <div className="flex items-center gap-3 px-2 justify-start md:justify-center lg:justify-start min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <User className="w-4.5 h-4.5 text-[#00D9FF]" />
              </div>
              <div className="block md:hidden lg:block overflow-hidden min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate">{user.username}</p>
                  {user.auth_provider === 'google' && (
                    <span className="text-[8px] bg-red-950/60 border border-red-500/30 text-red-200 px-1 rounded uppercase font-semibold scale-90 shrink-0">
                      G
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-inventra-muted truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

