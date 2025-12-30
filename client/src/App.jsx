import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <div className="app-container">
      <Dashboard />
      <ChatInterface />
    </div>
  )
}

export default App