import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './AuthContext'
import { NetworkGraphProvider } from "@/features/network/NetworkGraphContext";
import "./dev/networkDiagnostics.js";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NetworkGraphProvider>
        <App />
      </NetworkGraphProvider>
    </AuthProvider>
  </React.StrictMode>,
)
