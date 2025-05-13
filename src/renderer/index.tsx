import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TokenProvider } from './components/TokenContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TokenProvider>
      <App />
    </TokenProvider>
  </React.StrictMode>
);

// calling IPC exposed from preload script
window.electron?.ipcRenderer.once('ipc-example', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron?.ipcRenderer.sendMessage('ipc-example', ['ping']);
