"use client";

export type MobileNotificationType = "new_lead" | "task_overdue";

export type MobileNotificationItem = {
  id: string;
  type: MobileNotificationType;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  readAt?: string;
};

const STORAGE_KEY = "bizspr.mobile.notifications.v1";
export const MOBILE_NOTIFICATION_EVENT = "bizspr:mobile-notification";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function listMobileNotifications(): MobileNotificationItem[] {
  return safeRead<MobileNotificationItem[]>(STORAGE_KEY, []);
}

export function markMobileNotificationRead(id: string) {
  const next = listMobileNotifications().map((item) =>
    item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item,
  );
  safeWrite(STORAGE_KEY, next);
}

export function emitMobileNotification(input: Omit<MobileNotificationItem, "id" | "createdAt">) {
  if (typeof window === "undefined") return;

  const item: MobileNotificationItem = {
    ...input,
    id: uid("notif"),
    createdAt: new Date().toISOString(),
  };

  const existing = listMobileNotifications();
  const next = [item, ...existing].slice(0, 100);
  safeWrite(STORAGE_KEY, next);

  window.dispatchEvent(new CustomEvent(MOBILE_NOTIFICATION_EVENT, { detail: item }));

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      const notification = new Notification(item.title, {
        body: item.body,
        tag: `${item.type}-${item.href}`,
        data: { href: item.href },
      });
      notification.onclick = () => {
        window.focus();
        window.location.assign(item.href);
      };
    } catch {
      // no-op
    }
  }
}

export async function requestMobilePushPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}
