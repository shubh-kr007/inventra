import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard({ setActiveTab }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve dashboard metrics.');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050816] h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-inventra-muted">Initializing dashboard command center...</p>
        </div>
      </div>
    );
  }

  // Prep chart data
  const chartData = stats?.low_stock_products?.map(p => ({
    name: p.name.length > 10 ? `${p.name.substring(0, 10)}...` : p.name,
    stock: p.quantity,
    price: parseFloat(p.price)
  })) || [];

  const cards = [
    {
      title: 'Total Products',
      value: stats?.total_products || 0,
      icon: Package,
      color: 'text-[#00D9FF]',
      bgGlow: 'shadow-glow',
      borderGlow: 'hover:border-[#00D9FF]/30'
    },
    {
      title: 'Active Customers',
      value: stats?.total_customers || 0,
      icon: Users,
      color: 'text-indigo-400',
      bgGlow: 'hover:shadow-[0_0_15px_rgba(129,140,248,0.15)]',
      borderGlow: 'hover:border-indigo-400/30'
    },
    {
      title: 'Orders Processed',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: 'text-[#22C55E]',
      bgGlow: 'hover:shadow-glow-green',
      borderGlow: 'hover:border-[#22C55E]/30'
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.low_stock_count || 0,
      icon: AlertTriangle,
      color: stats?.low_stock_count > 0 ? 'text-[#EF4444]' : 'text-inventra-muted',
      bgGlow: stats?.low_stock_count > 0 ? 'shadow-glow-red' : 'hover:shadow-white/5',
      borderGlow: stats?.low_stock_count > 0 ? 'border-red-500/20' : 'hover:border-white/10'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050816]">
      {/* Top Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white">
            Operational Dashboard
          </h1>
          <p className="text-sm text-inventra-muted mt-1">
            Real-time analytics and inventory allocation controls.
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-200 rounded-2xl text-sm shadow-glow-red">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`glass-panel p-6 rounded-2xl border border-white/6 flex items-center justify-between ${card.bgGlow} ${card.borderGlow} transition-all duration-300`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-inventra-muted tracking-wider uppercase">
                  {card.title}
                </span>
                <h3 className="text-3xl font-black font-sans text-white tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-white/3 flex items-center justify-center shrink-0 border border-white/5`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Contents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Stock Allocation levels</h3>
              <p className="text-xs text-inventra-muted">Alert items quantity level overview.</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#00D9FF]" />
          </div>

          <div className="h-[280px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94A3B8" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#050816', 
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="stock" 
                    stroke="#00D9FF" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#cyanGlow)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-inventra-muted">
                No low stock alerts to plot. Inventory is healthy!
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-white/6 flex flex-col justify-between h-[364px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Critical Alerts</h3>
              <span className="text-[10px] bg-red-950/60 border border-red-500/20 text-red-200 px-2 py-0.5 rounded-full font-bold">
                Low Stock
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1.5">
              {stats?.low_stock_products && stats.low_stock_products.length > 0 ? (
                stats.low_stock_products.map((product) => (
                  <div 
                    key={product.id}
                    className="p-3 bg-white/2 hover:bg-white/4 border border-white/5 rounded-xl flex items-center justify-between group transition duration-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                      <p className="text-[10px] text-inventra-muted font-mono truncate mt-0.5">{product.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-inventra-red">{product.quantity} left</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-green shrink-0" />
                        <span className="text-[9px] text-red-400 font-medium uppercase tracking-wider">Restock</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-inventra-muted space-y-2">
                  <span className="inline-block p-2 bg-[#22C55E]/10 rounded-full text-[#22C55E]">✓</span>
                  <p>All products are safely stocked!</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('products')}
            className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 text-xs font-semibold text-white bg-white/3 hover:bg-white/5 border border-white/8 rounded-xl transition duration-300 group"
          >
            Manage Catalog
            <ArrowRight className="w-3.5 h-3.5 text-inventra-cyan group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
