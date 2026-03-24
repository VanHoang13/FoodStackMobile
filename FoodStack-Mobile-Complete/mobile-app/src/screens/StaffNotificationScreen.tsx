import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useNotifications, Notification } from '../contexts/NotificationContext';

type StaffNotificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffNotification'>;

interface Props {
  navigation: StaffNotificationScreenNavigationProp;
}

const NOTIFICATION_TYPES = {
  ORDER: { icon: 'shopping-bag', color: '#3498DB', label: 'Đơn hàng' },
  SERVICE_REQUEST: { icon: 'bell', color: '#E67E22', label: 'Yêu cầu dịch vụ' },
  SYSTEM: { icon: 'info', color: '#9B59B6', label: 'Hệ thống' },
  CHAT: { icon: 'message-circle', color: '#2ECC71', label: 'Tin nhắn' },
};

const PRIORITY_COLORS = {
  LOW: '#95A5A6',
  NORMAL: '#3498DB',
  HIGH: '#E67E22',
  URGENT: '#E74C3C',
};

const StaffNotificationScreen: React.FC<Props> = ({ navigation }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'ORDER':
        navigation.navigate('KitchenDisplay');
        break;
      case 'SERVICE_REQUEST':
        navigation.navigate('ServiceRequests');
        break;
      case 'CHAT':
        navigation.navigate('StaffChat');
        break;
      default:
        // Show notification details
        Alert.alert(notification.title, notification.message);
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Đánh dấu tất cả đã đọc',
      'Bạn có chắc chắn muốn đánh dấu tất cả thông báo là đã đọc?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: markAllAsRead }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Xóa tất cả thông báo',
      'Bạn có chắc chắn muốn xóa tất cả thông báo?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: clearNotifications }
      ]
    );
  };

  const getFilteredNotifications = () => {
    if (selectedFilter === 'ALL') {
      return notifications;
    }
    if (selectedFilter === 'UNREAD') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications.filter(n => n.type === selectedFilter);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <Icon name="check-circle" size={20} color="#27AE60" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClearAll}
          >
            <Icon name="trash-2" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'ALL', label: 'Tất cả', count: notifications.length },
            { key: 'UNREAD', label: 'Chưa đọc', count: unreadCount },
            { key: 'ORDER', label: 'Đơn hàng', count: notifications.filter(n => n.type === 'ORDER').length },
            { key: 'SERVICE_REQUEST', label: 'Dịch vụ', count: notifications.filter(n => n.type === 'SERVICE_REQUEST').length },
            { key: 'CHAT', label: 'Tin nhắn', count: notifications.filter(n => n.type === 'CHAT').length },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive,
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Không có thông báo</Text>
            <Text style={styles.emptyMessage}>
              {selectedFilter === 'UNREAD' 
                ? 'Tất cả thông báo đã được đọc'
                : 'Chưa có thông báo nào'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.unreadNotification,
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationLeft}>
                    <View style={[
                      styles.typeIcon,
                      { backgroundColor: NOTIFICATION_TYPES[notification.type].color }
                    ]}>
                      <Icon 
                        name={NOTIFICATION_TYPES[notification.type].icon} 
                        size={16} 
                        color="#fff" 
                      />
                    </View>
                    
                    <View style={styles.notificationInfo}>
                      <Text style={[
                        styles.notificationTitle,
                        !notification.isRead && styles.unreadTitle,
                      ]}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTime(notification.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.notificationRight}>
                    <View style={[
                      styles.priorityIndicator,
                      { backgroundColor: PRIORITY_COLORS[notification.priority] }
                    ]} />
                    
                    {!notification.isRead && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                </View>

                <Text style={[
                  styles.notificationMessage,
                  !notification.isRead && styles.unreadMessage,
                ]}>
                  {notification.message}
                </Text>

                <View style={styles.notificationFooter}>
                  <Text style={styles.typeLabel}>
                    {NOTIFICATION_TYPES[notification.type].label}
                  </Text>
                  
                  <Text style={styles.priorityLabel}>
                    {notification.priority}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffDashboard')}
        >
          <Icon name="home" size={22} color="#aaa" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('KitchenDisplay')}
        >
          <Icon name="chef-hat" size={22} color="#aaa" />
          <Text style={styles.navText}>Bếp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffTableManagement')}
        >
          <Icon name="grid" size={22} color="#aaa" />
          <Text style={styles.navText}>Bàn</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ServiceRequests')}
        >
          <Icon name="bell" size={22} color="#aaa" />
          <Text style={styles.navText}>Yêu cầu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('StaffProfile')}
        >
          <Icon name="user" size={22} color="#aaa" />
          <Text style={styles.navText}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  unreadBadge: {
    backgroundColor: '#E74C3C',
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
  
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  
  filterButtonActive: {
    backgroundColor: '#E8622A',
  },
  
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  filterButtonTextActive: {
    color: '#fff',
  },
  
  content: {
    flex: 1,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  notificationsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
    ...theme.shadows.sm,
  },
  
  unreadNotification: {
    borderLeftColor: '#E8622A',
    backgroundColor: '#FFF9F5',
  },
  
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  notificationInfo: {
    flex: 1,
  },
  
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  unreadTitle: {
    fontWeight: '900',
  },
  
  notificationTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  notificationRight: {
    alignItems: 'center',
    gap: 8,
  },
  
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8622A',
  },
  
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  unreadMessage: {
    color: '#333',
    fontWeight: '600',
  },
  
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  priorityLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
  },
  
  bottomNav: {
    height: 68,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  
  navText: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '700',
  },
});

export default StaffNotificationScreen;