import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import API from '../api';

function EmployeeProfile({ employeeId, onBack }) {
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Basic Stats
        const empRes = await API.get(`/employees/${employeeId}`);
        setEmployee(empRes.data);

        // 2. Fetch Sales History (For Graphs)
        const histRes = await API.get(`/transactions/employee/${employeeId}`);
        setHistory(histRes.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchData();
  }, [employeeId]);

  if (loading) return <div className="p-10 text-center text-[var(--accent-color)] animate-pulse">Loading Financial Profile...</div>;
  if (!employee) return <div className="p-10 text-center text-red-400">Employee Not Found</div>;

  // --- CALCULATIONS ---
  // 1. Trust Score: Percentage of transactions with a valid Blockchain Hash (Simulation)
  const totalTx = history.length;
  const verifiedTx = history.filter(tx => tx.transactionHash).length;
  const trustScore = totalTx === 0 ? 100 : Math.round((verifiedTx / totalTx) * 100);

  // 2. Chart Data: Format history for Recharts
  // We reverse it so the graph goes Left(Old) -> Right(New)
  const chartData = [...history].reverse().map((tx, index) => ({
    name: `Sale ${index + 1}`,
    amount: tx.totalAmount,
    time: new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-[var(--card-border)] transition-colors text-[var(--text-muted)]"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-2">
            {employee.name}
            {trustScore === 100 && <ShieldCheck className="text-green-500" size={24} title="100% Blockchain Verified" />}
          </h2>
          <p className="text-[var(--text-muted)]">{employee.nodeLocation} • {employee.role || 'Sales Associate'}</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: PROFIT CONTRIBUTION */}
        <div className="app-card border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={64} />
          </div>
          <h3 className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1">Profit Generated</h3>
          <p className="text-3xl font-mono font-bold text-[var(--accent-color)]">
            ${employee.profitGenerated?.toFixed(2) || '0.00'}
          </p>
          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Top 10% Contributor</span>
          </div>
        </div>

        {/* CARD 2: TRUST SCORE (BLOCKCHAIN) */}
        <div className="app-card border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl relative overflow-hidden">
          <h3 className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1">Blockchain Trust Score</h3>
          <div className="flex items-end gap-2">
            <p className={`text-4xl font-black ${trustScore === 100 ? 'text-green-500' : 'text-yellow-500'}`}>
              {trustScore}%
            </p>
            <span className="text-xs text-[var(--text-muted)] mb-1">Verified Transactions</span>
          </div>
          <div className="w-full bg-gray-700 h-1.5 mt-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-1000" 
              style={{ width: `${trustScore}%` }}
            />
          </div>
        </div>

        {/* CARD 3: PERFORMANCE RATING */}
        <div className="app-card border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl">
           <h3 className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-bold mb-1">Current Rating</h3>
           <p className="text-2xl font-bold text-[var(--text-main)]">{employee.rating}</p>
           <p className="text-xs text-[var(--text-muted)] mt-1">Based on customer feedback & sales volume.</p>
        </div>
      </div>

      {/* CHARTS & LEDGER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: SALES VELOCITY CHART */}
        <div className="lg:col-span-2 app-card border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl h-[400px] flex flex-col">
          <div className="mb-4 flex justify-between items-center">
             <h3 className="font-bold text-[var(--text-main)] flex items-center gap-2">
               <Activity size={18} className="text-[var(--accent-color)]" />
               Sales Velocity
             </h3>
             <span className="text-xs text-[var(--text-muted)]">Last 50 Transactions</span>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" opacity={0.5} />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--accent-color)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--accent-color)" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: RECENT LEDGER */}
        <div className="lg:col-span-1 app-card border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl flex flex-col h-[400px]">
          <h3 className="font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
             <ShieldCheck size={18} className="text-green-500" />
             Recent Ledger
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {history.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm">No transactions found.</p>
            ) : (
              history.map((tx) => (
                <div key={tx._id} className="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent-color)] transition-all group">
                   <div className="flex justify-between items-start mb-1">
                      <span className="text-green-400 font-mono font-bold text-sm">+${tx.totalAmount}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                   </div>
                   <div className="text-[10px] font-mono text-[var(--text-muted)] truncate group-hover:text-[var(--text-main)] transition-colors">
                      Hash: {tx.transactionHash || 'PENDING'}
                   </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmployeeProfile;