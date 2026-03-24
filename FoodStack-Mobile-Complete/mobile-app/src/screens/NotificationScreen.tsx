import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notification'>;

interface Props {
  navigation: NotificationScreenNavigationProp;
}

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'system' | 'feedback';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionData?: any;
  priority: 'high' | 'medium' | 'low';
}

const NotificationScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'promotion'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'Đơn hàng #1234 đã sẵn sàng',
          message: 'Đơn hàng của bạn đã được chuẩn bị xong và sẵn sàng phục vụ',
          timestamp: '2024-03-23T10:30:00Z',
          read: false,
          priority: 'high',
          actionData: { orderId: '1234', action: 'view_order' }
        },
        {
          id: '2',
          type: 'promotion',
          title: 'Giảm giá 20% cho đơn hàng tiếp theo',
          message: 'Sử dụng mã SAVE20 để được giảm 20% cho đơn hàng tiếp theo. Có hiệu lực đến 31/03/2024',
          timestamp: '2024-03-23T09:15:00Z',
          read: false,
          priority: 'medium',
          actionData: { promoCode: 'SAVE20', action: 'use_promo' }
        },
        {
          id: '3',
          type: 'order',
          title: 'Đơn hàng #1233 đã hoàn thành',
          message: 'Cảm ơn bạn đã sử dụng dịch vụ. Hãy đánh giá trải nghiệm của bạn',
          timestamp: '2024-03-22T19:45:00Z',
          read: true,
          priority: 'low',
          actionData: { orderId: '1233', action: 'feedback' }
        },
        {
          id: '4',
          type: 'system',
          title: 'Cập nhật ứng dụng mới',
          message: 'Phiên bản 2.1.0 đã có sẵn với nhiều tính năng mới và cải thiện hiệu suất',
          timestamp: '2024-03-22T08:00:00Z',
          read: true,
          priority: 'low',
          actionData: { action: 'update_app' }
        },
        {
          id: '5',
          type: 'promotion',
          title: 'Tích điểm thành công',
          message: 'Bạn đã tích được 50 điểm từ đơn hàng #1233. Tổng điểm hiện tại: 350',
          timestamp: '2024-03-22T19:50:00Z',
          read: true,
          priority: 'low',
          actionData: { points: 50, action: 'view_loyalty' }
        },
        {
          id: '6',
          type: 'feedback',
          title: 'Phản hồi từ nhà hàng',
          message: 'Nhà hàng ABC đã phản hồi đánh giá của bạn về đơn hàng #1232',
          timestamp: '2024-03-21T16:20:00Z',
          read: false,
          priority: 'medium',
          actionData: { orderId: '1232', action: 'view_feedback' }
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'Xóa thông báo',
      'Bạn có chắc chắn muốn xóa thông báo này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setNotifications(prev =>
              prev.filter(notif => notif.id !== notificationId)
            );
          }
        }
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionData) {
      switch (notification.actionData.action) {
        case 'view_order':
          navigation.navigate('OrderTracking', { 
            orderId: notification.actionData.orderId 
          });
          break;
        case 'use_promo':
          // Navigate to menu or cart with promo code
          Alert.alert('Mã giảm giá', `Mã ${notification.actionData.promoCode} đã được sao chép`);
          break;
        case 'feedback':
          navigation.navigate('Feedback', { 
            orderId: notification.actionData.orderId 
          });
          break;
        case 'view_loyalty':
          navigation.navigate('Loyalty');
          break;
        case 'view_feedback':
          navigation.navigate('OrderHistory');
          break;
        case 'update_app':
          Alert.alert('Cập nhật ứng dụng', 'Chuyển đến App Store để cập nhật');
          break;
      }
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconMap = {
      order: 'shopping-bag',
      promotion: 'gift',
      system: 'settings',
      feedback: 'message-circle'
    };
    return iconMap[type as keyof typeof iconMap] || 'bell';
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return '#E74C3C';
    
    const colorMap = {
      order: '#3498DB',
      promotion: '#E67E22',
      system: '#95A5A6',
      feedback: '#9B59B6'
    };
    return colorMap[type as keyof typeof colorMap] || '#95A5A6';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: { label: 'Quan trọng', color: '#E74C3C' },
      medium: { label: 'Trung bình', color: '#F39C12' },
      low: { label: 'Thấp', color: '#95A5A6' }
    };
    return badges[priority as keyof typeof badges];
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'order': return notif.type === 'order';
      case 'promotion': return notif.type === 'promotion';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Thông báo</Text>
              {unreadCount > 0 && (
                <Text style={styles.headerSubtitle}>{unreadCount} chưa đọc</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Icon name="check-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Tất cả', count: notifications.length },
            { key: 'unread', label: 'Chưa đọc', count: unreadCount },
            { key: 'order', label: 'Đơn hàng', count: notifications.filter(n => n.type === 'order').length },
            { key: 'promotion', label: 'Khuyến mãi', count: notifications.filter(n => n.type === 'promotion').length },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                filter === tab.key && styles.filterTabActive,
              ]}
              onPress={() => setFilter(tab.key as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === tab.key && styles.filterTabTextActive,
                ]}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="bell-off" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptyMessage}>
              {filter === 'unread' 
                ? 'Bạn đã đọc hết tất cả thông báo'
                : 'Chưa có thông báo nào trong mục này'
              }
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
              onPress={() => handleNotificationPress(notification)}
              onLongPress={() => deleteNotification(notification.id)}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationColor(notification.type, notification.priority) }
                  ]}>
                    <Icon 
                      name={getNotificationIcon(notification.type, notification.priority)} 
                      size={20} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.notificationInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.notificationTitle} numberOfLines={1}>
                        {notification.title}
                      </Text>
                      {notification.priority === 'high' && (
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityBadge(notification.priority).color }]}>
                          <Text style={styles.priorityText}>
                            {getPriorityBadge(notification.priority).label}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </View>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header
  header: {
    marginBottom: 16,
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filter
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  filterTab: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  filterTabActive: {
    backgroundColor: '#FF7A30',
    borderColor: '#FF7A30',
  },

  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  filterTabTextActive: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Notification Card
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A30',
  },

  notificationContent: {
    padding: 16,
  },

  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  notificationInfo: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },

  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },

  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },

  notificationTime: {
    fontSize: 12,
    color: '#999',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7A30',
    marginLeft: 8,
    marginTop: 4,
  },
});

export default NotificationScreen;