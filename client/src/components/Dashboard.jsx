// client/src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import API from '../api';
import AnalyticsTable from './AnalyticsTable'; // Import the dedicated component

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log("[Dashboard] 1. Starting fetch for /employees...");
      try {
        const response = await API.get('/employees');
        console.log("[Dashboard] 2. Data received:", response.data);
        setEmployees(response.data);
      } catch (error) {
        console.error("[Dashboard] FAILURE: Error fetching employees:", error);
      } finally {
        setLoading(false);
        console.log("[Dashboard] 3. Loading state set to false");
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-indigo-600 font-bold">Loading Analytics...</div>;

  return (
    <div className="p-2">
      {/* NEW: Styled Header with Node Selector */}
      <header className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          AI Retail Assistant
        </h1>
      
        <div className="flex items-center gap-2">
          <label className="text-sm text-blue-200">Store Node:</label>
          <select
            className="bg-blue-700 text-white border border-blue-500 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            defaultValue="All"
            onChange={(e) => console.log("Node changed to:", e.target.value)} // Nitish will connect this later
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