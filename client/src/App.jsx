import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import POSInterface from './components/POSInterface'; 
import AuditLogTable from './components/AuditLogTable'; // <--- NEW IMPORT
import Login from './components/Login';
import { useTheme } from './context/ThemeContext';
import { LogOut, Sun, Moon, LayoutDashboard, ShoppingBag, ShieldAlert } from 'lucide-react'; // <--- ADDED ShieldAlert

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'manager') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('pos');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isManager = user.role === 'manager';

  return (
    <div className="app-container font-sans flex flex-col transition-colors duration-300 min-h-screen">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />
      <div className="fixed -top-20 -left-20 w-[600px] h-[600px] rounded-full border-[3px] border-dashed border-[var(--accent-color)] opacity-20 dark:opacity-20 animate-spin-slow pointer-events-none z-0" />
      <div className="fixed top-[10%] -right-10 w-[300px] h-[300px] rounded-full border-[4px] border-[var(--text-highlight)] opacity-15 dark:opacity-20 animate-float pointer-events-none z-0" />
      <div className="fixed bottom-[20%] left-[10%] w-32 h-32 rounded-full border-[2px] border-[var(--accent-color)] opacity-40 dark:opacity-30 animate-float-fast pointer-events-none z-0" />
      <div className="fixed -bottom-10 -right-10 w-[500px] h-[500px] rounded-full border-[2px] border-[var(--card-border)] opacity-30 dark:opacity-20 animate-float-wide pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[300px] h-[300px] rounded-full border-[2px] border-dashed border-[var(--text-muted)] opacity-30 dark:opacity-20 animate-float-wide pointer-events-none z-0" style={{ animationDelay: '2s' }} />

      {/* HEADER */}
      <header className="sticky top-0 z-50 px-8 py-4 border-b border-[var(--card-border)] bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex justify-between items-center transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer hover:shadow-[var(--accent-glow)] border border-white/20 flex items-center justify-center text-white" 
            style={{ backgroundColor: 'var(--accent-color)' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <h1 className="text-2xl font-bold tracking-tight select-none">
            <span className="theme-text">AI Retail</span> <span className="text-[var(--text-muted)] opacity-80">Assistant</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[var(--text-main)]">{user.username || 'User'}</p>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest">{user.role || 'Staff'}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--card-border)] hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600 text-[var(--text-muted)] transition-all text-sm font-semibold shadow-sm"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* --- LEFT COLUMN: WORKSPACE --- */}
        <div className="lg:col-span-2 flex flex-col h-full">
           
           {/* NAVIGATION TABS */}
           <div className="flex gap-4 mb-6">
              {/* 1. Dashboard Tab */}
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === 'dashboard' 
                  ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-glow)] scale-105' 
                  : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent-color)]'
                }`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>

              {/* 2. Audits Tab (Manager Only) */}
              {isManager && (
                <button 
                  onClick={() => setActiveTab('audits')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    activeTab === 'audits' 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105 border-red-500' 
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500'
                  }`}
                >
                  <ShieldAlert size={18} />
                  Financial Audits
                </button>
              )}

              {/* 3. POS Tab (Staff Only) */}
              {!isManager && (
                <button 
                    onClick={() => setActiveTab('pos')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    activeTab === 'pos' 
                    ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-glow)] scale-105' 
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent-color)]'
                    }`}
                >
                    <ShoppingBag size={18} />
                    Point of Sale
                </button>
              )}
           </div>

           {/* CONTENT AREA */}
           <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* VIEW 1: DASHBOARD */}
             {activeTab === 'dashboard' && <Dashboard user={user} />}
             
             {/* VIEW 2: POS */}
             {activeTab === 'pos' && <POSInterface user={user} />}

             {/* VIEW 3: AUDITS */}
             {activeTab === 'audits' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight flex items-center gap-3">
                      <ShieldAlert className="text-red-500 h-8 w-8" />
                      Financial Security Audits
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                      End-of-shift cash reconciliation & <span className="text-red-500 font-bold">Risk Alerts</span>
                    </p>
                  </div>
                  <div className="app-card overflow-hidden !p-0 !bg-white/10 dark:!bg-slate-900/40 backdrop-blur-xl border-[var(--card-border)]">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--card-border)]/50">
                      <h3 className="theme-text text-lg font-semibold flex items-center gap-2">
                        <ShieldAlert size={20} className="text-red-500" />
                        Shift Closure Reports
                      </h3>
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-mono">Immutable Ledger</span>
                    </div>
                    <div className="overflow-x-auto">
                      <AuditLogTable />
                    </div>
                  </div>
                </div>
             )}

           </div>
        </div>

        {/* --- RIGHT COLUMN: CHAT COMPANION --- */}
        <div className="lg:col-span-1">
           <div className="app-card h-[calc(100vh-140px)] sticky top-28 flex flex-col overflow-hidden shadow-2xl !bg-white/10 dark:!bg-slate-900/40 backdrop-blur-xl border-[var(--card-border)]">
             <div className="mb-4 pb-4 border-b border-[var(--card-border)]/50 px-4 pt-4">
                <h3 className="theme-text text-lg font-bold flex items-center gap-2">
                  AI Companion
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {activeTab === 'pos' ? "Ask for product specs or comparisons." : "Ask about inventory, sales, or trends."}
                </p>
             </div>
             <div className="flex-1 overflow-hidden relative">
                <ChatInterface user={user} />
             </div>
           </div>
        </div>

      </main>
    </div>
  );
}

export default App;