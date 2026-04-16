import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../utils/api';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`glass-effect px-4 py-3 rounded-lg shadow-lg toast-enter flex items-center gap-2 ${
              toast.type === 'error' ? 'border-red-500' :
              toast.type === 'success' ? 'border-green-500' :
              'border-primary-500'
            }`}
          >
            <span className="text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
