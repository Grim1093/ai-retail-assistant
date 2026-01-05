import { useState } from 'react';
import API from '../api'; 
import { User, Lock, Loader2 } from 'lucide-react'; // Import icons

function Login({ onLogin }) {
  // ... (keep your existing state and handleSubmit logic)

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Animated Background Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md z-10">
        <h2 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Please enter your details to sign in</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label className="block text-slate-300 text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
              <input
                type="text"
                className="w-full bg-slate-900/50 border border-slate-700 text-white pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-slate-300 text-xs font-semibold mb-1.5 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
              <input
                type="password"
                className="w-full bg-slate-900/50 border border-slate-700 text-white pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500">
            Demo: <span className="text-blue-400 font-mono">admin</span> / <span className="text-blue-400 font-mono">123</span>
          </p>
        </div>
      </div>
    </div>
  );
}