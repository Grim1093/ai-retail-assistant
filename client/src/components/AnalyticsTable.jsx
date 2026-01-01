// client/src/components/AnalyticsTable.jsx
import React from 'react';

const AnalyticsTable = ({ data }) => {
  console.log("[AnalyticsTable] Rendering with data count:", data?.length);

  if (!data || data.length === 0) {
    return <div className="p-4 text-slate-500">No employee data available to display.</div>;
  }

  return (
    <div className="overflow-x-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Employee Performance Dashboard</h2>
      <table className="min-w-full text-left border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="py-3 px-4 font-semibold text-gray-700">Employee Name</th>
            <th className="py-3 px-4 font-semibold text-gray-700">Items Sold</th>
            <th className="py-3 px-4 font-semibold text-gray-700">Total Sales</th>
            <th className="py-3 px-4 font-semibold text-gray-700">Profit</th>
            <th className="py-3 px-4 font-semibold text-gray-700">Avg Discount</th>
            <th className="py-3 px-4 font-semibold text-gray-700">Rating</th>
          </tr>
        </thead>
        <tbody>
          {data.map((emp, index) => (
            <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">{emp.name}</td>
              <td className="py-3 px-4">{emp.itemsSold}</td>
              <td className="py-3 px-4">${emp.totalSalesValue}</td>
              <td className="py-3 px-4 text-green-700 font-medium">${emp.profitGenerated}</td>
              <td className="py-3 px-4 text-blue-600">{emp.avgDiscount}%</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  emp.rating === 'Excellent'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : emp.rating === 'Needs Improvement'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {emp.rating}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsTable;