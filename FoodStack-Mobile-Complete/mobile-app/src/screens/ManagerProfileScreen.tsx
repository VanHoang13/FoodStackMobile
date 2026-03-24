import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type ManagerProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManagerProfile'>;

interface Props {
  navigation: ManagerProfileScreenNavigationProp;
}

interface ManagerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  branchName: string;
  branchAddress: string;
  joinDate: string;
  employeeId: string;
  department: string;
  shift: string;
  performance: {
    rating: number;
    staffManaged: number;
    ordersProcessed: number;
    customerSatisfaction: number;
  };
}

const ManagerProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ManagerProfile>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Mock manager profile data
      const mockProfile: ManagerProfile = {
        id: user?.id || 'manager-001',
        name: user?.fullName || 'Nguyễn Văn Manager',
        email: user?.email || 'manager@branch1.com',
        phone: '0901234567',
        avatar: '👨‍💼',
        branchName: 'Chi nhánh Quận 1',
        branchAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        joinDate: '2023-01-15',
        employeeId: 'MNG001',
        department: 'Quản lý chi nhánh',
        shift: 'Toàn thời gian',
        performance: {
          rating: 4.5,
          staffManaged: 12,
          ordersProcessed: 1250,
          customerSatisfaction: 92,
        },
      };

      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ');
    }
  };

  const handleSave = async () => {
    try {
      if (!editedProfile.name?.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
        return;
      }

      if (!editedProfile.phone?.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
        return;
      }

      // Update profile
      setProfile({ ...profile!, ...editedProfile });
      setIsEditing(false);
      
      Alert.alert('Thành công', 'Đã cập nhật thông tin hồ sơ');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#34495E', '#2C3E50']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hồ sơ Manager</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              <Icon name={isEditing ? "check" : "edit"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{profile.avatar}</Text>
            <View style={styles.managerBadge}>
              <Text style={styles.managerBadgeText}>MGR</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileRole}>Quản lý chi nhánh</Text>
            <Text style={styles.branchName}>{profile.branchName}</Text>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.performanceContainer}>
          <Text style={styles.sectionTitle}>Hiệu suất làm việc</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <Icon name="star" size={24} color="#F39C12" />
              <Text style={styles.performanceNumber}>{profile.performance.rating}</Text>
              <Text style={styles.performanceLabel}>Đánh giá</Text>
            </View>
            <View style={styles.performanceCard}>
              <Icon name="users" size={24} color="#3498DB" />
              <Text style={styles.performanceNumber}>{profile.performance.staffManaged}</Text>
              <Text style={styles.performanceLabel}>Nhân viên quản lý</Text>
            </View>
            <View style={styles.performanceCard}>
              <Icon name="shopping-bag" size={24} color="#27AE60" />
              <Text style={styles.performanceNumber}>{profile.performance.ordersProcessed}</Text>
              <Text style={styles.performanceLabel}>Đơn hàng xử lý</Text>
            </View>
            <View style={styles.performanceCard}>
              <Icon name="heart" size={24} color="#E74C3C" />
              <Text style={styles.performanceNumber}>{profile.performance.customerSatisfaction}%</Text>
              <Text style={styles.performanceLabel}>Hài lòng KH</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="user" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedProfile.name}
                    onChangeText={(text) => setEditedProfile({...editedProfile, name: text})}
                    placeholder="Nhập họ tên"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile.name}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="mail" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedProfile.phone}
                    onChangeText={(text) => setEditedProfile({...editedProfile, phone: text})}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoValue}>{profile.phone}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="id-card" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mã nhân viên</Text>
                <Text style={styles.infoValue}>{profile.employeeId}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="calendar" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày vào làm</Text>
                <Text style={styles.infoValue}>{formatDate(profile.joinDate)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Branch Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Thông tin chi nhánh</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="building" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tên chi nhánh</Text>
                <Text style={styles.infoValue}>{profile.branchName}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="map-pin" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.infoValue}>{profile.branchAddress}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="briefcase" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phòng ban</Text>
                <Text style={styles.infoValue}>{profile.department}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Icon name="clock" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ca làm việc</Text>
                <Text style={styles.infoValue}>{profile.shift}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  // Header Styles
  header: {
    marginBottom: 20,
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

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Profile Header
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },

  avatar: {
    fontSize: 60,
  },

  managerBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#34495E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  managerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  profileInfo: {
    alignItems: 'center',
  },

  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },

  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },

  branchName: {
    fontSize: 14,
    color: '#34495E',
    fontWeight: '600',
  },

  // Performance Styles
  performanceContainer: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  performanceCard: {
    width: '48%',
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

  performanceNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },

  performanceLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Info Styles
  infoContainer: {
    marginBottom: 20,
  },

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

  infoInput: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#34495E',
    paddingVertical: 4,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#95A5A6',
  },

  saveButton: {
    backgroundColor: '#34495E',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ManagerProfileScreen;