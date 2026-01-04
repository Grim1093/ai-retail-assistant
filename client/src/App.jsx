import { useState } from 'react'  // <--- Import the State tool
import Dashboard from './components/Dashboard'
import ChatInterface from './components/ChatInterface' // Optional, if you have this
import Login from './components/Login'

function App() {
  // 1. GLOBAL USER STATE (The Brain)
  // null = no one is logged in
  // object = { name: "Chetan", role: "manager" }
  const [user, setUser] = useState(null); 

  // Helper function to update the brain when someone logs in
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Helper function to clear the brain when someone logs out
  const handleLogout = () => {
    setUser(null);
  };  // ... (rendering logic comes next)

  // If no user is logged in, show the Login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // IF LOGGED IN -> SHOW DASHBOARD
  // We pass 'user' (so dashboard knows who it is) and 'handleLogout'
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pass the User and Logout tool to the Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <Dashboard user={user} onLogout={handleLogout} />
        </div>

        {/* Optional: Chat Interface */}
        <div className="lg:col-span-1">
           {/* ChatInterface code here if needed */}
           <ChatInterface user={user} />
        </div>

      </main>
    </div>
  )
}
export default App