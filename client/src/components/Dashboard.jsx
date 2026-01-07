import { useState, useEffect } from 'react';
import AnalyticsTable from './AnalyticsTable';
import API from '../api';
import { LayoutDashboard, Store, AlertTriangle } from 'lucide-react';

function Dashboard({ user }) {
  const [selectedNode, setSelectedNode] = useState("All");
  const [employees, setEmployees] = useState([]);

  if (!user) {
    return <div className="p-10 text-center text-amber-500 animate-pulse">Loading User Profile...</div>;
  }

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await API.get('/employees');
        setEmployees(response.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="w-full">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-amber-400 h-8 w-8" />
            Performance Overview
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time metrics for <span className="text-amber-400 font-medium">{selectedNode}</span>
          </p>
        </div>

        <div className="relative group">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 group-hover:text-amber-400 transition-colors" />
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="appearance-none bg-slate-900/80 border border-slate-700 text-slate-200 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-500/30 transition-all cursor-pointer min-w-[200px]"
          >
            <option value="All">All Locations</option>
            <option value="Main Counter">Main Counter</option>
            <option value="Campus Store">Campus Store</option>
            <option value="Kiosk A">Kiosk A</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {user.role === 'manager' ? (
          <div className="app-card overflow-hidden">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <h3 className="gold-text text-lg font-semibold">Employee Performance Metrics</h3>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Live Data</span>
            </div>
            <div className="overflow-x-auto">
              <AnalyticsTable data={employees} />
            </div>
          </div>
        ) : (
          <div className="app-card border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent p-6 flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 rounded-full shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-amber-100 font-bold text-lg">Access Restricted</h3>
              <p className="text-slate-300 mt-1 leading-relaxed">
                You are currently viewing this dashboard as <span className="text-white font-semibold underline decoration-amber-500/50">{user.role}</span>. 
                Full analytics access is reserved for Managers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;