import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

interface Props {
  navigation: NotificationScreenNavigationProp;
}

interface Notification {
  id: string;
  type: 'ORDER' | 'SERVICE_REQUEST' | 'PAYMENT' | 'RESERVATION' | 'SYSTEM';
  subType: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

const NotificationScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'ORDER',
          subType: 'NEW_ORDER',
          title: 'Đơn hàng mới',
          message: 'Đơn hàng #ORD001 từ bàn 5',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false,
          data: { orderId: 'ORD001', tableId: '5' }
        },
        {
          id: '2',
          type: 'SERVICE_REQUEST',
          subType: 'NEW_REQUEST',
          title: 'Yêu cầu phục vụ',
          message: 'Yêu cầu nước từ bàn 3',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          read: false,
          data: { tableId: '3', type: 'WATER' }
        },
        {
          id: '3',
          type: 'PAYMENT',
          subType: 'PAYMENT_SUCCESS',
          title: 'Thanh toán thành công',
          message: 'Thanh toán 250,000đ cho đơn #ORD002',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: true,
          data: { orderId: 'ORD002', amount: 250000 }
        },
        {
          id: '4',
          type: 'RESERVATION',
          subType: 'NEW_RESERVATION',
          title: 'Đặt bàn mới',
          message: 'Đặt bàn từ Nguyễn Văn A - 4 người',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          read: true,
          data: { customerName: 'Nguyễn Văn A', partySize: 4 }
        },
        {
          id: '5',
          type: 'SYSTEM',
          subType: 'SUBSCRIPTION_WARNING',
          title: 'Gói dịch vụ sắp hết hạn',
          message: 'Gói dịch vụ sẽ hết hạn trong 3 ngày',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          data: { daysLeft: 3 }
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Load notifications error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );

      // TODO: Call API to mark as read
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      // TODO: Call API to mark all as read
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'ORDER':
        navigation.navigate('OrderManagement');
        break;
      case 'SERVICE_REQUEST':
        navigation.navigate('ServiceRequests');
        break;
      case 'PAYMENT':
        navigation.navigate('PaymentConfirmation', { 
          orderId: notification.data?.orderId 
        });
        break;
      case 'RESERVATION':
        navigation.navigate('Reservation');
        break;
      case 'SYSTEM':
        if (notification.subType === 'SUBSCRIPTION_WARNING') {
          navigation.navigate('Subscription');
        }
        break;
    }
  };

  const getNotificationIcon = (type: string, subType: string) => {
    switch (type) {
      case 'ORDER':
        return 'shopping-bag';
      case 'SERVICE_REQUEST':
        return 'bell';
      case 'PAYMENT':
        return 'credit-card';
      case 'RESERVATION':
        return 'calendar';
      case 'SYSTEM':
        return 'settings';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string, subType: string) => {
    switch (type) {
      case 'ORDER':
        return theme.colors.primary;
      case 'SERVICE_REQUEST':
        return theme.colors.warning;
      case 'PAYMENT':
        return theme.colors.success;
      case 'RESERVATION':
        return theme.colors.info;
      case 'SYSTEM':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || (filter === 'unread' && !notif.read)
  );

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type, item.subType) }
        ]}>
          <Icon 
            name={getNotificationIcon(item.type, item.subType)} 
            size={20} 
            color={theme.colors.white} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.notificationTitle,
            !item.read && styles.unreadTitle
          ]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>
            {item.message}
          </Text>
          <Text style={styles.notificationTime}>
            {getTimeAgo(item.timestamp)}
          </Text>
        </View>
        
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'all' && styles.activeFilterTab
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterTabText,
            filter === 'all' && styles.activeFilterTabText
          ]}>
            Tất cả ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'unread' && styles.activeFilterTab
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[
            styles.filterTabText,
            filter === 'unread' && styles.activeFilterTabText
          ]}>
            Chưa đọc ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bell-off" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptyText}>
              {filter === 'unread' 
                ? 'Bạn đã đọc tất cả thông báo'
                : 'Chưa có thông báo nào'
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  markAllText: {
    fontSize: 14,
    color: theme.colors.white,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    ...theme.shadows.small,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationScreen;