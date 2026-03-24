import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import OwnerStaffApiService, { Staff, StaffStats } from '../services/ownerStaffApiService';

type OwnerStaffManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerStaffManagement'>;
type OwnerStaffManagementScreenRouteProp = RouteProp<RootStackParamList, 'OwnerStaffManagement'>;

interface Props {
  navigation: OwnerStaffManagementScreenNavigationProp;
  route: OwnerStaffManagementScreenRouteProp;
}

const OwnerStaffManagementScreen: React.FC<Props> = ({ navigation, route }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    onLeaveStaff: 0,
    averagePerformance: 0,
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadStaffData();
  }, []);

  // Auto-reload when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || selectedFilter !== 'all') {
        loadStaffData();
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedFilter]);

  // Listen for updates when returning from other screens
  useFocusEffect(
    React.useCallback(() => {
      // Check if there's updated staff data from route params
      if (route.params?.updatedStaff) {
        const updatedStaff = route.params.updatedStaff;
        setStaffList(prev => 
          prev.map(staff => 
            staff.id === updatedStaff.id ? updatedStaff : staff
          )
        );
        // Clear the param to avoid re-processing
        navigation.setParams({ updatedStaff: undefined });
      }
      
      // Check if there's new staff data from create screen
      if (route.params?.newStaff) {
        const newStaff = route.params.newStaff;
        setStaffList(prev => [newStaff, ...prev]);
        // Clear the param to avoid re-processing
        navigation.setParams({ newStaff: undefined });
      }
      
      // Reload data when screen comes into focus to ensure consistency
      loadStaffData();
    }, [route.params?.updatedStaff, route.params?.newStaff])
  );

  const loadStaffData = async () => {
    try {
      setLoading(true);
      
      // Load staff from API
      const staff = await OwnerStaffApiService.getStaff({
        limit: 100, // Get more staff for better overview
        search: searchQuery.trim() || undefined,
        status: selectedFilter !== 'all' ? selectedFilter : undefined
      });
      
      setStaffList(staff);
      
      // Load and update stats from API
      const staffStats = await OwnerStaffApiService.getStaffStats();
      setStats(staffStats);
    } catch (error) {
      console.error('Error loading staff data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu nhân viên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStaffData();
    setRefreshing(false);
  };

  const handleAddStaff = () => {
    navigation.navigate('OwnerStaffCreate');
  };

  const handleResetData = () => {
    Alert.alert(
      'Làm mới dữ liệu',
      'Bạn có muốn tải lại dữ liệu nhân viên từ server?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Làm mới',
          onPress: async () => {
            try {
              setLoading(true);
              await loadStaffData();
              Alert.alert('Thành công', 'Đã làm mới dữ liệu nhân viên');
            } catch (error) {
              console.error('Error refreshing data:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi làm mới dữ liệu');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditStaff = (staff: Staff) => {
    navigation.navigate('OwnerStaffEdit', { staff });
  };

  const handleToggleStatus = async (staffId: string, currentStatus: Staff['status']) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const updatedStaff = await OwnerStaffApiService.updateStaffStatus(staffId, newStatus);
      
      // Update local state
      setStaffList(prev =>
        prev.map(staff =>
          staff.id === staffId ? { ...staff, status: newStatus } : staff
        )
      );
      
      // Update stats
      const staffStats = await OwnerStaffApiService.getStaffStats();
      setStats(staffStats);
      
      Alert.alert('Thành công', `Đã cập nhật trạng thái nhân viên`);
    } catch (error) {
      console.error('Error toggling staff status:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = (staff: Staff) => {
    Alert.alert(
      'Xóa nhân viên',
      `Bạn có chắc chắn muốn xóa ${staff.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await OwnerStaffApiService.deleteStaff(staff.id);
              
              if (success) {
                setStaffList(prev => prev.filter(s => s.id !== staff.id));
                
                // Update stats
                const staffStats = await OwnerStaffApiService.getStaffStats();
                setStats(staffStats);
                
                Alert.alert('Thành công', 'Đã xóa nhân viên');
              } else {
                Alert.alert('Lỗi', 'Không thể xóa nhân viên');
              }
            } catch (error) {
              console.error('Error deleting staff:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa nhân viên');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getFilteredStaff = () => {
    let filtered = staffList;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(staff => staff.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(staff =>
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery)
      );
    }

    return filtered;
  };

  const getRoleText = (role: Staff['role']) => {
    switch (role) {
      case 'CHEF':
        return 'Bếp trưởng';
      case 'WAITER':
        return 'Phục vụ';
      case 'CASHIER':
        return 'Thu ngân';
      case 'MANAGER':
        return 'Quản lý';
      default:
        return role;
    }
  };

  const getStatusText = (status: Staff['status']) => {
    switch (status) {
      case 'active':
        return 'Đang làm việc';
      case 'inactive':
        return 'Tạm nghỉ';
      case 'on_leave':
        return 'Nghỉ phép';
      default:
        return status;
    }
  };

  const getStatusColor = (status: Staff['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#9E9E9E';
      case 'on_leave':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getRoleColor = (role: Staff['role']) => {
    switch (role) {
      case 'CHEF':
        return '#FF5722';
      case 'WAITER':
        return '#2196F3';
      case 'CASHIER':
        return '#4CAF50';
      case 'MANAGER':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const getShiftText = (shift: Staff['shift']) => {
    switch (shift) {
      case 'morning':
        return 'Ca sáng';
      case 'afternoon':
        return 'Ca chiều';
      case 'evening':
        return 'Ca tối';
      case 'full_time':
        return 'Toàn thời gian';
      default:
        return shift;
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
        <Text style={styles.headerTitle}>Quản lý Nhân viên</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.analyticsButton}
            onPress={() => navigation.navigate('OwnerStaffAnalytics')}
          >
            <Icon name="bar-chart-2" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetData}
          >
            <Icon name="refresh-cw" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddStaff}
          >
            <Icon name="plus" size={24} color="#FF7A30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsValue}>{stats.totalStaff}</Text>
          <Text style={styles.statsLabel}>Tổng NV</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={[styles.statsValue, { color: '#4CAF50' }]}>{stats.activeStaff}</Text>
          <Text style={styles.statsLabel}>Đang làm</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={[styles.statsValue, { color: '#FF9800' }]}>{stats.onLeaveStaff}</Text>
          <Text style={styles.statsLabel}>Nghỉ phép</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={[styles.statsValue, { color: '#2196F3' }]}>{stats.averagePerformance.toFixed(1)}%</Text>
          <Text style={styles.statsLabel}>Hiệu suất TB</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm nhân viên..."
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Tất cả', count: staffList.length },
          { key: 'active', label: 'Đang làm việc', count: staffList.filter(s => s.status === 'active').length },
          { key: 'inactive', label: 'Tạm nghỉ', count: staffList.filter(s => s.status === 'inactive').length },
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
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filter.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Staff List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={[styles.staffContainer, { opacity: fadeAnim }]}>
          {getFilteredStaff().map((staff) => (
            <View key={staff.id} style={styles.staffCard}>
              <View style={styles.staffHeader}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffAvatarText}>
                    {staff.name.charAt(0).toUpperCase()}
                  </Text>
                  {staff.isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.staffInfo}>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffEmail}>{staff.email}</Text>
                  <Text style={styles.staffPhone}>{staff.phone}</Text>
                </View>

                <View style={styles.staffActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditStaff(staff)}
                  >
                    <Icon name="edit" size={16} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteStaff(staff)}
                  >
                    <Icon name="trash-2" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.staffDetails}>
                <View style={styles.staffBadges}>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(staff.role) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleBadgeText,
                        { color: getRoleColor(staff.role) },
                      ]}
                    >
                      {getRoleText(staff.role)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(staff.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: getStatusColor(staff.status) },
                      ]}
                    >
                      {getStatusText(staff.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.staffMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Ca làm việc</Text>
                    <Text style={styles.metricValue}>{getShiftText(staff.shift)}</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Hiệu suất</Text>
                    <View style={styles.performanceContainer}>
                      <Text style={styles.performanceText}>{staff.performance}%</Text>
                      <View style={styles.performanceBar}>
                        <View
                          style={[
                            styles.performanceProgress,
                            { width: `${staff.performance}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Ngày vào làm</Text>
                    <Text style={styles.metricValue}>
                      {new Date(staff.joinDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>

                <View style={styles.staffFooter}>
                  <TouchableOpacity
                    style={[
                      styles.statusToggleButton,
                      staff.status === 'active' ? styles.deactivateButton : styles.activateButton,
                    ]}
                    onPress={() => handleToggleStatus(staff.id, staff.status)}
                  >
                    <Icon
                      name={staff.status === 'active' ? 'pause' : 'play'}
                      size={14}
                      color="#fff"
                    />
                    <Text style={styles.statusToggleText}>
                      {staff.status === 'active' ? 'Tạm nghỉ' : 'Kích hoạt'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.viewDetailsButton}
                    onPress={() => navigation.navigate('OwnerStaffDetail', { staff })}
                  >
                    <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
                    <Icon name="arrow-right" size={14} color="#FF7A30" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {getFilteredStaff().length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="users" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>Không có nhân viên</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim()
                  ? 'Không tìm thấy nhân viên phù hợp'
                  : 'Chưa có nhân viên nào trong danh mục này'}
              </Text>
              {!searchQuery.trim() && (
                <TouchableOpacity
                  style={styles.addFirstStaffButton}
                  onPress={handleAddStaff}
                >
                  <LinearGradient
                    colors={['#FF7A30', '#E8622A']}
                    style={styles.addFirstStaffGradient}
                  >
                    <Icon name="plus" size={20} color="#fff" />
                    <Text style={styles.addFirstStaffText}>Thêm nhân viên đầu tiên</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
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

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  resetButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  analyticsButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  statsCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  statsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF7A30',
    marginBottom: 2,
  },

  statsLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },

  // Search Styles
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },

  // Filter Styles
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },

  activeFilterTab: {
    backgroundColor: '#FF7A30',
  },

  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  activeFilterTabText: {
    color: '#fff',
  },

  filterBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 4,
    minWidth: 16,
    alignItems: 'center',
  },

  filterBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  staffContainer: {
    padding: 20,
  },

  // Staff Card Styles
  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  staffAvatar: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF7A30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  staffAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },

  staffInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },

  staffEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  staffPhone: {
    fontSize: 12,
    color: '#666',
  },

  staffActions: {
    flexDirection: 'row',
    gap: 8,
  },

  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Staff Details Styles
  staffDetails: {
    gap: 12,
  },

  staffBadges: {
    flexDirection: 'row',
    gap: 8,
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  staffMetrics: {
    gap: 8,
  },

  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: 12,
    color: '#666',
  },

  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  performanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    minWidth: 32,
  },

  performanceBar: {
    width: 60,
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },

  performanceProgress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },

  staffFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  statusToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },

  activateButton: {
    backgroundColor: '#4CAF50',
  },

  deactivateButton: {
    backgroundColor: '#9E9E9E',
  },

  statusToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },

  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7A30',
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
    marginBottom: 24,
  },

  addFirstStaffButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },

  addFirstStaffGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },

  addFirstStaffText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default OwnerStaffManagementScreen;