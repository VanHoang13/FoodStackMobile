import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type ManagerStaffManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagerStaffManagement'>;

interface Props {
  navigation: ManagerStaffManagementScreenNavigationProp;
}

interface Staff {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  role: 'CHEF' | 'WAITER' | 'CASHIER';
  shift: 'morning' | 'afternoon' | 'evening' | 'full_time';
  status: 'active' | 'inactive' | 'on_break';
  checkInTime?: string;
  performance: number;
  tasksCompleted: number;
  totalTasks: number;
}

const ManagerStaffManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive' | 'on_break'>('all');

  useEffect(() => {
    loadStaffData();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staffList, searchQuery, selectedFilter]);

  const loadStaffData = async () => {
    try {
      // Mock data for branch staff (Manager only sees staff in their branch)
      const mockStaff: Staff[] = [
        {
          id: '1',
          name: 'Nguyễn Văn A',
          avatar: '👨‍🍳',
          email: 'nguyenvana@branch1.com',
          phone: '0901234567',
          role: 'CHEF',
          shift: 'morning',
          status: 'active',
          checkInTime: '07:30',
          performance: 92,
          tasksCompleted: 8,
          totalTasks: 10,
        },
        {
          id: '2',
          name: 'Trần Thị B',
          avatar: '👩‍💼',
          email: 'tranthib@branch1.com',
          phone: '0902345678',
          role: 'WAITER',
          shift: 'full_time',
          status: 'active',
          checkInTime: '08:00',
          performance: 88,
          tasksCompleted: 12,
          totalTasks: 15,
        },
        {
          id: '3',
          name: 'Lê Văn C',
          avatar: '👨‍💼',
          email: 'levanc@branch1.com',
          phone: '0903456789',
          role: 'CASHIER',
          shift: 'afternoon',
          status: 'on_break',
          checkInTime: '13:00',
          performance: 85,
          tasksCompleted: 5,
          totalTasks: 8,
        },
        {
          id: '4',
          name: 'Phạm Thị D',
          avatar: '👩‍🍳',
          email: 'phamthid@branch1.com',
          phone: '0904567890',
          role: 'CHEF',
          shift: 'evening',
          status: 'inactive',
          performance: 78,
          tasksCompleted: 0,
          totalTasks: 6,
        },
        {
          id: '5',
          name: 'Hoàng Văn E',
          avatar: '👨‍💼',
          email: 'hoangvane@branch1.com',
          phone: '0905678901',
          role: 'WAITER',
          shift: 'morning',
          status: 'active',
          checkInTime: '07:45',
          performance: 95,
          tasksCompleted: 10,
          totalTasks: 12,
        },
      ];

      setStaffList(mockStaff);
    } catch (error) {
      console.error('Error loading staff data:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách nhân viên');
    }
  };

  const filterStaff = () => {
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

    setFilteredStaff(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStaffData();
    setRefreshing(false);
  };

  const handleStaffDetail = (staff: Staff) => {
    navigation.navigate('ManagerStaffDetail', { staff });
  };

  const handleAssignTask = (staff: Staff) => {
    Alert.alert(
      'Giao việc',
      `Giao việc cho ${staff.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Giao việc', onPress: () => {
          Alert.alert('Thành công', 'Đã giao việc cho nhân viên');
        }},
      ]
    );
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'CHEF': return 'Đầu bếp';
      case 'WAITER': return 'Phục vụ';
      case 'CASHIER': return 'Thu ngân';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CHEF': return '#E74C3C';
      case 'WAITER': return '#3498DB';
      case 'CASHIER': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#27AE60';
      case 'inactive': return '#95A5A6';
      case 'on_break': return '#F39C12';
      default: return '#95A5A6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang làm việc';
      case 'inactive': return 'Nghỉ việc';
      case 'on_break': return 'Đang nghỉ';
      default: return status;
    }
  };

  const getShiftText = (shift: string) => {
    switch (shift) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      case 'full_time': return 'Toàn thời gian';
      default: return shift;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#9B59B6', '#8E44AD']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quản lý Nhân viên</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhân viên..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Tất cả', count: staffList.length },
            { key: 'active', label: 'Đang làm', count: staffList.filter(s => s.status === 'active').length },
            { key: 'on_break', label: 'Nghỉ giải lao', count: staffList.filter(s => s.status === 'on_break').length },
            { key: 'inactive', label: 'Nghỉ việc', count: staffList.filter(s => s.status === 'inactive').length },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.key && styles.filterTabTextActive
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Staff List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredStaff.map((staff) => (
          <TouchableOpacity
            key={staff.id}
            style={styles.staffCard}
            onPress={() => handleStaffDetail(staff)}
            activeOpacity={0.7}
          >
            <View style={styles.staffHeader}>
              <View style={styles.staffInfo}>
                <Text style={styles.staffAvatar}>{staff.avatar}</Text>
                <View style={styles.staffDetails}>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffEmail}>{staff.email}</Text>
                  <View style={styles.staffMeta}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(staff.role) }]}>
                      <Text style={styles.roleBadgeText}>{getRoleText(staff.role)}</Text>
                    </View>
                    <Text style={styles.shiftText}>{getShiftText(staff.shift)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.staffActions}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(staff.status) }]}>
                  <Text style={styles.statusBadgeText}>{getStatusText(staff.status)}</Text>
                </View>
                {staff.checkInTime && (
                  <Text style={styles.checkInTime}>Check-in: {staff.checkInTime}</Text>
                )}
              </View>
            </View>

            {/* Performance Bar */}
            <View style={styles.performanceContainer}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceLabel}>Hiệu suất: {staff.performance}%</Text>
                <Text style={styles.tasksText}>
                  {staff.tasksCompleted}/{staff.totalTasks} công việc
                </Text>
              </View>
              <View style={styles.performanceBarBackground}>
                <View 
                  style={[
                    styles.performanceBar, 
                    { 
                      width: `${staff.performance}%`,
                      backgroundColor: staff.performance >= 90 ? '#27AE60' : 
                                     staff.performance >= 70 ? '#F39C12' : '#E74C3C'
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.taskButton]}
                onPress={() => handleAssignTask(staff)}
              >
                <Icon name="plus" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Giao việc</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.detailButton]}
                onPress={() => handleStaffDetail(staff)}
              >
                <Icon name="eye" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredStaff.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy nhân viên nào</Text>
          </View>
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

  // Header Styles
  header: {
    marginBottom: 16,
  },

  headerGradient: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  headerRight: {
    width: 40,
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },

  // Filter Styles
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  filterTabActive: {
    backgroundColor: '#9B59B6',
    borderColor: '#9B59B6',
  },

  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  filterTabTextActive: {
    color: '#fff',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  staffInfo: {
    flexDirection: 'row',
    flex: 1,
  },

  staffAvatar: {
    fontSize: 32,
    marginRight: 12,
  },

  staffDetails: {
    flex: 1,
  },

  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  staffEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  staffMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  shiftText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  staffActions: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  checkInTime: {
    fontSize: 12,
    color: '#666',
  },

  // Performance Styles
  performanceContainer: {
    marginBottom: 12,
  },

  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  performanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  tasksText: {
    fontSize: 12,
    color: '#666',
  },

  performanceBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },

  performanceBar: {
    height: '100%',
    borderRadius: 3,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },

  taskButton: {
    backgroundColor: '#27AE60',
  },

  detailButton: {
    backgroundColor: '#3498DB',
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ManagerStaffManagementScreen;