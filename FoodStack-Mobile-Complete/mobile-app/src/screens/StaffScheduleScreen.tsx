import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type StaffScheduleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffSchedule'>;

interface Props {
  navigation: StaffScheduleScreenNavigationProp;
}

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ABSENT';
  location: string;
  role: string;
  notes?: string;
  breakTime?: {
    start: string;
    end: string;
    duration: number;
  };
}

interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'EMERGENCY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  requestedAt: string;
  approvedBy?: string;
}

interface ScheduleData {
  currentWeek: Shift[];
  nextWeek: Shift[];
  timeOffRequests: TimeOffRequest[];
  weeklyHours: {
    scheduled: number;
    worked: number;
    overtime: number;
  };
  monthlyStats: {
    totalShifts: number;
    completedShifts: number;
    absences: number;
    lateArrivals: number;
  };
}

const SHIFT_TYPES = {
  MORNING: { color: '#F39C12', label: 'Ca sáng', time: '6:00 - 14:00' },
  AFTERNOON: { color: '#3498DB', label: 'Ca chiều', time: '14:00 - 22:00' },
  EVENING: { color: '#9B59B6', label: 'Ca tối', time: '18:00 - 02:00' },
  NIGHT: { color: '#34495E', label: 'Ca đêm', time: '22:00 - 06:00' },
};

const STATUS_COLORS = {
  SCHEDULED: '#95A5A6',
  CONFIRMED: '#3498DB',
  COMPLETED: '#27AE60',
  CANCELLED: '#E74C3C',
  ABSENT: '#E67E22',
};

const { width } = Dimensions.get('window');

const StaffScheduleScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<'CURRENT' | 'NEXT'>('CURRENT');
  const [selectedTab, setSelectedTab] = useState<'SCHEDULE' | 'TIME_OFF' | 'STATS'>('SCHEDULE');

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock schedule data
      const mockData: ScheduleData = {
        currentWeek: [
          {
            id: '1',
            date: '2024-01-22',
            startTime: '06:00',
            endTime: '14:00',
            type: 'MORNING',
            status: 'COMPLETED',
            location: 'Chi nhánh chính',
            role: 'Phục vụ',
            breakTime: { start: '10:00', end: '10:30', duration: 30 },
          },
          {
            id: '2',
            date: '2024-01-23',
            startTime: '14:00',
            endTime: '22:00',
            type: 'AFTERNOON',
            status: 'COMPLETED',
            location: 'Chi nhánh chính',
            role: 'Phục vụ',
            breakTime: { start: '18:00', end: '18:30', duration: 30 },
          },
          {
            id: '3',
            date: '2024-01-24',
            startTime: '06:00',
            endTime: '14:00',
            type: 'MORNING',
            status: 'CONFIRMED',
            location: 'Chi nhánh chính',
            role: 'Phục vụ',
            breakTime: { start: '10:00', end: '10:30', duration: 30 },
          },
          {
            id: '4',
            date: '2024-01-25',
            startTime: '14:00',
            endTime: '22:00',
            type: 'AFTERNOON',
            status: 'SCHEDULED',
            location: 'Chi nhánh chính',
            role: 'Phục vụ',
          },
          {
            id: '5',
            date: '2024-01-26',
            startTime: '06:00',
            endTime: '14:00',
            type: 'MORNING',
            status: 'SCHEDULED',
            location: 'Chi nhánh chính',
            role: 'Phục vụ',
          },
        ],
        nextWeek: [
          {
            id: '6',
            date: '2024-01-29',
            startTime: '14:00',
            endTime: '22:00',
            type: 'AFTERNOON',
            status: 'SCHEDULED',
            location: 'Chi nhánh chính',
            role: 'Phục vụ',
          },
          {
            id: '7',
            date: '2024-01-30',
            startTime: '06:00',
            endTime: '14:00',
            type: 'MORNING',
            status: 'SCHEDULED',
            location: 'Chi nhánh chính',
            role: 'Phục vụ',
          },
        ],
        timeOffRequests: [
          {
            id: '1',
            startDate: '2024-02-05',
            endDate: '2024-02-07',
            type: 'VACATION',
            status: 'PENDING',
            reason: 'Nghỉ phép thăm gia đình',
            requestedAt: '2024-01-20',
          },
          {
            id: '2',
            startDate: '2024-01-15',
            endDate: '2024-01-15',
            type: 'SICK_LEAVE',
            status: 'APPROVED',
            reason: 'Ốm',
            requestedAt: '2024-01-14',
            approvedBy: 'Quản lý ca',
          },
        ],
        weeklyHours: {
          scheduled: 40,
          worked: 32,
          overtime: 2,
        },
        monthlyStats: {
          totalShifts: 22,
          completedShifts: 20,
          absences: 1,
          lateArrivals: 0,
        },
      };
      
      setSchedule(mockData);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftAction = (shift: Shift, action: 'CONFIRM' | 'CANCEL' | 'REQUEST_CHANGE') => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${action === 'CONFIRM' ? 'xác nhận' : 
                                action === 'CANCEL' ? 'hủy' : 'yêu cầu thay đổi'} ca làm việc này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          onPress: () => {
            // TODO: Implement API call
            console.log(`${action} shift ${shift.id}`);
            Alert.alert('Thành công', 'Đã cập nhật ca làm việc');
          }
        }
      ]
    );
  };

  const handleTimeOffRequest = () => {
    Alert.alert(
      'Yêu cầu nghỉ phép',
      'Chức năng này sẽ được phát triển trong phiên bản tiếp theo',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getShiftDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2024-01-01 ${startTime}`);
    const end = new Date(`2024-01-01 ${endTime}`);
    let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Handle overnight shifts
    if (diff < 0) {
      diff += 24;
    }
    
    return `${diff}h`;
  };

  if (loading || !schedule) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải lịch làm việc...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        
        <Text style={styles.headerTitle}>Lịch làm việc</Text>

        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleTimeOffRequest}
        >
          <Icon name="plus" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'SCHEDULE', label: 'Lịch trình' },
          { key: 'TIME_OFF', label: 'Nghỉ phép' },
          { key: 'STATS', label: 'Thống kê' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab.key && styles.tabButtonTextActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'SCHEDULE' && (
          <>
            {/* Week Selector */}
            <View style={styles.weekSelector}>
              <TouchableOpacity
                style={[
                  styles.weekButton,
                  selectedWeek === 'CURRENT' && styles.weekButtonActive,
                ]}
                onPress={() => setSelectedWeek('CURRENT')}
              >
                <Text style={[
                  styles.weekButtonText,
                  selectedWeek === 'CURRENT' && styles.weekButtonTextActive,
                ]}>
                  Tuần này
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.weekButton,
                  selectedWeek === 'NEXT' && styles.weekButtonActive,
                ]}
                onPress={() => setSelectedWeek('NEXT')}
              >
                <Text style={[
                  styles.weekButtonText,
                  selectedWeek === 'NEXT' && styles.weekButtonTextActive,
                ]}>
                  Tuần sau
                </Text>
              </TouchableOpacity>
            </View>

            {/* Weekly Hours Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tổng quan tuần</Text>
              
              <View style={styles.hoursCard}>
                <View style={styles.hoursRow}>
                  <View style={styles.hoursStat}>
                    <Text style={styles.hoursValue}>{schedule.weeklyHours.scheduled}h</Text>
                    <Text style={styles.hoursLabel}>Đã lên lịch</Text>
                  </View>
                  
                  <View style={styles.hoursStat}>
                    <Text style={[styles.hoursValue, { color: '#27AE60' }]}>
                      {schedule.weeklyHours.worked}h
                    </Text>
                    <Text style={styles.hoursLabel}>Đã làm</Text>
                  </View>
                  
                  <View style={styles.hoursStat}>
                    <Text style={[styles.hoursValue, { color: '#E67E22' }]}>
                      {schedule.weeklyHours.overtime}h
                    </Text>
                    <Text style={styles.hoursLabel}>Tăng ca</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Shifts List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Ca làm việc - {selectedWeek === 'CURRENT' ? 'Tuần này' : 'Tuần sau'}
              </Text>
              
              <View style={styles.shiftsList}>
                {(selectedWeek === 'CURRENT' ? schedule.currentWeek : schedule.nextWeek).map((shift) => (
                  <View key={shift.id} style={styles.shiftCard}>
                    <View style={styles.shiftHeader}>
                      <View style={styles.shiftLeft}>
                        <View style={[
                          styles.shiftTypeIcon,
                          { backgroundColor: SHIFT_TYPES[shift.type].color }
                        ]}>
                          <Icon name="clock" size={16} color="#fff" />
                        </View>
                        
                        <View style={styles.shiftInfo}>
                          <Text style={styles.shiftDate}>{formatDate(shift.date)}</Text>
                          <Text style={styles.shiftType}>
                            {SHIFT_TYPES[shift.type].label}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.shiftRight}>
                        <View style={[
                          styles.shiftStatus,
                          { backgroundColor: STATUS_COLORS[shift.status] }
                        ]}>
                          <Text style={styles.shiftStatusText}>
                            {shift.status === 'SCHEDULED' ? 'Đã lên lịch' :
                             shift.status === 'CONFIRMED' ? 'Đã xác nhận' :
                             shift.status === 'COMPLETED' ? 'Hoàn thành' :
                             shift.status === 'CANCELLED' ? 'Đã hủy' : 'Vắng mặt'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.shiftDetails}>
                      <View style={styles.shiftTime}>
                        <Text style={styles.timeText}>
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </Text>
                        <Text style={styles.durationText}>
                          ({getShiftDuration(shift.startTime, shift.endTime)})
                        </Text>
                      </View>
                      
                      <Text style={styles.shiftLocation}>📍 {shift.location}</Text>
                      <Text style={styles.shiftRole}>👤 {shift.role}</Text>
                      
                      {shift.breakTime && (
                        <Text style={styles.breakTime}>
                          ☕ Nghỉ: {shift.breakTime.start} - {shift.breakTime.end} ({shift.breakTime.duration}p)
                        </Text>
                      )}
                    </View>

                    {shift.status === 'SCHEDULED' && (
                      <View style={styles.shiftActions}>
                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={() => handleShiftAction(shift, 'CONFIRM')}
                        >
                          <Text style={styles.confirmButtonText}>Xác nhận</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.changeButton}
                          onPress={() => handleShiftAction(shift, 'REQUEST_CHANGE')}
                        >
                          <Text style={styles.changeButtonText}>Yêu cầu đổi</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {selectedTab === 'TIME_OFF' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yêu cầu nghỉ phép</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleTimeOffRequest}
              >
                <Icon name="plus" size={16} color="#fff" />
                <Text style={styles.addButtonText}>Tạo yêu cầu</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeOffList}>
              {schedule.timeOffRequests.map((request) => (
                <View key={request.id} style={styles.timeOffCard}>
                  <View style={styles.timeOffHeader}>
                    <Text style={styles.timeOffDates}>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </Text>
                    <View style={[
                      styles.requestStatus,
                      { 
                        backgroundColor: 
                          request.status === 'APPROVED' ? '#27AE60' :
                          request.status === 'REJECTED' ? '#E74C3C' : '#F39C12'
                      }
                    ]}>
                      <Text style={styles.requestStatusText}>
                        {request.status === 'APPROVED' ? 'Đã duyệt' :
                         request.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.timeOffType}>
                    {request.type === 'VACATION' ? '🏖️ Nghỉ phép' :
                     request.type === 'SICK_LEAVE' ? '🤒 Nghỉ ốm' :
                     request.type === 'PERSONAL' ? '👤 Việc cá nhân' : '🚨 Khẩn cấp'}
                  </Text>
                  
                  <Text style={styles.timeOffReason}>{request.reason}</Text>
                  
                  <Text style={styles.timeOffMeta}>
                    Yêu cầu: {formatDate(request.requestedAt)}
                    {request.approvedBy && ` • Duyệt bởi: ${request.approvedBy}`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedTab === 'STATS' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thống kê tháng này</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#3498DB', '#2980B9']}
                  style={styles.statIcon}
                >
                  <Icon name="calendar" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{schedule.monthlyStats.totalShifts}</Text>
                <Text style={styles.statLabel}>Tổng ca làm</Text>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#27AE60', '#229954']}
                  style={styles.statIcon}
                >
                  <Icon name="check-circle" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{schedule.monthlyStats.completedShifts}</Text>
                <Text style={styles.statLabel}>Đã hoàn thành</Text>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#E67E22', '#D35400']}
                  style={styles.statIcon}
                >
                  <Icon name="x-circle" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{schedule.monthlyStats.absences}</Text>
                <Text style={styles.statLabel}>Vắng mặt</Text>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#9B59B6', '#8E44AD']}
                  style={styles.statIcon}
                >
                  <Icon name="clock" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{schedule.monthlyStats.lateArrivals}</Text>
                <Text style={styles.statLabel}>Đi muộn</Text>
              </View>
            </View>

            {/* Attendance Rate */}
            <View style={styles.attendanceCard}>
              <Text style={styles.attendanceTitle}>Tỷ lệ tham dự</Text>
              <View style={styles.attendanceProgress}>
                <View style={styles.attendanceBar}>
                  <View style={[
                    styles.attendanceFill,
                    { 
                      width: `${(schedule.monthlyStats.completedShifts / schedule.monthlyStats.totalShifts) * 100}%`,
                      backgroundColor: '#27AE60'
                    }
                  ]} />
                </View>
                <Text style={styles.attendancePercent}>
                  {Math.round((schedule.monthlyStats.completedShifts / schedule.monthlyStats.totalShifts) * 100)}%
                </Text>
              </View>
            </View>
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  
  tabButtonActive: {
    backgroundColor: '#E8622A',
  },
  
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  tabButtonTextActive: {
    color: '#fff',
  },
  
  content: {
    flex: 1,
  },
  
  weekSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  
  weekButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  weekButtonActive: {
    backgroundColor: '#E8622A',
  },
  
  weekButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  
  weekButtonTextActive: {
    color: '#fff',
  },
  
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8622A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  
  hoursCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.sm,
  },
  
  hoursRow: {
    flexDirection: 'row',
  },
  
  hoursStat: {
    flex: 1,
    alignItems: 'center',
  },
  
  hoursValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  hoursLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  shiftsList: {
    gap: 12,
  },
  
  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  shiftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  shiftTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  shiftInfo: {
    flex: 1,
  },
  
  shiftDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  shiftType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  shiftRight: {
    alignItems: 'flex-end',
  },
  
  shiftStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  shiftStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  
  shiftDetails: {
    marginBottom: 12,
  },
  
  shiftTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  shiftLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  
  shiftRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  
  breakTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  shiftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  confirmButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  
  changeButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  changeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  
  timeOffList: {
    gap: 12,
  },
  
  timeOffCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  timeOffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  timeOffDates: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  requestStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  requestStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  
  timeOffType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  
  timeOffReason: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  timeOffMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  
  attendanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.sm,
  },
  
  attendanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  
  attendanceProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  attendanceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  attendanceFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  attendancePercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
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

export default StaffScheduleScreen;