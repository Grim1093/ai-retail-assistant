import { useState, useEffect } from 'react';
import AnalyticsTable from './AnalyticsTable';
import ProductTable from './ProductTable';
import AddDataModal from './AddDataModal';
import EmployeeProfile from './EmployeeProfile';
import API from '../api';
import { LayoutDashboard, Store, PackageSearch, Plus, ChevronDown } from 'lucide-react'; // <--- REMOVED ShieldAlert & AuditLogTable

function Dashboard({ user }) {
  const [selectedNode, setSelectedNode] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [viewingEmployeeId, setViewingEmployeeId] = useState(null);

  if (!user) {
    return <div className="p-10 text-center text-[var(--accent-color)] animate-pulse">Loading User Profile...</div>;
  }

  const fetchData = async () => {
    try {
      const empRes = await API.get('/employees', { 
          params: { node: selectedNode } 
      });
      setEmployees(empRes.data);

      const prodRes = await API.get('/products');
      setProducts(prodRes.data);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedNode]);

  if (viewingEmployeeId) {
    return (
      <EmployeeProfile 
        employeeId={viewingEmployeeId} 
        onBack={() => setViewingEmployeeId(null)} 
      />
    );
  }

  return (
    <div className="w-full space-y-8 relative animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        
        {user.role === 'manager' ? (
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight flex items-center gap-3">
              <LayoutDashboard className="text-[var(--accent-color)] h-8 w-8" />
              Performance Overview
            </h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Real-time metrics for <span className="text-[var(--accent-color)] font-medium">{selectedNode}</span>
            </p>
          </div>
        ) : <div />}

        <div className="flex items-center gap-3">
            {user.role === 'manager' && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-semibold shadow-lg shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all duration-300"
                >
                    <Plus size={18} strokeWidth={3} />
                    <span className="hidden sm:inline">Add Data</span>
                </button>
            )}

            {user.role === 'manager' && (
              <div className="relative z-50">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] h-4 w-4 z-10" />
     
                <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className="w-[200px] flex items-center justify-between bg-[var(--card-bg)]/50 border border-[var(--card-border)] text-[var(--text-main)] pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all cursor-pointer backdrop-blur-md"
                >
                    <span>{selectedNode === 'All' ? 'All Locations' : selectedNode}</span>
                    <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                        {['All', 'Main Counter', 'Campus Store', 'Kiosk A'].map((option) => (
                            <div 
                                key={option}
                                onClick={() => {
                                    setSelectedNode(option);
                                    setIsDropdownOpen(false);
                                }}
                                className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                                    selectedNode === option 
                                        ? 'bg-[var(--accent-color)] text-white font-medium' 
                                        : 'text-[var(--text-main)] hover:bg-[var(--accent-color)]/10'
                                }`}
                            >
                                {option === 'All' ? 'All Locations' : option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            )}
        </div>
      </div>

      {/* --- SECTION 1: EMPLOYEES (Manager Only) --- */}
      {user.role === 'manager' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="app-card overflow-hidden !p-0 !bg-white/10 dark:!bg-slate-900/40 backdrop-blur-xl border-[var(--card-border)]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--card-border)]/50">
              <h3 className="theme-text text-lg font-semibold">Employee Performance Metrics</h3>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-mono">Live Data</span>
            </div>
            <div className="overflow-x-auto">
              <AnalyticsTable 
                data={employees} 
                onViewProfile={(id) => setViewingEmployeeId(id)} 
              />
            </div>
          </div>
        </div>
      )}
    
      {/* --- SECTION 2: PRODUCT INVENTORY --- */}
      <div className="mt-10 mb-6">
        <h2 className="text-3xl font-bold text-[var(--text-main)] tracking-tight flex items-center gap-3">
          <PackageSearch className="text-[var(--accent-color)] h-8 w-8" />
          Inventory Management
        </h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Detailed breakdown of <span className="text-[var(--accent-color)] font-medium">Stock & Benefits</span>
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="app-card overflow-hidden !p-0 !bg-white/10 dark:!bg-slate-900/40 backdrop-blur-xl border-[var(--card-border)]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--card-border)]/50">
              <h3 className="theme-text text-lg font-semibold flex items-center gap-2">
                 <PackageSearch size={20} className="text-[var(--accent-color)]" />
                 Store Inventory & Benefits
              </h3>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-mono">Live Data</span>
            </div>
            <div className="overflow-x-auto">
              <ProductTable data={products} />
            </div>
          </div>
      </div>

      {isModalOpen && (
        <AddDataModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
                fetchData();
                setIsModalOpen(false); 
            }} 
        />
      )}

    </div>
  );
}

export default Dashboard;