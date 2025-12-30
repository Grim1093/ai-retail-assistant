import Dashboard from './components/Dashboard'
import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar with your Node Selector */}
      <header className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">AI Retail Assistant</h1>
          <span className="bg-blue-600 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Frontend v1.0</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="node-select" className="text-sm font-medium text-blue-100">Active Node:</label>
          <select 
            id="node-select"
            className="bg-blue-700 text-white border border-blue-500 rounded-md px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="main">Main Counter</option>
            <option value="branch-a">Store Branch A</option>
            <option value="branch-b">Store Branch B</option>
          </select>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4">
        {/* Left Side: Chat Interface */}
        <section className="w-full md:w-[40%] h-[80vh] bg-white rounded-lg shadow border flex flex-col overflow-hidden">
          <div className="p-4 border-b font-bold text-gray-700 bg-white">AI Chat Assistant</div>
          <ChatInterface />
        </section>

        {/* Right Side: Analytics Dashboard */}
        <section className="w-full md:w-[60%] h-[80vh] overflow-y-auto">
          <Dashboard />
        </section>
      </main>
    </div>
  )
}

export default App