"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toastsState: ToastItem[] = [];
const listeners = new Set<ToastListener>();
const activeTimers = new Map<string, NodeJS.Timeout>();

function notify() {
  const current = [...toastsState];
  listeners.forEach((listener) => listener(current));
}

export function dismissToast(id: string) {
  const timer = activeTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(id);
  }
  toastsState = toastsState.filter((t) => t.id !== id);
  notify();
}

export function toast(
  message: string,
  options?: { type?: ToastType; title?: string; duration?: number }
) {
  const id = Math.random().toString(36).substring(2, 9);
  const type = options?.type ?? "info";
  // Default timeout: 3200ms (3.2 seconds) so toasts do not linger
  const duration = options?.duration ?? 3200;

  const item: ToastItem = {
    id,
    type,
    title: options?.title,
    message,
    duration,
  };

  // Limit stack to latest 3 toasts
  toastsState = [item, ...toastsState.slice(0, 2)];
  notify();

  if (duration > 0) {
    const timer = setTimeout(() => {
      dismissToast(id);
    }, duration);
    activeTimers.set(id, timer);
  }

  return id;
}

toast.success = (message: string, title?: string, duration?: number) => {
  return toast(message, { type: "success", title, duration: duration ?? 3000 });
};

toast.error = (message: string, title?: string, duration?: number) => {
  return toast(message, { type: "error", title, duration: duration ?? 4000 });
};

toast.info = (message: string, title?: string, duration?: number) => {
  return toast(message, { type: "info", title, duration: duration ?? 3000 });
};

export function ToastProvider() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    listeners.add(setToasts);
    setToasts(toastsState);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-[92vw] sm:max-w-sm pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-lg border border-slate-200/90 bg-white/98 px-3.5 py-2.5 text-slate-800 shadow-lg backdrop-blur-xs transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="shrink-0 mt-0.5">
            {t.type === "success" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            )}
            {t.type === "error" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="h-4 w-4" />
              </span>
            )}
            {t.type === "info" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-[#EA580C]">
                <Info className="h-4 w-4" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            {t.title && (
              <h4 className="text-xs font-semibold text-slate-900 tracking-tight leading-snug">
                {t.title}
              </h4>
            )}
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {t.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-sm"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </aside>
  );
}
