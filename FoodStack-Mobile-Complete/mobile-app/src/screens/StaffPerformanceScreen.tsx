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

type StaffPerformanceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffPerformance'>;

interface Props {
  navigation: StaffPerformanceScreenNavigationProp;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  color: string;
  icon: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: string;
  progress?: number;
  maxProgress?: number;
}

interface PerformanceData {
  kpis: KPI[];
  achievements: Achievement[];
  ranking: {
    position: number;
    totalStaff: number;
    score: number;
    change: number;
  };
  streaks: {
    current: number;
    longest: number;
    type: string;
  };
  feedback: {
    positive: number;
    neutral: number;
    negative: number;
    recent: {
      rating: number;
      comment: string;
      date: string;
    }[];
  };
}

const { width } = Dimensions.get('window');

const StaffPerformanceScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'KPIs' | 'ACHIEVEMENTS' | 'FEEDBACK'>('KPIs');

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock performance data
      const mockData: PerformanceData = {
        kpis: [
          {
            id: '1',
            name: 'Đơn hàng/giờ',
            value: 12.5,
            target: 15,
            unit: 'đơn',
            trend: 'up',
            trendValue: 8.3,
            color: '#3498DB',
            icon: 'trending-up',
          },
          {
            id: '2',
            name: 'Thời gian phục vụ',
            value: 8.2,
            target: 10,
            unit: 'phút',
            trend: 'down',
            trendValue: -12.5,
            color: '#27AE60',
            icon: 'clock',
          },
          {
            id: '3',
            name: 'Độ chính xác',
            value: 96.8,
            target: 95,
            unit: '%',
            trend: 'up',
            trendValue: 2.1,
            color: '#E67E22',
            icon: 'target',
          },
          {
            id: '4',
            name: 'Đánh giá khách hàng',
            value: 4.7,
            target: 4.5,
            unit: '/5',
            trend: 'stable',
            trendValue: 0,
            color: '#9B59B6',
            icon: 'star',
          },
        ],
        achievements: [
          {
            id: '1',
            title: 'Speed Demon',
            description: 'Xử lý 100 đơn hàng trong 1 ngày',
            icon: 'zap',
            color: '#F39C12',
            unlockedAt: '2024-01-20',
          },
          {
            id: '2',
            title: 'Customer Favorite',
            description: 'Nhận 50 đánh giá 5 sao',
            icon: 'heart',
            color: '#E74C3C',
            unlockedAt: '2024-01-18',
          },
          {
            id: '3',
            title: 'Perfect Week',
            description: 'Hoàn thành mục tiêu cả tuần',
            icon: 'award',
            color: '#27AE60',
            unlockedAt: '2024-01-15',
          },
          {
            id: '4',
            title: 'Team Player',
            description: 'Hỗ trợ đồng nghiệp 20 lần',
            icon: 'users',
            color: '#3498DB',
            unlockedAt: '',
            progress: 15,
            maxProgress: 20,
          },
        ],
        ranking: {
          position: 3,
          totalStaff: 15,
          score: 892,
          change: 2,
        },
        streaks: {
          current: 7,
          longest: 12,
          type: 'Đạt mục tiêu hàng ngày',
        },
        feedback: {
          positive: 85,
          neutral: 12,
          negative: 3,
          recent: [
            {
              rating: 5,
              comment: 'Phục vụ rất tốt, nhanh chóng và chu đáo',
              date: '2024-01-21',
            },
            {
              rating: 4,
              comment: 'Nhân viên thân thiện, món ăn ngon',
              date: '2024-01-20',
            },
            {
              rating: 5,
              comment: 'Excellent service!',
              date: '2024-01-19',
            },
          ],
        },
      };
      
      setPerformance(mockData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKPIProgress = (value: number, target: number) => {
    return Math.min((value / target) * 100, 100);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'minus';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#27AE60';
      case 'down': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  if (loading || !performance) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải dữ liệu hiệu suất...</Text>
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
        
        <Text style={styles.headerTitle}>Hiệu suất cá nhân</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Icon name="share" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Performance Summary */}
      <View style={styles.summaryContainer}>
        <LinearGradient
          colors={['#E8622A', '#D35400']}
          style={styles.summaryCard}
        >
          <View style={styles.summaryContent}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryTitle}>Xếp hạng hiện tại</Text>
              <Text style={styles.summaryRank}>#{performance.ranking.position}</Text>
              <Text style={styles.summarySubtitle}>
                trong {performance.ranking.totalStaff} nhân viên
              </Text>
            </View>
            
            <View style={styles.summaryRight}>
              <Text style={styles.summaryScore}>{performance.ranking.score}</Text>
              <Text style={styles.summaryScoreLabel}>điểm</Text>
              <View style={styles.summaryChange}>
                <Icon 
                  name={performance.ranking.change > 0 ? 'arrow-up' : 'arrow-down'} 
                  size={12} 
                  color="#fff" 
                />
                <Text style={styles.summaryChangeText}>
                  {Math.abs(performance.ranking.change)} vị trí
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'KPIs', label: 'KPIs' },
          { key: 'ACHIEVEMENTS', label: 'Thành tích' },
          { key: 'FEEDBACK', label: 'Phản hồi' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab.key && styles.tabButtonTextActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'KPIs' && (
          <>
            {/* KPIs Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chỉ số hiệu suất chính</Text>
              
              <View style={styles.kpiGrid}>
                {performance.kpis.map((kpi) => (
                  <View key={kpi.id} style={styles.kpiCard}>
                    <View style={styles.kpiHeader}>
                      <View style={[styles.kpiIcon, { backgroundColor: kpi.color }]}>
                        <Icon name={kpi.icon} size={20} color="#fff" />
                      </View>
                      <View style={styles.kpiTrend}>
                        <Icon 
                          name={getTrendIcon(kpi.trend)} 
                          size={16} 
                          color={getTrendColor(kpi.trend)} 
                        />
                        <Text style={[
                          styles.kpiTrendText,
                          { color: getTrendColor(kpi.trend) }
                        ]}>
                          {kpi.trendValue > 0 ? '+' : ''}{kpi.trendValue}%
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.kpiName}>{kpi.name}</Text>
                    <Text style={styles.kpiValue}>
                      {kpi.value}{kpi.unit}
                    </Text>
                    <Text style={styles.kpiTarget}>
                      Mục tiêu: {kpi.target}{kpi.unit}
                    </Text>
                    
                    <View style={styles.kpiProgressBar}>
                      <View style={[
                        styles.kpiProgress,
                        { 
                          width: `${getKPIProgress(kpi.value, kpi.target)}%`,
                          backgroundColor: kpi.color
                        }
                      ]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Streaks */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chuỗi thành tích</Text>
              
              <View style={styles.streakCard}>
                <View style={styles.streakHeader}>
                  <Icon name="flame" size={24} color="#E67E22" />
                  <Text style={styles.streakTitle}>{performance.streaks.type}</Text>
                </View>
                
                <View style={styles.streakStats}>
                  <View style={styles.streakStat}>
                    <Text style={styles.streakNumber}>{performance.streaks.current}</Text>
                    <Text style={styles.streakLabel}>Hiện tại</Text>
                  </View>
                  <View style={styles.streakDivider} />
                  <View style={styles.streakStat}>
                    <Text style={styles.streakNumber}>{performance.streaks.longest}</Text>
                    <Text style={styles.streakLabel}>Dài nhất</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {selectedTab === 'ACHIEVEMENTS' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thành tích & Huy hiệu</Text>
            
            <View style={styles.achievementsList}>
              {performance.achievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={styles.achievementLeft}>
                    <View style={[
                      styles.achievementIcon,
                      { 
                        backgroundColor: achievement.unlockedAt ? achievement.color : '#f0f0f0',
                        opacity: achievement.unlockedAt ? 1 : 0.5
                      }
                    ]}>
                      <Icon 
                        name={achievement.icon} 
                        size={24} 
                        color={achievement.unlockedAt ? '#fff' : '#999'} 
                      />
                    </View>
                    
                    <View style={styles.achievementInfo}>
                      <Text style={[
                        styles.achievementTitle,
                        { opacity: achievement.unlockedAt ? 1 : 0.5 }
                      ]}>
                        {achievement.title}
                      </Text>
                      <Text style={styles.achievementDescription}>
                        {achievement.description}
                      </Text>
                      
                      {achievement.progress !== undefined && (
                        <View style={styles.achievementProgress}>
                          <View style={styles.progressBar}>
                            <View style={[
                              styles.progressFill,
                              { 
                                width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%`,
                                backgroundColor: achievement.color
                              }
                            ]} />
                          </View>
                          <Text style={styles.progressText}>
                            {achievement.progress}/{achievement.maxProgress}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {achievement.unlockedAt && (
                    <View style={styles.achievementDate}>
                      <Text style={styles.achievementDateText}>
                        {new Date(achievement.unlockedAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedTab === 'FEEDBACK' && (
          <>
            {/* Feedback Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tổng quan phản hồi</Text>
              
              <View style={styles.feedbackOverview}>
                <View style={styles.feedbackStat}>
                  <Text style={styles.feedbackNumber}>{performance.feedback.positive}%</Text>
                  <Text style={styles.feedbackLabel}>Tích cực</Text>
                  <View style={[styles.feedbackBar, { backgroundColor: '#27AE60' }]} />
                </View>
                
                <View style={styles.feedbackStat}>
                  <Text style={styles.feedbackNumber}>{performance.feedback.neutral}%</Text>
                  <Text style={styles.feedbackLabel}>Trung tính</Text>
                  <View style={[styles.feedbackBar, { backgroundColor: '#F39C12' }]} />
                </View>
                
                <View style={styles.feedbackStat}>
                  <Text style={styles.feedbackNumber}>{performance.feedback.negative}%</Text>
                  <Text style={styles.feedbackLabel}>Tiêu cực</Text>
                  <View style={[styles.feedbackBar, { backgroundColor: '#E74C3C' }]} />
                </View>
              </View>
            </View>

            {/* Recent Feedback */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phản hồi gần đây</Text>
              
              <View style={styles.feedbackList}>
                {performance.feedback.recent.map((feedback, index) => (
                  <View key={index} style={styles.feedbackItem}>
                    <View style={styles.feedbackHeader}>
                      <View style={styles.feedbackRating}>
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            name="star"
                            size={16}
                            color={i < feedback.rating ? '#F39C12' : '#e0e0e0'}
                          />
                        ))}
                      </View>
                      <Text style={styles.feedbackDate}>
                        {new Date(feedback.date).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <Text style={styles.feedbackComment}>{feedback.comment}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#666',
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
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  
  summaryRank: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  
  summarySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  
  summaryRight: {
    alignItems: 'flex-end',
  },
  
  summaryScore: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  
  summaryScoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  
  summaryChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  summaryChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  
  tabButtonActive: {
    backgroundColor: '#E8622A',
  },
  
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  tabButtonTextActive: {
    color: '#fff',
  },
  
  content: {
    flex: 1,
  },
  
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  kpiCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  kpiTrendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  kpiName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  
  kpiValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  kpiTarget: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  
  kpiProgressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  kpiProgress: {
    height: '100%',
    borderRadius: 2,
  },
  
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.sm,
  },
  
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  
  streakTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  streakStat: {
    flex: 1,
    alignItems: 'center',
  },
  
  streakNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#E67E22',
    marginBottom: 4,
  },
  
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  
  achievementsList: {
    gap: 12,
  },
  
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  achievementInfo: {
    flex: 1,
  },
  
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  achievementDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  progressBar: {
    flex: 1,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  achievementDate: {
    alignItems: 'flex-end',
  },
  
  achievementDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  
  feedbackOverview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    ...theme.shadows.sm,
  },
  
  feedbackStat: {
    flex: 1,
    alignItems: 'center',
  },
  
  feedbackNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  
  feedbackBar: {
    width: '80%',
    height: 4,
    borderRadius: 2,
  },
  
  feedbackList: {
    gap: 12,
  },
  
  feedbackItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.sm,
  },
  
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  feedbackRating: {
    flexDirection: 'row',
    gap: 2,
  },
  
  feedbackDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  
  feedbackComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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

export default StaffPerformanceScreen;