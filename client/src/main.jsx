import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <--- THIS LINE IS CRITICAL. IF MISSING, NO STYLES WILL WORK.
import { ThemeProvider } from './context/ThemeContext' // 1. Import the Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap the App component so it can access the Theme Context */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)