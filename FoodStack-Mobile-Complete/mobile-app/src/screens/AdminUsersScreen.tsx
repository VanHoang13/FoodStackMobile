import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';

type AdminUsersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminUsers'>;

interface Props {
  navigation: AdminUsersScreenNavigationProp;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  restaurant?: string;
}

const AdminUsersScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Admin User', email: 'admin@mobile.test', role: 'ADMIN', status: 'ACTIVE' },
    { id: '2', name: 'Restaurant Owner', email: 'owner@mobile.test', role: 'OWNER', status: 'ACTIVE', restaurant: 'Mobile Test Restaurant' },
    { id: '3', name: 'Manager User', email: 'manager@mobile.test', role: 'MANAGER', status: 'ACTIVE', restaurant: 'Mobile Test Restaurant' },
    { id: '4', name: 'Staff User', email: 'staff@mobile.test', role: 'STAFF', status: 'ACTIVE', restaurant: 'Mobile Test Restaurant' },
    { id: '5', name: 'Customer User', email: 'customer@mobile.test', role: 'CUSTOMER', status: 'ACTIVE' },
  ]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#e74c3c';
      case 'OWNER': return '#9b59b6';
      case 'MANAGER': return '#3498db';
      case 'STAFF': return '#f39c12';
      case 'CUSTOMER': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        {item.restaurant && <Text style={styles.userRestaurant}>{item.restaurant}</Text>}
      </View>
      <View style={styles.userMeta}>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'ACTIVE' ? '#27ae60' : '#e74c3c' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Quản lý người dùng</Text>
        <TouchableOpacity>
          <Icon name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Tổng người dùng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.status === 'ACTIVE').length}</Text>
          <Text style={styles.statLabel}>Đang hoạt động</Text>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        style={styles.usersList}
        showsVerticalScrollIndicator={false}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userRestaurant: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
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
});

export default AdminUsersScreen;
