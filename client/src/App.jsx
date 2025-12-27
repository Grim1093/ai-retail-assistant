import React from 'react';
import { useState } from 'react';
import AnalyticsTable from './AnalyticsTable';
import ChatInterface from './ChatInterface';
// import ChatInterface from './ChatInterface'; // You will create this in Phase 2

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
        <h1 className="text-2xl font-bold">AI Retail Assistant</h1>
        <div className="bg-blue-700 px-3 py-1 rounded">
          <select className="bg-transparent outline-none">
            <option>Node: Main Counter</option>
            <option>Node: Store Branch A</option>
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
          {/* Direct call to your component without extra nesting */}
          <AnalyticsTable data={dummyData} /> 
        </section>

      </main>
    </div>
  );
}

export default App;