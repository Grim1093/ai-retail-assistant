import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AnalyticsTable = ({ data }) => {
  console.log("[AnalyticsTable] Rendering with data count:", data?.length);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-500 italic">No employee data available to display.</div>;
  }

  return (
    // Removed 'bg-white shadow' to fit transparently inside the parent app-card
    <div className="w-full">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-400">
            <th className="py-4 px-6 font-medium">Employee Name</th>
            <th className="py-4 px-6 font-medium text-right">Items Sold</th>
            <th className="py-4 px-6 font-medium text-right">Total Sales</th>
            <th className="py-4 px-6 font-medium text-right text-amber-500">Profit</th>
            <th className="py-4 px-6 font-medium text-right">Avg Discount</th>
            <th className="py-4 px-6 font-medium text-center">Rating</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((emp, index) => (
            <tr 
              key={index} 
              className="group hover:bg-white/5 transition-colors duration-200"
            >
              {/* Name */}
              <td className="py-4 px-6 text-slate-200 font-medium">
                {emp.name}
              </td>

              {/* Items Sold */}
              <td className="py-4 px-6 text-slate-400 text-right">
                {emp.itemsSold}
              </td>

              {/* Total Sales */}
              <td className="py-4 px-6 text-slate-200 text-right font-mono">
                ${emp.totalSalesValue.toLocaleString()}
              </td>

              {/* Profit (Highlighted Gold/Green) */}
              <td className="py-4 px-6 text-right font-mono font-bold text-amber-400 group-hover:text-amber-300 shadow-amber-500/10">
                ${emp.profitGenerated.toLocaleString()}
              </td>

              {/* Discount */}
              <td className="py-4 px-6 text-slate-400 text-right">
                {emp.avgDiscount}%
              </td>

              {/* Rating Badge */}
              <td className="py-4 px-6 text-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  emp.rating === 'Excellent'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : emp.rating === 'Needs Improvement'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {emp.rating === 'Excellent' && <TrendingUp size={12} />}
                  {emp.rating === 'Needs Improvement' && <TrendingDown size={12} />}
                  {emp.rating !== 'Excellent' && emp.rating !== 'Needs Improvement' && <Minus size={12} />}
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