import { useState, useEffect } from 'react';
import API from '../api';
import CloseShiftModal from './CloseShiftModal';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, CheckCircle, Package, Smartphone, Banknote, Lock } from 'lucide-react';

function POSInterface({ user }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stockLevel) return prev; 
        return prev.map(item => 
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        productId: product._id, 
        name: product.name, 
        price: product.currentPrice, 
        quantity: 1, 
        maxStock: product.stockLevel 
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty > item.maxStock) return item; 
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const payload = {
        employeeId: user.employeeId, 
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod: paymentMethod 
      };

      const res = await API.post('/transactions', payload);
      setSuccessData(res.data);
      setCart([]); 
      fetchProducts(); 
    } catch (err) {
      alert("Checkout Failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 animate-in zoom-in duration-300">
        <div className="bg-[var(--card-bg)] border border-[var(--accent-color)] p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">Sale Complete!</h2>
          <p className="text-[var(--text-muted)] mb-6">Paid via {successData.transaction.paymentMethod}</p>
          
          <div className="bg-black/20 p-4 rounded-xl text-left mb-6 font-mono text-xs text-[var(--text-muted)] break-all">
            <p className="mb-1 text-[var(--accent-color)] font-bold">BLOCKCHAIN PROOF:</p>
            {successData.transaction.transactionHash}
          </div>

          <button 
            onClick={() => setSuccessData(null)}
            className="w-full py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold hover:opacity-90 transition"
          >
            Start New Sale
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      
      {/* LEFT: PRODUCT CATALOG */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        {/* HEADER & SEARCH */}
        <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-12 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* UPDATED: ONLY SHOW CLOSE SHIFT IF USER IS STAFF */}
            {user.role === 'staff' && (
              <button 
                  onClick={() => setIsShiftModalOpen(true)}
                  className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap"
                  title="End Shift Audit"
              >
                  <Lock size={18} />
                  <span className="hidden sm:inline">Close Shift</span>
              </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
          {filteredProducts.map(product => (
            <div 
              key={product._id} 
              onClick={() => product.stockLevel > 0 && addToCart(product)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                product.stockLevel === 0 
                  ? 'opacity-50 grayscale border-red-500/30 bg-red-500/5' 
                  : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--accent-color)] hover:shadow-lg'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-lg">
                  <Package size={20} />
                </div>
                <span className="font-mono text-sm font-bold text-[var(--text-main)]">
                  ${product.currentPrice}
                </span>
              </div>
              <h4 className="font-semibold text-[var(--text-main)] truncate" title={product.name}>{product.name}</h4>
              <p className={`text-xs mt-1 ${product.stockLevel < 10 ? 'text-red-400 font-bold' : 'text-[var(--text-muted)]'}`}>
                {product.stockLevel === 0 ? "Out of Stock" : `${product.stockLevel} in stock`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: CURRENT CART */}
      <div className="app-card flex flex-col h-full !p-0 overflow-hidden border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl">
        <div className="p-4 border-b border-[var(--card-border)] bg-[var(--card-bg)]">
          <h3 className="font-bold text-[var(--text-main)] flex items-center gap-2">
            <ShoppingCart size={20} className="text-[var(--accent-color)]" />
            Current Sale
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
              <ShoppingCart size={48} className="mb-2" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex items-center justify-between p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-[var(--text-main)] truncate">{item.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">${item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white/10 rounded"><Minus size={14} className="text-[var(--text-main)]" /></button>
                   <span className="text-sm font-bold text-[var(--text-main)] w-4 text-center">{item.quantity}</span>
                   <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white/10 rounded"><Plus size={14} className="text-[var(--text-main)]" /></button>
                   <button onClick={() => removeFromCart(item.productId)} className="ml-2 text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Payment Methods */}
        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)] space-y-4">
          <div className="flex justify-between items-center text-lg font-bold text-[var(--text-main)]">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <button 
               onClick={() => setPaymentMethod("Cash")}
               className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all ${
                 paymentMethod === "Cash" 
                 ? "bg-green-500/20 border-green-500 text-green-500" 
                 : "border-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-border)]"
               }`}
             >
               <Banknote size={16} /> Cash
             </button>
             <button 
               onClick={() => setPaymentMethod("UPI")}
               className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all ${
                 paymentMethod === "UPI" 
                 ? "bg-blue-500/20 border-blue-500 text-blue-500" 
                 : "border-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-border)]"
               }`}
             >
               <Smartphone size={16} /> UPI / Card
             </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className="w-full py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold shadow-lg shadow-[var(--accent-glow)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             <CheckCircle size={20} />
             Confirm Payment
          </button>
        </div>
      </div>

      <CloseShiftModal 
        isOpen={isShiftModalOpen} 
        onClose={() => setIsShiftModalOpen(false)} 
        user={user}
      />

    </div>
  );
}

export default POSInterface;