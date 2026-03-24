import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type ManagerShiftManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagerShiftManagement'>;

interface Props {
  navigation: ManagerShiftManagementScreenNavigationProp;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  date: string;
  staffCount: number;
  requiredStaff: number;
  status: 'upcoming' | 'active' | 'completed';
  staff: StaffMember[];
}

interface StaffMember {
  id: string;
  name: string;
  position: string;
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'absent';
  checkInTime?: string;
  checkOutTime?: string;
}

const ManagerShiftManagementScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadShifts();
  }, [selectedDate]);

  const loadShifts = async () => {
    try {
      // Mock data for shifts
      const mockShifts: Shift[] = [
        {
          id: '1',
          name: 'Ca sáng',
          startTime: '06:00',
          endTime: '14:00',
          date: selectedDate,
          staffCount: 5,
          requiredStaff: 6,
          status: 'active',
          staff: [
            { id: '1', name: 'Nguyễn Văn A', position: 'Phục vụ', status: 'checked-in', checkInTime: '05:55' },
            { id: '2', name: 'Trần Thị B', position: 'Thu ngân', status: 'checked-in', checkInTime: '06:00' },
            { id: '3', name: 'Lê Văn C', position: 'Bếp', status: 'checked-in', checkInTime: '05:50' },
            { id: '4', name: 'Phạm Thị D', position: 'Phục vụ', status: 'checked-in', checkInTime: '06:05' },
            { id: '5', name: 'Hoàng Văn E', position: 'Dọn dẹp', status: 'absent' },
          ]
        },
        {
          id: '2',
          name: 'Ca chiều',
          startTime: '14:00',
          endTime: '22:00',
          date: selectedDate,
          staffCount: 7,
          requiredStaff: 8,
          status: 'upcoming',
          staff: [
            { id: '6', name: 'Vũ Thị F', position: 'Phục vụ', status: 'scheduled' },
            { id: '7', name: 'Đỗ Văn G', position: 'Thu ngân', status: 'scheduled' },
            { id: '8', name: 'Bùi Thị H', position: 'Bếp', status: 'scheduled' },
            { id: '9', name: 'Ngô Văn I', position: 'Phục vụ', status: 'scheduled' },
            { id: '10', name: 'Lý Thị J', position: 'Phục vụ', status: 'scheduled' },
            { id: '11', name: 'Trương Văn K', position: 'Bếp', status: 'scheduled' },
            { id: '12', name: 'Phan Thị L', position: 'Dọn dẹp', status: 'scheduled' },
          ]
        },
        {
          id: '3',
          name: 'Ca đêm',
          startTime: '22:00',
          endTime: '06:00',
          date: selectedDate,
          staffCount: 3,
          requiredStaff: 4,
          status: 'upcoming',
          staff: [
            { id: '13', name: 'Đinh Văn M', position: 'Bảo vệ', status: 'scheduled' },
            { id: '14', name: 'Võ Thị N', position: 'Dọn dẹp', status: 'scheduled' },
            { id: '15', name: 'Tô Văn O', position: 'Bếp', status: 'scheduled' },
          ]
        },
      ];
      
      setShifts(mockShifts);
    } catch (error) {
      console.error('Error loading shifts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShifts();
    setRefreshing(false);
  };

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#27AE60';
      case 'upcoming': return '#3498DB';
      case 'completed': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const getShiftStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang diễn ra';
      case 'upcoming': return 'Sắp tới';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in': return '#27AE60';
      case 'checked-out': return '#95A5A6';
      case 'scheduled': return '#3498DB';
      case 'absent': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getStaffStatusText = (status: string) => {
    switch (status) {
      case 'checked-in': return 'Đã vào';
      case 'checked-out': return 'Đã ra';
      case 'scheduled': return 'Đã lên lịch';
      case 'absent': return 'Vắng mặt';
      default: return 'Không xác định';
    }
  };

  const handleStaffAction = (shift: Shift, staff: StaffMember, action: string) => {
    Alert.alert(
      `${staff.name}`,
      `Bạn muốn ${action} cho nhân viên này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: () => {
            Alert.alert('Thành công', `Đã ${action} cho ${staff.name}`);
          }
        },
      ]
    );
  };

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -2; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Hôm nay' : 
               i === 1 ? 'Ngày mai' : 
               i === -1 ? 'Hôm qua' :
               date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
      });
    }
    
    return dates;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#3498DB', '#2980B9']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Quản lý Ca làm</Text>
              <Text style={styles.headerSubtitle}>Chi nhánh Quận 1</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Icon name="refresh-cw" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Selector */}
        <View style={styles.dateContainer}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {getDateOptions().map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.dateButton,
                  selectedDate === date.value && styles.dateButtonActive,
                ]}
                onPress={() => setSelectedDate(date.value)}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    selectedDate === date.value && styles.dateButtonTextActive,
                  ]}
                >
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Shifts */}
        <View style={styles.shiftsContainer}>
          <Text style={styles.sectionTitle}>Ca làm việc</Text>
          
          {shifts.map((shift) => (
            <View key={shift.id} style={styles.shiftCard}>
              <View style={styles.shiftHeader}>
                <View>
                  <Text style={styles.shiftName}>{shift.name}</Text>
                  <Text style={styles.shiftTime}>
                    {shift.startTime} - {shift.endTime}
                  </Text>
                </View>
                <View style={styles.shiftStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getShiftStatusColor(shift.status) }]}>
                    <Text style={styles.statusText}>{getShiftStatusText(shift.status)}</Text>
                  </View>
                  <Text style={styles.staffCount}>
                    {shift.staffCount}/{shift.requiredStaff} nhân viên
                  </Text>
                </View>
              </View>

              {/* Staff List */}
              <View style={styles.staffContainer}>
                <Text style={styles.staffTitle}>Danh sách nhân viên:</Text>
                {shift.staff.map((staff) => (
                  <TouchableOpacity
                    key={staff.id}
                    style={styles.staffCard}
                    onPress={() => {
                      const actions = [];
                      if (staff.status === 'scheduled') {
                        actions.push({ text: 'Check-in', onPress: () => handleStaffAction(shift, staff, 'check-in') });
                      }
                      if (staff.status === 'checked-in') {
                        actions.push({ text: 'Check-out', onPress: () => handleStaffAction(shift, staff, 'check-out') });
                      }
                      if (staff.status === 'absent') {
                        actions.push({ text: 'Đánh dấu có mặt', onPress: () => handleStaffAction(shift, staff, 'đánh dấu có mặt') });
                      }
                      
                      Alert.alert(
                        staff.name,
                        `Vị trí: ${staff.position}\nTrạng thái: ${getStaffStatusText(staff.status)}${
                          staff.checkInTime ? `\nGiờ vào: ${staff.checkInTime}` : ''
                        }${
                          staff.checkOutTime ? `\nGiờ ra: ${staff.checkOutTime}` : ''
                        }`,
                        [
                          { text: 'Đóng', style: 'cancel' },
                          ...actions,
                        ]
                      );
                    }}
                  >
                    <View style={styles.staffInfo}>
                      <Text style={styles.staffName}>{staff.name}</Text>
                      <Text style={styles.staffPosition}>{staff.position}</Text>
                      {staff.checkInTime && (
                        <Text style={styles.staffTime}>Vào: {staff.checkInTime}</Text>
                      )}
                      {staff.checkOutTime && (
                        <Text style={styles.staffTime}>Ra: {staff.checkOutTime}</Text>
                      )}
                    </View>
                    <View style={[styles.staffStatusBadge, { backgroundColor: getStaffStatusColor(staff.status) }]}>
                      <Text style={styles.staffStatusText}>{getStaffStatusText(staff.status)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Shift Actions */}
              <View style={styles.shiftActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => Alert.alert('Chỉnh sửa ca', `Chỉnh sửa ca ${shift.name}`)}
                >
                  <Icon name="edit" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.addButton]}
                  onPress={() => Alert.alert('Thêm nhân viên', `Thêm nhân viên vào ca ${shift.name}`)}
                >
                  <Icon name="plus" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Thêm NV</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },

  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
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

  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // Date Selector
  dateContainer: {
    marginBottom: 24,
  },

  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  dateButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },

  dateButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  dateButtonTextActive: {
    color: '#fff',
  },

  // Shifts
  shiftsContainer: {
    marginBottom: 20,
  },

  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
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

  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  shiftName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  shiftTime: {
    fontSize: 14,
    color: '#666',
  },

  shiftStatus: {
    alignItems: 'flex-end',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  staffCount: {
    fontSize: 12,
    color: '#666',
  },

  // Staff
  staffContainer: {
    marginBottom: 16,
  },

  staffTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  staffCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  staffInfo: {
    flex: 1,
  },

  staffName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },

  staffPosition: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  staffTime: {
    fontSize: 11,
    color: '#999',
  },

  staffStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  staffStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  // Actions
  shiftActions: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },

  editButton: {
    backgroundColor: '#F39C12',
  },

  addButton: {
    backgroundColor: '#27AE60',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ManagerShiftManagementScreen;