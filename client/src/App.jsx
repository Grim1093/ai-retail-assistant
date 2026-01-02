import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ChatInterface from './components/ChatInterface'
import Login from './components/Login'

function App() {
  const [user, setUser] = useState(null);

  // Handle Login
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
  };

  // If no user is logged in, show the Login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Once logged in, show the full Dashboard and Assistant
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Analytics Dashboard (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Dashboard user={user} onLogout={handleLogout} />
        </div>

        {/* Right Side: Chat Bot (Takes 1 column) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-150 flex flex-col sticky top-24">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Smart Assistant</h2>
            <ChatInterface user={user} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App