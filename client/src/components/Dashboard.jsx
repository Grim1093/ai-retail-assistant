import { useState, useEffect } from 'react';
import API from '../api';
import AnalyticsTable from './AnalyticsTable'; 

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. NEW STATE: Track the currently selected store
  const [selectedNode, setSelectedNode] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      console.log(`[Dashboard] Fetching data for node: ${selectedNode}...`);
      setLoading(true);
      try {
        // 2. QUERY LOGIC: If 'All', fetch everything. If specific, add ?node=Value
        const query = selectedNode === 'All' ? '' : `?node=${selectedNode}`;
        
        // This sends a request like: GET /employees?node=Campus Store
        const response = await API.get(`/employees${query}`);
        
        console.log("[Dashboard] Data received:", response.data);
        setEmployees(response.data);
      } catch (error) {
        console.error("[Dashboard] Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedNode]); // 3. CRITICAL: Re-run this effect whenever 'selectedNode' changes

  if (loading) return <div className="p-8 text-indigo-600 font-bold">Loading Analytics...</div>;

  return (
    <div className="p-2">
      <header className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          AI Retail Assistant
        </h1>
      
        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-200">Store Node:</label>
          <select
            className="bg-blue-700 text-white border border-blue-500 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            // 4. CONNECT UI: Bind value to state and update state on change
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)} 
          >
            <option value="All">All Locations</option>
            <option value="Main Counter">Main Counter</option>
            <option value="Campus Store">Campus Store</option>
            <option value="Kiosk A">Kiosk A</option>
          </select>
        </div>
      </header>

      <p className="text-slate-500 mb-6">Manage your store employees and daily sales data.</p>
    
      <AnalyticsTable data={employees} />
    </div>
  );
}

export default Dashboard;