import { useState } from 'react';
import { createPortal } from 'react-dom'; // <--- CRITICAL IMPORT
import { X, UserPlus, PackagePlus, CheckCircle, AlertCircle, ChevronDown, Check } from 'lucide-react';
import API from '../api';

function AddDataModal({ onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('employee'); // 'employee' or 'product'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNodeOpen, setIsNodeOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // --- INITIAL STATES ---
  const initialEmployeeState = {
    name: '',
    nodeLocation: 'Main Counter',
    itemsSold: 0,
    totalSalesValue: 0,
    profitGenerated: 0,
    avgDiscount: 0,
    rating: 'Good'
  };

  const initialProductState = {
    name: '',
    category: '',
    currentPrice: 0,
    stockLevel: 0,
    studentBenefits: '',
    isAvailableInOtherNodes: false
  };

  const [empData, setEmpData] = useState(initialEmployeeState);
  const [prodData, setProdData] = useState(initialProductState);

  // --- HANDLERS ---
  const handleEmpChange = (e) => {
    const { name, value } = e.target;
    setEmpData(prev => ({ ...prev, [name]: value }));
  };

  const handleProdChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProdData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === 'employee') {
        await API.post('/employees', empData);
      } else {
        await API.post('/products', prodData);
      }
      
      // Success!
      onSuccess(); 

    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.response?.data?.message || "Failed to save data.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER WITH PORTAL ---
  // This teleports the modal outside the current DOM hierarchy to document.body
  // fixing the Z-Index / Layering issues.
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-4 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--card-bg)]">
          <h2 className="text-xl font-bold theme-text flex items-center gap-2">
            {activeTab === 'employee' ? <UserPlus size={20} /> : <PackagePlus size={20} />}
            Add New Record
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex p-2 gap-2 bg-[var(--card-bg)]/50 border-b border-[var(--card-border)]">
          <button 
            onClick={() => setActiveTab('employee')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'employee' ? 'bg-[var(--accent-color)] text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--card-border)]'}`}
          >
            Add Employee
          </button>
          <button 
            onClick={() => setActiveTab('product')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'product' ? 'bg-[var(--accent-color)] text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--card-border)]'}`}
          >
            Add Product
          </button>
        </div>

        {/* SCROLLABLE FORM AREA */}
        <div className="overflow-y-auto p-6 flex-1 bg-[var(--bg-primary)]/50">
            
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form id="add-data-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* --- EMPLOYEE FORM --- */}
                {activeTab === 'employee' && (
                    <>
                        <div className="form-group">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Full Name</label>
                            <input required name="name" value={empData.name} onChange={handleEmpChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none" placeholder="e.g. John Doe" />
                        </div>

                        {/* Custom Location Dropdown */}
                        <div className="form-group relative z-20">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Location Node</label>
                            
                            <button 
                                type="button"
                                onClick={() => setIsNodeOpen(!isNodeOpen)}
                                onBlur={() => setTimeout(() => setIsNodeOpen(false), 200)}
                                className="w-full flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)] focus:border-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all"
                            >
                                <span>{empData.nodeLocation}</span>
                                <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isNodeOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isNodeOpen && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {['Main Counter', 'Campus Store', 'Kiosk A'].map((loc) => (
                                        <div 
                                            key={loc}
                                            onClick={() => {
                                                setEmpData(prev => ({ ...prev, nodeLocation: loc }));
                                                setIsNodeOpen(false);
                                            }}
                                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--accent-color)]/10 text-[var(--text-main)] hover:text-[var(--accent-color)] transition-colors"
                                        >
                                            {loc}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Items Sold</label>
                                <input type="number" name="itemsSold" value={empData.itemsSold} onChange={handleEmpChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Sales Value ($)</label>
                                <input type="number" name="totalSalesValue" value={empData.totalSalesValue} onChange={handleEmpChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Profit ($)</label>
                                <input type="number" name="profitGenerated" value={empData.profitGenerated} onChange={handleEmpChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Avg Discount (%)</label>
                                <input type="number" name="avgDiscount" value={empData.avgDiscount} onChange={handleEmpChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)]" />
                            </div>
                        </div>

                        {/* Custom Rating Dropdown */}
                        <div className="form-group relative z-10">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Performance Rating</label>
                            
                            <button 
                                type="button"
                                onClick={() => setIsRatingOpen(!isRatingOpen)}
                                onBlur={() => setTimeout(() => setIsRatingOpen(false), 200)}
                                className="w-full flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)] focus:border-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all"
                            >
                                <span>{empData.rating}</span>
                                <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isRatingOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isRatingOpen && (
                                <div className="absolute bottom-full mb-1 left-0 w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement'].map((rate) => (
                                        <div 
                                            key={rate}
                                            onClick={() => {
                                                setEmpData(prev => ({ ...prev, rating: rate }));
                                                setIsRatingOpen(false);
                                            }}
                                            className="px-4 py-2.5 text-sm cursor-pointer hover:bg-[var(--accent-color)]/10 text-[var(--text-main)] hover:text-[var(--accent-color)] transition-colors"
                                        >
                                            {rate}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* --- PRODUCT FORM --- */}
                {activeTab === 'product' && (
                     <>
                        <div className="form-group">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Product Name</label>
                            <input required name="name" value={prodData.name} onChange={handleProdChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none" placeholder="e.g. Wireless Mouse" />
                        </div>

                        <div className="form-group">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Category</label>
                            <input required name="category" value={prodData.category} onChange={handleProdChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)]" placeholder="e.g. Electronics" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Price ($)</label>
                                <input type="number" name="currentPrice" value={prodData.currentPrice} onChange={handleProdChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Stock Level</label>
                                <input type="number" name="stockLevel" value={prodData.stockLevel} onChange={handleProdChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)]" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Student Benefits</label>
                            <input name="studentBenefits" value={prodData.studentBenefits} onChange={handleProdChange} className="w-full bg-[var(--bg-primary)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-[var(--text-main)]" placeholder="e.g. 10% Off with ID" />
                        </div>

                        {/* Custom Toggle Switch */}
                        <div 
                            onClick={() => setProdData(prev => ({ ...prev, isAvailableInOtherNodes: !prev.isAvailableInOtherNodes }))}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                prodData.isAvailableInOtherNodes 
                                    ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]' 
                                    : 'bg-[var(--bg-primary)]/50 border-[var(--card-border)] hover:border-[var(--text-muted)]'
                            }`}
                        >
                            {/* The Toggle Box */}
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                                prodData.isAvailableInOtherNodes
                                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
                                    : 'bg-transparent border-[var(--text-muted)]'
                            }`}>
                                {prodData.isAvailableInOtherNodes && <Check size={14} className="text-white" strokeWidth={4} />}
                            </div>
                            
                            <label className="text-sm font-medium text-[var(--text-main)] cursor-pointer select-none">
                                Available in all nodes?
                            </label>
                        </div>
                    </>
                )}
            </form>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)] flex justify-end gap-3">
            <button onClick={onClose} type="button" className="px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--card-border)] transition-colors">
                Cancel
            </button>
            <button 
                type="submit" 
                form="add-data-form" 
                disabled={isLoading}
                className="px-6 py-2 rounded-lg text-sm font-semibold bg-[var(--accent-color)] text-white shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Saving...' : (
                    <>
                        <CheckCircle size={16} /> Save Record
                    </>
                )}
            </button>
        </div>

      </div>
    </div>,
    document.body // <--- MOUNTS THE MODAL TO BODY
  );
}

export default AddDataModal;