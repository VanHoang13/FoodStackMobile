import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';

type ReservationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reservation'>;

interface Props {
  navigation: ReservationScreenNavigationProp;
  route: {
    params: {
      restaurantId?: string;
      branchId?: string;
    };
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  tables: number;
}

const ReservationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurantId, branchId } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [guestCount, setGuestCount] = useState(2);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Mock time slots - in real app, fetch from API
  const timeSlots: TimeSlot[] = [
    { time: '11:00', available: true, tables: 5 },
    { time: '11:30', available: true, tables: 3 },
    { time: '12:00', available: false, tables: 0 },
    { time: '12:30', available: true, tables: 2 },
    { time: '13:00', available: true, tables: 4 },
    { time: '13:30', available: true, tables: 6 },
    { time: '18:00', available: true, tables: 8 },
    { time: '18:30', available: true, tables: 5 },
    { time: '19:00', available: false, tables: 0 },
    { time: '19:30', available: true, tables: 3 },
    { time: '20:00', available: true, tables: 7 },
    { time: '20:30', available: true, tables: 4 },
  ];

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setSelectedTime(''); // Reset time when date changes
    }
  };

  const handleGuestCountChange = (increment: boolean) => {
    if (increment && guestCount < 20) {
      setGuestCount(guestCount + 1);
    } else if (!increment && guestCount > 1) {
      setGuestCount(guestCount - 1);
    }
  };

  const handleReservation = async () => {
    if (!selectedTime) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn thời gian');
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên khách hàng');
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const reservationId = `RES-${Date.now()}`;
      
      Alert.alert(
        'Đặt bàn thành công!',
        `Mã đặt bàn: ${reservationId}\nThời gian: ${selectedTime} - ${selectedDate.toLocaleDateString('vi-VN')}\nSố khách: ${guestCount} người\n\nNhà hàng sẽ liên hệ xác nhận trong 15 phút.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Reservation error:', error);
      Alert.alert('Lỗi', 'Không thể đặt bàn, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt bàn</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color="#E8622A" />
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              <Text style={styles.dateSubtext}>
                {isToday(selectedDate) ? 'Hôm nay' : 
                 isTomorrow(selectedDate) ? 'Ngày mai' : ''}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Guest Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số lượng khách</Text>
          <View style={styles.guestCounter}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleGuestCountChange(false)}
            >
              <Icon name="minus" size={20} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.guestCountDisplay}>
              <Text style={styles.guestCountText}>{guestCount}</Text>
              <Text style={styles.guestCountLabel}>khách</Text>
            </View>
            
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleGuestCountChange(true)}
            >
              <Icon name="plus" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn giờ</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.time}
                style={[
                  styles.timeSlot,
                  !slot.available && styles.timeSlotDisabled,
                  selectedTime === slot.time && styles.timeSlotSelected,
                ]}
                onPress={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
              >
                <Text style={[
                  styles.timeSlotText,
                  !slot.available && styles.timeSlotTextDisabled,
                  selectedTime === slot.time && styles.timeSlotTextSelected,
                ]}>
                  {slot.time}
                </Text>
                {slot.available && (
                  <Text style={[
                    styles.timeSlotTables,
                    selectedTime === slot.time && styles.timeSlotTablesSelected,
                  ]}>
                    {slot.tables} bàn trống
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tên khách hàng *</Text>
            <View style={styles.inputWrapper}>
              <Icon name="user" size={16} color="#666" />
              <TextInput
                style={styles.textInput}
                placeholder="Nhập tên của bạn"
                value={customerName}
                onChangeText={setCustomerName}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại *</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={16} color="#666" />
              <TextInput
                style={styles.textInput}
                placeholder="Nhập số điện thoại"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Yêu cầu đặc biệt (tùy chọn)</Text>
            <View style={styles.inputWrapper}>
              <Icon name="message-circle" size={16} color="#666" />
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Ví dụ: Bàn gần cửa sổ, sinh nhật, dị ứng thực phẩm..."
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        {/* Reservation Summary */}
        {selectedTime && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Tóm tắt đặt bàn</Text>
            
            <View style={styles.summaryRow}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.summaryText}>
                {formatDate(selectedDate)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Icon name="clock" size={16} color="#666" />
              <Text style={styles.summaryText}>
                {selectedTime}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Icon name="users" size={16} color="#666" />
              <Text style={styles.summaryText}>
                {guestCount} khách
              </Text>
            </View>
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>Lưu ý:</Text>
          <Text style={styles.termsText}>
            • Vui lòng đến đúng giờ đã đặt{'\n'}
            • Nhà hàng sẽ giữ bàn trong 15 phút{'\n'}
            • Liên hệ nhà hàng nếu cần thay đổi hoặc hủy{'\n'}
            • Phí đặt bàn có thể áp dụng cho nhóm lớn
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.reserveButton, loading && styles.reserveButtonDisabled]}
          onPress={handleReservation}
          disabled={loading || !selectedTime}
        >
          <LinearGradient
            colors={loading || !selectedTime ? ['#ccc', '#999'] : ['#E8622A', '#D55A1F']}
            style={styles.reserveButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="check" size={20} color="#fff" />
                <Text style={styles.reserveButtonText}>Xác nhận đặt bàn</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  headerRight: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },

  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  // Date Selection
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    gap: 12,
  },

  dateInfo: {
    flex: 1,
  },

  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  dateSubtext: {
    fontSize: 12,
    color: '#E8622A',
    marginTop: 2,
  },

  // Guest Counter
  guestCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },

  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  guestCountDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },

  guestCountText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E8622A',
  },

  guestCountLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Time Selection
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  timeSlot: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  timeSlotSelected: {
    backgroundColor: '#E8622A',
    borderColor: '#D55A1F',
  },

  timeSlotDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },

  timeSlotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  timeSlotTextSelected: {
    color: '#fff',
  },

  timeSlotTextDisabled: {
    color: '#999',
  },

  timeSlotTables: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  timeSlotTablesSelected: {
    color: 'rgba(255,255,255,0.8)',
  },

  // Input
  inputContainer: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Summary
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  summaryText: {
    fontSize: 14,
    color: '#666',
  },

  // Terms
  termsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 32,
  },

  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },

  // Bottom Action
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  reserveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.shadows.md,
  },

  reserveButtonDisabled: {
    opacity: 0.6,
  },

  reserveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },

  reserveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ReservationScreen;