import { useState, useRef, useEffect } from 'react';
import API from '../api';

function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Retail Assistant. Ask me about stock, prices, or discounts.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Create the user message object
    const userMessage = { sender: 'user', text: input };
    
    // 2. Optimistically update the UI (Show user message immediately)
    // We capture this new state to send to the server
    const updatedHistory = [...messages, userMessage];
    
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      // 3. SEND HISTORY TO SERVER (The Phase 4 Upgrade)
      // We send 'prompt' for the current question AND 'history' for context
      const response = await API.post('/chat', { 
        prompt: userMessage.text,
        history: updatedHistory // <--- This enables the "Elephant Memory"
      });

      const aiMessage = { sender: 'ai', text: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { sender: 'ai', text: "Error connecting to AI. Please check the server logs." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border border-gray-300 rounded-lg shadow-lg bg-white mt-5 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg font-bold">
        Retail Assistant AI
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              <strong className="block text-xs mb-1 opacity-70">
                {msg.sender === 'user' ? 'You' : 'Assistant'}
              </strong>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-3 rounded-bl-none text-gray-500 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg flex gap-2">
        <input 
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask about products, staff, or sales..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading}
          className={`px-4 py-2 rounded-md font-medium text-white transition-colors ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;