import { useState, useRef, useEffect } from 'react';
import API from '../api';
import { Send, Bot, User, Loader2, Sparkles, Paperclip } from 'lucide-react';

function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Retail Assistant. Ask me about stock, prices, or upload an invoice to analyze.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- File Upload Handler ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = response.data.url;
      setInput((prev) => prev + ` (Analyze this file: ${fileUrl}) `);
      
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
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
            {/* Avatar - Added backdrop-blur */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border backdrop-blur-sm ${
              msg.sender === 'user' 
                ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)] border-[var(--accent-color)]/30' 
                : 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--card-border)]'
            }`}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble - INCREASED TRANSPARENCY HERE */}
            <div className={`max-w-[85%] p-3 rounded-2xl border backdrop-blur-md wrap-break-word whitespace-pre-wrap ${
              msg.sender === 'user' 
                // User: Highly transparent accent color
                ? 'bg-(--accent-color)/70 text-(--btn-text) border-transparent rounded-tr-none font-medium shadow-lg shadow-[var(--accent-glow)]' 
                // AI: Almost clear glass (bg-white/10 or bg-slate-900/30)
                : 'bg-white/10 dark:bg-slate-900/30 text-(--text-main) border-(--card-border)/50 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--card-border)] flex items-center justify-center shrink-0 backdrop-blur-sm">
               <Sparkles size={14} className="animate-pulse" />
             </div>
             <div className="bg-white/10 dark:bg-slate-900/30 border border-[var(--card-border)] p-3 rounded-2xl rounded-tl-none text-[var(--text-muted)] flex items-center gap-2 backdrop-blur-md">
               <Loader2 className="animate-spin h-3 w-3" />
               <span className="text-xs">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="mt-4 relative">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          accept="image/*,.pdf"
        />

        {/* Paperclip Button */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploading}
          className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all z-10 ${
            isUploading 
              ? 'text-[var(--accent-color)] animate-pulse cursor-wait' 
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-border)]'
          }`}
          title="Upload Invoice/Document"
        >
          <Paperclip size={18} />
        </button>

        {/* Text Input - EXTREMELY TRANSPARENT */}
        <input 
          className="w-full bg-white/5 dark:bg-slate-900/20 border border-[var(--card-border)] text-[var(--text-main)] pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)]/50 placeholder:text-[var(--text-muted)] transition-all shadow-inner backdrop-blur-md"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder={isUploading ? "Uploading file..." : "Type your question..."}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isLoading || isUploading}
        />
        
        {/* Send Button */}
        <button 
          onClick={handleSend} 
          disabled={isLoading || isUploading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all z-10 ${
            isLoading || !input.trim()
              ? 'text-(--text-muted) cursor-not-allowed' 
              : 'bg-(--accent-color) text-(--btn-text) hover:scale-105 shadow-lg shadow-[var(--accent-glow)]'
          }`}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;