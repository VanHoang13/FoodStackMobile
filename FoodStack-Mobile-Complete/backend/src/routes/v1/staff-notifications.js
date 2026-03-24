const express = require('express');
const router = express.Router();

// Mock notification data
let notifications = [
  {
    id: '1',
    type: 'ORDER',
    title: 'Đơn hàng mới',
    message: 'Đơn hàng #ORD-001 từ bàn B05',
    data: { orderNumber: 'ORD-001', table: 'B05' },
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    priority: 'HIGH',
  },
  {
    id: '2',
    type: 'SERVICE_REQUEST',
    title: 'Yêu cầu dịch vụ',
    message: 'Khách hàng bàn A03 cần thêm nước',
    data: { table: 'A03', requestType: 'WATER' },
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    priority: 'NORMAL',
  },
  {
    id: '3',
    type: 'SYSTEM',
    title: 'Thông báo hệ thống',
    message: 'Ca làm việc sáng bắt đầu lúc 8:00',
    data: {},
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    priority: 'LOW',
  },
];

// GET /api/v1/staff/notifications - Get all notifications
router.get('/', async (req, res) => {
  try {
    const { type, isRead, limit = 50 } = req.query;
    
    let filteredNotifications = [...notifications];
    
    // Filter by type
    if (type && type !== 'ALL') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    
    // Filter by read status
    if (isRead !== undefined) {
      const readStatus = isRead === 'true';
      filteredNotifications = filteredNotifications.filter(n => n.isRead === readStatus);
    }
    
    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limit results
    filteredNotifications = filteredNotifications.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        notifications: filteredNotifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải thông báo',
    });
  }
});

// PUT /api/v1/staff/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificationIndex = notifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo',
      });
    }
    
    notifications[notificationIndex].isRead = true;
    
    res.json({
      success: true,
      data: notifications[notificationIndex],
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật thông báo',
    });
  }
});

// PUT /api/v1/staff/notifications/read-all - Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    notifications = notifications.map(n => ({ ...n, isRead: true }));
    
    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật thông báo',
    });
  }
});

// DELETE /api/v1/staff/notifications - Clear all notifications
router.delete('/', async (req, res) => {
  try {
    notifications = [];
    
    res.json({
      success: true,
      message: 'Đã xóa tất cả thông báo',
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa thông báo',
    });
  }
});

// POST /api/v1/staff/notifications - Create new notification (for testing)
router.post('/', async (req, res) => {
  try {
    const { type, title, message, data = {}, priority = 'NORMAL' } = req.body;
    
    const newNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date().toISOString(),
      priority,
    };
    
    notifications.unshift(newNotification);
    
    res.status(201).json({
      success: true,
      data: newNotification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo thông báo',
    });
  }
});

module.exports = router;