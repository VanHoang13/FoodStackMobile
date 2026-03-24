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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import MenuManagementService, { MenuCategory, MenuItem } from '../services/menuManagementService';
import ImageUploadService from '../services/imageUploadService';

type OwnerMenuManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerMenuManagement'>;

interface Props {
  navigation: OwnerMenuManagementScreenNavigationProp;
}

const OwnerMenuManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState<boolean | null>(null);
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true,
    is_featured: false,
    image_url: '',
  });
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    totalItems: 0,
    availableItems: 0,
    featuredItems: 0,
    avgPrice: 0
  });

  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      // Initialize mock data if needed
      await MenuManagementService.initializeMockData();
      
      const [categoriesData, itemsData, statsData] = await Promise.all([
        MenuManagementService.getCategories(),
        MenuManagementService.getItems(),
        MenuManagementService.getMenuStats()
      ]);
      
      setCategories(categoriesData);
      setItems(itemsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading menu data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu menu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMenuData();
  };

  const getFilteredItems = () => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    // Availability filter
    if (filterAvailable !== null) {
      filtered = filtered.filter(item => item.is_available === filterAvailable);
    }

    // Featured filter
    if (filterFeatured !== null) {
      filtered = filtered.filter(item => item.is_featured === filterFeatured);
    }

    return filtered;
  };

  const toggleItemAvailability = async (itemId: string) => {
    try {
      const updatedItem = await MenuManagementService.toggleItemAvailability(itemId);
      if (updatedItem) {
        setItems(prevItems =>
          prevItems.map(item => item.id === itemId ? updatedItem : item)
        );
        // Update stats
        loadMenuData();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái món ăn');
    }
  };

  const toggleItemFeatured = async (itemId: string) => {
    try {
      const updatedItem = await MenuManagementService.toggleItemFeatured(itemId);
      if (updatedItem) {
        setItems(prevItems =>
          prevItems.map(item => item.id === itemId ? updatedItem : item)
        );
        loadMenuData();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái nổi bật');
    }
  };

  const deleteItem = async (itemId: string, itemName: string) => {
    Alert.alert(
      'Xóa món ăn',
      `Bạn có chắc chắn muốn xóa "${itemName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await MenuManagementService.deleteItem(itemId);
              if (success) {
                setItems(prevItems => prevItems.filter(item => item.id !== itemId));
                loadMenuData();
                Alert.alert('Thành công', 'Đã xóa món ăn');
              }
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Lỗi', 'Không thể xóa món ăn');
            }
          }
        }
      ]
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return Math.round(price / 1000000) + 'M';
    } else if (price >= 1000) {
      return Math.round(price / 1000) + 'K';
    }
    return price + 'đ';
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_available: true,
      is_featured: false,
      image_url: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id,
      is_available: item.is_available,
      is_featured: item.is_featured,
      image_url: item.image_url || '',
    });
    setEditingItem(item);
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món ăn');
      return;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
      return;
    }
    if (!formData.category_id) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    try {
      const itemData = {
        ...formData,
        price: Number(formData.price),
        sort_order: editingItem ? editingItem.sort_order : items.length + 1,
      };

      if (editingItem) {
        // Update existing item
        const updatedItem = await MenuManagementService.updateItem(editingItem.id, itemData);
        if (updatedItem) {
          setItems(prevItems =>
            prevItems.map(item => item.id === editingItem.id ? updatedItem : item)
          );
          Alert.alert('Thành công', 'Đã cập nhật món ăn');
        }
        setEditingItem(null);
      } else {
        // Create new item
        const newItem = await MenuManagementService.createItem(itemData);
        if (newItem) {
          setItems(prevItems => [...prevItems, newItem]);
          Alert.alert('Thành công', 'Đã thêm món ăn mới');
        }
        setShowAddModal(false);
      }
      
      // Reload stats
      loadMenuData();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Lỗi', 'Không thể lưu món ăn');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Không xác định';
  };

  const handleResetData = () => {
    Alert.alert(
      'Khôi phục dữ liệu mẫu',
      'Chọn loại dữ liệu muốn khôi phục:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: '3 món (Minimal)',
          onPress: async () => {
            try {
              setLoading(true);
              await MenuManagementService.forceResetWithMinimalData();
              await loadMenuData();
              Alert.alert('Thành công', 'Đã khôi phục với 3 món ăn');
            } catch (error) {
              console.error('Error resetting to minimal data:', error);
              Alert.alert('Lỗi', 'Không thể khôi phục dữ liệu');
            }
          }
        },
        {
          text: '18 món (Full)',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await MenuManagementService.resetMockData();
              await loadMenuData();
              Alert.alert('Thành công', 'Đã khôi phục dữ liệu đầy đủ');
            } catch (error) {
              console.error('Error resetting menu data:', error);
              Alert.alert('Lỗi', 'Không thể khôi phục dữ liệu menu');
            }
          }
        }
      ]
    );
  };

  const handleDebugData = async () => {
    try {
      await MenuManagementService.debugMenuData();
      const stats = await MenuManagementService.getMenuStats();
      Alert.alert(
        'Debug Info',
        `Tổng món: ${stats.totalItems}\nCó sẵn: ${stats.availableItems}\nNổi bật: ${stats.featuredItems}\nDanh mục: ${stats.totalCategories}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin debug');
    }
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
      const uploadResult = await ImageUploadService.uploadImage(imageUri, 'menu-items');
      
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
      'Chọn ảnh món ăn',
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

  const filteredItems = getFilteredItems();

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
        <Text style={styles.headerTitle}>Quản lý Menu</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetData}
          >
            <Icon name="refresh" size={18} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.debugButton}
            onPress={handleDebugData}
          >
            <Icon name="info" size={16} color="#666" />
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
            <Text 
              style={styles.statValue} 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {stats.totalItems}
            </Text>
            <Text 
              style={styles.statLabel} 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Tổng món
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text 
              style={[styles.statValue, { color: '#27AE60' }]} 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {stats.availableItems}
            </Text>
            <Text 
              style={styles.statLabel} 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Có sẵn
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text 
              style={[styles.statValue, { color: '#F39C12' }]} 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {stats.featuredItems}
            </Text>
            <Text 
              style={styles.statLabel} 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Nổi bật
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text 
              style={[styles.statValue, { color: '#3498DB' }]} 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {formatPrice(stats.avgPrice)}
            </Text>
            <Text 
              style={styles.statLabel} 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Giá TB
            </Text>
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="filter" size={20} color="#E8622A" />
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === 'all' && styles.filterChipActive
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === 'all' && styles.filterChipTextActive
              ]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterChip,
                  selectedCategory === category.id && styles.filterChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === category.id && styles.filterChipTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.statusFilters}>
            <TouchableOpacity
              style={[
                styles.statusFilter,
                filterAvailable === true && styles.statusFilterActive
              ]}
              onPress={() => setFilterAvailable(filterAvailable === true ? null : true)}
            >
              <Text style={[
                styles.statusFilterText,
                filterAvailable === true && styles.statusFilterTextActive
              ]}>
                Có sẵn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusFilter,
                filterFeatured === true && styles.statusFilterActive
              ]}
              onPress={() => setFilterFeatured(filterFeatured === true ? null : true)}
            >
              <Text style={[
                styles.statusFilterText,
                filterFeatured === true && styles.statusFilterTextActive
              ]}>
                Nổi bật
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu Items List */}
      <ScrollView
        style={styles.itemsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="restaurant" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy món ăn nào</Text>
            <Text style={styles.emptySubText}>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Thêm món ăn mới để bắt đầu'}
            </Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              {/* Item Image */}
              <Image 
                source={{ 
                  uri: item.image_url || 'https://via.placeholder.com/300x120/E8622A/FFFFFF?text=Mon+An' 
                }} 
                style={styles.itemImage}
                defaultSource={{ uri: 'https://via.placeholder.com/300x120/E8622A/FFFFFF?text=Mon+An' }}
                onError={() => {
                  console.log('Failed to load image for item:', item.name);
                }}
                resizeMode="cover"
              />
              
              {/* Item Info */}
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.statusBadges}>
                    {item.is_featured && (
                      <View style={[styles.badge, styles.featuredBadge]}>
                        <Icon name="star" size={12} color="#F39C12" />
                        <Text style={styles.badgeText}>Nổi bật</Text>
                      </View>
                    )}
                    <View style={[
                      styles.badge,
                      item.is_available ? styles.availableBadge : styles.unavailableBadge
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        item.is_available ? styles.availableBadgeText : styles.unavailableBadgeText
                      ]}>
                        {item.is_available ? 'Có sẵn' : 'Hết hàng'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="tag" size={14} color="#666" />
                    <Text style={styles.detailText}>{getCategoryName(item.category_id)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="dollar-sign" size={14} color="#666" />
                    <Text style={styles.detailText}>{formatPrice(item.price)}</Text>
                  </View>
                  {item.preparation_time && (
                    <View style={styles.detailRow}>
                      <Icon name="clock" size={14} color="#666" />
                      <Text style={styles.detailText}>{item.preparation_time} phút</Text>
                    </View>
                  )}
                  {item.description && (
                    <View style={styles.detailRow}>
                      <Icon name="info" size={14} color="#666" />
                      <Text style={styles.detailText} numberOfLines={2}>{item.description}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.is_available ? styles.toggleOffButton : styles.toggleOnButton
                  ]}
                  onPress={() => toggleItemAvailability(item.id)}
                >
                  <Icon 
                    name={item.is_available ? "eye-off" : "eye"} 
                    size={16} 
                    color="#fff" 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.is_featured ? styles.unfeatureButton : styles.featureButton
                  ]}
                  onPress={() => toggleItemFeatured(item.id)}
                >
                  <Icon 
                    name={item.is_featured ? "star-off" : "star"} 
                    size={16} 
                    color="#fff" 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(item)}
                >
                  <Icon name="edit" size={16} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteItem(item.id, item.name)}
                >
                  <Icon name="trash" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Item Modal */}
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
            <Text style={styles.modalTitle}>Thêm món mới</Text>
            <TouchableOpacity onPress={handleSaveItem}>
              <Text style={styles.modalSaveText}>Lưu</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên món ăn *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên món ăn"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            {/* Description Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mô tả</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Nhập mô tả món ăn"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Price Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá (VNĐ) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập giá món ăn"
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
              />
            </View>

            {/* Category Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Danh mục *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      formData.category_id === category.id && styles.categoryChipSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category_id: category.id }))}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      formData.category_id === category.id && styles.categoryChipTextSelected
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Image Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hình ảnh món ăn</Text>
              
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

            {/* Switches */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Có sẵn</Text>
                <Switch
                  value={formData.is_available}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_available: value }))}
                  trackColor={{ false: '#ccc', true: '#27AE60' }}
                  thumbColor={formData.is_available ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Món nổi bật</Text>
                <Switch
                  value={formData.is_featured}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_featured: value }))}
                  trackColor={{ false: '#ccc', true: '#F39C12' }}
                  thumbColor={formData.is_featured ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        visible={editingItem !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingItem(null)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sửa món ăn</Text>
            <TouchableOpacity onPress={handleSaveItem}>
              <Text style={styles.modalSaveText}>Lưu</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tên món ăn *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên món ăn"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>

            {/* Description Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mô tả</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Nhập mô tả món ăn"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Price Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Giá (VNĐ) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập giá món ăn"
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                keyboardType="numeric"
              />
            </View>

            {/* Category Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Danh mục *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      formData.category_id === category.id && styles.categoryChipSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category_id: category.id }))}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      formData.category_id === category.id && styles.categoryChipTextSelected
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Image Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hình ảnh món ăn</Text>
              
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

            {/* Switches */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Có sẵn</Text>
                <Switch
                  value={formData.is_available}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_available: value }))}
                  trackColor={{ false: '#ccc', true: '#27AE60' }}
                  thumbColor={formData.is_available ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.formLabel}>Món nổi bật</Text>
                <Switch
                  value={formData.is_featured}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, is_featured: value }))}
                  trackColor={{ false: '#ccc', true: '#F39C12' }}
                  thumbColor={formData.is_featured ? '#fff' : '#f4f3f4'}
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
  addButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    padding: 8,
    marginRight: 8,
  },
  
  debugButton: {
    padding: 8,
    marginRight: 8,
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
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
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
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterChipActive: {
    backgroundColor: '#E8622A',
    borderColor: '#E8622A',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  statusFilters: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statusFilter: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusFilterActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#666',
  },
  statusFilterTextActive: {
    color: '#fff',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  itemDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  statusBadges: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  featuredBadge: {
    backgroundColor: '#FFF3E0',
  },
  availableBadge: {
    backgroundColor: '#E8F5E8',
  },
  unavailableBadge: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  availableBadgeText: {
    color: '#27AE60',
  },
  unavailableBadgeText: {
    color: '#E74C3C',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleOnButton: {
    backgroundColor: '#27AE60',
  },
  toggleOffButton: {
    backgroundColor: '#95A5A6',
  },
  featureButton: {
    backgroundColor: '#F39C12',
  },
  unfeatureButton: {
    backgroundColor: '#95A5A6',
  },
  editButton: {
    backgroundColor: '#3498DB',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
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
  categoryPicker: {
    marginTop: 8,
  },
  categoryChip: {
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
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalPlaceholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default OwnerMenuManagementScreen;