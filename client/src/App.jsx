import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-600">AI Retail Assistant</h1>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Analytics Dashboard (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Store Performance</h2>
            <Dashboard />
          </div>
        </div>

        {/* Right Side: Chat Bot (Takes 1 column) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-150 flex flex-col sticky top-24">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Smart Assistant</h2>
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App