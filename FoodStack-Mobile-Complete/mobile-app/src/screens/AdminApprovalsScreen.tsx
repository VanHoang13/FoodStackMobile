import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';

type AdminApprovalsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminApprovals'>;

interface Props {
  navigation: AdminApprovalsScreenNavigationProp;
}

interface Approval {
  id: string;
  type: 'RESTAURANT_REGISTRATION' | 'MENU_ITEM' | 'PROMOTION';
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const AdminApprovalsScreen: React.FC<Props> = ({ navigation }) => {
  const [approvals, setApprovals] = useState<Approval[]>([
    {
      id: '1',
      type: 'RESTAURANT_REGISTRATION',
      title: 'Đăng ký nhà hàng mới',
      description: 'Nhà hàng Phở Việt Nam - 123 Nguyễn Văn Linh',
      submittedBy: 'Nguyễn Văn A',
      submittedAt: '2026-03-21',
      status: 'PENDING'
    },
    {
      id: '2',
      type: 'MENU_ITEM',
      title: 'Thêm món ăn mới',
      description: 'Bún bò Huế đặc biệt - 85,000đ',
      submittedBy: 'Mobile Test Restaurant',
      submittedAt: '2026-03-20',
      status: 'PENDING'
    }
  ]);

  const handleApprove = (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn phê duyệt?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Phê duyệt',
          onPress: () => {
            setApprovals(prev => prev.map(item => 
              item.id === id ? { ...item, status: 'APPROVED' as const } : item
            ));
            Alert.alert('Thành công', 'Đã phê duyệt');
          }
        }
      ]
    );
  };

  const handleReject = (id: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn từ chối?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: () => {
            setApprovals(prev => prev.map(item => 
              item.id === id ? { ...item, status: 'REJECTED' as const } : item
            ));
            Alert.alert('Đã từ chối', 'Yêu cầu đã bị từ chối');
          }
        }
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESTAURANT_REGISTRATION': return 'home';
      case 'MENU_ITEM': return 'coffee';
      case 'PROMOTION': return 'tag';
      default: return 'file';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#27ae60';
      case 'REJECTED': return '#e74c3c';
      case 'PENDING': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const renderApproval = ({ item }: { item: Approval }) => (
    <View style={styles.approvalCard}>
      <View style={styles.approvalHeader}>
        <View style={styles.approvalInfo}>
          <Icon name={getTypeIcon(item.type)} size={20} color={theme.colors.primary} />
          <Text style={styles.approvalTitle}>{item.title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.approvalDescription}>{item.description}</Text>
      <Text style={styles.approvalMeta}>Bởi: {item.submittedBy} • {item.submittedAt}</Text>
      
      {item.status === 'PENDING' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={() => handleReject(item.id)}
          >
            <Icon name="x" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]} 
            onPress={() => handleApprove(item.id)}
          >
            <Icon name="check" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Phê duyệt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Phê duyệt</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pendingCount}</Text>
        </View>
      </View>

      <FlatList
        data={approvals}
        renderItem={renderApproval}
        keyExtractor={(item) => item.id}
        style={styles.approvalsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      />
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  approvalsList: {
    flex: 1,
  },
  approvalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  approvalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  approvalMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  approveButton: {
    backgroundColor: '#27ae60',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminApprovalsScreen;