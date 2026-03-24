import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type StaffProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffProfile'>;

interface Props {
  navigation: StaffProfileScreenNavigationProp;
}

interface StaffInfo {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  joinDate: string;
  branch: string;
  restaurant: string;
}

interface PerformanceStats {
  ordersProcessed: number;
  averageTime: number;
  customerRating: number;
  shiftsCompleted: number;
}

const StaffProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadStaffProfile();
  }, []);

  const loadStaffProfile = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStaffInfo({
        id: user?.userId || '1',
        fullName: user?.fullName || 'Nguyễn Văn Staff',
        email: user?.email || 'staff@foodstack.com',
        phone: '0123456789',
        role: user?.role || 'STAFF',
        status: 'ACTIVE',
        joinDate: '2024-01-15',
        branch: 'Chi nhánh Quận 1',
        restaurant: 'FoodStack Restaurant',
      });

      setPerformanceStats({
        ordersProcessed: 156,
        averageTime: 12,
        customerRating: 4.8,
        shiftsCompleted: 24,
      });
    } catch (error) {
      console.error('Error loading staff profile:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      // TODO: API call to change password
      console.log('Changing password...');
      
      Alert.alert('Thành công', 'Đã đổi mật khẩu thành công');
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
    }
  };
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              navigation.replace('Login');
            }
          }
        }
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'STAFF': return 'Nhân viên';
      case 'MANAGER': return 'Quản lý';
      case 'OWNER': return 'Chủ nhà hàng';
      default: return role;
    }
  };

  if (!staffInfo || !performanceStats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
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
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#E8622A', '#D44A1A']}
            style={styles.profileBackground}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>👨‍🍳</Text>
              </View>
              <Text style={styles.staffName}>{staffInfo.fullName}</Text>
              <Text style={styles.staffRole}>{getRoleDisplayName(staffInfo.role)}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hiệu suất làm việc</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="shopping-bag" size={24} color="#3498DB" />
              <Text style={styles.statValue}>{performanceStats.ordersProcessed}</Text>
              <Text style={styles.statLabel}>Đơn hàng xử lý</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="clock" size={24} color="#F39C12" />
              <Text style={styles.statValue}>{performanceStats.averageTime}m</Text>
              <Text style={styles.statLabel}>Thời gian TB</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="star" size={24} color="#E74C3C" />
              <Text style={styles.statValue}>{performanceStats.customerRating}</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="calendar" size={24} color="#27AE60" />
              <Text style={styles.statValue}>{performanceStats.shiftsCompleted}</Text>
              <Text style={styles.statLabel}>Ca làm việc</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Icon name="mail" size={16} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{staffInfo.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="phone" size={16} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{staffInfo.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="briefcase" size={16} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Vai trò</Text>
                <Text style={styles.infoValue}>{getRoleDisplayName(staffInfo.role)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="map-pin" size={16} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Chi nhánh</Text>
                <Text style={styles.infoValue}>{staffInfo.branch}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Icon name="calendar" size={16} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày vào làm</Text>
                <Text style={styles.infoValue}>{new Date(staffInfo.joinDate).toLocaleDateString('vi-VN')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowChangePasswordModal(true)}
            >
              <View style={styles.settingLeft}>
                <Icon name="lock" size={20} color="#E8622A" />
                <Text style={styles.settingText}>Đổi mật khẩu</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="bell" size={20} color="#3498DB" />
                <Text style={styles.settingText}>Cài đặt thông báo</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="help-circle" size={20} color="#27AE60" />
                <Text style={styles.settingText}>Hỗ trợ</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <Icon name="log-out" size={20} color="#E74C3C" />
                <Text style={[styles.settingText, styles.logoutText]}>Đăng xuất</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowChangePasswordModal(false)}
              >
                <Icon name="x" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.changePasswordButtonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Icon name="user" size={22} color="#E8622A" />
          <Text style={[styles.navText, styles.activeNavText]}>Cá nhân</Text>
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
  
  headerRight: {
    width: 40,
  },
  
  content: {
    flex: 1,
  },
  
  profileHeader: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  
  profileBackground: {
    padding: 24,
    alignItems: 'center',
  },
  
  avatarContainer: {
    alignItems: 'center',
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  avatarText: {
    fontSize: 32,
  },
  
  staffName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  
  staffRole: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
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
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    ...theme.shadows.sm,
  },
  
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  
  logoutItem: {
    borderBottomWidth: 0,
  },
  
  logoutText: {
    color: '#E74C3C',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  inputContainer: {
    marginBottom: 16,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  
  changePasswordButton: {
    backgroundColor: '#E8622A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  
  activeNavItem: {
    // Active state styling handled by individual elements
  },
  
  navText: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '700',
  },
  
  activeNavText: {
    color: '#E8622A',
  },
});

export default StaffProfileScreen;