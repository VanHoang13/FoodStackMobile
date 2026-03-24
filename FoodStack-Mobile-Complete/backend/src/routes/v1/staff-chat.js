const express = require('express');
const router = express.Router();

// Mock chat data
let chatRooms = [
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

let messages = {
  '1': [
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
      senderId: 'current',
      senderName: 'Bạn',
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
  ],
  '2': [
    {
      id: '5',
      senderId: 'user3',
      senderName: 'Lê Văn C',
      senderRole: 'MANAGER',
      message: 'Chuẩn bị cho ca chiều',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      type: 'TEXT',
      isRead: true,
    },
  ],
  '3': [
    {
      id: '6',
      senderId: 'system',
      senderName: 'Hệ thống',
      senderRole: 'SYSTEM',
      message: 'Cảnh báo: Hết nguyên liệu phở',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      type: 'ALERT',
      isRead: false,
    },
  ],
};

// GET /api/v1/staff/chat/rooms - Get all chat rooms
router.get('/rooms', async (req, res) => {
  try {
    res.json({
      success: true,
      data: chatRooms,
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách phòng chat',
    });
  }
});

// GET /api/v1/staff/chat/rooms/:roomId/messages - Get messages for a room
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const roomMessages = messages[roomId] || [];
    
    // Sort by timestamp (oldest first for chat)
    roomMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMessages = roomMessages.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        messages: paginatedMessages,
        total: roomMessages.length,
        hasMore: endIndex < roomMessages.length,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải tin nhắn',
    });
  }
});

// POST /api/v1/staff/chat/rooms/:roomId/messages - Send a message
router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, senderId, senderName, senderRole } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tin nhắn không được để trống',
      });
    }
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: senderId || 'current',
      senderName: senderName || 'Nhân viên',
      senderRole: senderRole || 'STAFF',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'TEXT',
      isRead: true,
    };
    
    // Initialize room messages if not exists
    if (!messages[roomId]) {
      messages[roomId] = [];
    }
    
    messages[roomId].push(newMessage);
    
    // Update room's last message
    const roomIndex = chatRooms.findIndex(room => room.id === roomId);
    if (roomIndex !== -1) {
      chatRooms[roomIndex].lastMessage = newMessage;
    }
    
    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể gửi tin nhắn',
    });
  }
});

// PUT /api/v1/staff/chat/rooms/:roomId/read - Mark room messages as read
router.put('/rooms/:roomId/read', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Mark all messages in room as read
    if (messages[roomId]) {
      messages[roomId] = messages[roomId].map(msg => ({ ...msg, isRead: true }));
    }
    
    // Update room unread count
    const roomIndex = chatRooms.findIndex(room => room.id === roomId);
    if (roomIndex !== -1) {
      chatRooms[roomIndex].unreadCount = 0;
    }
    
    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả tin nhắn là đã đọc',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đọc',
    });
  }
});

// POST /api/v1/staff/chat/rooms - Create new chat room (for testing)
router.post('/rooms', async (req, res) => {
  try {
    const { name, type, participants = [] } = req.body;
    
    const newRoom = {
      id: Date.now().toString(),
      name,
      type: type || 'GENERAL',
      participants: participants.length,
      unreadCount: 0,
      lastMessage: null,
    };
    
    chatRooms.push(newRoom);
    messages[newRoom.id] = [];
    
    res.status(201).json({
      success: true,
      data: newRoom,
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo phòng chat',
    });
  }
});

module.exports = router;