import React, { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext();

const icons = {
  success: "✅",
  info: "ℹ️",
  warning: "⚠️",
  error: "❌"
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, description, variant = "info", duration = 4500 }) => {
    const id = crypto.randomUUID();
    const entry = { id, title, description, variant, createdAt: Date.now() };
    setToasts((prev) => [...prev, entry]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] px-4 py-3"
          >
            <div className="text-lg" aria-hidden>
              {icons[toast.variant] || icons.info}
            </div>
            <div className="flex-1">
              <p className="text-slate-900 font-semibold text-sm">{toast.title}</p>
              {toast.description && <p className="text-slate-600 text-sm">{toast.description}</p>}
            </div>
            <button
              className="text-slate-400 hover:text-slate-600 text-sm"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
