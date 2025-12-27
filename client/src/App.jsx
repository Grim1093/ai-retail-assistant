import React from 'react';
import { useState } from 'react';
import AnalyticsTable from './AnalyticsTable';
import ChatInterface from './ChatInterface';

function App() {
  const dummyData = [
  { name: "Parth", itemsSold: 50, totalSalesValue: 1000, profitGenerated: 250, avgDiscount: 5, rating: "Excellent" },
  { name: "Rahul", itemsSold: 20, totalSalesValue: 400, profitGenerated: 80, avgDiscount: 12, rating: "Needs Improvement" }
  ];

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! How can I help you with the retail data today?' }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput(''); // Clear input after sending
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* 1. Navbar */}
      <header className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">

          <h1 className="text-2xl font-bold">AI Retail Assistant</h1>
          <span className="bg-blue-600 text-xs px-2 py-1 rounded-full uppercase tracking-wider">Frontend v1.0</span>
        </div>
  
        {/* This is your Node Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="node-select" className="text-sm font-medium text-blue-100">Active Node:</label>
          <select
            id="node-select"
            className="bg-blue-700 text-white border border-blue-500 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="main">Main Counter</option>
            <option value="branch-a">Store Branch A</option>
            <option value="branch-b">Store Branch B</option>
          </select>
        </div>
      </header>

      {/* 2. Main Grid Layout */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4">
        
        {/* Left Panel: Chat (40% roughly) */}
        <section className="w-full md:w-[40%] h-[80vh] bg-white rounded-lg shadow border flex flex-col">
          <div className="p-4 border-b font-bold text-gray-700">AI Chat Assistant</div>
          <ChatInterface 
            messages={messages} 
            onSend={handleSend} 
            input={input} 
            setInput={setInput} 
          />
        </section>

        {/* Right Panel: Data Table (60% roughly) */}
        <section className="w-full md:w-[60%] h-[80vh] overflow-y-auto">
          <AnalyticsTable data={dummyData} /> 
        </section>

      </main>
    </div>
  );
}

export default App;