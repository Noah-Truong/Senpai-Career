import fs from "fs";
import path from "path";
import { Notification } from "@/types";
import { v4 as uuidv4 } from "uuid";

const NOTIFICATIONS_FILE = path.join(process.cwd(), "data", "notifications.json");

const ensureDataDir = () => {
  const dataDir = path.dirname(NOTIFICATIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(NOTIFICATIONS_FILE)) {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2));
  }
};

export interface NotificationData extends Omit<Notification, "createdAt"> {
  createdAt: string;
}

export const readNotifications = (): NotificationData[] => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(NOTIFICATIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveNotification = (notificationData: Omit<NotificationData, "id" | "createdAt" | "read">): NotificationData => {
  ensureDataDir();
  const notifications = readNotifications();

  const newNotification: NotificationData = {
    ...notificationData,
    id: uuidv4(),
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.push(newNotification);
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));

  return newNotification;
};

export const getNotificationsByUserId = (userId: string): NotificationData[] => {
  const notifications = readNotifications();
  return notifications.filter(n => n.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const getUnreadNotificationsCount = (userId: string): number => {
  const notifications = getNotificationsByUserId(userId);
  return notifications.filter(n => !n.read).length;
};

export const markNotificationAsRead = (notificationId: string): NotificationData | undefined => {
  ensureDataDir();
  const notifications = readNotifications();
  const index = notifications.findIndex(n => n.id === notificationId);

  if (index === -1) {
    return undefined;
  }

  notifications[index].read = true;
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
  return notifications[index];
};

export const markAllNotificationsAsRead = (userId: string): void => {
  ensureDataDir();
  const notifications = readNotifications();
  notifications.forEach(n => {
    if (n.userId === userId && !n.read) {
      n.read = true;
    }
  });
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
};

export const deleteNotification = (notificationId: string): boolean => {
  ensureDataDir();
  const notifications = readNotifications();
  const initialLength = notifications.length;
  const filtered = notifications.filter(n => n.id !== notificationId);
  
  if (filtered.length < initialLength) {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(filtered, null, 2));
    return true;
  }
  return false;
};

