import React, {useState} from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react';

const AnalyticsTable = ({ data }) => {
  console.log("[AnalyticsTable] Rendering with data count:", data?.length);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // --- SORTING LOGIC ---
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Special handling for Rating strings if needed, otherwise string compare
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to render sort icon
  const SortIcon = ({ columnKey }) => (
    <ArrowUpDown 
      size={14} 
      className={`ml-1 transition-opacity ${
        sortConfig.key === columnKey ? 'opacity-100 text-[var(--accent-color)]' : 'opacity-30 group-hover:opacity-70'
      }`} 
    />
  );

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-[var(--text-muted)] italic">No employee data available to display.</div>;
  }

  return (
    <div className="w-full">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--card-border)] text-xs uppercase tracking-widest text-[var(--text-muted)]">
            
            {/* 1. NAME - Clickable */}
            <th className="py-4 px-6 font-medium cursor-pointer group select-none" onClick={() => requestSort('name')}>
              <div className="flex items-center">Employee Name <SortIcon columnKey="name" /></div>
            </th>

            {/* 2. ITEMS SOLD - Clickable */}
            <th className="py-4 px-6 font-medium text-right cursor-pointer group select-none" onClick={() => requestSort('itemsSold')}>
              <div className="flex items-center justify-end">Items Sold <SortIcon columnKey="itemsSold" /></div>
            </th>

            {/* 3. SALES - Clickable */}
            <th className="py-4 px-6 font-medium text-right cursor-pointer group select-none" onClick={() => requestSort('totalSalesValue')}>
              <div className="flex items-center justify-end">Total Sales <SortIcon columnKey="totalSalesValue" /></div>
            </th>

            {/* 4. PROFIT - Clickable & Colored */}
            <th className="py-4 px-6 font-medium text-right text-[var(--accent-color)] cursor-pointer group select-none" onClick={() => requestSort('profitGenerated')}>
              <div className="flex items-center justify-end">Profit <SortIcon columnKey="profitGenerated" /></div>
            </th>

            {/* 5. DISCOUNT - Clickable */}
            <th className="py-4 px-6 font-medium text-right cursor-pointer group select-none" onClick={() => requestSort('avgDiscount')}>
              <div className="flex items-center justify-end">Avg Discount <SortIcon columnKey="avgDiscount" /></div>
            </th>

            {/* 6. RATING - Clickable */}
            <th className="py-4 px-6 font-medium text-center cursor-pointer group select-none" onClick={() => requestSort('rating')}>
              <div className="flex items-center justify-center">Rating <SortIcon columnKey="rating" /></div>
            </th>
          </tr>
        </thead>
        
        {/* Divide lines: Use theme border variable */}
        <tbody className="divide-y divide-[var(--card-border)]">
          {sortedData.map((emp, index) => (
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