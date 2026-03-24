import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type ManagerStaffDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagerStaffDetail'>;
type ManagerStaffDetailScreenRouteProp = RouteProp<RootStackParamList, 'ManagerStaffDetail'>;

interface Props {
  navigation: ManagerStaffDetailScreenNavigationProp;
  route: ManagerStaffDetailScreenRouteProp;
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

interface TaskHistory {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'overdue';
  assignedDate: string;
  completedDate?: string;
  priority: 'high' | 'medium' | 'low';
}

const ManagerStaffDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { staff } = route.params;
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'performance'>('info');
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);

  useEffect(() => {
    loadTaskHistory();
  }, []);

  const loadTaskHistory = async () => {
    // Mock task history data
    const mockTasks: TaskHistory[] = [
      {
        id: '1',
        title: 'Dọn dẹp khu vực bàn 1-5',
        description: 'Vệ sinh và sắp xếp lại bàn ghế khu vực phía trước',
        status: 'completed',
        assignedDate: '2024-03-22T08:00:00Z',
        completedDate: '2024-03-22T09:30:00Z',
        priority: 'medium',
      },
      {
        id: '2',
        title: 'Kiểm tra kho nguyên liệu',
        description: 'Kiểm tra số lượng và chất lượng nguyên liệu trong kho',
        status: 'pending',
        assignedDate: '2024-03-22T10:00:00Z',
        priority: 'high',
      },
      {
        id: '3',
        title: 'Hướng dẫn nhân viên mới',
        description: 'Hướng dẫn quy trình phục vụ cho nhân viên mới',
        status: 'completed',
        assignedDate: '2024-03-21T14:00:00Z',
        completedDate: '2024-03-21T16:00:00Z',
        priority: 'medium',
      },
    ];

    setTaskHistory(mockTasks);
  };

  const handleAssignTask = () => {
    Alert.alert(
      'Giao việc mới',
      'Chọn loại công việc muốn giao:',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Dọn dẹp', onPress: () => assignTask('Dọn dẹp khu vực') },
        { text: 'Kiểm tra', onPress: () => assignTask('Kiểm tra chất lượng') },
        { text: 'Hỗ trợ', onPress: () => assignTask('Hỗ trợ khách hàng') },
      ]
    );
  };

  const assignTask = (taskType: string) => {
    Alert.alert('Thành công', `Đã giao việc "${taskType}" cho ${staff.name}`);
  };

  const handleChangeShift = () => {
    Alert.alert(
      'Thay đổi ca làm',
      'Chọn ca làm mới:',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Ca sáng', onPress: () => changeShift('morning') },
        { text: 'Ca chiều', onPress: () => changeShift('afternoon') },
        { text: 'Ca tối', onPress: () => changeShift('evening') },
      ]
    );
  };

  const changeShift = (newShift: string) => {
    Alert.alert('Thành công', `Đã chuyển ${staff.name} sang ${getShiftText(newShift)}`);
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#27AE60';
      case 'pending': return '#F39C12';
      case 'overdue': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#95A5A6';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <Text style={styles.headerTitle}>Chi tiết Nhân viên</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
      </View>

      {/* Staff Profile */}
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <Text style={styles.staffAvatar}>{staff.avatar}</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.staffName}>{staff.name}</Text>
            <View style={styles.staffMeta}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(staff.role) }]}>
                <Text style={styles.roleBadgeText}>{getRoleText(staff.role)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(staff.status) }]}>
                <Text style={styles.statusBadgeText}>{getStatusText(staff.status)}</Text>
              </View>
            </View>
            <Text style={styles.shiftText}>{getShiftText(staff.shift)}</Text>
            {staff.checkInTime && (
              <Text style={styles.checkInText}>Check-in: {staff.checkInTime}</Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.taskButton]}
            onPress={handleAssignTask}
          >
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Giao việc</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.shiftButton]}
            onPress={handleChangeShift}
          >
            <Icon name="clock" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Đổi ca</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'info', label: 'Thông tin', icon: 'user' },
          { key: 'tasks', label: 'Công việc', icon: 'list' },
          { key: 'performance', label: 'Hiệu suất', icon: 'chart' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Icon 
              name={tab.icon} 
              size={18} 
              color={activeTab === tab.key ? '#9B59B6' : '#666'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && (
          <View style={styles.infoTab}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="mail" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{staff.email}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={styles.infoValue}>{staff.phone}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="briefcase" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Chức vụ</Text>
                  <Text style={styles.infoValue}>{getRoleText(staff.role)}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="clock" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ca làm việc</Text>
                  <Text style={styles.infoValue}>{getShiftText(staff.shift)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'tasks' && (
          <View style={styles.tasksTab}>
            <View style={styles.tasksSummary}>
              <Text style={styles.tasksSummaryText}>
                Hoàn thành: {staff.tasksCompleted}/{staff.totalTasks} công việc
              </Text>
            </View>
            
            {taskHistory.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskBadges}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.priorityText}>
                        {task.priority === 'high' ? 'Cao' : 
                         task.priority === 'medium' ? 'TB' : 'Thấp'}
                      </Text>
                    </View>
                    <View style={[styles.taskStatusBadge, { backgroundColor: getTaskStatusColor(task.status) }]}>
                      <Text style={styles.taskStatusText}>
                        {task.status === 'completed' ? 'Hoàn thành' :
                         task.status === 'pending' ? 'Đang làm' : 'Quá hạn'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.taskDescription}>{task.description}</Text>
                
                <View style={styles.taskFooter}>
                  <Text style={styles.taskDate}>
                    Giao: {formatDate(task.assignedDate)}
                  </Text>
                  {task.completedDate && (
                    <Text style={styles.taskDate}>
                      Hoàn thành: {formatDate(task.completedDate)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'performance' && (
          <View style={styles.performanceTab}>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceTitle}>Hiệu suất tổng thể</Text>
              <View style={styles.performanceCircle}>
                <Text style={styles.performanceNumber}>{staff.performance}%</Text>
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

            <View style={styles.performanceStats}>
              <View style={styles.performanceStatCard}>
                <Icon name="check-circle" size={24} color="#27AE60" />
                <Text style={styles.performanceStatNumber}>{staff.tasksCompleted}</Text>
                <Text style={styles.performanceStatLabel}>Công việc hoàn thành</Text>
              </View>
              
              <View style={styles.performanceStatCard}>
                <Icon name="clock" size={24} color="#F39C12" />
                <Text style={styles.performanceStatNumber}>{staff.totalTasks - staff.tasksCompleted}</Text>
                <Text style={styles.performanceStatLabel}>Công việc đang làm</Text>
              </View>
            </View>
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

  // Profile Styles
  profileContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
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

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  staffAvatar: {
    fontSize: 48,
    marginRight: 16,
  },

  profileInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },

  staffMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
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

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  shiftText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },

  checkInText: {
    fontSize: 12,
    color: '#666',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },

  taskButton: {
    backgroundColor: '#27AE60',
  },

  shiftButton: {
    backgroundColor: '#3498DB',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
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

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },

  activeTab: {
    backgroundColor: '#f8f9fa',
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  activeTabText: {
    color: '#9B59B6',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Info Tab
  infoTab: {},

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  infoContent: {
    flex: 1,
    marginLeft: 16,
  },

  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },

  // Tasks Tab
  tasksTab: {},

  tasksSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
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

  tasksSummaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  taskCard: {
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

  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },

  taskBadges: {
    gap: 4,
  },

  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  taskStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  taskStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },

  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  taskDate: {
    fontSize: 12,
    color: '#666',
  },

  // Performance Tab
  performanceTab: {},

  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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

  performanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  performanceCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  performanceNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
  },

  performanceBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },

  performanceBar: {
    height: '100%',
    borderRadius: 4,
  },

  performanceStats: {
    flexDirection: 'row',
    gap: 12,
  },

  performanceStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  performanceStatNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },

  performanceStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default ManagerStaffDetailScreen;