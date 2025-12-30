import { useState } from 'react';
import API from '../api';

function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Retail Assistant. Ask me about stock, prices, or discounts.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); 
    setIsTyping(true);

    try {
      const response = await API.post('/chat', { prompt: userMessage.text });
      const aiMessage = { sender: 'ai', text: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ai', text: "Sorry, server unreachable." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 h-[300px]">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-200 text-black rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <p className="text-xs text-gray-500 italic">AI is typing...</p>}
      </div>
      <div className="p-4 border-t flex gap-2 bg-white">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask about a product..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
        />
        <button onClick={handleSend} className="bg-blue-800 text-white px-4 py-2 rounded-full font-bold shadow-sm">Send</button>
      </div>
    </div>
  );
}

export default ChatInterface;