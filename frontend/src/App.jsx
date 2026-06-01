import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Grainient from './components/Grainient';
import { Menu } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050816] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-inventra-muted font-sans tracking-wide">Syncing secure gateway credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-full bg-[#050816] text-white font-sans overflow-hidden relative">
      {/* Dynamic Futuristic WebGL Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
        <Grainient
          color1="#3a3939"
          color2="#000000"
          color3="#515052"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      {/* Navigation sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main content viewport */}
      <main className="flex-1 h-full flex flex-col overflow-hidden relative z-10 bg-transparent">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050816]/80 backdrop-blur shrink-0 z-30">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" className="w-7 h-7 object-contain filter drop-shadow-[0_0_6px_rgba(0,217,255,0.3)]" alt="Inventra Logo" />
            <h2 className="text-sm font-extrabold tracking-wide text-white">INVENTRA</h2>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 hover:bg-white/5 border border-white/8 rounded-xl transition duration-150 text-[#00D9FF]"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Subtle decorative top gradients */}
        <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-indigo-500/5 blur-[80px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-[300px] h-[150px] bg-cyan-500/3 blur-[70px] pointer-events-none" />

        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'products' && <Products />}
        {activeTab === 'customers' && <Customers />}
        {activeTab === 'orders' && <Orders />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

