import { useState, useEffect } from 'react';
import API from '../api';

const AnalyticsTable = ({ data }) => {
  return (
    <div className="overflow-x-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Employee Performance Dashboard</h2>
      <table className="min-w-full text-left">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="py-2 px-4">Employee Name</th>
            <th className="py-2 px-4">Items Sold</th>
            <th className="py-2 px-4">Total Sales</th>
            <th className="py-2 px-4">Profit</th>
            <th className="py-2 px-4">Rating</th>
          </tr>
        </thead>
        <tbody>
          {data.map((emp, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{emp.name}</td>
              <td className="py-2 px-4">{emp.itemsSold}</td>
              <td className="py-2 px-4">${emp.totalSalesValue}</td>
              <td className="py-2 px-4 text-green-700">${emp.profitGenerated}</td>
              <td className={`py-2 px-4 font-semibold ${
                emp.rating === 'Excellent' ? 'text-green-600' : 
                emp.rating === 'Needs Improvement' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {emp.rating}
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

  if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;

  return <AnalyticsTable data={employees} />;
}

export default Dashboard;