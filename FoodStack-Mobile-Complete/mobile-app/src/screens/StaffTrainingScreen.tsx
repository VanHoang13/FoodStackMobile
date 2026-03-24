import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type StaffTrainingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffTraining'>;

interface Props {
  navigation: StaffTrainingScreenNavigationProp;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'SAFETY' | 'SERVICE' | 'TECHNICAL' | 'MANAGEMENT';
  duration: number;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  icon: string;
  color: string;
}

const { width } = Dimensions.get('window');

const StaffTrainingScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'SAFETY' | 'SERVICE' | 'TECHNICAL' | 'MANAGEMENT'>('ALL');

  useEffect(() => {
    loadTrainingModules();
  }, []);

  const loadTrainingModules = async () => {
    try {
      setLoading(true);
      
      // Mock training modules
      const mockModules: TrainingModule[] = [
        {
          id: '1',
          title: 'An toàn thực phẩm cơ bản',
          description: 'Học các nguyên tắc cơ bản về an toàn thực phẩm và vệ sinh',
          category: 'SAFETY',
          duration: 45,
          progress: 100,
          status: 'COMPLETED',
          difficulty: 'BEGINNER',
          icon: 'shield',
          color: '#27AE60',
        },
        {
          id: '2',
          title: 'Kỹ năng phục vụ khách hàng',
          description: 'Phát triển kỹ năng giao tiếp và phục vụ khách hàng chuyên nghiệp',
          category: 'SERVICE',
          duration: 60,
          progress: 75,
          status: 'IN_PROGRESS',
          difficulty: 'INTERMEDIATE',
          icon: 'users',
          color: '#3498DB',
        },
        {
          id: '3',
          title: 'Sử dụng hệ thống POS',
          description: 'Hướng dẫn sử dụng hệ thống thanh toán và quản lý đơn hàng',
          category: 'TECHNICAL',
          duration: 30,
          progress: 0,
          status: 'NOT_STARTED',
          difficulty: 'BEGINNER',
          icon: 'monitor',
          color: '#E67E22',
        },
        {
          id: '4',
          title: 'Quản lý ca làm việc',
          description: 'Kỹ năng lãnh đạo và quản lý nhóm trong ca làm việc',
          category: 'MANAGEMENT',
          duration: 90,
          progress: 0,
          status: 'NOT_STARTED',
          difficulty: 'ADVANCED',
          icon: 'briefcase',
          color: '#9B59B6',
        },
        {
          id: '5',
          title: 'Xử lý tình huống khẩn cấp',
          description: 'Cách xử lý các tình huống khẩn cấp và sự cố trong nhà hàng',
          category: 'SAFETY',
          duration: 40,
          progress: 50,
          status: 'IN_PROGRESS',
          difficulty: 'INTERMEDIATE',
          icon: 'alert-triangle',
          color: '#E74C3C',
        },
      ];
      
      setModules(mockModules);
    } catch (error) {
      console.error('Error loading training modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredModules = () => {
    if (selectedCategory === 'ALL') {
      return modules;
    }
    return modules.filter(module => module.category === selectedCategory);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#27AE60';
      case 'IN_PROGRESS': return '#F39C12';
      default: return '#95A5A6';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return '#27AE60';
      case 'INTERMEDIATE': return '#F39C12';
      case 'ADVANCED': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const filteredModules = getFilteredModules();

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
        
        <Text style={styles.headerTitle}>Đào tạo & Phát triển</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Icon name="book-open" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Progress Summary */}
      <View style={styles.summaryContainer}>
        <LinearGradient
          colors={['#E8622A', '#D35400']}
          style={styles.summaryCard}
        >
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryTitle}>Tiến độ học tập</Text>
              <Text style={styles.summaryProgress}>
                {modules.filter(m => m.status === 'COMPLETED').length}/{modules.length} hoàn thành
              </Text>
            </View>
            
            <View style={styles.summaryRight}>
              <Text style={styles.summaryPercentage}>
                {Math.round((modules.filter(m => m.status === 'COMPLETED').length / modules.length) * 100)}%
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'SAFETY', label: 'An toàn' },
            { key: 'SERVICE', label: 'Dịch vụ' },
            { key: 'TECHNICAL', label: 'Kỹ thuật' },
            { key: 'MANAGEMENT', label: 'Quản lý' },
          ].map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.filterButton,
                selectedCategory === category.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === category.key && styles.filterButtonTextActive,
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Đang tải khóa học...</Text>
          </View>
        ) : filteredModules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>Không có khóa học</Text>
            <Text style={styles.emptyMessage}>
              Không có khóa học nào trong danh mục này
            </Text>
          </View>
        ) : (
          <View style={styles.modulesList}>
            {filteredModules.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleCard}
                onPress={() => {
                  // TODO: Navigate to module details
                  console.log('Open module:', module.title);
                }}
              >
                <View style={styles.moduleHeader}>
                  <View style={styles.moduleLeft}>
                    <View style={[
                      styles.moduleIcon,
                      { backgroundColor: module.color }
                    ]}>
                      <Icon name={module.icon} size={24} color="#fff" />
                    </View>
                    
                    <View style={styles.moduleInfo}>
                      <Text style={styles.moduleTitle}>{module.title}</Text>
                      <Text style={styles.moduleCategory}>
                        {module.category === 'SAFETY' ? 'An toàn' :
                         module.category === 'SERVICE' ? 'Dịch vụ' :
                         module.category === 'TECHNICAL' ? 'Kỹ thuật' : 'Quản lý'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.moduleRight}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(module.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {module.status === 'COMPLETED' ? 'Hoàn thành' :
                         module.status === 'IN_PROGRESS' ? 'Đang học' : 'Chưa bắt đầu'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.moduleDescription}>{module.description}</Text>

                <View style={styles.moduleDetails}>
                  <View style={styles.moduleDetailItem}>
                    <Icon name="clock" size={14} color="#666" />
                    <Text style={styles.moduleDetailText}>{module.duration} phút</Text>
                  </View>
                  
                  <View style={styles.moduleDetailItem}>
                    <Icon name="bar-chart" size={14} color="#666" />
                    <Text style={[
                      styles.moduleDetailText,
                      { color: getDifficultyColor(module.difficulty) }
                    ]}>
                      {module.difficulty === 'BEGINNER' ? 'Cơ bản' :
                       module.difficulty === 'INTERMEDIATE' ? 'Trung bình' : 'Nâng cao'}
                    </Text>
                  </View>
                </View>

                {module.status !== 'NOT_STARTED' && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressLabel}>Tiến độ</Text>
                      <Text style={styles.progressPercent}>{module.progress}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill,
                        { 
                          width: `${module.progress}%`,
                          backgroundColor: module.color
                        }
                      ]} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
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
  
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.md,
  },
  
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  summaryLeft: {
    flex: 1,
  },
  
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  
  summaryProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  
  summaryRight: {
    alignItems: 'flex-end',
  },
  
  summaryPercentage: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
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
  
  modulesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  moduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  moduleInfo: {
    flex: 1,
  },
  
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  moduleCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  moduleRight: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  moduleDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  
  moduleDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  moduleDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  progressContainer: {
    marginTop: 8,
  },
  
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
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

export default StaffTrainingScreen;