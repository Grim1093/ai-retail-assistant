import React from 'react';
import { Package, Tag, AlertCircle, CheckCircle } from 'lucide-react';

const ProductTable = ({ data }) => {
  console.log("[ProductTable] Rendering with data count:", data?.length);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-[var(--text-muted)] italic">No product inventory available.</div>;
  }

  return (
    <div className="w-full">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--card-border)] text-xs uppercase tracking-widest text-[var(--text-muted)]">
            <th className="py-4 px-6 font-medium">Product Name</th>
            <th className="py-4 px-6 font-medium text-right">Price</th>
            <th className="py-4 px-6 font-medium text-center">Stock Level</th>
            <th className="py-4 px-6 font-medium">Student Benefits</th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-[var(--card-border)]">
          {data.map((prod, index) => (
            <tr 
              key={index} 
              className="group hover:bg-[var(--text-muted)]/5 transition-colors duration-200"
            >
              {/* Product Name */}
              <td className="py-4 px-6 text-[var(--text-main)] font-medium flex items-center gap-2">
                <Package size={16} className="text-[var(--accent-color)] opacity-50" />
                {prod.name}
              </td>

              {/* Price */}
              <td className="py-4 px-6 text-[var(--text-main)] text-right font-mono">
                ${prod.currentPrice.toFixed(2)}
              </td>

              {/* Stock Level (With color warning) */}
              <td className="py-4 px-6 text-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  prod.stockLevel < 10
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' // Low Stock
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' // Good Stock
                }`}>
                  {prod.stockLevel < 10 ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                  {prod.stockLevel} units
                </span>
              </td>

              {/* Benefits */}
              <td className="py-4 px-6 text-[var(--text-muted)] text-sm flex items-center gap-2">
                 {prod.studentBenefits ? (
                    <>
                        <Tag size={12} className="text-[var(--accent-color)]" />
                        {prod.studentBenefits}
                    </>
                 ) : (
                    <span className="opacity-50">-</span>
                 )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;