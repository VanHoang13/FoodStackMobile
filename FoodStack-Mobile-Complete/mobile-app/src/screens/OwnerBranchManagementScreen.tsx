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
  Modal,
  Switch,
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import BranchManagementService, { Branch, BranchStats } from '../services/branchManagementService';
import ImageUploadService from '../services/imageUploadService';

type OwnerBranchManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerBranchManagement'>;

interface Props {
  navigation: OwnerBranchManagementScreenNavigationProp;
}

const OwnerBranchManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<BranchStats>({
    totalBranches: 0,
    activeBranches: 0,
    inactiveBranches: 0,
    totalTables: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [savingBranch, setSavingBranch] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager_name: '',
    manager_phone: '',
    is_active: true,
    opening_hours: {
      open: '08:00',
      close: '22:00',
    },
    image_url: '',
  });

  useEffect(() => {
    loadBranchData();
  }, []);

  const loadBranchData = async () => {
    try {
      setLoading(true);
      
      // Initialize mock data if needed
      await BranchManagementService.initializeMockData();
      
      const [branchesData, statsData] = await Promise.all([
        BranchManagementService.getBranches(),
        BranchManagementService.getBranchStats()
      ]);

      setBranches(branchesData);
      setStats(statsData);
      
    } catch (error) {
      console.error('Error loading branch data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu chi nhánh');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const resetMockData = async () => {
    Alert.alert(
      'Reset dữ liệu mẫu',
      'Bạn có muốn reset về dữ liệu mẫu với ảnh mới không? Điều này sẽ xóa tất cả chi nhánh hiện tại.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await BranchManagementService.resetMockData();
              await loadBranchData();
              Alert.alert('Thành công', 'Đã reset dữ liệu mẫu với ảnh mới');
            } catch (error) {
              console.error('Error resetting mock data:', error);
              Alert.alert('Lỗi', 'Không thể reset dữ liệu');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBranchData();
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      manager_name: '',
      manager_phone: '',
      is_active: true,
      opening_hours: {
        open: '08:00',
        close: '22:00',
      },
      image_url: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (branch: Branch) => {
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      manager_name: branch.manager_name,
      manager_phone: branch.manager_phone,
      is_active: branch.is_active,
      opening_hours: branch.opening_hours,
      image_url: branch.image_url || '',
    });
    setEditingBranch(branch);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chi nhánh');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    
    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (10-11 chữ số)');
      return false;
    }
    
    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Lỗi', 'Email không hợp lệ');
        return false;
      }
    }
    
    // Validate manager phone if provided
    if (formData.manager_phone.trim()) {
      if (!phoneRegex.test(formData.manager_phone.replace(/\s/g, ''))) {
        Alert.alert('Lỗi', 'SĐT quản lý không hợp lệ (10-11 chữ số)');
        return false;
      }
    }
    
    // Validate opening hours
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.opening_hours.open)) {
      Alert.alert('Lỗi', 'Giờ mở cửa không hợp lệ (HH:MM)');
      return false;
    }
    if (!timeRegex.test(formData.opening_hours.close)) {
      Alert.alert('Lỗi', 'Giờ đóng cửa không hợp lệ (HH:MM)');
      return false;
    }
    
    return true;
  };

  const handleSaveBranch = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSavingBranch(true);
      
      if (editingBranch) {
        // Update existing branch
        const updatedBranch = await BranchManagementService.updateBranch(editingBranch.id, formData);
        
        if (updatedBranch) {
          setBranches(prevBranches =>
            prevBranches.map(branch => 
              branch.id === editingBranch.id ? updatedBranch : branch
            )
          );
          
          Alert.alert('Thành công', 'Đã cập nhật chi nhánh');
        }
        setEditingBranch(null);
      } else {
        // Create new branch
        const newBranch = await BranchManagementService.createBranch(formData);
        
        setBranches(prevBranches => [...prevBranches, newBranch]);
        Alert.alert('Thành công', 'Đã thêm chi nhánh mới');
        setShowAddModal(false);
      }
      
      // Reload stats
      const updatedStats = await BranchManagementService.getBranchStats();
      setStats(updatedStats);
      
    } catch (error) {
      console.error('Error saving branch:', error);
      Alert.alert('Lỗi', 'Không thể lưu chi nhánh');
    } finally {
      setSavingBranch(false);
    }
  };

  const toggleBranchStatus = async (branchId: string) => {
    try {
      setTogglingStatus(branchId);
      
      const updatedBranch = await BranchManagementService.toggleBranchStatus(branchId);
      
      if (updatedBranch) {
        setBranches(prevBranches =>
          prevBranches.map(branch =>
            branch.id === branchId ? updatedBranch : branch
          )
        );
        
        // Update stats
        const updatedStats = await BranchManagementService.getBranchStats();
        setStats(updatedStats);
        
        Alert.alert(
          'Thành công', 
          `Chi nhánh đã được ${updatedBranch.is_active ? 'kích hoạt' : 'tạm đóng'}`
        );
      }
    } catch (error) {
      console.error('Error toggling branch status:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái chi nhánh');
    } finally {
      setTogglingStatus(null);
    }
  };

  const deleteBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa chi nhánh "${branch?.name}"?\n\nHành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingBranch(branchId);
              
              const success = await BranchManagementService.deleteBranch(branchId);
              
              if (success) {
                setBranches(prevBranches => 
                  prevBranches.filter(branch => branch.id !== branchId)
                );
                
                // Update stats
                const updatedStats = await BranchManagementService.getBranchStats();
                setStats(updatedStats);
                
                Alert.alert('Thành công', 'Đã xóa chi nhánh');
              } else {
                Alert.alert('Lỗi', 'Không tìm thấy chi nhánh để xóa');
              }
            } catch (error) {
              console.error('Error deleting branch:', error);
              Alert.alert('Lỗi', 'Không thể xóa chi nhánh');
            } finally {
              setDeletingBranch(null);
            }
          }
        }
      ]
    );
  };

  // Image upload handlers
  const showImagePickerOptions = () => {
    const options = ['Chọn từ thư viện', 'Chụp ảnh mới', 'Nhập URL', 'Hủy'];
    const cancelButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Chọn ảnh chi nhánh',
        },
        (buttonIndex) => {
          handleImagePickerSelection(buttonIndex);
        }
      );
    } else {
      // For Android, show Alert
      Alert.alert(
        'Chọn ảnh chi nhánh',
        'Bạn muốn chọn ảnh từ đâu?',
        [
          { text: 'Thư viện', onPress: () => handleImagePickerSelection(0) },
          { text: 'Chụp ảnh', onPress: () => handleImagePickerSelection(1) },
          { text: 'Nhập URL', onPress: () => handleImagePickerSelection(2) },
          { text: 'Hủy', style: 'cancel' },
        ]
      );
    }
  };

  const handleImagePickerSelection = async (buttonIndex: number) => {
    switch (buttonIndex) {
      case 0: // Gallery
        await pickImageFromGallery();
        break;
      case 1: // Camera
        await takePhotoWithCamera();
        break;
      case 2: // URL Input
        showUrlInputDialog();
        break;
      default:
        break;
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setUploadingImage(true);
      
      const result = await ImageUploadService.pickImageFromGallery();
      
      if (result && !result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadImageToCloudinary(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
    } finally {
      setUploadingImage(false);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      setUploadingImage(true);
      
      const result = await ImageUploadService.takePhoto();
      
      if (result && !result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadImageToCloudinary(imageUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadImageToCloudinary = async (imageUri: string) => {
    try {
      console.log('🚀 Starting image upload to Cloudinary...');
      const uploadResult = await ImageUploadService.uploadImage(imageUri, 'branches');
      
      if (uploadResult.success && uploadResult.url) {
        setFormData(prev => ({ ...prev, image_url: uploadResult.url }));
        Alert.alert('Thành công', 'Đã tải ảnh lên thành công');
      } else {
        console.error('Upload failed:', uploadResult.error);
        
        // Nếu lỗi authentication, suggest login lại
        if (uploadResult.error?.includes('đăng nhập')) {
          Alert.alert(
            'Cần đăng nhập lại', 
            'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để upload ảnh.',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Nhập URL thay thế', onPress: showUrlInputDialog }
            ]
          );
        } else {
          Alert.alert(
            'Lỗi upload', 
            uploadResult.error || 'Không thể tải ảnh lên',
            [
              { text: 'Thử lại', onPress: () => uploadImageToCloudinary(imageUri) },
              { text: 'Nhập URL thay thế', onPress: showUrlInputDialog }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert(
        'Lỗi', 
        'Không thể tải ảnh lên. Vui lòng thử lại hoặc nhập URL.',
        [
          { text: 'Thử lại', onPress: () => uploadImageToCloudinary(imageUri) },
          { text: 'Nhập URL', onPress: showUrlInputDialog }
        ]
      );
    }
  };

  const showUrlInputDialog = () => {
    Alert.prompt(
      'Nhập URL ảnh',
      'Vui lòng nhập đường dẫn ảnh:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'OK',
          onPress: (url) => {
            if (url && url.trim()) {
              setFormData(prev => ({ ...prev, image_url: url.trim() }));
            }
          }
        }
      ],
      'plain-text',
      formData.image_url
    );
  };

  // Image Upload Component
  const ImageUploadSection = () => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Hình ảnh chi nhánh</Text>
      
      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={showImagePickerOptions}
        disabled={uploadingImage}
      >
        <Icon name="camera" size={20} color="#E8622A" />
        <Text style={styles.uploadButtonText}>
          {uploadingImage ? 'Đang tải lên...' : 'Chọn ảnh'}
        </Text>
      </TouchableOpacity>

      {/* Manual URL Input */}
      <TouchableOpacity
        style={styles.urlInputButton}
        onPress={showUrlInputDialog}
      >
        <Icon name="link" size={16} color="#666" />
        <Text style={styles.urlInputButtonText}>Hoặc nhập URL</Text>
      </TouchableOpacity>

      {/* Image Preview */}
      {formData.image_url ? (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: formData.image_url }} 
            style={styles.imagePreview}
            onError={() => {
              Alert.alert('Lỗi', 'Không thể tải ảnh từ URL này');
            }}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setFormData(prev => ({ ...prev, image_url: '' }))}
          >
            <Icon name="x" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Icon name="image" size={40} color="#ccc" />
          <Text style={styles.imagePlaceholderText}>Chưa có ảnh</Text>
        </View>
      )}
    </View>
  );

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.manager_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.phone.includes(searchQuery) ||
    branch.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Chi nhánh</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetMockData}
          >
            <Icon name="refresh" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Icon name="plus" size={20} color="#E8622A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue} numberOfLines={1}>{stats.totalBranches}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Tổng chi nhánh</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#27AE60' }]} numberOfLines={1}>{stats.activeBranches}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Đang hoạt động</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#E74C3C' }]} numberOfLines={1}>{stats.inactiveBranches}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Tạm đóng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#3498DB' }]} numberOfLines={1}>{stats.totalTables}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Tổng bàn</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm chi nhánh..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Branches List */}
      <ScrollView
        style={styles.branchesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredBranches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có chi nhánh nào</Text>
            <Text style={styles.emptySubText}>Nhấn nút + để thêm chi nhánh mới</Text>
          </View>
        ) : (
          filteredBranches.map((branch) => (
            <View key={branch.id} style={styles.branchCard}>
              {/* Branch Image */}
              <Image 
                source={{ 
                  uri: branch.image_url || 'https://via.placeholder.com/300x120/E8622A/FFFFFF?text=Chi+Nhanh' 
                }} 
                style={styles.branchImage}
                defaultSource={{ uri: 'https://via.placeholder.com/300x120/E8622A/FFFFFF?text=Chi+Nhanh' }}
                onError={() => {
                  console.log('Failed to load image for branch:', branch.name);
                }}
                resizeMode="cover"
              />
              
              {/* Branch Info */}
              <View style={styles.branchInfo}>
                <View style={styles.branchHeader}>
                  <Text style={styles.branchName}>{branch.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    branch.is_active ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      branch.is_active ? styles.activeText : styles.inactiveText
                    ]}>
                      {branch.is_active ? 'Hoạt động' : 'Tạm đóng'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.branchDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="map-pin" size={14} color="#666" />
                    <Text style={styles.detailText}>{branch.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="phone" size={14} color="#666" />
                    <Text style={styles.detailText}>{branch.phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="user" size={14} color="#666" />
                    <Text style={styles.detailText}>QL: {branch.manager_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="clock" size={14} color="#666" />
                    <Text style={styles.detailText}>
                      {branch.opening_hours.open} - {branch.opening_hours.close}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    branch.is_active ? styles.deactivateButton : styles.activateButton,
                    togglingStatus === branch.id && { opacity: 0.5 }
                  ]}
                  onPress={() => toggleBranchStatus(branch.id)}
                  disabled={togglingStatus === branch.id}
                >
                  <Icon 
                    name={togglingStatus === branch.id ? "loader" : (branch.is_active ? "pause" : "play")} 
                    size={16} 
                    color="#fff" 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(branch)}
                >
                  <Icon name="edit" size={16} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton, 
                    styles.deleteButton,
                    deletingBranch === branch.id && { opacity: 0.5 }
                  ]}
                  onPress={() => deleteBranch(branch.id)}
                  disabled={deletingBranch === branch.id}
                >
                  <Icon 
                    name={deletingBranch === branch.id ? "loader" : "trash"} 
                    size={16} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {/* Add Branch Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Thêm chi nhánh</Text>
            <TouchableOpacity onPress={handleSaveBranch} disabled={savingBranch}>
              <Text style={[styles.modalSaveText, savingBranch && { opacity: 0.5 }]}>
                {savingBranch ? 'Đang lưu...' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Branch Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên chi nhánh *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên chi nhánh"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Địa chỉ *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Nhập địa chỉ chi nhánh"
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số điện thoại *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập email chi nhánh"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Manager Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên quản lý</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên quản lý"
                value={formData.manager_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, manager_name: text }))}
              />
            </View>

            {/* Manager Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>SĐT quản lý</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập SĐT quản lý"
                value={formData.manager_phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, manager_phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            {/* Opening Hours */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giờ hoạt động</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Mở cửa</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="08:00"
                    value={formData.opening_hours.open}
                    onChangeText={(text) => setFormData(prev => ({
                      ...prev,
                      opening_hours: { ...prev.opening_hours, open: text }
                    }))}
                  />
                </View>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Đóng cửa</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="22:00"
                    value={formData.opening_hours.close}
                    onChangeText={(text) => setFormData(prev => ({
                      ...prev,
                      opening_hours: { ...prev.opening_hours, close: text }
                    }))}
                  />
                </View>
              </View>
            </View>

            {/* Image Upload Section */}
            <ImageUploadSection />

            {/* Active Status */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Trạng thái hoạt động</Text>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value }))}
                  trackColor={{ false: '#ccc', true: '#27AE60' }}
                  thumbColor={formData.is_active ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Branch Modal */}
      <Modal
        visible={editingBranch !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingBranch(null)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sửa chi nhánh</Text>
            <TouchableOpacity onPress={handleSaveBranch} disabled={savingBranch}>
              <Text style={[styles.modalSaveText, savingBranch && { opacity: 0.5 }]}>
                {savingBranch ? 'Đang lưu...' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Branch Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên chi nhánh *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên chi nhánh"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Địa chỉ *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Nhập địa chỉ chi nhánh"
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Số điện thoại *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập email chi nhánh"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Manager Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên quản lý</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên quản lý"
                value={formData.manager_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, manager_name: text }))}
              />
            </View>

            {/* Manager Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>SĐT quản lý</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập SĐT quản lý"
                value={formData.manager_phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, manager_phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            {/* Opening Hours */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giờ hoạt động</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Mở cửa</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="08:00"
                    value={formData.opening_hours.open}
                    onChangeText={(text) => setFormData(prev => ({
                      ...prev,
                      opening_hours: { ...prev.opening_hours, open: text }
                    }))}
                  />
                </View>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Đóng cửa</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="22:00"
                    value={formData.opening_hours.close}
                    onChangeText={(text) => setFormData(prev => ({
                      ...prev,
                      opening_hours: { ...prev.opening_hours, close: text }
                    }))}
                  />
                </View>
              </View>
            </View>

            {/* Image Upload Section */}
            <ImageUploadSection />

            {/* Active Status */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Trạng thái hoạt động</Text>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value }))}
                  trackColor={{ false: '#ccc', true: '#27AE60' }}
                  thumbColor={formData.is_active ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 60,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  branchesList: {
    flex: 1,
    paddingHorizontal: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  branchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  branchImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  branchInfo: {
    padding: 16,
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  branchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#27AE60',
  },
  inactiveText: {
    color: '#E74C3C',
  },
  branchDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  activateButton: {
    backgroundColor: '#27AE60',
  },
  deactivateButton: {
    backgroundColor: '#95A5A6',
  },
  editButton: {
    backgroundColor: '#3498DB',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#E8622A',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    resizeMode: 'cover',
  },
  imagePreviewContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E8622A',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#E8622A',
    fontWeight: '500',
    marginLeft: 8,
  },
  urlInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  urlInputButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default OwnerBranchManagementScreen;
