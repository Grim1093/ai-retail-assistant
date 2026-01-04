import { useState } from 'react';
import API from '../api'; 

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState(""); // New: To show technical details
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    setIsLoading(true);

    try {
      console.log("Attempting login with:", username, password);
      // Calling the backend
      const response = await API.post('/auth/login', { username, password });
      
      console.log("Server Response:", response.data);

      if (response.data.success) {
        onLogin(response.data.user);
      } else {
        setError("Login failed: " + (response.data.message || "Unknown error"));
      }

    } catch (err) {
      console.error("Login Error Details:", err);
      
      // 1. Check if Server is offline (Network Error)
      if (err.message === "Network Error") {
        setError("❌ Server is NOT running.");
        setDebugInfo("Please open a new terminal, go to the 'server' folder, and run: npm start");
      } 
      // 2. Check if Password is wrong (401 Error)
      else if (err.response && err.response.status === 401) {
        setError("❌ Invalid Username or Password");
        setDebugInfo("Try: admin / 123");
      }
      // 3. Other Errors
      else {
        setError("❌ Error: " + err.message);
        setDebugInfo(JSON.stringify(err.response?.data || "Check Console (F12)"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          Retail Assistant Login
        </h2>
        
        {/* ERROR BOX */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            <p className="font-bold">{error}</p>
            <p className="text-xs mt-1 text-red-600 font-mono">{debugInfo}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="......"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Connecting...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          Demo: <b>admin</b> / 123 (Manager) or <b>staff</b> / 123 (Staff)
        </p>
      </div>
    </div>
  );
}

export default Login;