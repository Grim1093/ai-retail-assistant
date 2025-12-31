import { useState, useEffect } from 'react';
import API from '../api';

const AnalyticsTable = ({ data }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 mt-4">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase">Employee Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase">Role</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((emp) => (
            <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{emp.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emp.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get('/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-indigo-600 font-bold">Loading Analytics...</div>;

  return (
    <div className="p-2">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Retail Dashboard</h1>
      <p className="text-slate-500 mb-6">Manage your store employees and daily sales data.</p>
      <AnalyticsTable data={employees} />
    </div>
  );
}

export default Dashboard;