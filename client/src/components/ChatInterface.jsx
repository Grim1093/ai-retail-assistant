import { useState } from 'react';
import API from '../api';

function ChatInterface() {
  // FIXED LINE BELOW:
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Retail Assistant. Ask me about stock, prices, or discounts.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message to UI immediately
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); 
    setIsTyping(true);

    try {
      // 2. Send to Backend
      const response = await API.post('/chat', { prompt: userMessage.text });

      // 3. Add AI Response to UI
      const aiMessage = { sender: 'ai', text: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { sender: 'ai', text: "Sorry, I couldn't reach the server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
      <div style={{ height: '200px', overflowY: 'scroll', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4 animate-pulse">
            <div className="bg-gray-200 rounded-lg p-3 text-gray-500 text-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>

      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Ask about a product..."
        style={{ width: '80%' }}
      />
      <button onClick={handleSend} style={{ width: '18%' }}>Send</button>
    </div>
  );
}

export default ChatInterface;