import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

type AdminSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminSettings'>;

interface Props {
  navigation: AdminSettingsScreenNavigationProp;
}

const AdminSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();

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

  const settingSections = [
    {
      title: 'Hệ thống',
      items: [
        { icon: 'settings', title: 'Cấu hình chung', subtitle: 'Cài đặt hệ thống cơ bản', toggle: false, action: undefined },
        { icon: 'shield', title: 'Bảo mật', subtitle: 'Quản lý bảo mật và quyền truy cập', toggle: false, action: undefined },
        { icon: 'database', title: 'Sao lưu dữ liệu', subtitle: 'Tự động sao lưu và khôi phục', toggle: false, action: undefined },
      ]
    },
    {
      title: 'Thông báo',
      items: [
        { icon: 'bell', title: 'Thông báo email', subtitle: 'Cấu hình email thông báo', toggle: true, action: undefined },
        { icon: 'smartphone', title: 'Thông báo push', subtitle: 'Thông báo đẩy trên mobile', toggle: true, action: undefined },
      ]
    },
    {
      title: 'Tài khoản',
      items: [
        { icon: 'user', title: 'Thông tin cá nhân', subtitle: 'Chỉnh sửa thông tin admin', toggle: false, action: undefined },
        { icon: 'key', title: 'Đổi mật khẩu', subtitle: 'Cập nhật mật khẩu bảo mật', toggle: false, action: undefined },
        { icon: 'log-out', title: 'Đăng xuất', subtitle: 'Thoát khỏi hệ thống', toggle: false, action: handleLogout },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={styles.settingItem}
                  onPress={item.action || (() => Alert.alert('Thông báo', 'Tính năng đang phát triển'))}
                >
                  <View style={styles.settingIcon}>
                    <Icon name={item.icon} size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={true}
                      onValueChange={() => {}}
                      trackColor={{ false: '#e9ecef', true: theme.colors.primary }}
                    />
                  ) : (
                    <Icon name="chevron-right" size={16} color="#999" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>FoodStack Admin v1.0.0</Text>
          <Text style={styles.footerText}>© 2026 FoodStack. All rights reserved.</Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});

export default AdminSettingsScreen;