
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const container = document.getElementById('root');
  if (!container) return;

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("React Mount Error:", error);
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #ef4444;">
        <h2 style="font-weight: 800; font-size: 24px;">App Crash</h2>
        <p style="color: #64748b;">Failed to initialize React environment.</p>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
