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
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Retail Dashboard</h1>
      <p className="text-slate-500 mb-6">Manage your store employees and daily sales data.</p>
      
      {/* Pass the data to the child component */}
      <AnalyticsTable data={employees} />
    </div>
  );
}

export default Dashboard;