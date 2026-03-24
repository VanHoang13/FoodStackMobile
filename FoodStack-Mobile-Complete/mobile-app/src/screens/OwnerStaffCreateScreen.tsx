import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import OwnerStaffApiService, { Staff } from '../services/ownerStaffApiService';

type OwnerStaffCreateScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerStaffCreate'>;

interface Props {
  navigation: OwnerStaffCreateScreenNavigationProp;
}

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: Staff['role'];
  status: Staff['status'];
  shift: Staff['shift'];
  address: string;
  emergencyContact: string;
  salary: string;
}

const OwnerStaffCreateScreen: React.FC<Props> = ({ navigation }) => {
  // Form state with default values
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'WAITER',
    status: 'active',
    shift: 'full_time',
    address: '',
    emergencyContact: '',
    salary: '8000000',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (role: StaffFormData['role']) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleStatusChange = (status: StaffFormData['status']) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleShiftChange = (shift: StaffFormData['shift']) => {
    setFormData(prev => ({ ...prev, shift }));
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhân viên không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Liên hệ khẩn cấp không được để trống';
    }

    const salary = parseFloat(formData.salary);
    if (isNaN(salary) || salary <= 0) {
      newErrors.salary = 'Lương phải là số dương';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateStaffId = () => {
    return 'staff_' + Date.now().toString();
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create new staff using API service
      const newStaff = await OwnerStaffApiService.createStaff({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        shift: formData.shift,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        salary: parseFloat(formData.salary),
        joinDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        performance: 85, // Default performance score
        isOnline: false,
      });
      
      Alert.alert(
        'Thành công',
        'Đã tạo nhân viên mới',
        [
          {
            text: 'Quay lại danh sách',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating staff:', error);
      Alert.alert('Lỗi', 'Không thể tạo nhân viên mới. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có muốn xóa tất cả thông tin đã nhập?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              role: 'WAITER',
              status: 'active',
              shift: 'full_time',
              address: '',
              emergencyContact: '',
              salary: '8000000',
            });
            setErrors({});
          },
        },
      ]
    );
  };

  const getRoleText = (role: StaffFormData['role']) => {
    switch (role) {
      case 'CHEF': return 'Bếp trưởng';
      case 'WAITER': return 'Phục vụ';
      case 'CASHIER': return 'Thu ngân';
      case 'MANAGER': return 'Quản lý';
      default: return role;
    }
  };

  const getStatusText = (status: StaffFormData['status']) => {
    switch (status) {
      case 'active': return 'Đang làm việc';
      case 'inactive': return 'Tạm nghỉ';
      case 'on_leave': return 'Nghỉ phép';
      default: return status;
    }
  };

  const getShiftText = (shift: StaffFormData['shift']) => {
    switch (shift) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      case 'full_time': return 'Toàn thời gian';
      default: return shift;
    }
  };

  const formatCurrency = (amount: string) => {
    const number = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('vi-VN').format(number);
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
        <Text style={styles.headerTitle}>Thêm nhân viên mới</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Icon name="refresh-cw" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Nhập họ và tên"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="0901234567"
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ *</Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Nhập địa chỉ"
                multiline
                numberOfLines={3}
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Liên hệ khẩn cấp *</Text>
              <TextInput
                style={[styles.input, errors.emergencyContact && styles.inputError]}
                value={formData.emergencyContact}
                onChangeText={(value) => handleInputChange('emergencyContact', value)}
                placeholder="0987654321"
                keyboardType="phone-pad"
              />
              {errors.emergencyContact && <Text style={styles.errorText}>{errors.emergencyContact}</Text>}
            </View>
          </View>

          {/* Work Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin công việc</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chức vụ *</Text>
              <View style={styles.optionsContainer}>
                {(['CHEF', 'WAITER', 'CASHIER', 'MANAGER'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.optionButton,
                      formData.role === role && styles.optionButtonActive,
                    ]}
                    onPress={() => handleRoleChange(role)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        formData.role === role && styles.optionButtonTextActive,
                      ]}
                    >
                      {getRoleText(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Trạng thái *</Text>
              <View style={styles.optionsContainer}>
                {(['active', 'inactive', 'on_leave'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.optionButton,
                      formData.status === status && styles.optionButtonActive,
                    ]}
                    onPress={() => handleStatusChange(status)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        formData.status === status && styles.optionButtonTextActive,
                      ]}
                    >
                      {getStatusText(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ca làm việc *</Text>
              <View style={styles.optionsContainer}>
                {(['morning', 'afternoon', 'evening', 'full_time'] as const).map((shift) => (
                  <TouchableOpacity
                    key={shift}
                    style={[
                      styles.optionButton,
                      formData.shift === shift && styles.optionButtonActive,
                    ]}
                    onPress={() => handleShiftChange(shift)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        formData.shift === shift && styles.optionButtonTextActive,
                      ]}
                    >
                      {getShiftText(shift)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lương cơ bản (VNĐ) *</Text>
              <TextInput
                style={[styles.input, errors.salary && styles.inputError]}
                value={formatCurrency(formData.salary)}
                onChangeText={(value) => handleInputChange('salary', value.replace(/[^0-9]/g, ''))}
                placeholder="8000000"
                keyboardType="numeric"
              />
              {errors.salary && <Text style={styles.errorText}>{errors.salary}</Text>}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Đang tạo...' : 'Tạo nhân viên'}
          </Text>
        </TouchableOpacity>
      </View>
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

  resetButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 8,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // Input Styles
  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFF5F5',
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },

  // Options Styles
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  optionButtonActive: {
    backgroundColor: '#FF7A30',
    borderColor: '#FF7A30',
  },

  optionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  optionButtonTextActive: {
    color: '#fff',
  },

  // Working Days Styles
  workingDaysContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  dayButtonActive: {
    backgroundColor: '#FF7A30',
    borderColor: '#FF7A30',
  },

  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  dayButtonTextActive: {
    color: '#fff',
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  createButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF7A30',
    alignItems: 'center',
  },

  createButtonDisabled: {
    backgroundColor: '#ccc',
  },

  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OwnerStaffCreateScreen;