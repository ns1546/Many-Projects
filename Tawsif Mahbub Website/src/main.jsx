import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './shadcn.css';
import './index.css';
import './mobile.css';
import { initSecurityArmor } from './lib/securityArmor';

// Initialize anti-tamper and anti-debugging protection
initSecurityArmor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
