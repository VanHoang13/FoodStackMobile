import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';

export interface Notification {
  id: string;
  type: 'ORDER' | 'SERVICE_REQUEST' | 'SYSTEM' | 'CHAT';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Mock notifications - no WebSocket needed
    {
      id: '1',
      type: 'ORDER',
      title: 'Đơn hàng mới',
      message: 'Đơn hàng #ORD-001 từ bàn B05',
      data: { orderId: 'ORD-001', tableId: 'B05' },
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: 'HIGH',
    },
    {
      id: '2',
      type: 'SERVICE_REQUEST',
      title: 'Yêu cầu dịch vụ',
      message: 'Khách hàng bàn A03 cần thêm nước',
      data: { tableId: 'A03', requestType: 'WATER' },
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      priority: 'NORMAL',
    },
    {
      id: '3',
      type: 'SYSTEM',
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống sẽ bảo trì vào 2:00 AM',
      data: null,
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      priority: 'LOW',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show alert for high priority notifications
    if (notification.priority === 'HIGH' || notification.priority === 'URGENT') {
      Alert.alert(notification.title, notification.message);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};