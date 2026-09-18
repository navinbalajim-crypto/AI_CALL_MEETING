import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = {
      id,
      title: toast.title,
      message: toast.message,
      type: toast.type || 'info', // info, commitment, success, alert
      duration: toast.duration || 4500,
      action: toast.action
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 4));

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3.5 backdrop-blur-xl animate-slide-up transition-all ${
              toast.type === 'commitment'
                ? 'bg-[#101526]/95 border-emerald-500/40 text-white shadow-emerald-950/40'
                : toast.type === 'alert'
                ? 'bg-[#101526]/95 border-amber-500/40 text-white shadow-amber-950/40'
                : toast.type === 'success'
                ? 'bg-[#101526]/95 border-primary/40 text-white'
                : 'bg-[#101526]/95 border-white/10 text-white'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'commitment' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
              )}
              {toast.type === 'alert' && (
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'success' && (
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-soft">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-8 h-8 rounded-lg bg-ai/15 border border-ai/30 flex items-center justify-center text-ai">
                  <Info className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white leading-snug flex items-center gap-2">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-xs font-medium text-ai hover:underline flex items-center gap-1"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
