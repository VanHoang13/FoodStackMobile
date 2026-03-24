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
  Switch,
  Image,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import InventoryManagementService, { InventoryItem, InventoryStats } from '../services/inventoryManagementService';
import ImageUploadService from '../services/imageUploadService';

type StaffInventoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffInventory'>;

interface Props {
  navigation: StaffInventoryScreenNavigationProp;
}

const INVENTORY_CATEGORIES = {
  INGREDIENTS: { icon: 'package', color: '#3498DB', label: 'Nguyên liệu' },
  BEVERAGES: { icon: 'coffee', color: '#E67E22', label: 'Đồ uống' },
  SUPPLIES: { icon: 'box', color: '#9B59B6', label: 'Vật tư' },
  CONDIMENTS: { icon: 'droplet', color: '#27AE60', label: 'Gia vị' },
};

const STATUS_COLORS = {
  IN_STOCK: '#27AE60',
  LOW_STOCK: '#F39C12',
  OUT_OF_STOCK: '#E74C3C',
  EXPIRED: '#8E44AD',
};

const StaffInventoryScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'INGREDIENTS' as InventoryItem['category'],
    description: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: '',
    price: '',
    supplier: '',
    barcode: '',
    expiryDate: '',
    location: '',
    image_url: '',
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      
      // Initialize mock data if needed
      await InventoryManagementService.initializeMockData();
      
      const [inventoryData, statsData] = await Promise.all([
        InventoryManagementService.getInventoryItems(),
        InventoryManagementService.getInventoryStats()
      ]);
      
      setInventory(inventoryData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading inventory:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu kho');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInventory();
  };
  const getFilteredInventory = () => {
    let filtered = inventory;
    
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setUpdateQuantity(item.currentStock.toString());
    setShowUpdateModal(true);
  };

  const submitStockUpdate = async () => {
    if (!selectedItem || !updateQuantity.trim()) return;

    const newQuantity = parseInt(updateQuantity);
    if (isNaN(newQuantity) || newQuantity < 0) {
      Alert.alert('Lỗi', 'Số lượng không hợp lệ');
      return;
    }

    try {
      const updatedItem = await InventoryManagementService.updateStock(
        selectedItem.id,
        newQuantity,
        'Cập nhật tồn kho từ app',
        user?.fullName || 'Nhân viên'
      );

      if (updatedItem) {
        setInventory(prev => prev.map(item => 
          item.id === selectedItem.id ? updatedItem : item
        ));
        
        // Reload stats
        const newStats = await InventoryManagementService.getInventoryStats();
        setStats(newStats);
      }

      setShowUpdateModal(false);
      setSelectedItem(null);
      setUpdateQuantity('');
      
      Alert.alert('Thành công', 'Đã cập nhật số lượng tồn kho');
    } catch (error) {
      console.error('Error updating stock:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật tồn kho');
    }
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'INGREDIENTS',
      description: '',
      currentStock: '',
      minStock: '',
      maxStock: '',
      unit: '',
      price: '',
      supplier: '',
      barcode: '',
      expiryDate: '',
      location: '',
      image_url: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingItem(null);
    setShowAddModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      unit: item.unit,
      price: item.price?.toString() || '',
      supplier: item.supplier || '',
      barcode: item.barcode || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      location: item.location || '',
      image_url: item.image_url || '',
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!formData.currentStock.trim() || isNaN(Number(formData.currentStock))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng hiện tại hợp lệ');
      return;
    }
    if (!formData.minStock.trim() || isNaN(Number(formData.minStock))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng tối thiểu hợp lệ');
      return;
    }
    if (!formData.maxStock.trim() || isNaN(Number(formData.maxStock))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số lượng tối đa hợp lệ');
      return;
    }
    if (!formData.unit.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đơn vị');
      return;
    }

    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        maxStock: Number(formData.maxStock),
        unit: formData.unit,
        price: formData.price ? Number(formData.price) : undefined,
        supplier: formData.supplier,
        barcode: formData.barcode,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
        location: formData.location,
        image_url: formData.image_url,
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.fullName || 'Nhân viên',
      };

      if (editingItem) {
        // Update existing item
        const updatedItem = await InventoryManagementService.updateItem(editingItem.id, itemData);
        if (updatedItem) {
          setInventory(prev =>
            prev.map(item => item.id === editingItem.id ? updatedItem : item)
          );
          Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
        }
      } else {
        // Create new item
        const newItem = await InventoryManagementService.createItem(itemData);
        if (newItem) {
          setInventory(prev => [...prev, newItem]);
          Alert.alert('Thành công', 'Đã thêm sản phẩm mới');
        }
      }
      
      // Reload stats
      const newStats = await InventoryManagementService.getInventoryStats();
      setStats(newStats);
      
      setShowAddModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm');
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có chắc chắn muốn xóa "${item.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await InventoryManagementService.deleteItem(item.id);
              if (success) {
                setInventory(prev => prev.filter(i => i.id !== item.id));
                
                // Reload stats
                const newStats = await InventoryManagementService.getInventoryStats();
                setStats(newStats);
                
                Alert.alert('Thành công', 'Đã xóa sản phẩm');
              }
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  // Image upload functions
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

  const takePhoto = async () => {
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
      const uploadResult = await ImageUploadService.uploadImage(imageUri, 'inventory');
      
      if (uploadResult.success && uploadResult.url) {
        setFormData(prev => ({ ...prev, image_url: uploadResult.url }));
        Alert.alert('Thành công', 'Đã tải ảnh lên thành công');
      } else {
        console.error('Upload failed:', uploadResult.error);
        Alert.alert(
          'Lỗi tải ảnh',
          uploadResult.error || 'Không thể tải ảnh lên',
          [
            { text: 'Thử lại', onPress: () => uploadImageToCloudinary(imageUri) },
            { text: 'Nhập URL thay thế', onPress: showUrlInputDialog }
          ]
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Lỗi tải ảnh',
        'Không thể tải ảnh lên. Vui lòng thử lại hoặc nhập URL.',
        [
          { text: 'Thử lại', onPress: () => uploadImageToCloudinary(imageUri) },
          { text: 'Nhập URL', onPress: showUrlInputDialog }
        ]
      );
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Chọn ảnh sản phẩm',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thư viện', onPress: pickImageFromGallery },
        { text: 'Chụp ảnh', onPress: takePhoto },
        { text: 'Nhập URL', onPress: showUrlInputDialog }
      ]
    );
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

  const handleResetData = () => {
    Alert.alert(
      'Khôi phục dữ liệu mẫu',
      'Bạn có chắc chắn muốn khôi phục dữ liệu kho mẫu? Tất cả dữ liệu hiện tại sẽ bị thay thế.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await InventoryManagementService.resetMockData();
              await loadInventory();
              Alert.alert('Thành công', 'Đã khôi phục dữ liệu kho mẫu');
            } catch (error) {
              console.error('Error resetting inventory data:', error);
              Alert.alert('Lỗi', 'Không thể khôi phục dữ liệu kho');
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getStatusText = (status: InventoryItem['status']) => {
    switch (status) {
      case 'IN_STOCK': return 'Còn hàng';
      case 'LOW_STOCK': return 'Sắp hết';
      case 'OUT_OF_STOCK': return 'Hết hàng';
      case 'EXPIRED': return 'Hết hạn';
      default: return 'Không xác định';
    }
  };

  const filteredInventory = getFilteredInventory();

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
        
        <Text style={styles.headerTitle}>Quản lý kho</Text>

        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleResetData}
        >
          <Icon name="refresh" size={18} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={openAddModal}
        >
          <Icon name="plus" size={20} color="#E8622A" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Tổng sản phẩm</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.IN_STOCK }]}>
              {stats.inStock}
            </Text>
            <Text style={styles.statLabel}>Còn hàng</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.LOW_STOCK }]}>
              {stats.lowStock}
            </Text>
            <Text style={styles.statLabel}>Sắp hết</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.OUT_OF_STOCK }]}>
              {stats.outOfStock}
            </Text>
            <Text style={styles.statLabel}>Hết hàng</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: STATUS_COLORS.EXPIRED }]}>
              {stats.expiringSoon}
            </Text>
            <Text style={styles.statLabel}>Sắp hết hạn</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#E8622A' }]}>
              {formatCurrency(stats.totalValue)}
            </Text>
            <Text style={styles.statLabel}>Tổng giá trị</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'ALL', label: 'Tất cả', count: inventory.length },
            ...Object.entries(INVENTORY_CATEGORIES).map(([key, value]) => ({
              key,
              label: value.label,
              count: inventory.filter(item => item.category === key).length,
            })),
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedCategory === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === filter.key && styles.filterButtonTextActive,
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Inventory List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : filteredInventory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có sản phẩm nào'}
            </Text>
          </View>
        ) : (
          <View style={styles.inventoryList}>
            {filteredInventory.map((item) => (
              <View key={item.id} style={styles.inventoryCard}>
                {/* Item Image */}
                {item.image_url && (
                  <Image 
                    source={{ uri: item.image_url }} 
                    style={styles.itemImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/300x120/E8622A/FFFFFF?text=San+Pham' }}
                    onError={() => {
                      console.log('Failed to load image for item:', item.name);
                    }}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemLeft}>
                      <View style={[
                        styles.categoryIcon,
                        { backgroundColor: INVENTORY_CATEGORIES[item.category].color }
                      ]}>
                        <Icon 
                          name={INVENTORY_CATEGORIES[item.category].icon} 
                          size={16} 
                          color="#fff" 
                        />
                      </View>
                      
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemCategory}>
                          {INVENTORY_CATEGORIES[item.category].label}
                        </Text>
                        {item.description && (
                          <Text style={styles.itemDescription} numberOfLines={2}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.itemRight}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: STATUS_COLORS[item.status] }
                      ]}>
                        <Text style={styles.statusText}>
                          {getStatusText(item.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.stockInfo}>
                    <View style={styles.stockNumbers}>
                      <Text style={styles.currentStock}>
                        {item.currentStock} {item.unit}
                      </Text>
                      <Text style={styles.stockRange}>
                        Min: {item.minStock} | Max: {item.maxStock}
                      </Text>
                    </View>
                    
                    <View style={styles.stockBar}>
                      <View 
                        style={[
                          styles.stockProgress,
                          { 
                            width: `${getStockPercentage(item.currentStock, item.maxStock)}%`,
                            backgroundColor: STATUS_COLORS[item.status],
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  {/* Additional Info */}
                  <View style={styles.additionalInfo}>
                    {item.supplier && (
                      <View style={styles.infoRow}>
                        <Icon name="truck" size={12} color="#666" />
                        <Text style={styles.infoText}>NCC: {item.supplier}</Text>
                      </View>
                    )}
                    {item.location && (
                      <View style={styles.infoRow}>
                        <Icon name="map-pin" size={12} color="#666" />
                        <Text style={styles.infoText}>Vị trí: {item.location}</Text>
                      </View>
                    )}
                    {item.expiryDate && (
                      <View style={styles.infoRow}>
                        <Icon name="calendar" size={12} color="#666" />
                        <Text style={styles.infoText}>
                          HSD: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {item.price && (
                    <View style={styles.priceInfo}>
                      <Text style={styles.priceLabel}>Giá:</Text>
                      <Text style={styles.priceValue}>
                        {formatCurrency(item.price)}/{item.unit}
                      </Text>
                    </View>
                  )}

                  <View style={styles.itemFooter}>
                    <Text style={styles.lastUpdated}>
                      Cập nhật: {formatTime(item.lastUpdated)}
                    </Text>
                    <Text style={styles.updatedBy}>
                      Bởi: {item.updatedBy}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.updateButton]}
                      onPress={() => handleUpdateStock(item)}
                    >
                      <Icon name="package" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Cập nhật</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => openEditModal(item)}
                    >
                      <Icon name="edit" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Sửa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Icon name="trash" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              setEditingItem(null);
            }}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </Text>
            <TouchableOpacity onPress={handleSaveItem}>
              <Text style={styles.modalSaveText}>Lưu</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên sản phẩm"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            {/* Category Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Danh mục *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                {Object.entries(INVENTORY_CATEGORIES).map(([key, value]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.categoryChip,
                      formData.category === key && styles.categoryChipSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category: key as InventoryItem['category'] }))}
                  >
                    <Icon name={value.icon} size={16} color={formData.category === key ? '#fff' : value.color} />
                    <Text style={[
                      styles.categoryChipText,
                      formData.category === key && styles.categoryChipTextSelected
                    ]}>
                      {value.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mô tả</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Nhập mô tả sản phẩm"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Stock Inputs */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Số lượng hiện tại *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  value={formData.currentStock}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, currentStock: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Đơn vị *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="kg, lon, gói..."
                  value={formData.unit}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Tối thiểu *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  value={formData.minStock}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, minStock: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Tối đa *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  value={formData.maxStock}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, maxStock: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Price and Supplier */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Giá (VNĐ)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Nhà cung cấp</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Tên nhà cung cấp"
                  value={formData.supplier}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, supplier: text }))}
                />
              </View>
            </View>

            {/* Barcode and Location */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Mã vạch</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Mã vạch sản phẩm"
                  value={formData.barcode}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, barcode: text }))}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Vị trí lưu trữ</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Kho A1, Tủ lạnh B2..."
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                />
              </View>
            </View>

            {/* Expiry Date */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ngày hết hạn</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                value={formData.expiryDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, expiryDate: text }))}
              />
            </View>

            {/* Image Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hình ảnh sản phẩm</Text>
              
              {/* Upload Buttons */}
              <View style={styles.uploadButtonsContainer}>
                <TouchableOpacity
                  style={[styles.uploadButton, uploadingImage && { opacity: 0.5 }]}
                  onPress={showImageOptions}
                  disabled={uploadingImage}
                >
                  <Icon name={uploadingImage ? "loader" : "camera"} size={20} color="#E8622A" />
                  <Text style={styles.uploadButtonText}>
                    {uploadingImage ? 'Đang tải...' : 'Chọn ảnh'}
                  </Text>
                </TouchableOpacity>
              </View>

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
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Update Stock Modal */}
      {showUpdateModal && selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật tồn kho</Text>
            <Text style={styles.modalSubtitle}>{selectedItem.name}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số lượng hiện tại:</Text>
              <TextInput
                style={styles.quantityInput}
                value={updateQuantity}
                onChangeText={setUpdateQuantity}
                keyboardType="numeric"
                placeholder="Nhập số lượng"
              />
              <Text style={styles.unitLabel}>{selectedItem.unit}</Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowUpdateModal(false);
                  setSelectedItem(null);
                  setUpdateQuantity('');
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={submitStockUpdate}
              >
                <Text style={styles.confirmButtonText}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
    marginLeft: 8,
  },
  
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
    marginBottom: 8,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
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
  
  inventoryList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  inventoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },

  itemImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },

  itemContent: {
    padding: 16,
  },

  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    lineHeight: 16,
  },

  additionalInfo: {
    marginVertical: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },

  updateButton: {
    backgroundColor: '#3498DB',
  },

  editButton: {
    backgroundColor: '#F39C12',
  },

  deleteButton: {
    backgroundColor: '#E74C3C',
  },

  // Modal styles
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

  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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

  categoryPicker: {
    marginTop: 8,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },

  categoryChipSelected: {
    backgroundColor: '#E8622A',
    borderColor: '#E8622A',
  },

  categoryChipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },

  categoryChipTextSelected: {
    color: '#fff',
  },

  // Upload styles
  uploadButtonsContainer: {
    marginBottom: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  uploadButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#E8622A',
    fontWeight: '500',
  },

  imagePreviewContainer: {
    position: 'relative',
    marginTop: 8,
  },

  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
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

  imagePlaceholder: {
    height: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  itemLeft: {
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
  
  itemInfo: {
    flex: 1,
  },
  
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  itemCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  itemRight: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  
  stockInfo: {
    marginBottom: 12,
  },
  
  stockNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  currentStock: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  
  stockRange: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  stockBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  
  stockProgress: {
    height: '100%',
    borderRadius: 3,
  },
  
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E8622A',
  },
  
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  lastUpdated: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  
  updatedBy: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '80%',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  inputContainer: {
    marginBottom: 24,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  quantityInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  unitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E8622A',
    alignItems: 'center',
  },
  
  confirmButtonText: {
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
  
  navText: {
    fontSize: 10,
    color: '#aaa',
    fontWeight: '700',
  },
});

export default StaffInventoryScreen;