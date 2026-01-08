import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AnalyticsTable = ({ data }) => {
  console.log("[AnalyticsTable] Rendering with data count:", data?.length);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-[var(--text-muted)] italic">No employee data available to display.</div>;
  }

  return (
    <div className="w-full">
      <table className="min-w-full text-left border-collapse">
        <thead>
          {/* Header Border & Text: Uses theme variables */}
          <tr className="border-b border-[var(--card-border)] text-xs uppercase tracking-widest text-[var(--text-muted)]">
            <th className="py-4 px-6 font-medium">Employee Name</th>
            <th className="py-4 px-6 font-medium text-right">Items Sold</th>
            <th className="py-4 px-6 font-medium text-right">Total Sales</th>
            {/* Profit Header: Uses dynamic highlight color */}
            <th className="py-4 px-6 font-medium text-right text-[var(--accent-color)]">Profit</th>
            <th className="py-4 px-6 font-medium text-right">Avg Discount</th>
            <th className="py-4 px-6 font-medium text-center">Rating</th>
          </tr>
        </thead>
        
        {/* Divide lines: Use theme border variable */}
        <tbody className="divide-y divide-[var(--card-border)]">
          {data.map((emp, index) => (
            <tr 
              key={index} 
              // Hover: Uses a subtle transparent muted color that works on both backgrounds
              className="group hover:bg-[var(--text-muted)]/5 transition-colors duration-200"
            >
              {/* Name: Main Text Color */}
              <td className="py-4 px-6 text-[var(--text-main)] font-medium">
                {emp.name}
              </td>

              {/* Items Sold: Muted Text Color */}
              <td className="py-4 px-6 text-[var(--text-muted)] text-right">
                {emp.itemsSold}
              </td>

              {/* Total Sales: Main Text Color */}
              <td className="py-4 px-6 text-[var(--text-main)] text-right font-mono">
                ${emp.totalSalesValue.toLocaleString()}
              </td>

              {/* Profit: Accent Color (Gold in Dark / Sky in Light) */}
              <td className="py-4 px-6 text-right font-mono font-bold text-[var(--accent-color)] group-hover:brightness-110 shadow-[var(--accent-glow)]">
                ${emp.profitGenerated.toLocaleString()}
              </td>

              {/* Discount: Muted Text Color */}
              <td className="py-4 px-6 text-[var(--text-muted)] text-right">
                {emp.avgDiscount}%
              </td>

              {/* Rating Badge: Kept semantic colors (Green/Red/Blue) but checked for visibility */}
              <td className="py-4 px-6 text-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  emp.rating === 'Excellent'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : emp.rating === 'Needs Improvement'
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
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