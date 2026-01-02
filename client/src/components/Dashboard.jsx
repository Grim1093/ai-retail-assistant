import { useState, useEffect } from 'react';
import AnalyticsTable from './AnalyticsTable';
import API from '../api';

function Dashboard({ user, onLogout }) {
  const [selectedNode, setSelectedNode] = useState("All");
  const [employees, setEmployees] = useState([]);

  // Fetch employee data (Nitish's Logic)
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
    <div className="min-h-screen bg-gray-50">
      {/* Upgraded Header Section */}
      <header className="bg-blue-800 text-white p-4 shadow-md flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            AI Retail Assistant
          </h1>
          {/* Role Badge */}
          <span className="bg-blue-900 text-xs px-2 py-1 rounded border border-blue-600 uppercase tracking-wide">
            {user.role} View
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-blue-300">@{user.username}</p>
          </div>

          {/* Node Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="bg-blue-700 text-white border border-blue-500 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="All">All Locations</option>
              <option value="Main Counter">Main Counter</option>
              <option value="Campus Store">Campus Store</option>
              <option value="Kiosk A">Kiosk A</option>
            </select>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded ml-2 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-4">
        {/* Role-Based Content Access */}
        {user.role === 'manager' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Store Performance</h2>
            <AnalyticsTable data={employees} />
          </div>
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded shadow-sm">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <span className="font-bold">Staff View Active:</span> You have access to the AI Chat Assistant. 
                  Analytics are restricted to Managers.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;