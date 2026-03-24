import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';
import { adminApi, AdminRestaurant } from '../services/adminApi';

type AdminRestaurantsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminRestaurants'>;

interface Props {
  navigation: AdminRestaurantsScreenNavigationProp;
}

const AdminRestaurantsScreen: React.FC<Props> = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<AdminRestaurant | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, [filter, search]);

  const loadRestaurants = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      
      const response = await adminApi.getRestaurants({
        page: pageNum,
        limit: 10,
        status: filter === 'all' ? undefined : filter,
        search: search || undefined
      });

      if (response.success && response.data) {
        const newRestaurants = response.data.data;
        
        if (append) {
          setRestaurants(prev => [...prev, ...newRestaurants]);
        } else {
          setRestaurants(newRestaurants);
        }
        
        setHasMore(pageNum < response.data.pagination.pages);
        setPage(pageNum);
      } else {
        console.error('Failed to load restaurants:', response.message);
        // Fallback to mock data
        if (!append) {
          setRestaurants([
            {
              id: '1',
              name: 'Nhà hàng ABC',
              email: 'abc@restaurant.com',
              status: 'APPROVED',
              branchCount: 2,
              userCount: 5,
              totalOrders: 245,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Quán Phở Hà Nội',
              email: 'pho@restaurant.com',
              status: 'PENDING',
              branchCount: 1,
              userCount: 3,
              totalOrders: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadRestaurants(1, false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadRestaurants(page + 1, true);
    }
  };

  const handleStatusChange = (restaurant: AdminRestaurant) => {
    setSelectedRestaurant(restaurant);
    setNewStatus(restaurant.status);
    setStatusReason('');
    setStatusModalVisible(true);
  };

  const updateRestaurantStatus = async () => {
    if (!selectedRestaurant || !newStatus) return;

    try {
      const response = await adminApi.updateRestaurantStatus(
        selectedRestaurant.id,
        newStatus,
        statusReason
      );

      if (response.success) {
        Alert.alert('Thành công', response.message);
        setStatusModalVisible(false);
        onRefresh(); // Reload data
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái nhà hàng');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#10B981';
      case 'PENDING': return '#F59E0B';
      case 'REJECTED': return '#EF4444';
      case 'SUSPENDED': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Đã duyệt';
      case 'PENDING': return 'Chờ duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'SUSPENDED': return 'Tạm ngưng';
      default: return status;
    }
  };

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
        <Text style={styles.headerTitle}>Quản lý nhà hàng</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm nhà hàng..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'APPROVED' && styles.filterChipActive]}
          onPress={() => setFilter('APPROVED')}
        >
          <Text style={[styles.filterText, filter === 'APPROVED' && styles.filterTextActive]}>
            Đã duyệt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'PENDING' && styles.filterChipActive]}
          onPress={() => setFilter('PENDING')}
        >
          <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
            Chờ duyệt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'SUSPENDED' && styles.filterChipActive]}
          onPress={() => setFilter('SUSPENDED')}
        >
          <Text style={[styles.filterText, filter === 'SUSPENDED' && styles.filterTextActive]}>
            Tạm ngưng
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Restaurant List */}
      {loading && restaurants.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Đang tải danh sách nhà hàng...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onMomentumScrollEnd={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isCloseToBottom) {
              loadMore();
            }
          }}
        >
          {restaurants.map((restaurant) => (
            <View key={restaurant.id} style={styles.restaurantCard}>
              <View style={styles.restaurantHeader}>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantEmail}>{restaurant.email}</Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(restaurant.status) }]}
                  onPress={() => handleStatusChange(restaurant)}
                >
                  <Text style={styles.statusText}>{getStatusText(restaurant.status)}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.restaurantStats}>
                <View style={styles.statItem}>
                  <Icon name="home" size={16} color="#666" />
                  <Text style={styles.statText}>{restaurant.branchCount} chi nhánh</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="user" size={16} color="#666" />
                  <Text style={styles.statText}>{restaurant.userCount} nhân viên</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="shopping-bag" size={16} color="#666" />
                  <Text style={styles.statText}>{restaurant.totalOrders} đơn hàng</Text>
                </View>
              </View>

              <View style={styles.restaurantActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleStatusChange(restaurant)}
                >
                  <Icon name="edit" size={16} color="#6366F1" />
                  <Text style={styles.actionButtonText}>Cập nhật trạng thái</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {loading && restaurants.length > 0 && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật trạng thái nhà hàng</Text>
            <Text style={styles.modalSubtitle}>{selectedRestaurant?.name}</Text>

            <View style={styles.statusOptions}>
              {['APPROVED', 'PENDING', 'REJECTED', 'SUSPENDED'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    newStatus === status && styles.statusOptionSelected
                  ]}
                  onPress={() => setNewStatus(status)}
                >
                  <Text style={[
                    styles.statusOptionText,
                    newStatus === status && styles.statusOptionTextSelected
                  ]}>
                    {getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reasonInput}
              placeholder="Lý do thay đổi (tùy chọn)"
              value={statusReason}
              onChangeText={setStatusReason}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setStatusModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={updateRestaurantStatus}
              >
                <Text style={styles.confirmButtonText}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },

  // Filters
  filterContainer: {
    marginBottom: 16,
  },

  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  filterChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },

  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  filterTextActive: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },

  // Restaurant Card
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    ...theme.shadows.sm,
  },

  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  restaurantInfo: {
    flex: 1,
  },

  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  restaurantEmail: {
    fontSize: 14,
    color: '#666',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },

  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  restaurantStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statText: {
    fontSize: 12,
    color: '#666',
  },

  restaurantActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },

  actionButtonText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },

  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },

  loadMoreText: {
    fontSize: 14,
    color: '#666',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  statusOptions: {
    marginBottom: 20,
  },

  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
  },

  statusOptionSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },

  statusOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },

  statusOptionTextSelected: {
    color: '#fff',
  },

  reasonInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },

  confirmButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AdminRestaurantsScreen;