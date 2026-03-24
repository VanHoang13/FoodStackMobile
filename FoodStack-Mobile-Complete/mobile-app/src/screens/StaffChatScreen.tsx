import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { theme } from '../theme';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';

type StaffChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StaffChat'>;

interface Props {
  navigation: StaffChatScreenNavigationProp;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  type: 'TEXT' | 'SYSTEM' | 'ALERT';
  isRead: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'GENERAL' | 'SHIFT' | 'EMERGENCY' | 'MANAGEMENT';
  participants: number;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

const CHAT_TYPES = {
  GENERAL: { icon: 'users', color: '#3498DB', label: 'Chung' },
  SHIFT: { icon: 'clock', color: '#27AE60', label: 'Ca làm việc' },
  EMERGENCY: { icon: 'alert-triangle', color: '#E74C3C', label: 'Khẩn cấp' },
  MANAGEMENT: { icon: 'briefcase', color: '#9B59B6', label: 'Quản lý' },
};

const StaffChatScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadChatRooms = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock chat rooms
      const mockRooms: ChatRoom[] = [
        {
          id: '1',
          name: 'Chat chung',
          type: 'GENERAL',
          participants: 12,
          unreadCount: 3,
          lastMessage: {
            id: '1',
            senderId: 'user2',
            senderName: 'Trần Thị B',
            senderRole: 'STAFF',
            message: 'Bàn 5 cần hỗ trợ',
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            type: 'TEXT',
            isRead: false,
          },
        },
        {
          id: '2',
          name: 'Ca sáng',
          type: 'SHIFT',
          participants: 6,
          unreadCount: 0,
          lastMessage: {
            id: '2',
            senderId: 'user3',
            senderName: 'Lê Văn C',
            senderRole: 'MANAGER',
            message: 'Chuẩn bị cho ca chiều',
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            type: 'TEXT',
            isRead: true,
          },
        },
        {
          id: '3',
          name: 'Khẩn cấp',
          type: 'EMERGENCY',
          participants: 8,
          unreadCount: 1,
          lastMessage: {
            id: '3',
            senderId: 'system',
            senderName: 'Hệ thống',
            senderRole: 'SYSTEM',
            message: 'Cảnh báo: Hết nguyên liệu phở',
            timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
            type: 'ALERT',
            isRead: false,
          },
        },
      ];
      
      setChatRooms(mockRooms);
      
      // Auto select first room
      if (mockRooms.length > 0) {
        setSelectedRoom(mockRooms[0]);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock messages
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          senderId: 'user2',
          senderName: 'Trần Thị B',
          senderRole: 'STAFF',
          message: 'Chào mọi người!',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          type: 'TEXT',
          isRead: true,
        },
        {
          id: '2',
          senderId: user?.userId || 'current',
          senderName: user?.fullName || 'Bạn',
          senderRole: 'STAFF',
          message: 'Chào Trần Thị B!',
          timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
          type: 'TEXT',
          isRead: true,
        },
        {
          id: '3',
          senderId: 'user3',
          senderName: 'Lê Văn C',
          senderRole: 'MANAGER',
          message: 'Hôm nay có nhiều khách, mọi người cố gắng nhé!',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          type: 'TEXT',
          isRead: true,
        },
        {
          id: '4',
          senderId: 'user2',
          senderName: 'Trần Thị B',
          senderRole: 'STAFF',
          message: 'Bàn 5 cần hỗ trợ',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          type: 'TEXT',
          isRead: false,
        },
      ];
      
      setMessages(mockMessages);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.userId || 'current',
      senderName: user?.fullName || 'Bạn',
      senderRole: user?.role || 'STAFF',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'TEXT',
      isRead: true,
    };

    try {
      // Add message to local state immediately
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // TODO: Send to server
      console.log('Sending message:', message);
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }
    
    return date.toLocaleDateString('vi-VN');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MANAGER': return '#9B59B6';
      case 'STAFF': return '#3498DB';
      case 'SYSTEM': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const isOwnMessage = (senderId: string) => {
    return senderId === user?.userId;
  };

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
        
        <View style={styles.headerCenter}>
          {selectedRoom && (
            <>
              <View style={[
                styles.roomTypeIcon,
                { backgroundColor: CHAT_TYPES[selectedRoom.type].color }
              ]}>
                <Icon 
                  name={CHAT_TYPES[selectedRoom.type].icon} 
                  size={16} 
                  color="#fff" 
                />
              </View>
              <View>
                <Text style={styles.headerTitle}>{selectedRoom.name}</Text>
                <Text style={styles.headerSubtitle}>
                  {selectedRoom.participants} thành viên
                </Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Icon name="more-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Chat Rooms Tabs */}
      <View style={styles.roomsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {chatRooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={[
                styles.roomTab,
                selectedRoom?.id === room.id && styles.roomTabActive,
              ]}
              onPress={() => setSelectedRoom(room)}
            >
              <View style={[
                styles.roomTabIcon,
                { backgroundColor: CHAT_TYPES[room.type].color }
              ]}>
                <Icon 
                  name={CHAT_TYPES[room.type].icon} 
                  size={14} 
                  color="#fff" 
                />
              </View>
              <Text style={[
                styles.roomTabText,
                selectedRoom?.id === room.id && styles.roomTabTextActive,
              ]}>
                {room.name}
              </Text>
              {room.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{room.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
            
            return (
              <View key={message.id}>
                {showDate && (
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateText}>{formatDate(message.timestamp)}</Text>
                  </View>
                )}
                
                <View style={[
                  styles.messageContainer,
                  isOwnMessage(message.senderId) && styles.ownMessageContainer,
                ]}>
                  {!isOwnMessage(message.senderId) && (
                    <View style={styles.messageHeader}>
                      <Text style={[
                        styles.senderName,
                        { color: getRoleColor(message.senderRole) }
                      ]}>
                        {message.senderName}
                      </Text>
                      <Text style={styles.messageTime}>
                        {formatTime(message.timestamp)}
                      </Text>
                    </View>
                  )}
                  
                  <View style={[
                    styles.messageBubble,
                    isOwnMessage(message.senderId) ? styles.ownMessageBubble : styles.otherMessageBubble,
                    message.type === 'ALERT' && styles.alertMessageBubble,
                  ]}>
                    <Text style={[
                      styles.messageText,
                      isOwnMessage(message.senderId) && styles.ownMessageText,
                      message.type === 'ALERT' && styles.alertMessageText,
                    ]}>
                      {message.message}
                    </Text>
                    
                    {isOwnMessage(message.senderId) && (
                      <Text style={styles.ownMessageTime}>
                        {formatTime(message.timestamp)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.messageInput}
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                newMessage.trim() && styles.sendButtonActive,
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Icon 
                name="send" 
                size={20} 
                color={newMessage.trim() ? '#fff' : '#ccc'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginLeft: 12,
  },
  
  roomTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  roomsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  roomTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    gap: 6,
  },
  
  roomTabActive: {
    backgroundColor: '#E8622A',
  },
  
  roomTabIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  roomTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  
  roomTabTextActive: {
    color: '#fff',
  },
  
  unreadBadge: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  
  chatContainer: {
    flex: 1,
  },
  
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  messageContainer: {
    marginBottom: 12,
  },
  
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  
  senderName: {
    fontSize: 12,
    fontWeight: '700',
  },
  
  messageTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
  
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    ...theme.shadows.sm,
  },
  
  ownMessageBubble: {
    backgroundColor: '#E8622A',
    borderBottomRightRadius: 4,
  },
  
  alertMessageBubble: {
    backgroundColor: '#FFE6E6',
    borderColor: '#E74C3C',
    borderWidth: 1,
  },
  
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  
  ownMessageText: {
    color: '#fff',
  },
  
  alertMessageText: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  
  ownMessageTime: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'right',
  },
  
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sendButtonActive: {
    backgroundColor: '#E8622A',
  },
});

export default StaffChatScreen;