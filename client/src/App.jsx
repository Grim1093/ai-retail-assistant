import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // USE THE NEW CLASS 'app-container' FROM INDEX.CSS
  return (
    <div className="app-container font-sans flex flex-col">
      
      {/* HEADER: Sticky with Gold Text */}
      <header className="sticky top-0 z-50 px-8 py-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg shadow-amber-500/20"></div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gold-text">AI Retail</span> <span className="text-slate-400">Assistant</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-slate-300 font-medium">{user.username || 'User'}</p>
            <p className="text-xs text-amber-500/80 uppercase tracking-widest">{user.role || 'Staff'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 rounded-xl border border-amber-500/30 text-amber-100 hover:bg-amber-500/10 hover:border-amber-500/60 transition-all text-sm font-semibold shadow-lg shadow-amber-900/20"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Dashboard */}
        <div className="lg:col-span-2 space-y-6">
           <Dashboard user={user} />
        </div>

        {/* RIGHT COLUMN: Chat (Sticky Sidebar) */}
        <div className="lg:col-span-1">
           <div className="app-card h-[calc(100vh-140px)] sticky top-28 flex flex-col overflow-hidden">
             <div className="mb-4 pb-4 border-b border-white/5">
                <h3 className="gold-text text-lg font-bold">AI Companion</h3>
                <p className="text-xs text-slate-400">Ask about inventory, sales, or trends.</p>
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