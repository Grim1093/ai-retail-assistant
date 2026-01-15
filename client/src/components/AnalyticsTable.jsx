import React, {useState} from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpDown, Eye } from 'lucide-react'; // <--- Added Eye Icon

const AnalyticsTable = ({ data, onViewProfile }) => { // <--- Added onViewProfile Prop
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
            
            {/* 1. NAME */}
            <th className="py-4 px-6 font-medium cursor-pointer group select-none" onClick={() => requestSort('name')}>
              <div className="flex items-center">Employee Name <SortIcon columnKey="name" /></div>
            </th>

            {/* 2. ITEMS SOLD */}
            <th className="py-4 px-6 font-medium text-right cursor-pointer group select-none" onClick={() => requestSort('itemsSold')}>
              <div className="flex items-center justify-end">Items Sold <SortIcon columnKey="itemsSold" /></div>
            </th>

            {/* 3. SALES */}
            <th className="py-4 px-6 font-medium text-right cursor-pointer group select-none" onClick={() => requestSort('totalSalesValue')}>
              <div className="flex items-center justify-end">Total Sales <SortIcon columnKey="totalSalesValue" /></div>
            </th>

            {/* 4. PROFIT */}
            <th className="py-4 px-6 font-medium text-right text-[var(--accent-color)] cursor-pointer group select-none" onClick={() => requestSort('profitGenerated')}>
              <div className="flex items-center justify-end">Profit <SortIcon columnKey="profitGenerated" /></div>
            </th>

            {/* 5. DISCOUNT */}
            <th className="py-4 px-6 font-medium text-right cursor-pointer group select-none" onClick={() => requestSort('avgDiscount')}>
              <div className="flex items-center justify-end">Avg Discount <SortIcon columnKey="avgDiscount" /></div>
            </th>

            {/* 6. RATING */}
            <th className="py-4 px-6 font-medium text-center cursor-pointer group select-none" onClick={() => requestSort('rating')}>
              <div className="flex items-center justify-center">Rating <SortIcon columnKey="rating" /></div>
            </th>

            {/* 7. ACTIONS (New Column) */}
            <th className="py-4 px-6 font-medium text-center">
              Profile
            </th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-[var(--card-border)]">
          {sortedData.map((emp, index) => (
            <tr 
              key={index} 
              className="group hover:bg-[var(--text-muted)]/5 transition-colors duration-200"
            >
              {/* Name */}
              <td className="py-4 px-6 text-[var(--text-main)] font-medium">
                {emp.name}
              </td>

              {/* Items Sold */}
              <td className="py-4 px-6 text-[var(--text-muted)] text-right">
                {emp.itemsSold}
              </td>

              {/* Total Sales */}
              <td className="py-4 px-6 text-[var(--text-main)] text-right font-mono">
                ${emp.totalSalesValue.toLocaleString()}
              </td>

              {/* Profit */}
              <td className="py-4 px-6 text-right font-mono font-bold text-[var(--accent-color)] group-hover:brightness-110 shadow-[var(--accent-glow)]">
                ${emp.profitGenerated.toLocaleString()}
              </td>

              {/* Discount */}
              <td className="py-4 px-6 text-[var(--text-muted)] text-right">
                {emp.avgDiscount}%
              </td>

              {/* Rating Badge */}
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

              {/* ACTIONS CELL (Click triggers Profile View) */}
              <td className="py-4 px-6 text-center">
                <button 
                  onClick={() => onViewProfile(emp._id)} // <--- Passes ID to Dashboard
                  className="p-2 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300 transform active:scale-95"
                  title="View Full Profile"
                >
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsTable;