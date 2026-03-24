import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type StaffTasksScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffTasks'>;

interface Props {
  navigation: StaffTasksScreenNavigationProp;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'CLEANING' | 'INVENTORY' | 'CUSTOMER_SERVICE' | 'MAINTENANCE' | 'TRAINING';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedBy: string;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  estimatedTime: number; // in minutes
  actualTime?: number;
  location?: string;
  checklist?: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  checklist: string[];
}

const TASK_CATEGORIES = {
  CLEANING: { icon: 'trash-2', color: '#3498DB', label: 'Vệ sinh' },
  INVENTORY: { icon: 'package', color: '#27AE60', label: 'Kho hàng' },
  CUSTOMER_SERVICE: { icon: 'users', color: '#E67E22', label: 'Khách hàng' },
  MAINTENANCE: { icon: 'tool', color: '#9B59B6', label: 'Bảo trì' },
  TRAINING: { icon: 'book', color: '#E74C3C', label: 'Đào tạo' },
};

const PRIORITY_COLORS = {
  LOW: '#95A5A6',
  NORMAL: '#3498DB',
  HIGH: '#E67E22',
  URGENT: '#E74C3C',
};

const STATUS_COLORS = {
  PENDING: '#F39C12',
  IN_PROGRESS: '#3498DB',
  COMPLETED: '#27AE60',
  OVERDUE: '#E74C3C',
};

const StaffTasksScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock tasks data
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Vệ sinh khu vực bàn ăn',
          description: 'Lau chùi tất cả bàn ghế trong khu vực A',
          category: 'CLEANING',
          priority: 'HIGH',
          status: 'PENDING',
          assignedBy: 'Quản lý ca',
          assignedTo: user?.fullName || 'Nhân viên',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          estimatedTime: 30,
          location: 'Khu vực A',
          checklist: [
            { id: '1', text: 'Lau sạch mặt bàn', completed: false },
            { id: '2', text: 'Sắp xếp ghế ngồi', completed: false },
            { id: '3', text: 'Kiểm tra đồ dùng trên bàn', completed: false },
          ],
        },
        {
          id: '2',
          title: 'Kiểm tra tồn kho nguyên liệu',
          description: 'Kiểm tra và cập nhật số lượng nguyên liệu trong kho',
          category: 'INVENTORY',
          priority: 'NORMAL',
          status: 'IN_PROGRESS',
          assignedBy: 'Quản lý kho',
          assignedTo: user?.fullName || 'Nhân viên',
          dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          estimatedTime: 45,
          location: 'Kho nguyên liệu',
          checklist: [
            { id: '1', text: 'Kiểm tra thịt bò', completed: true },
            { id: '2', text: 'Kiểm tra rau củ', completed: true },
            { id: '3', text: 'Kiểm tra gia vị', completed: false },
            { id: '4', text: 'Cập nhật hệ thống', completed: false },
          ],
        },
        {
          id: '3',
          title: 'Hỗ trợ khách hàng VIP',
          description: 'Phục vụ đặc biệt cho khách hàng VIP tại bàn B01',
          category: 'CUSTOMER_SERVICE',
          priority: 'URGENT',
          status: 'COMPLETED',
          assignedBy: 'Quản lý ca',
          assignedTo: user?.fullName || 'Nhân viên',
          dueDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          estimatedTime: 20,
          actualTime: 18,
          location: 'Bàn B01',
        },
      ];
      
      setTasks(mockTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    if (selectedFilter === 'ALL') {
      return tasks;
    }
    return tasks.filter(task => task.status === selectedFilter);
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      // TODO: Replace with actual API call
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: newStatus as any,
              completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined
            }
          : task
      ));
      
      Alert.alert('Thành công', 'Đã cập nhật trạng thái công việc');
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleChecklistUpdate = (taskId: string, checklistItemId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? {
            ...task,
            checklist: task.checklist?.map(item =>
              item.id === checklistItemId
                ? { ...item, completed: !item.completed }
                : item
            )
          }
        : task
    ));
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));

    if (diffInMinutes < 0) {
      return 'Quá hạn';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút nữa`;
    }
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ nữa`;
    }
    return date.toLocaleDateString('vi-VN');
  };

  const getTaskProgress = (task: Task) => {
    if (!task.checklist || task.checklist.length === 0) {
      return task.status === 'COMPLETED' ? 100 : 0;
    }
    const completed = task.checklist.filter(item => item.completed).length;
    return (completed / task.checklist.length) * 100;
  };

  const filteredTasks = getFilteredTasks();

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
        
        <Text style={styles.headerTitle}>Công việc</Text>

        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="plus" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Tổng công việc</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.PENDING }]}>
              {tasks.filter(t => t.status === 'PENDING').length}
            </Text>
            <Text style={styles.statLabel}>Chờ xử lý</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.IN_PROGRESS }]}>
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </Text>
            <Text style={styles.statLabel}>Đang làm</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.COMPLETED }]}>
              {tasks.filter(t => t.status === 'COMPLETED').length}
            </Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'ALL', label: 'Tất cả', count: tasks.length },
            { key: 'PENDING', label: 'Chờ xử lý', count: tasks.filter(t => t.status === 'PENDING').length },
            { key: 'IN_PROGRESS', label: 'Đang làm', count: tasks.filter(t => t.status === 'IN_PROGRESS').length },
            { key: 'COMPLETED', label: 'Hoàn thành', count: tasks.filter(t => t.status === 'COMPLETED').length },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
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

      {/* Tasks List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải công việc...</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Không có công việc</Text>
            <Text style={styles.emptyMessage}>
              {selectedFilter === 'ALL' 
                ? 'Chưa có công việc nào được giao'
                : `Không có công việc ${selectedFilter.toLowerCase()}`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {filteredTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => {
                  setSelectedTask(task);
                  setShowTaskDetail(true);
                }}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskLeft}>
                    <View style={[
                      styles.categoryIcon,
                      { backgroundColor: TASK_CATEGORIES[task.category].color }
                    ]}>
                      <Icon 
                        name={TASK_CATEGORIES[task.category].icon} 
                        size={16} 
                        color="#fff" 
                      />
                    </View>
                    
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <Text style={styles.taskCategory}>
                        {TASK_CATEGORIES[task.category].label}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.taskRight}>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: PRIORITY_COLORS[task.priority] }
                    ]}>
                      <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.taskDescription}>{task.description}</Text>

                {task.location && (
                  <View style={styles.taskLocation}>
                    <Icon name="map-pin" size={14} color="#666" />
                    <Text style={styles.locationText}>{task.location}</Text>
                  </View>
                )}

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Tiến độ</Text>
                    <Text style={styles.progressPercent}>
                      {Math.round(getTaskProgress(task))}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { 
                        width: `${getTaskProgress(task)}%`,
                        backgroundColor: STATUS_COLORS[task.status]
                      }
                    ]} />
                  </View>
                </View>

                <View style={styles.taskFooter}>
                  <View style={styles.taskMeta}>
                    <Text style={styles.taskTime}>
                      ⏱️ {formatTime(task.estimatedTime)}
                    </Text>
                    <Text style={styles.taskDue}>
                      📅 {formatDueDate(task.dueDate)}
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[task.status] }
                  ]}>
                    <Text style={styles.statusText}>
                      {task.status === 'PENDING' ? 'Chờ xử lý' :
                       task.status === 'IN_PROGRESS' ? 'Đang làm' :
                       task.status === 'COMPLETED' ? 'Hoàn thành' : 'Quá hạn'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Task Detail Modal */}
      <Modal
        visible={showTaskDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedTask && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTaskDetail(false)}
              >
                <Icon name="x" size={24} color="#333" />
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>Chi tiết công việc</Text>
              
              <View style={styles.modalActions}>
                {selectedTask.status === 'PENDING' && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => {
                      handleTaskStatusUpdate(selectedTask.id, 'IN_PROGRESS');
                      setShowTaskDetail(false);
                    }}
                  >
                    <Text style={styles.startButtonText}>Bắt đầu</Text>
                  </TouchableOpacity>
                )}
                
                {selectedTask.status === 'IN_PROGRESS' && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => {
                      handleTaskStatusUpdate(selectedTask.id, 'COMPLETED');
                      setShowTaskDetail(false);
                    }}
                  >
                    <Text style={styles.completeButtonText}>Hoàn thành</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.taskDetailCard}>
                <Text style={styles.detailTitle}>{selectedTask.title}</Text>
                <Text style={styles.detailDescription}>{selectedTask.description}</Text>
                
                <View style={styles.detailMeta}>
                  <View style={styles.detailMetaItem}>
                    <Text style={styles.detailMetaLabel}>Danh mục:</Text>
                    <Text style={styles.detailMetaValue}>
                      {TASK_CATEGORIES[selectedTask.category].label}
                    </Text>
                  </View>
                  
                  <View style={styles.detailMetaItem}>
                    <Text style={styles.detailMetaLabel}>Ưu tiên:</Text>
                    <Text style={styles.detailMetaValue}>{selectedTask.priority}</Text>
                  </View>
                  
                  <View style={styles.detailMetaItem}>
                    <Text style={styles.detailMetaLabel}>Thời gian dự kiến:</Text>
                    <Text style={styles.detailMetaValue}>
                      {formatTime(selectedTask.estimatedTime)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailMetaItem}>
                    <Text style={styles.detailMetaLabel}>Hạn hoàn thành:</Text>
                    <Text style={styles.detailMetaValue}>
                      {formatDueDate(selectedTask.dueDate)}
                    </Text>
                  </View>
                </View>

                {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                  <View style={styles.checklistContainer}>
                    <Text style={styles.checklistTitle}>Danh sách kiểm tra</Text>
                    
                    {selectedTask.checklist.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.checklistItem}
                        onPress={() => handleChecklistUpdate(selectedTask.id, item.id)}
                      >
                        <View style={[
                          styles.checkbox,
                          item.completed && styles.checkboxCompleted
                        ]}>
                          {item.completed && (
                            <Icon name="check" size={14} color="#fff" />
                          )}
                        </View>
                        <Text style={[
                          styles.checklistText,
                          item.completed && styles.checklistTextCompleted
                        ]}>
                          {item.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

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
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  
  tasksList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  taskInfo: {
    flex: 1,
  },
  
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  taskCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  taskRight: {
    alignItems: 'flex-end',
  },
  
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  taskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  taskLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  progressContainer: {
    marginBottom: 12,
  },
  
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  taskMeta: {
    flex: 1,
  },
  
  taskTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  
  taskDue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  startButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  
  completeButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  completeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  taskDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.sm,
  },
  
  detailTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  
  detailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  
  detailMeta: {
    marginBottom: 20,
  },
  
  detailMetaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  detailMetaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  detailMetaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  checklistContainer: {
    marginTop: 20,
  },
  
  checklistTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkboxCompleted: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  
  checklistText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
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

export default StaffTasksScreen;