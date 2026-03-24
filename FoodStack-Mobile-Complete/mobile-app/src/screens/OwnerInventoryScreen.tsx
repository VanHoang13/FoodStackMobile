import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  Switch,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import InventoryManagementService, { InventoryItem, InventoryStats } from '../services/inventoryManagementService';
import ImageUploadService from '../services/imageUploadService';

type OwnerInventoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerInventory'>;

interface Props {
  navigation: OwnerInventoryScreenNavigationProp;
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

const OwnerInventoryScreen: React.FC<Props> = ({ navigation }) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
    totalValue: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState<'all' | InventoryItem['category']>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      // Initialize mock data if needed
      await InventoryManagementService.initializeMockData();
      
      const [inventoryData, statsData] = await Promise.all([
        InventoryManagementService.getInventoryItems(),
        InventoryManagementService.getInventoryStats()
      ]);
      
      setInventoryItems(inventoryData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu kho');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventoryData();
    setRefreshing(false);
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

  const handleAddItem = () => {
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
        updatedBy: 'Owner',
      };

      if (editingItem) {
        // Update existing item
        const updatedItem = await InventoryManagementService.updateItem(editingItem.id, itemData);
        if (updatedItem) {
          setInventoryItems(prev =>
            prev.map(item => item.id === editingItem.id ? updatedItem : item)
          );
          Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
        }
      } else {
        // Create new item
        const newItem = await InventoryManagementService.createItem(itemData);
        if (newItem) {
          setInventoryItems(prev => [...prev, newItem]);
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

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setUpdateQuantity(item.currentStock.toString());
    setShowUpdateModal(true);
  };

  const submitStockUpdate = async () => {
    if (!selectedItem || !updateQuantity.trim()) return;

    const newQuantity = parseFloat(updateQuantity);
    if (isNaN(newQuantity) || newQuantity < 0) {
      Alert.alert('Lỗi', 'Số lượng không hợp lệ');
      return;
    }

    try {
      const updatedItem = await InventoryManagementService.updateStock(
        selectedItem.id,
        newQuantity,
        'Cập nhật tồn kho từ Owner app',
        'Owner'
      );

      if (updatedItem) {
        setInventoryItems(prev => prev.map(item => 
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

  const handleDeleteItem = (item: InventoryItem) => {
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
                setInventoryItems(prev => prev.filter(i => i.id !== item.id));
                
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
              setRefreshing(true);
              await InventoryManagementService.resetMockData();
              await loadInventoryData();
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

  const getFilteredItems = () => {
    let filtered = inventoryItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.status === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getCategoryText = (category: InventoryItem['category']) => {
    return INVENTORY_CATEGORIES[category]?.label || category;
  };

  const getStatusText = (status: InventoryItem['status']) => {
    switch (status) {
      case 'IN_STOCK':
        return 'Còn hàng';
      case 'LOW_STOCK':
        return 'Sắp hết';
      case 'OUT_OF_STOCK':
        return 'Hết hàng';
      case 'EXPIRED':
        return 'Hết hạn';
      default:
        return status;
    }
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    return STATUS_COLORS[status] || '#666';
  };

  const getCategoryIcon = (category: InventoryItem['category']) => {
    return INVENTORY_CATEGORIES[category]?.icon || 'package';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getInventoryStats = () => {
    return {
      total: stats.totalItems,
      inStock: stats.inStock,
      lowStock: stats.lowStock,
      outOfStock: stats.outOfStock,
    };
  };

  const displayStats = getInventoryStats();

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
        <Text style={styles.headerTitle}>Quản lý Kho</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetData}
          >
            <Icon name="refresh" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddItem}
          >
            <Icon name="plus" size={24} color="#FF7A30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
            <Text style={styles.statNumber}>{displayStats.inStock}</Text>
            <Text style={styles.statLabel}>Còn hàng</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
            <Text style={styles.statNumber}>{displayStats.lowStock}</Text>
            <Text style={styles.statLabel}>Sắp hết</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
            <Text style={styles.statNumber}>{displayStats.outOfStock}</Text>
            <Text style={styles.statLabel}>Hết hàng</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#2196F3' }]}>
            <Text style={styles.statNumber}>{displayStats.total}</Text>
            <Text style={styles.statLabel}>Tổng cộng</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm nguyên liệu..."
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {/* Category Filter */}
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedCategory === 'all' && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedCategory === 'all' && styles.activeFilterTabText,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            {Object.entries(INVENTORY_CATEGORIES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterTab,
                  selectedCategory === key && styles.activeFilterTab,
                ]}
                onPress={() => setSelectedCategory(key as InventoryItem['category'])}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedCategory === key && styles.activeFilterTabText,
                  ]}
                >
                  {value.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {/* Status Filter */}
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'all' && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'all' && styles.activeFilterTabText,
                ]}
              >
                Tất cả trạng thái
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'low_stock' && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter('low_stock')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'low_stock' && styles.activeFilterTabText,
                ]}
              >
                Sắp hết
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'out_of_stock' && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter('out_of_stock')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === 'out_of_stock' && styles.activeFilterTabText,
                ]}
              >
                Hết hàng
              </Text>
            </TouchableOpacity>
          </View>
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
        <Animated.View style={[styles.inventoryContainer, { opacity: fadeAnim }]}>
          {getFilteredItems().map((item) => (
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
                  <View style={styles.itemIcon}>
                    <Icon
                      name={getCategoryIcon(item.category)}
                      size={20}
                      color="#FF7A30"
                    />
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{getCategoryText(item.category)}</Text>
                    {item.supplier && (
                      <Text style={styles.itemSupplier}>{item.supplier}</Text>
                    )}
                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                    )}
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={() => handleUpdateStock(item)}
                    >
                      <Icon name="package" size={16} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(item)}
                    >
                      <Icon name="edit" size={16} color="#FF9800" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Icon name="trash-2" size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.stockInfo}>
                    <View style={styles.stockRow}>
                      <Text style={styles.stockLabel}>Tồn kho:</Text>
                      <Text style={[styles.stockValue, { color: getStatusColor(item.status) }]}>
                        {item.currentStock} {item.unit}
                      </Text>
                    </View>
                    <View style={styles.stockRow}>
                      <Text style={styles.stockLabel}>Tối thiểu:</Text>
                      <Text style={styles.stockValue}>{item.minStock} {item.unit}</Text>
                    </View>
                    {item.price && (
                      <View style={styles.stockRow}>
                        <Text style={styles.stockLabel}>Giá:</Text>
                        <Text style={styles.stockValue}>{formatCurrency(item.price)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(item.status) },
                        ]}
                      >
                        {getStatusText(item.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Additional Info */}
                  <View style={styles.additionalInfo}>
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
                          HSD: {formatDate(item.expiryDate)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.stockProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%`,
                            backgroundColor: getStatusColor(item.status),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {item.currentStock}/{item.maxStock} {item.unit}
                    </Text>
                  </View>

                  <Text style={styles.lastUpdated}>
                    Cập nhật: {formatDate(item.lastUpdated)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {getFilteredItems().length === 0 && (
            <View style={styles.emptyState}>
              <Icon name="package" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>Không có nguyên liệu</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim()
                  ? 'Không tìm thấy nguyên liệu phù hợp'
                  : 'Chưa có nguyên liệu nào trong danh mục này'}
              </Text>
              {!searchQuery.trim() && (
                <TouchableOpacity
                  style={styles.addFirstItemButton}
                  onPress={handleAddItem}
                >
                  <LinearGradient
                    colors={['#FF7A30', '#E8622A']}
                    style={styles.addFirstItemGradient}
                  >
                    <Icon name="plus" size={20} color="#fff" />
                    <Text style={styles.addFirstItemText}>Thêm nguyên liệu đầu tiên</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
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
      <Modal
        visible={showUpdateModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.updateModalContent}>
            <Text style={styles.updateModalTitle}>Cập nhật tồn kho</Text>
            {selectedItem && (
              <Text style={styles.updateModalSubtitle}>{selectedItem.name}</Text>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số lượng hiện tại:</Text>
              <TextInput
                style={styles.quantityInput}
                value={updateQuantity}
                onChangeText={setUpdateQuantity}
                keyboardType="numeric"
                placeholder="Nhập số lượng"
              />
              {selectedItem && (
                <Text style={styles.unitLabel}>{selectedItem.unit}</Text>
              )}
            </View>
            
            <View style={styles.updateModalActions}>
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
      </Modal>
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

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resetButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats Styles
  statsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
    marginBottom: 2,
  },

  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },

  // Search Styles
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },

  // Filter Styles
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },

  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },

  activeFilterTab: {
    backgroundColor: '#FF7A30',
  },

  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  activeFilterTabText: {
    color: '#fff',
  },

  // Content Styles
  content: {
    flex: 1,
  },

  inventoryContainer: {
    padding: 20,
  },

  // Inventory Card Styles
  inventoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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

  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
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
    color: '#333',
    marginBottom: 2,
  },

  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  itemSupplier: {
    fontSize: 11,
    color: '#999',
  },

  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },

  updateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Item Details Styles
  itemDetails: {
    gap: 12,
  },

  stockInfo: {
    gap: 6,
  },

  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stockLabel: {
    fontSize: 12,
    color: '#666',
  },

  stockValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  statusContainer: {
    alignItems: 'flex-start',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },

  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  expiryText: {
    fontSize: 11,
    color: '#666',
  },

  stockProgress: {
    gap: 4,
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

  progressText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },

  lastUpdated: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },

  addFirstItemButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },

  addFirstItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },

  addFirstItemText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
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

  // Update Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  updateModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '80%',
  },

  updateModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },

  updateModalSubtitle: {
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

  updateModalActions: {
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
});

export default OwnerInventoryScreen;