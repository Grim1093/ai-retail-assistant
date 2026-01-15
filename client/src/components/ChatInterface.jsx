import { useState, useRef, useEffect } from 'react';
import API from '../api';
import { Send, Bot, User, Loader2, Sparkles, Paperclip, TrendingUp, DollarSign, Star, Box, Tag } from 'lucide-react';

function ChatInterface({ userName = "User" }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 1. GREETING & OPTIONS LOGIC
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: `Hello ${userName}! 👋 I am your Retail Assistant.\n\nSelect an option below or ask me anything.`,
      actions: [
        { label: "📦 Check Stock", value: "Check Stock" },
        { label: "👥 Employee Performance", value: "Employee Performance" },
        { label: "💰 Today's Profit", value: "Total Profit Today" }
      ]
    }
  ]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- Handle Click on Predefined Option ---
  const handleOptionClick = (actionValue) => {
    if (actionValue === "Check Stock") {
      setMessages(prev => [
        ...prev, 
        { sender: 'user', text: actionValue },
        { sender: 'ai', text: "Sure! Which product are you looking for? (e.g., 'Shoes', 'Bags')" }
      ]);
      return; 
    }

    if (actionValue === "Employee Performance") {
        setMessages(prev => [
          ...prev, 
          { sender: 'user', text: actionValue },
          { sender: 'ai', text: "Okay. Which employee do you want to audit? (e.g., 'Rohan', 'Sarah')" }
        ]);
        return; 
    }

    handleSend(actionValue);
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    
    if (!textOverride) setInput(""); 
    setIsLoading(true);

    try {
      const response = await API.post('/chat', { 
        prompt: textToSend,
        history: messages 
      });

      const { answer, stats, products } = response.data;

      const aiMessage = { 
        sender: 'ai', 
        text: answer,   
        stats: stats,
        products: products 
      };
      
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Error connecting to AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-sm">
      
      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar p-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col gap-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            
            <div className={`flex gap-3 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border backdrop-blur-sm ${
                msg.sender === 'user' 
                    ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)] border-[var(--accent-color)]/30' 
                    : 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--card-border)]'
                }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className={`p-3 rounded-2xl border backdrop-blur-md ${
                msg.sender === 'user' 
                    ? 'bg-[var(--accent-color)]/70 text-[var(--btn-text)] border-transparent rounded-tr-none shadow-lg' 
                    : 'bg-white/10 dark:bg-slate-900/30 text-[var(--text-main)] border-[var(--card-border)]/50 rounded-tl-none shadow-sm'
                }`}>
                <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                {/* --- A. STATS CARD (Employees) --- */}
                {msg.stats && (msg.stats.sales || msg.stats.profit) && (
                    <div className="mt-3 bg-black/20 rounded-xl p-3 grid grid-cols-2 gap-2 border border-white/5">
                        {/* 1. SALES */}
                        {msg.stats.sales > 0 && (
                            <div className="col-span-1 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                                <div className="text-emerald-400 text-[10px] font-bold uppercase flex gap-1"><DollarSign size={10}/> Sales</div>
                                <div className="text-lg font-bold text-emerald-100">${msg.stats.sales.toLocaleString()}</div>
                            </div>
                        )}
                        {/* 2. PROFIT */}
                        {msg.stats.profit > 0 && (
                            <div className="col-span-1 bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg">
                                <div className="text-blue-400 text-[10px] font-bold uppercase flex gap-1"><TrendingUp size={10}/> Profit</div>
                                <div className="text-lg font-bold text-blue-100">${msg.stats.profit.toLocaleString()}</div>
                            </div>
                        )}
                        {/* 3. ITEMS SOLD */}
                        {msg.stats.itemsSold > 0 && (
                            <div className="col-span-1 bg-purple-500/10 border border-purple-500/20 p-2 rounded-lg">
                                <div className="text-purple-400 text-[10px] font-bold uppercase flex gap-1"><Box size={10}/> Sold</div>
                                <div className="text-lg font-bold text-purple-100">{msg.stats.itemsSold}</div>
                            </div>
                        )}
                        {/* 4. AVG DISCOUNT */}
                        {msg.stats.avgDiscount !== undefined && msg.stats.avgDiscount !== null && (
                            <div className="col-span-1 bg-pink-500/10 border border-pink-500/20 p-2 rounded-lg">
                                <div className="text-pink-400 text-[10px] font-bold uppercase flex gap-1"><Tag size={10}/> Disc.</div>
                                <div className="text-lg font-bold text-pink-100">{msg.stats.avgDiscount}%</div>
                            </div>
                        )}
                        {/* 5. RATING */}
                        {msg.stats.rating && (
                            <div className="col-span-2 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg flex justify-between items-center">
                                <div className="text-amber-400 text-[10px] font-bold uppercase flex gap-1"><Star size={10}/> Rating</div>
                                <div className="text-amber-100 font-bold">{msg.stats.rating}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- B. INVENTORY CARD (Products) --- */}
                {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 bg-black/20 rounded-xl overflow-hidden border border-white/5">
                        <div className="px-3 py-2 bg-white/5 text-xs font-semibold text-[var(--text-muted)] border-b border-white/5">
                            Inventory Match
                        </div>
                        {msg.products.map((prod, i) => (
                            <div key={i} className="px-3 py-2 flex justify-between items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-[var(--accent-color)]/20 text-[var(--accent-color)]">
                                        <Box size={12} />
                                    </div>
                                    <span className="font-medium text-[var(--text-main)]">{prod.name}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300">
                                            Qty: {prod.stock}
                                        </span>
                                        <span className="text-xs font-bold text-emerald-400">
                                            ${prod.price}
                                        </span>
                                    </div>
                                    {/* --- STUDENT BENEFITS BADGE --- */}
                                    {prod.benefits && prod.benefits !== "None" && (
                                        <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-1">
                                            {prod.benefits}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                </div>
            </div>

            {/* --- C. SUGGESTED ACTIONS --- */}
            {msg.actions && (
                <div className="flex flex-wrap gap-2 ml-11 animate-in fade-in zoom-in duration-300 delay-100">
                    {msg.actions.map((action, i) => (
                        <button 
                            key={i}
                            onClick={() => handleOptionClick(action.value)}
                            disabled={isLoading}
                            className="text-xs px-3 py-1.5 rounded-full border border-[var(--accent-color)]/30 bg-[var(--accent-color)]/10 text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

          </div>
        ))}
        {isLoading && <div className="ml-11 text-xs text-[var(--text-muted)] animate-pulse flex gap-2"><Loader2 className="animate-spin h-3 w-3"/> Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="mt-2 relative">
        <input 
          type="file" ref={fileInputRef} onChange={() => {}} className="hidden" 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Paperclip size={18} />
        </button>

        <input 
          className="w-full bg-white/5 border border-[var(--card-border)] text-[var(--text-main)] pl-12 pr-12 py-3 rounded-xl focus:border-[var(--accent-color)] focus:outline-none transition-all placeholder:text-[var(--text-muted)]"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type here..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        
        <button 
          onClick={() => handleSend()} 
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--accent-color)] text-white rounded-lg hover:scale-105 transition-transform"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;