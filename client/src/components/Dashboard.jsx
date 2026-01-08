import { useState, useEffect } from 'react';
import AnalyticsTable from './AnalyticsTable';
import API from '../api';
import { LayoutDashboard, Store, AlertTriangle } from 'lucide-react';

function Dashboard({ user }) {
  const [selectedNode, setSelectedNode] = useState("All");
  const [employees, setEmployees] = useState([]);

  if (!user) {
    return <div className="p-10 text-center text-[var(--accent-color)] animate-pulse">Loading User Profile...</div>;
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
          <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-[var(--accent-color)] h-8 w-8" />
            Performance Overview
          </h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Real-time metrics for <span className="text-[var(--accent-color)] font-medium">{selectedNode}</span>
          </p>
        </div>

        <div className="relative group">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] h-4 w-4 group-hover:text-[var(--accent-color)] transition-colors" />
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            // FIX: Added !bg-transparent to let the background shine through more, reliant on the glass blur of the container
            className="appearance-none bg-[var(--card-bg)]/50 border border-[var(--card-border)] text-[var(--text-main)] pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-20 hover:border-[var(--accent-color)] transition-all cursor-pointer min-w-[200px] backdrop-blur-md"
          >
            <option value="All">All Locations</option>
            <option value="Main Counter">Main Counter</option>
            <option value="Campus Store">Campus Store</option>
            <option value="Kiosk A">Kiosk A</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">▼</div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {user.role === 'manager' ? (
          // FIX: Overrode the default .app-card background with a highly transparent one
          // Light Mode: !bg-white/10 | Dark Mode: !bg-slate-900/40
          // Added backdrop-blur-xl to blur the passing circles while keeping them visible
          <div className="app-card overflow-hidden !p-0 !bg-white/10 dark:!bg-slate-900/40 backdrop-blur-xl border-[var(--card-border)]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--card-border)]/50">
              <h3 className="theme-text text-lg font-semibold">Employee Performance Metrics</h3>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-mono">Live Data</span>
            </div>
            <div className="overflow-x-auto">
              <AnalyticsTable data={employees} />
            </div>
          </div>
        ) : (
          <div className="app-card border-l-4 border-l-[var(--accent-color)] bg-[var(--card-bg)]/50 backdrop-blur-md p-6 flex items-start gap-4">
            <div className="p-3 bg-[var(--accent-color)]/20 rounded-full shrink-0">
              <AlertTriangle className="h-6 w-6 text-[var(--accent-color)]" />
            </div>
            <div>
              <h3 className="text-[var(--text-main)] font-bold text-lg">Access Restricted</h3>
              <p className="text-[var(--text-muted)] mt-1 leading-relaxed">
                You are currently viewing this dashboard as <span className="text-[var(--text-main)] font-bold underline decoration-[var(--accent-color)]">{user.role}</span>. 
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