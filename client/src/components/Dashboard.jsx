const AnalyticsTable = ({ data }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase">Employee Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase">Role</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase">Shift Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((emp) => (
            <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{emp.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{emp.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {emp.shift || 'Full Time'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};