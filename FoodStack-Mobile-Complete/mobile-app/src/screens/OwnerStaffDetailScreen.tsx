import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type OwnerStaffDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerStaffDetail'>;
type OwnerStaffDetailScreenRouteProp = RouteProp<RootStackParamList, 'OwnerStaffDetail'>;

interface Props {
  navigation: OwnerStaffDetailScreenNavigationProp;
  route: OwnerStaffDetailScreenRouteProp;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CHEF' | 'WAITER' | 'CASHIER' | 'MANAGER';
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  shift: 'morning' | 'afternoon' | 'evening' | 'full_time';
  performance: number;
  avatar?: string;
  isOnline: boolean;
  address?: string;
  birthDate?: string;
  emergencyContact?: string;
  salary?: number;
  workingDays?: string[];
}

interface PerformanceMetric {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

interface WorkHistory {
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: 'present' | 'late' | 'absent';
}

const { width } = Dimensions.get('window');

const OwnerStaffDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { staff: initialStaff, updated } = route.params;
  const [staff, setStaff] = useState(initialStaff);
  const [selectedTab, setSelectedTab] = useState<'info' | 'performance' | 'schedule'>('info');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Update staff data when coming back from edit screen
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.staff && route.params?.updated) {
        setStaff(route.params.staff);
      }
    }, [route.params?.staff, route.params?.updated])
  );

  const handleEditStaff = () => {
    navigation.navigate('OwnerStaffEdit', { staff });
  };

  const handleToggleStatus = () => {
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    Alert.alert(
      'Cập nhật trạng thái',
      `Bạn có muốn ${newStatus === 'active' ? 'kích hoạt' : 'tạm ngưng'} nhân viên ${staff.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: () => {
            // Update staff status logic here
            Alert.alert('Thành công', 'Đã cập nhật trạng thái nhân viên');
          }
        },
      ]
    );
  };
  const getRoleText = (role: Staff['role']) => {
    switch (role) {
      case 'CHEF': return 'Bếp trưởng';
      case 'WAITER': return 'Phục vụ';
      case 'CASHIER': return 'Thu ngân';
      case 'MANAGER': return 'Quản lý';
      default: return role;
    }
  };

  const getStatusText = (status: Staff['status']) => {
    switch (status) {
      case 'active': return 'Đang làm việc';
      case 'inactive': return 'Tạm nghỉ';
      case 'on_leave': return 'Nghỉ phép';
      default: return status;
    }
  };

  const getStatusColor = (status: Staff['status']) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#9E9E9E';
      case 'on_leave': return '#FF9800';
      default: return '#666';
    }
  };

  const getRoleColor = (role: Staff['role']) => {
    switch (role) {
      case 'CHEF': return '#FF5722';
      case 'WAITER': return '#2196F3';
      case 'CASHIER': return '#4CAF50';
      case 'MANAGER': return '#9C27B0';
      default: return '#666';
    }
  };

  const getShiftText = (shift: Staff['shift']) => {
    switch (shift) {
      case 'morning': return 'Ca sáng (6:00 - 14:00)';
      case 'afternoon': return 'Ca chiều (14:00 - 22:00)';
      case 'evening': return 'Ca tối (18:00 - 02:00)';
      case 'full_time': return 'Toàn thời gian';
      default: return shift;
    }
  };

  // Mock performance data
  const performanceMetrics: PerformanceMetric[] = [
    { label: 'Chất lượng phục vụ', value: 92, maxValue: 100, color: '#4CAF50' },
    { label: 'Tốc độ làm việc', value: 88, maxValue: 100, color: '#2196F3' },
    { label: 'Tinh thần đồng đội', value: 95, maxValue: 100, color: '#FF9800' },
    { label: 'Chuyên môn', value: 85, maxValue: 100, color: '#9C27B0' },
    { label: 'Chấp hành nội quy', value: 98, maxValue: 100, color: '#F44336' },
  ];

  // Mock work history
  const workHistory: WorkHistory[] = [
    { date: '2024-01-15', checkIn: '08:00', checkOut: '16:00', hoursWorked: 8, status: 'present' },
    { date: '2024-01-14', checkIn: '08:15', checkOut: '16:00', hoursWorked: 7.75, status: 'late' },
    { date: '2024-01-13', checkIn: '08:00', checkOut: '16:00', hoursWorked: 8, status: 'present' },
    { date: '2024-01-12', checkIn: '-', checkOut: '-', hoursWorked: 0, status: 'absent' },
    { date: '2024-01-11', checkIn: '08:00', checkOut: '16:00', hoursWorked: 8, status: 'present' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getWorkStatusColor = (status: WorkHistory['status']) => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'late': return '#FF9800';
      case 'absent': return '#F44336';
      default: return '#666';
    }
  };

  const getWorkStatusText = (status: WorkHistory['status']) => {
    switch (status) {
      case 'present': return 'Có mặt';
      case 'late': return 'Đi muộn';
      case 'absent': return 'Vắng mặt';
      default: return status;
    }
  };
  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Icon name="mail" size={16} color="#666" />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{staff.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="phone" size={16} color="#666" />
            <Text style={styles.infoLabel}>Điện thoại</Text>
            <Text style={styles.infoValue}>{staff.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="map-pin" size={16} color="#666" />
            <Text style={styles.infoLabel}>Địa chỉ</Text>
            <Text style={styles.infoValue}>{staff.address || '123 Đường ABC, Quận 1, TP.HCM'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.infoLabel}>Ngày sinh</Text>
            <Text style={styles.infoValue}>{staff.birthDate ? formatDate(staff.birthDate) : '15/03/1990'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="phone-call" size={16} color="#666" />
            <Text style={styles.infoLabel}>Liên hệ khẩn cấp</Text>
            <Text style={styles.infoValue}>{staff.emergencyContact || '0987654321'}</Text>
          </View>
        </View>
      </View>

      {/* Work Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin công việc</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Icon name="briefcase" size={16} color="#666" />
            <Text style={styles.infoLabel}>Chức vụ</Text>
            <View style={styles.roleContainer}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(staff.role) + '20' }]}>
                <Text style={[styles.roleBadgeText, { color: getRoleColor(staff.role) }]}>
                  {getRoleText(staff.role)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Icon name="clock" size={16} color="#666" />
            <Text style={styles.infoLabel}>Ca làm việc</Text>
            <Text style={styles.infoValue}>{getShiftText(staff.shift)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="calendar-plus" size={16} color="#666" />
            <Text style={styles.infoLabel}>Ngày vào làm</Text>
            <Text style={styles.infoValue}>{formatDate(staff.joinDate)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="dollar-sign" size={16} color="#666" />
            <Text style={styles.infoLabel}>Lương cơ bản</Text>
            <Text style={styles.infoValue}>{formatCurrency(staff.salary || 8000000)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="activity" size={16} color="#666" />
            <Text style={styles.infoLabel}>Trạng thái</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(staff.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(staff.status) }]}>
                  {getStatusText(staff.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Working Days */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ngày làm việc</Text>
        <View style={styles.workingDaysContainer}>
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => {
            const isWorkingDay = staff.workingDays?.includes(day) ?? [0, 1, 2, 3, 4].includes(index);
            return (
              <View
                key={day}
                style={[
                  styles.dayBadge,
                  isWorkingDay ? styles.workingDay : styles.nonWorkingDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isWorkingDay ? styles.workingDayText : styles.nonWorkingDayText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
  const renderPerformanceTab = () => (
    <View style={styles.tabContent}>
      {/* Overall Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hiệu suất tổng thể</Text>
        <View style={styles.overallPerformance}>
          <View style={styles.performanceCircle}>
            <Text style={styles.performanceNumber}>{staff.performance}%</Text>
            <Text style={styles.performanceLabel}>Điểm tổng</Text>
          </View>
          <View style={styles.performanceInfo}>
            <Text style={styles.performanceDescription}>
              Nhân viên có hiệu suất làm việc tốt, đáp ứng yêu cầu công việc và có tinh thần tr책nhiệm cao.
            </Text>
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chi tiết đánh giá</Text>
        <View style={styles.metricsContainer}>
          {performanceMetrics.map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}/{metric.maxValue}</Text>
              </View>
              <View style={styles.metricBar}>
                <View style={styles.metricBarBackground}>
                  <View
                    style={[
                      styles.metricBarFill,
                      {
                        width: `${(metric.value / metric.maxValue) * 100}%`,
                        backgroundColor: metric.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Performance History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử đánh giá</Text>
        <View style={styles.historyContainer}>
          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>Tháng 12/2023</Text>
            <Text style={styles.historyScore}>89%</Text>
            <Text style={styles.historyNote}>Tốt</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>Tháng 11/2023</Text>
            <Text style={styles.historyScore}>85%</Text>
            <Text style={styles.historyNote}>Khá</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>Tháng 10/2023</Text>
            <Text style={styles.historyScore}>91%</Text>
            <Text style={styles.historyNote}>Tốt</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      {/* Attendance Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tóm tắt chấm công</Text>
        <View style={styles.attendanceStats}>
          <View style={styles.attendanceStat}>
            <Text style={styles.attendanceNumber}>22</Text>
            <Text style={styles.attendanceLabel}>Ngày có mặt</Text>
          </View>
          <View style={styles.attendanceStat}>
            <Text style={styles.attendanceNumber}>2</Text>
            <Text style={styles.attendanceLabel}>Đi muộn</Text>
          </View>
          <View style={styles.attendanceStat}>
            <Text style={styles.attendanceNumber}>1</Text>
            <Text style={styles.attendanceLabel}>Vắng mặt</Text>
          </View>
          <View style={styles.attendanceStat}>
            <Text style={styles.attendanceNumber}>176</Text>
            <Text style={styles.attendanceLabel}>Giờ làm việc</Text>
          </View>
        </View>
      </View>

      {/* Work History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lịch sử chấm công</Text>
        <View style={styles.workHistoryContainer}>
          {workHistory.map((record, index) => (
            <View key={index} style={styles.workHistoryItem}>
              <View style={styles.workHistoryDate}>
                <Text style={styles.workHistoryDateText}>{formatDate(record.date)}</Text>
              </View>
              <View style={styles.workHistoryTime}>
                <Text style={styles.workHistoryTimeText}>
                  {record.checkIn} - {record.checkOut}
                </Text>
                <Text style={styles.workHistoryHours}>
                  {record.hoursWorked}h
                </Text>
              </View>
              <View style={styles.workHistoryStatus}>
                <View
                  style={[
                    styles.workStatusBadge,
                    { backgroundColor: getWorkStatusColor(record.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.workStatusText,
                      { color: getWorkStatusColor(record.status) },
                    ]}
                  >
                    {getWorkStatusText(record.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
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
        <Text style={styles.headerTitle}>Chi tiết nhân viên</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditStaff}
        >
          <Icon name="edit" size={20} color="#FF7A30" />
        </TouchableOpacity>
      </View>

      {/* Staff Profile Header */}
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={['#FF7A30', '#E8622A']}
          style={styles.profileGradient}
        >
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {staff.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              {staff.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.staffName}>{staff.name}</Text>
              <Text style={styles.staffRole}>{getRoleText(staff.role)}</Text>
              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatNumber}>{staff.performance}%</Text>
                  <Text style={styles.profileStatLabel}>Hiệu suất</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatNumber}>
                    {Math.floor((Date.now() - new Date(staff.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                  </Text>
                  <Text style={styles.profileStatLabel}>Tháng làm việc</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            staff.status === 'active' ? styles.deactivateButton : styles.activateButton,
          ]}
          onPress={handleToggleStatus}
        >
          <Icon
            name={staff.status === 'active' ? 'pause' : 'play'}
            size={16}
            color="#fff"
          />
          <Text style={styles.actionButtonText}>
            {staff.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton}>
          <Icon name="message-circle" size={16} color="#2196F3" />
          <Text style={styles.chatButtonText}>Nhắn tin</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'info', label: 'Thông tin', icon: 'user' },
          { key: 'performance', label: 'Hiệu suất', icon: 'trending-up' },
          { key: 'schedule', label: 'Chấm công', icon: 'calendar' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Icon
              name={tab.icon}
              size={16}
              color={selectedTab === tab.key ? '#FF7A30' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[{ opacity: fadeAnim }]}>
          {selectedTab === 'info' && renderInfoTab()}
          {selectedTab === 'performance' && renderPerformanceTab()}
          {selectedTab === 'schedule' && renderScheduleTab()}
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

  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Profile Header Styles
  profileHeader: {
    marginBottom: 16,
  },

  profileGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },

  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },

  profileInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },

  staffRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },

  profileStats: {
    flexDirection: 'row',
    gap: 24,
  },

  profileStat: {
    alignItems: 'center',
  },

  profileStatNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },

  profileStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },

  // Action Buttons Styles
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },

  activateButton: {
    backgroundColor: '#4CAF50',
  },

  deactivateButton: {
    backgroundColor: '#9E9E9E',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    gap: 8,
  },

  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF7A30',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activeTabText: {
    color: '#FF7A30',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  tabContent: {
    padding: 20,
  },

  section: {
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // Info Tab Styles
  infoGrid: {
    gap: 16,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoLabel: {
    fontSize: 14,
    color: '#666',
    minWidth: 100,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },

  roleContainer: {
    flex: 1,
  },

  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  statusContainer: {
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  workingDaysContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  dayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  workingDay: {
    backgroundColor: '#FF7A30',
  },

  nonWorkingDay: {
    backgroundColor: '#f0f0f0',
  },

  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },

  workingDayText: {
    color: '#fff',
  },

  nonWorkingDayText: {
    color: '#999',
  },
  // Performance Tab Styles
  overallPerformance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  performanceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7A30',
    justifyContent: 'center',
    alignItems: 'center',
  },

  performanceNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },

  performanceLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },

  performanceInfo: {
    flex: 1,
  },

  performanceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  metricsContainer: {
    gap: 16,
  },

  metricItem: {
    gap: 8,
  },

  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  metricValue: {
    fontSize: 12,
    color: '#666',
  },

  metricBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },

  metricBarBackground: {
    width: '100%',
    height: '100%',
  },

  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  historyContainer: {
    gap: 12,
  },

  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  historyDate: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  historyScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7A30',
    minWidth: 50,
    textAlign: 'center',
  },

  historyNote: {
    fontSize: 12,
    color: '#666',
    minWidth: 50,
    textAlign: 'right',
  },

  // Schedule Tab Styles
  attendanceStats: {
    flexDirection: 'row',
    gap: 12,
  },

  attendanceStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },

  attendanceNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginBottom: 4,
  },

  attendanceLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },

  workHistoryContainer: {
    gap: 8,
  },

  workHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  workHistoryDate: {
    flex: 1,
  },

  workHistoryDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  workHistoryTime: {
    flex: 1,
    alignItems: 'center',
  },

  workHistoryTimeText: {
    fontSize: 12,
    color: '#666',
  },

  workHistoryHours: {
    fontSize: 10,
    color: '#999',
  },

  workHistoryStatus: {
    flex: 1,
    alignItems: 'flex-end',
  },

  workStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  workStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default OwnerStaffDetailScreen;