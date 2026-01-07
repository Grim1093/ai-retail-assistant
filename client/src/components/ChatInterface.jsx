// client/src/components/ChatInterface.jsx

import { useState, useRef, useEffect } from 'react';
import API from '../api';
import { Send, Bot, User, Loader2, Sparkles, Paperclip } from 'lucide-react';

function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Retail Assistant. Ask me about stock, prices, or upload an invoice to analyze.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // NEW: Upload state
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // NEW: Ref for hidden file input

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- NEW: File Upload Handler ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload to Server -> Azure Blob
      const response = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = response.data.url;
      
      // Auto-append URL to input so AI knows what to read
      setInput((prev) => prev + ` (Analyze this file: ${fileUrl}) `);
      
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input so user can select same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Create user message
    const userMessage = { sender: 'user', text: input };
    
    // 2. Optimistic Update
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      // 3. API Call
      const response = await API.post('/chat', { 
        prompt: userMessage.text,
        history: updatedHistory 
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
    // FULL HEIGHT CONTAINER
    <div className="flex flex-col h-full text-sm">
      
      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === 'user' 
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                : 'bg-slate-700/50 text-slate-400 border border-white/5'
            }`}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.sender === 'user' 
                ? 'bg-amber-500 text-slate-900 rounded-tr-none font-medium shadow-lg shadow-amber-500/10' 
                : 'bg-slate-800/80 text-slate-200 border border-white/10 rounded-tl-none shadow-md'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-700/50 text-slate-400 border border-white/5 flex items-center justify-center shrink-0">
               <Sparkles size={14} className="animate-pulse" />
             </div>
             <div className="bg-slate-800/80 border border-white/10 p-3 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-2">
               <Loader2 className="animate-spin h-3 w-3" />
               <span className="text-xs">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="mt-4 relative">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          accept="image/*,.pdf"
        />

        {/* Paperclip Button (Left Side) */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploading}
          className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
            isUploading 
              ? 'text-amber-500 animate-pulse cursor-wait' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Upload Invoice/Document"
        >
          <Paperclip size={18} />
        </button>

        {/* Text Input */}
        <input 
          className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 placeholder:text-slate-600 transition-all shadow-inner"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder={isUploading ? "Uploading file..." : "Type your question..."}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isLoading || isUploading}
        />
        
        {/* Send Button (Right Side) */}
        <button 
          onClick={handleSend} 
          disabled={isLoading || isUploading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
            isLoading || !input.trim()
              ? 'text-slate-600 cursor-not-allowed' 
              : 'bg-amber-500 text-slate-900 hover:scale-105 shadow-lg shadow-amber-500/20'
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;