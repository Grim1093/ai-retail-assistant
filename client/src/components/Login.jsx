import { useState } from 'react';
import API from '../api'; 
import { User, Lock, Loader2, Sparkles, ArrowRight } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await API.post('/auth/login', { username, password });
      if (response.data.success) {
        onLogin(response.data.user);
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* 1. BACKGROUND EFFECTS (Platinum Theme) */}
      {/* Grid Pattern - subtle and technical */}
      <div className="absolute inset-0 bg-grid-pattern z-0 pointer-events-none opacity-60" />
      
      {/* Rotating Circle (Geometric accent) */}
      <div 
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full border border-[var(--grid-color)] opacity-40 animate-spin-slow pointer-events-none z-0"
      />
      
      {/* Spotlight Glow (Indigo Accent) */}
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent-color)] opacity-10 blur-[100px] rounded-full pointer-events-none z-0"
      />

      {/* 2. LOGIN CARD */}
      <div className="login-card w-full max-w-md p-8 z-10 mx-4 relative backdrop-blur-xl border border-[var(--card-border)] shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent-color)] text-white mb-4 shadow-lg shadow-[var(--accent-glow)]">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">AI Retail</h2>
          <p className="text-[var(--text-muted)] text-sm mt-2 font-medium">System Access Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
             <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center font-medium animate-pulse">
               {error}
             </div>
          )}

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider ml-1">
              Username
            </label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] h-5 w-5 transition-colors group-focus-within:text-[var(--accent-color)]" />
              <input
                type="text"
                className="input-field pl-10" 
                placeholder="Enter ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
             <label className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] h-5 w-5 transition-colors group-focus-within:text-[var(--accent-color)]" />
              <input
                type="password"
                className="input-field pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6 shadow-lg shadow-[var(--accent-glow)] hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        
        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[var(--card-border)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Authorized Personnel Only • <span className="font-semibold text-[var(--text-main)]">Azure AD Encrypted</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;