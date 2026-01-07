import { useState, useEffect } from 'react';
import API from '../api'; 
import { User, Lock, Loader2, Sparkles } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // MOUSE INTERACTION STATE
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardMousePos, setCardMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleGlobalMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50
      });
    };
    window.addEventListener('mousemove', handleGlobalMove);
    return () => window.removeEventListener('mousemove', handleGlobalMove);
  }, []);

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await API.post('/auth/login', { username, password });
      if (response.data.success) {
        onLogin(response.data.user);
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setError("❌ Connection Error. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // USE THE NEW CLASS 'login-container' FROM INDEX.CSS
    <div className="login-container">
      
      {/* Floating Blobs for Parallax */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute rounded-full opacity-40 blur-[80px] transition-transform duration-1000 ease-out bg-sky-300"
          style={{
            top: '10%', left: '15%', width: '500px', height: '500px',
            transform: `translate(${mousePos.x * -1.2}px, ${mousePos.y * -1.2}px)`
          }}
        />
        <div 
          className="absolute rounded-full opacity-30 blur-[80px] transition-transform duration-700 ease-out bg-green-300"
          style={{
            bottom: '10%', right: '10%', width: '400px', height: '400px',
            transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`
          }}
        />
      </div>

      {/* LOGIN CARD */}
      <div 
        onMouseMove={handleCardMouseMove}
        className="login-card relative group"
      >
        <header className="text-center mb-8">
          <div className="inline-flex p-3 bg-sky-50 rounded-2xl mb-4 border border-sky-100 shadow-sm">
            <Sparkles className="h-6 w-6 text-sky-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">AI Retailer</h2>
          <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest font-medium">Assistant Hub</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
             <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-pulse">
               {error}
             </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-1">Username</label>
            <div className="relative group/input">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within/input:text-sky-500 transition-colors" />
              <input
                type="text"
                className="w-full bg-white border border-slate-200 text-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition-all placeholder:text-slate-400 shadow-inner"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-1">Password</label>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within/input:text-sky-500 transition-colors" />
              <input
                type="password"
                className="w-full bg-white border border-slate-200 text-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition-all placeholder:text-slate-400 shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-btn flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;