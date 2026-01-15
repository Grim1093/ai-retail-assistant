import { useEffect, useState } from 'react';
import API from '../api';
import { ShieldAlert, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

function AuditLogTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await API.get('/shifts');
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-[var(--text-muted)]">Loading Security Logs...</div>;

  return (
    <div className="w-full">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--card-border)] text-xs uppercase tracking-widest text-[var(--text-muted)]">
            <th className="py-4 px-6 font-medium">Time</th>
            <th className="py-4 px-6 font-medium">Employee</th>
            <th className="py-4 px-6 font-medium text-right">System Expected</th>
            <th className="py-4 px-6 font-medium text-right">Actual Count</th>
            <th className="py-4 px-6 font-medium text-right">Discrepancy</th>
            <th className="py-4 px-6 font-medium text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--card-border)]">
          {logs.map((log) => (
            <tr key={log._id} className="group hover:bg-[var(--text-muted)]/5 transition-colors">
              
              {/* TIME */}
              <td className="py-4 px-6 text-[var(--text-muted)] text-sm flex items-center gap-2">
                <Clock size={14} />
                {new Date(log.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </td>

              {/* EMPLOYEE */}
              <td className="py-4 px-6 font-medium text-[var(--text-main)]">
                {log.employeeId?.name || "Unknown"}
                <span className="block text-[10px] text-[var(--text-muted)] uppercase">
                  {log.employeeId?.nodeLocation}
                </span>
              </td>

              {/* EXPECTED */}
              <td className="py-4 px-6 text-[var(--text-muted)] text-right font-mono">
                ${log.expectedCash.toFixed(2)}
              </td>

              {/* ACTUAL */}
              <td className="py-4 px-6 text-[var(--text-main)] text-right font-mono font-bold">
                ${log.actualCash.toFixed(2)}
              </td>

              {/* DISCREPANCY */}
              <td className={`py-4 px-6 text-right font-mono font-bold ${
                log.discrepancy === 0 ? 'text-[var(--text-muted)]' : 'text-red-500'
              }`}>
                {log.discrepancy > 0 ? '+' : ''}{log.discrepancy.toFixed(2)}
              </td>

              {/* STATUS BADGE */}
              <td className="py-4 px-6 text-center">
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    log.status === 'Matched'
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : log.status === 'CRITICAL ALERT'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                 }`}>
                    {log.status === 'Matched' && <CheckCircle size={12} />}
                    {log.status === 'CRITICAL ALERT' && <ShieldAlert size={12} />}
                    {log.status === 'Minor Discrepancy' && <AlertTriangle size={12} />}
                    {log.status}
                 </span>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      
      {logs.length === 0 && (
        <div className="p-8 text-center text-[var(--text-muted)] italic">
            No shift audits recorded yet.
        </div>
      )}
    </div>
  );
}

export default AuditLogTable;