import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import Icon from '../components/Icon';

type OwnerChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OwnerChat'>;

interface Props {
  navigation: OwnerChatScreenNavigationProp;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'individual' | 'group';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
  participants?: string[];
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
  isOwner: boolean;
}

const OwnerChatScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      // Mock data - replace with API call
      const mockRooms: ChatRoom[] = [
        {
          id: 'room_1',
          name: 'Nhóm Nhân viên Phục vụ',
          type: 'group',
          lastMessage: 'Bàn 5 cần hỗ trợ',
          lastMessageTime: '2 phút trước',
          unreadCount: 3,
          isOnline: true,
          participants: ['staff_1', 'staff_2', 'staff_3']
        },
        {
          id: 'room_2',
          name: 'Trần Văn A (Bếp trưởng)',
          type: 'individual',
          lastMessage: 'Nguyên liệu đã chuẩn bị xong',
          lastMessageTime: '5 phút trước',
          unreadCount: 1,
          isOnline: true,
        },
        {
          id: 'room_3',
          name: 'Nguyễn Thị B (Thu ngân)',
          type: 'individual',
          lastMessage: 'Báo cáo ca sáng đã gửi',
          lastMessageTime: '15 phút trước',
          unreadCount: 0,
          isOnline: false,
        },
        {
          id: 'room_4',
          name: 'Nhóm Bếp',
          type: 'group',
          lastMessage: 'Đơn hàng #402 đã hoàn thành',
          lastMessageTime: '30 phút trước',
          unreadCount: 0,
          isOnline: true,
          participants: ['chef_1', 'chef_2', 'chef_3']
        },
      ];

      setChatRooms(mockRooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      // Mock messages - replace with API call
      const mockMessages: Message[] = [
        {
          id: 'msg_1',
          senderId: 'staff_1',
          senderName: 'Lê Văn C',
          message: 'Chào sếp! Hôm nay có 3 bàn đặt trước',
          timestamp: '09:30',
          type: 'text',
          isOwner: false,
        },
        {
          id: 'msg_2',
          senderId: 'owner',
          senderName: 'Chủ nhà hàng',
          message: 'Tốt! Chuẩn bị kỹ để đón khách nhé',
          timestamp: '09:32',
          type: 'text',
          isOwner: true,
        },
        {
          id: 'msg_3',
          senderId: 'staff_2',
          senderName: 'Trần Thị D',
          message: 'Menu hôm nay có món gì đặc biệt không ạ?',
          timestamp: '09:35',
          type: 'text',
          isOwner: false,
        },
        {
          id: 'msg_4',
          senderId: 'owner',
          senderName: 'Chủ nhà hàng',
          message: 'Có món phở bò đặc biệt và cơm tấm sườn nướng mật ong',
          timestamp: '09:36',
          type: 'text',
          isOwner: true,
        },
        {
          id: 'msg_5',
          senderId: 'staff_1',
          senderName: 'Lê Văn C',
          message: 'Bàn 5 cần hỗ trợ',
          timestamp: '10:15',
          type: 'text',
          isOwner: false,
        },
      ];

      setMessages(mockMessages);
      
      // Scroll to bottom after loading messages
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    loadMessages(room.id);
    
    // Mark room as read
    setChatRooms(prev =>
      prev.map(r =>
        r.id === room.id ? { ...r, unreadCount: 0 } : r
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'owner',
      senderName: 'Chủ nhà hàng',
      message: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: 'text',
      isOwner: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update last message in room list
    setChatRooms(prev =>
      prev.map(room =>
        room.id === selectedRoom.id
          ? {
              ...room,
              lastMessage: message.message,
              lastMessageTime: 'Vừa xong',
            }
          : room
      )
    );

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderChatList = () => (
    <View style={styles.chatListContainer}>
      <View style={styles.chatListHeader}>
        <Text style={styles.chatListTitle}>Tin nhắn</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Icon name="plus" size={20} color="#FF7A30" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        {chatRooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={styles.chatRoomCard}
            onPress={() => handleRoomSelect(room)}
            activeOpacity={0.7}
          >
            <View style={styles.roomAvatar}>
              <View
                style={[
                  styles.avatarContainer,
                  room.type === 'group' ? styles.groupAvatar : styles.individualAvatar,
                ]}
              >
                <Icon
                  name={room.type === 'group' ? 'users' : 'user'}
                  size={20}
                  color="#fff"
                />
              </View>
              {room.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.roomInfo}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomName} numberOfLines={1}>
                  {room.name}
                </Text>
                <Text style={styles.roomTime}>{room.lastMessageTime}</Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {room.lastMessage}
              </Text>
            </View>

            {room.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{room.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderChatRoom = () => (
    <View style={styles.chatRoomContainer}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backToChatList}
          onPress={() => setSelectedRoom(null)}
        >
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{selectedRoom?.name}</Text>
          <Text style={styles.chatHeaderStatus}>
            {selectedRoom?.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
          </Text>
        </View>

        <TouchableOpacity style={styles.chatMenuButton}>
          <Icon name="more-vertical" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isOwner ? styles.ownerMessage : styles.staffMessage,
            ]}
          >
            {!message.isOwner && (
              <Text style={styles.senderName}>{message.senderName}</Text>
            )}
            <View
              style={[
                styles.messageBubble,
                message.isOwner ? styles.ownerBubble : styles.staffBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isOwner ? styles.ownerMessageText : styles.staffMessageText,
                ]}
              >
                {message.message}
              </Text>
            </View>
            <Text style={styles.messageTime}>{message.timestamp}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Nhập tin nhắn..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive,
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Icon name="send" size={20} color={newMessage.trim() ? '#fff' : '#ccc'} />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>
          {selectedRoom ? selectedRoom.name : 'Chat Nhân viên'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.chatContainer, { opacity: fadeAnim }]}>
          {selectedRoom ? renderChatRoom() : renderChatList()}
        </Animated.View>
      </KeyboardAvoidingView>
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

  placeholder: {
    width: 40,
  },

  // Content Styles
  content: {
    flex: 1,
  },

  chatContainer: {
    flex: 1,
  },

  // Chat List Styles
  chatListContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  chatListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  chatListTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },

  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  chatList: {
    flex: 1,
  },

  chatRoomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },

  roomAvatar: {
    position: 'relative',
    marginRight: 12,
  },

  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  groupAvatar: {
    backgroundColor: '#FF7A30',
  },

  individualAvatar: {
    backgroundColor: '#2196F3',
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },

  roomInfo: {
    flex: 1,
  },

  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },

  roomTime: {
    fontSize: 12,
    color: '#666',
  },

  lastMessage: {
    fontSize: 14,
    color: '#666',
  },

  unreadBadge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    marginLeft: 8,
  },

  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  // Chat Room Styles
  chatRoomContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backToChatList: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  chatHeaderInfo: {
    flex: 1,
  },

  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  chatHeaderStatus: {
    fontSize: 12,
    color: '#666',
  },

  chatMenuButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Messages Styles
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  messageContainer: {
    marginVertical: 4,
  },

  ownerMessage: {
    alignItems: 'flex-end',
  },

  staffMessage: {
    alignItems: 'flex-start',
  },

  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 12,
  },

  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  ownerBubble: {
    backgroundColor: '#FF7A30',
    borderBottomRightRadius: 4,
  },

  staffBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  ownerMessageText: {
    color: '#fff',
  },

  staffMessageText: {
    color: '#333',
  },

  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 12,
  },

  // Message Input Styles
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },

  messageInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonActive: {
    backgroundColor: '#FF7A30',
  },

  sendButtonInactive: {
    backgroundColor: '#f0f0f0',
  },
});

export default OwnerChatScreen;