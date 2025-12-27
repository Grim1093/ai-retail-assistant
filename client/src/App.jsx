import React from 'react';
import { useState } from 'react';
// import AnalyticsTable from './AnalyticsTable'; // You will create this in Phase 2
// import ChatInterface from './ChatInterface'; // You will create this in Phase 2

function App() {
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
          <div className="flex-1 p-4 bg-gray-50">
            {/* <ChatInterface /> will go here later */}
            <p className="text-gray-400">Chat messages will appear here...</p>
          </div>
        </section>

        {/* Right Panel: Data Table (60% roughly) */}
        <section className="w-full md:w-[60%]">
          {/* <AnalyticsTable /> will go here later */}
          <div className="bg-white p-6 rounded-lg shadow border h-full">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Analytics Dashboard</h2>
            <p className="text-gray-400">Performance data will load here...</p>
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;