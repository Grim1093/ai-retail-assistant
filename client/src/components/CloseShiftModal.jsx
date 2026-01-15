import { useState } from 'react';
import API from '../api';
import { X, ShieldAlert, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

function CloseShiftModal({ isOpen, onClose, user }) {
  const [cashCount, setCashCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cashCount) return;
    
    setLoading(true);
    try {
      const res = await API.post('/shifts/close', {
        employeeId: user.employeeId,
        actualCash: parseFloat(cashCount)
      });
      setReport(res.data.report);
    } catch (err) {
      alert("Audit Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--card-border)] bg-[var(--card-bg)]">
          <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <ShieldAlert className="text-[var(--accent-color)]" />
            End of Shift Audit
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8">
          
          {/* STATE 1: INPUT FORM */}
          {!report ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                 <p className="text-sm text-blue-400 font-medium">
                   🔒 <strong>Blind Close Protocol:</strong> The system knows how much cash you should have. Count your physical drawer and enter the amount below.
                 </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Total Cash in Drawer
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-mono">$</span>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    className="w-full pl-8 pr-4 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-2xl font-mono font-bold text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none transition-colors"
                    placeholder="0.00"
                    value={cashCount}
                    onChange={(e) => setCashCount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !cashCount}
                className="w-full py-4 bg-[var(--accent-color)] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader className="animate-spin" /> : "Submit Audit"}
              </button>
            </form>
          ) : (
            
            /* STATE 2: AUDIT RESULT */
            <div className="text-center space-y-6">
              {/* STATUS ICON */}
              <div className="flex justify-center">
                 {report.status === 'Matched' && <div className="p-4 bg-green-500/20 rounded-full"><CheckCircle size={48} className="text-green-500"/></div>}
                 {report.status === 'Minor Discrepancy' && <div className="p-4 bg-yellow-500/20 rounded-full"><AlertTriangle size={48} className="text-yellow-500"/></div>}
                 {report.status === 'CRITICAL ALERT' && <div className="p-4 bg-red-500/20 rounded-full"><ShieldAlert size={48} className="text-red-500"/></div>}
              </div>

              <div>
                <h3 className={`text-2xl font-black uppercase ${
                  report.status === 'Matched' ? 'text-green-500' : 
                  report.status === 'Minor Discrepancy' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {report.status}
                </h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">Audit Log #{report._id.slice(-6)}</p>
              </div>

              <div className="bg-black/20 rounded-xl p-4 space-y-2 font-mono text-sm">
                 <div className="flex justify-between text-[var(--text-muted)]">
                   <span>System Expected:</span>
                   <span>${report.expectedCash.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-[var(--text-main)] font-bold">
                   <span>You Declared:</span>
                   <span>${report.actualCash.toFixed(2)}</span>
                 </div>
                 <div className={`flex justify-between border-t border-white/10 pt-2 font-bold ${
                    report.discrepancy === 0 ? 'text-green-500' : 'text-red-400'
                 }`}>
                   <span>Difference:</span>
                   <span>{report.discrepancy > 0 ? '+' : ''}{report.discrepancy.toFixed(2)}</span>
                 </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-3 border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 rounded-xl font-medium transition-colors"
              >
                Close Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CloseShiftModal;