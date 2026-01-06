import { useState, useEffect } from 'react';
import API from '../api'; 
import { User, Lock, Loader2, AlertCircle, Sparkles } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. MOUSE INTERACTION STATE
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardMousePos, setCardMousePos] = useState({ x: 0, y: 0 });

  // Tracks mouse globally for the background parallax effect
  useEffect(() => {
    const handleGlobalMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 50, // Parallax range
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
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans">
      
      {/* --- INTERACTIVE ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Blob 1: Moves opposite to mouse (Slow Parallax) */}
        <div 
          className="absolute rounded-full opacity-30 blur-[120px] transition-transform duration-1000 ease-out"
          style={{
            top: '5%',
            left: '10%',
            width: '700px',
            height: '700px',
            backgroundColor: '#1d4ed8',
            transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`
          }}
        />
        
        {/* Blob 2: Moves with mouse (Faster Parallax) */}
        <div 
          className="absolute rounded-full opacity-25 blur-[100px] transition-transform duration-700 ease-out"
          style={{
            bottom: '10%',
            right: '5%',
            width: '600px',
            height: '600px',
            backgroundColor: '#4338ca',
            transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`
          }}
        />

        {/* Layer 3: The Wavy Aurora Wave */}
        <div className="absolute inset-0 opacity-20 animate-aurora bg-linear-to-tr from-teal-500/20 via-transparent to-blue-500/20 blur-[80px]" />
      </div>

      {/* --- THE LOGIN CARD --- */}
      <div 
        onMouseMove={handleCardMouseMove}
        className="relative z-10 w-full max-w-md mx-4 group"
      >
        {/* Animated Outer Ring Glow */}
        <div className="absolute -inset-1 bg-linear-to-r from-blue-500/30 to-indigo-500/30 rounded-4xl blur-2xl opacity-40 group-hover:opacity-100 transition duration-700"></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-3xl p-10 rounded-4xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/20">
          
          {/* Mouse Spotlight (follows mouse inside card) */}
          <div 
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(400px circle at ${cardMousePos.x}px ${cardMousePos.y}px, rgba(59,130,246,0.15), transparent 40%)`
            }}
          />

          <header className="text-center mb-10">
            <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
              <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">AI Retailer</h2>
            <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-medium">Assistant Hub</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">Username</label>
              <div className="relative group/input">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5 group-focus-within/input:text-blue-400 transition-colors" />
                <input
                  type="text"
                  className="w-full bg-slate-950/40 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-700"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">Password</label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5 group-focus-within/input:text-blue-400 transition-colors" />
                <input
                  type="password"
                  className="w-full bg-slate-950/40 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-700"
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
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-[0.97] disabled:opacity-50 flex justify-center items-center gap-3 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;