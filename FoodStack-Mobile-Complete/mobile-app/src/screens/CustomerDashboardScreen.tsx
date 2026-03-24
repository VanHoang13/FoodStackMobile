import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../types';
import { publicApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import Icon from '../components/Icon';

type CustomerDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'CustomerDashboard'>;

interface Props {
  navigation: CustomerDashboardNavigationProp;
}

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  action: () => void;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  status: string;
  total: number;
  createdAt: string;
  items: number;
}

interface FavoriteRestaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisine: string;
  distance: string;
}

const { width } = Dimensions.get('window');

const CustomerDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user dashboard data
  const { data: dashboardData, refetch } = useQuery({
    queryKey: ['customerDashboard', user?.id],
    queryFn: () => publicApi.getCustomerDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const quickActions: QuickAction[] = [
    {
      id: 'scan_qr',
      title: 'Quét QR',
      subtitle: 'Đặt món tại bàn',
      icon: 'qr-code',
      color: '#E8622A',
      action: () => navigation.navigate('QRScan'),
    },
    {
      id: 'browse_restaurants',
      title: 'Nhà hàng',
      subtitle: 'Khám phá menu',
      icon: 'home',
      color: '#3498DB',
      action: () => navigation.navigate('RestaurantList'),
    },
    {
      id: 'reservations',
      title: 'Đặt bàn',
      subtitle: 'Đặt chỗ trước',
      icon: 'calendar',
      color: '#27AE60',
      action: () => navigation.navigate('Reservation'),
    },
    {
      id: 'offers',
      title: 'Ưu đãi',
      subtitle: 'Khuyến mãi hot',
      icon: 'tag',
      color: '#F39C12',
      action: () => navigation.navigate('Offers'),
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#F39C12';
      case 'CONFIRMED': return '#3498DB';
      case 'PREPARING': return '#E67E22';
      case 'READY': return '#27AE60';
      case 'COMPLETED': return '#16A085';
      default: return '#95A5A6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PREPARING': return 'Đang chuẩn bị';
      case 'READY': return 'Sẵn sàng';
      case 'COMPLETED': return 'Hoàn thành';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || '👤'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Xin chào!</Text>
                <Text style={styles.userName}>{user?.name || 'Khách hàng'}</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('Notification')}
              >
                <Icon name="bell" size={20} color="#fff" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Icon name="user" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Loyalty Points */}
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyInfo}>
              <Text style={styles.loyaltyTitle}>Điểm tích lũy</Text>
              <Text style={styles.loyaltyPoints}>1,250 điểm</Text>
            </View>
            <TouchableOpacity
              style={styles.loyaltyButton}
              onPress={() => navigation.navigate('Loyalty')}
            >
              <Text style={styles.loyaltyButtonText}>Xem thêm</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.action}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Icon name={action.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.recentOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {dashboardData?.recentOrders?.length > 0 ? (
            dashboardData.recentOrders.slice(0, 3).map((order: RecentOrder) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderTracking', {
                  orderId: order.id,
                  orderNumber: order.orderNumber
                })}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                <Text style={styles.orderDetails}>
                  {order.items} món • {formatPrice(order.total)}
                </Text>
                
                <Text style={styles.orderTime}>
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
              <Text style={styles.emptyMessage}>Hãy quét QR code để đặt món đầu tiên!</Text>
            </View>
          )}
        </View>

        {/* Favorite Restaurants */}
        <View style={styles.favoritesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhà hàng yêu thích</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RestaurantList')}>
              <Text style={styles.seeAllText}>Khám phá thêm</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesScroll}
          >
            {dashboardData?.favoriteRestaurants?.map((restaurant: FavoriteRestaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                style={styles.restaurantCard}
                onPress={() => navigation.navigate('RestaurantDetail', {
                  restaurantId: restaurant.id
                })}
              >
                <Image
                  source={{ uri: restaurant.image }}
                  style={styles.restaurantImage}
                  resizeMode="cover"
                />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                  <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>
                  <View style={styles.restaurantMeta}>
                    <View style={styles.rating}>
                      <Icon name="star" size={12} color="#F39C12" />
                      <Text style={styles.ratingText}>{restaurant.rating}</Text>
                    </View>
                    <Text style={styles.distance}>{restaurant.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Promotional Banner */}
        <View style={styles.promoContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.promoBanner}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Ưu đãi đặc biệt!</Text>
              <Text style={styles.promoSubtitle}>
                Giảm 20% cho đơn hàng đầu tiên
              </Text>
              <TouchableOpacity
                style={styles.promoButton}
                onPress={() => navigation.navigate('Offers')}
              >
                <Text style={styles.promoButtonText}>Xem ngay</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.promoEmoji}>🎉</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  userInfo: {
    flex: 1,
  },

  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  userName: {
    fontSize: 18,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  // Loyalty Card
  loyaltyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
  },

  loyaltyInfo: {
    flex: 1,
  },

  loyaltyTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },

  loyaltyPoints: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  loyaltyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  loyaltyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8622A',
  },

  // Quick Actions
  quickActionsContainer: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  quickActionCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...theme.shadows.sm,
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Recent Orders
  recentOrdersContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  seeAllText: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '600',
  },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  restaurantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },

  orderDetails: {
    fontSize: 14,
    color: '#E8622A',
    fontWeight: '600',
    marginBottom: 4,
  },

  orderTime: {
    fontSize: 12,
    color: '#999',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Favorites
  favoritesContainer: {
    paddingLeft: 16,
    marginBottom: 24,
  },

  favoritesScroll: {
    paddingRight: 16,
    gap: 12,
  },

  restaurantCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },

  restaurantImage: {
    width: '100%',
    height: 100,
  },

  restaurantInfo: {
    padding: 12,
  },

  restaurantCuisine: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },

  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  distance: {
    fontSize: 12,
    color: '#999',
  },

  // Promo Banner
  promoContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },

  promoBanner: {
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  promoContent: {
    flex: 1,
  },

  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },

  promoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },

  promoButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  promoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },

  promoEmoji: {
    fontSize: 32,
  },
});

export default CustomerDashboardScreen;