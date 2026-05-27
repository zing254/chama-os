import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { TOAST_DURATION_MS } from '../data/constants';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'sound';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  sound?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  playSound: (type: 'success' | 'error' | 'notification') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const SOUNDS = {
  success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6Wg3NuZXB0gJWakIx0bmJweoSOkJyVjoqFeWNleIOQlZqXkYqFgHZxd4OTl5iVlYuFf3h0d4OQk5mVlYuFfnhzd4KQlJmUlIuEfnhzd4KQlJmUlIuEfnhzd4KQlJmUlIuEfnhzd4KQlJmUlIuEfnhzd4KQlJmUlIuEfnhzd4KQlJmUlIuEfnhzd4KQlJmUlIuEfnhzd4KQlJmUlIuEfnhzc=',
  error: 'data:audio/wav;base64,UklGRl4GAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ0GAACBf4KIfXlzd4OQk5mVlYuEgHdzdoKQk5mVlYuEf3hzd4KQkpmUlIuEgHdzdoKQkpmUlIuEf3hzd4KQkpmUlIuEf3hzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuF',
  notification: 'data:audio/wav;base64,UklGRjYGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ0GAACBf4KIfXlzd4OQk5mVlYuEgHdzdoKQk5mVlYuEf3hzd4KQkpmUlIuEgHdzdoKQkpmUlIuEf3hzd4KQkpmUlIuEf3hzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuEfnhzd4KQkpmUlIuF',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    if (toast.sound !== false) {
      playSound(toast.type === 'error' ? 'error' : toast.type === 'success' ? 'success' : 'notification');
    }

    const duration = toast.duration ?? TOAST_DURATION_MS;
    if (duration > 0) {
      const timeout = setTimeout(() => {
        timeoutsRef.current.delete(id);
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
      timeoutsRef.current.set(id, timeout);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const playSound = useCallback((type: 'success' | 'error' | 'notification') => {
    try {
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {
      // Sound failed, ignore
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll, success, error, warning, info, playSound }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}