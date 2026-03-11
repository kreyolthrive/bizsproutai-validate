"use client";

import type { SprintTask } from "@/src/sprint/types";
import { emitMobileNotification } from "@/src/mobile/notificationCenter";

const STARTED_AT_KEY = "bizspr.sprint.startedAt.v1";
const OVERDUE_SENT_KEY = "bizspr.mobile.overdue.sent.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureSprintStartedAt(): string {
  if (typeof window === "undefined") return new Date().toISOString();
  const existing = localStorage.getItem(STARTED_AT_KEY);
  if (existing) return existing;
  const now = new Date().toISOString();
  localStorage.setItem(STARTED_AT_KEY, now);
  return now;
}

function dueDateForTask(startedAt: string, index: number): Date {
  const base = new Date(startedAt);
  const due = new Date(base);
  due.setDate(base.getDate() + index);
  due.setHours(23, 59, 59, 999);
  return due;
}

export function detectOverdueTaskIds(taskList: SprintTask[], completedIds: string[]): string[] {
  const startedAt = ensureSprintStartedAt();
  const now = new Date();

  return taskList
    .filter((task, index) => {
      if (completedIds.includes(task.taskId)) return false;
      const due = dueDateForTask(startedAt, index);
      return now > due;
    })
    .map((task) => task.taskId);
}

export function emitOverdueTaskNotifications(taskList: SprintTask[], completedIds: string[]) {
  const overdueIds = detectOverdueTaskIds(taskList, completedIds);
  if (!overdueIds.length) return overdueIds;

  const sentMap = readJson<Record<string, string>>(OVERDUE_SENT_KEY, {});
  const today = new Date().toISOString().slice(0, 10);

  overdueIds.forEach((taskId) => {
    if (sentMap[taskId] === today) return;
    const task = taskList.find((item) => item.taskId === taskId);
    if (!task) return;

    emitMobileNotification({
      type: "task_overdue",
      title: "Task overdue",
      body: task.title,
      href: "/mobile?tab=tasks",
    });

    sentMap[taskId] = today;
  });

  writeJson(OVERDUE_SENT_KEY, sentMap);
  return overdueIds;
}
