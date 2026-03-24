import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type OwnerNotificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerNotification'>;

interface Props {
  navigation: OwnerNotificationScreenNavigationProp;
}

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'staff' | 'system' | 'inventory';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

const OwnerNotificationScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'order' | 'staff'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Mock data - replace with API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'order',
          title: 'Đơn hàng mới #402',
          message: 'Khách hàng Nguyễn Văn A vừa đặt đơn hàng tại bàn B05',
          time: '2 phút trước',
          isRead: false,
          priority: 'high',
          data: { orderId: '402', tableNumber: 'B05' }
        },
        {
          id: '2',
          type: 'payment',
          title: 'Thanh toán thành công',
          message: 'Đơn hàng #398 đã được thanh toán - 125.000đ',
          time: '5 phút trước',
          isRead: false,
          priority: 'medium',
          data: { orderId: '398', amount: 125000 }
        },
        {
          id: '3',
          type: 'staff',
          title: 'Nhân viên xin nghỉ',
          message: 'Trần Thị B xin nghỉ ca chiều hôm nay',
          time: '15 phút trước',
          isRead: true,
          priority: 'medium',
          data: { staffId: 'staff_2', shift: 'afternoon' }
        },
        {
          id: '4',
          type: 'inventory',
          title: 'Cảnh báo tồn kho',
          message: 'Thịt bò sắp hết (còn 2kg), cần nhập thêm',
          time: '30 phút trước',
          isRead: false,
          priority: 'high',
          data: { item: 'beef', quantity: 2 }
        },
        {
          id: '5',
          type: 'system',
          title: 'Cập nhật hệ thống',
          message: 'Hệ thống đã được cập nhật phiên bản mới',
          time: '1 giờ trước',
          isRead: true,
          priority: 'low',
          data: { version: '2.1.0' }
        },
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

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getFilteredNotifications = () => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'order':
        return notifications.filter(n => n.type === 'order' || n.type === 'payment');
      case 'staff':
        return notifications.filter(n => n.type === 'staff');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return 'shopping-bag';
      case 'payment':
        return 'dollar-sign';
      case 'staff':
        return 'users';
      case 'inventory':
        return 'package';
      case 'system':
        return 'settings';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return '#F44336';
    
    switch (type) {
      case 'order':
        return '#FF7A30';
      case 'payment':
        return '#4CAF50';
      case 'staff':
        return '#2196F3';
      case 'inventory':
        return '#FF9800';
      case 'system':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
        >
          <Icon name="check-circle" size={20} color="#FF7A30" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Tất cả', count: notifications.length },
            { key: 'unread', label: 'Chưa đọc', count: unreadCount },
            { key: 'order', label: 'Đơn hàng', count: notifications.filter(n => n.type === 'order' || n.type === 'payment').length },
            { key: 'staff', label: 'Nhân viên', count: notifications.filter(n => n.type === 'staff').length },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.activeFilterTabText,
                ]}
              >
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{filter.count}</Text>
                </View>
              )}
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
        <Animated.View style={[styles.notificationsContainer, { opacity: fadeAnim }]}>
          {getFilteredNotifications().map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadNotificationCard,
              ]}
              onPress={() => handleMarkAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationContent}>
                <View
                  style={[
                    styles.notificationIcon,
                    {
                      backgroundColor: getNotificationColor(notification.type, notification.priority) + '20',
                    },
                  ]}
                >
                  <Icon
                    name={getNotificationIcon(notification.type)}
                    size={20}
                    color={getNotificationColor(notification.type, notification.priority)}
                  />
                </View>

                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>
                      {formatTime(notification.time)}
                    </Text>
                  </View>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  {notification.priority === 'high' && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityBadgeText}>Ưu tiên cao</Text>
                    </View>
                  )}
                </View>

                {!notification.isRead && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          ))}

          {getFilteredNotifications().length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="bell-off" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>Không có thông báo</Text>
              <Text style={styles.emptyStateText}>
                Chưa có thông báo nào trong danh mục này
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  unreadBadge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },

  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  markAllButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filter Styles
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },

  activeFilterTab: {
    backgroundColor: '#FF7A30',
  },

  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activeFilterTabText: {
    color: '#fff',
  },

  filterBadge: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
    minWidth: 16,
    alignItems: 'center',
  },

  filterBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  notificationsContainer: {
    padding: 20,
  },

  // Notification Card Styles
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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

  unreadNotificationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A30',
  },

  notificationContent: {
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

  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },

  notificationTime: {
    fontSize: 12,
    color: '#666',
  },

  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },

  priorityBadge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },

  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7A30',
    marginLeft: 8,
    marginTop: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default OwnerNotificationScreen;