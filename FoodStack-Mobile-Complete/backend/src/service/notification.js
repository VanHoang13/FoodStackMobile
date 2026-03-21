const { EventEmitter } = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.subscribers = new Map();
  }

  // Subscribe to notifications for a specific user/restaurant
  subscribe(userId, socket) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId).add(socket);

    // Remove socket when disconnected
    socket.on('disconnect', () => {
      this.unsubscribe(userId, socket);
    });
  }

  // Unsubscribe from notifications
  unsubscribe(userId, socket) {
    if (this.subscribers.has(userId)) {
      this.subscribers.get(userId).delete(socket);
      if (this.subscribers.get(userId).size === 0) {
        this.subscribers.delete(userId);
      }
    }
  }

  // Send notification to specific user
  sendToUser(userId, notification) {
    if (this.subscribers.has(userId)) {
      const sockets = this.subscribers.get(userId);
      sockets.forEach(socket => {
        socket.emit('notification', notification);
      });
    }
  }

  // Send notification to all staff in a branch
  sendToBranchStaff(branchId, notification) {
    // This would typically query the database for staff in the branch
    // For now, we'll emit to all subscribers with branch context
    this.emit('branch_notification', { branchId, notification });
  }

  // Send notification to restaurant owners/managers
  sendToRestaurantManagers(restaurantId, notification) {
    this.emit('restaurant_notification', { restaurantId, notification });
  }

  // Create different types of notifications
  createOrderNotification(order, type) {
    return {
      id: `order_${order.id}_${Date.now()}`,
      type: 'ORDER',
      subType: type, // 'NEW_ORDER', 'STATUS_UPDATE', 'CANCELLED'
      title: this.getOrderNotificationTitle(type),
      message: this.getOrderNotificationMessage(order, type),
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        tableId: order.table_id,
        branchId: order.branch_id,
        status: order.status
      },
      timestamp: new Date().toISOString(),
      read: false
    };
  }

  createServiceRequestNotification(serviceRequest, type) {
    return {
      id: `service_${serviceRequest.id}_${Date.now()}`,
      type: 'SERVICE_REQUEST',
      subType: type, // 'NEW_REQUEST', 'STATUS_UPDATE'
      title: this.getServiceRequestNotificationTitle(type),
      message: this.getServiceRequestNotificationMessage(serviceRequest, type),
      data: {
        serviceRequestId: serviceRequest.id,
        tableId: serviceRequest.table_id,
        branchId: serviceRequest.branch_id,
        requestType: serviceRequest.type,
        priority: serviceRequest.priority
      },
      timestamp: new Date().toISOString(),
      read: false
    };
  }

  createPaymentNotification(payment, type) {
    return {
      id: `payment_${payment.id}_${Date.now()}`,
      type: 'PAYMENT',
      subType: type, // 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_PENDING'
      title: this.getPaymentNotificationTitle(type),
      message: this.getPaymentNotificationMessage(payment, type),
      data: {
        paymentId: payment.id,
        orderId: payment.order_id,
        amount: payment.amount,
        method: payment.payment_method,
        status: payment.status
      },
      timestamp: new Date().toISOString(),
      read: false
    };
  }

  createReservationNotification(reservation, type) {
    return {
      id: `reservation_${reservation.id}_${Date.now()}`,
      type: 'RESERVATION',
      subType: type, // 'NEW_RESERVATION', 'CONFIRMED', 'CANCELLED'
      title: this.getReservationNotificationTitle(type),
      message: this.getReservationNotificationMessage(reservation, type),
      data: {
        reservationId: reservation.id,
        branchId: reservation.branch_id,
        customerName: reservation.customer_name,
        reservationDate: reservation.reservation_date,
        partySize: reservation.party_size
      },
      timestamp: new Date().toISOString(),
      read: false
    };
  }

  // Helper methods for notification messages
  getOrderNotificationTitle(type) {
    const titles = {
      'NEW_ORDER': 'Đơn hàng mới',
      'STATUS_UPDATE': 'Cập nhật đơn hàng',
      'CANCELLED': 'Đơn hàng bị hủy'
    };
    return titles[type] || 'Thông báo đơn hàng';
  }

  getOrderNotificationMessage(order, type) {
    const messages = {
      'NEW_ORDER': `Đơn hàng #${order.order_number} từ bàn ${order.table?.name || order.table_id}`,
      'STATUS_UPDATE': `Đơn hàng #${order.order_number} đã được cập nhật: ${order.status}`,
      'CANCELLED': `Đơn hàng #${order.order_number} đã bị hủy`
    };
    return messages[type] || `Đơn hàng #${order.order_number}`;
  }

  getServiceRequestNotificationTitle(type) {
    const titles = {
      'NEW_REQUEST': 'Yêu cầu phục vụ mới',
      'STATUS_UPDATE': 'Cập nhật yêu cầu phục vụ'
    };
    return titles[type] || 'Yêu cầu phục vụ';
  }

  getServiceRequestNotificationMessage(serviceRequest, type) {
    const messages = {
      'NEW_REQUEST': `Yêu cầu ${serviceRequest.type} từ bàn ${serviceRequest.table?.name || serviceRequest.table_id}`,
      'STATUS_UPDATE': `Yêu cầu phục vụ đã được cập nhật: ${serviceRequest.status}`
    };
    return messages[type] || `Yêu cầu phục vụ từ bàn ${serviceRequest.table_id}`;
  }

  getPaymentNotificationTitle(type) {
    const titles = {
      'PAYMENT_SUCCESS': 'Thanh toán thành công',
      'PAYMENT_FAILED': 'Thanh toán thất bại',
      'PAYMENT_PENDING': 'Thanh toán đang xử lý'
    };
    return titles[type] || 'Thông báo thanh toán';
  }

  getPaymentNotificationMessage(payment, type) {
    const messages = {
      'PAYMENT_SUCCESS': `Thanh toán ${payment.amount.toLocaleString('vi-VN')}đ thành công`,
      'PAYMENT_FAILED': `Thanh toán ${payment.amount.toLocaleString('vi-VN')}đ thất bại`,
      'PAYMENT_PENDING': `Thanh toán ${payment.amount.toLocaleString('vi-VN')}đ đang xử lý`
    };
    return messages[type] || `Thanh toán ${payment.amount.toLocaleString('vi-VN')}đ`;
  }

  getReservationNotificationTitle(type) {
    const titles = {
      'NEW_RESERVATION': 'Đặt bàn mới',
      'CONFIRMED': 'Đặt bàn đã xác nhận',
      'CANCELLED': 'Đặt bàn bị hủy'
    };
    return titles[type] || 'Thông báo đặt bàn';
  }

  getReservationNotificationMessage(reservation, type) {
    const messages = {
      'NEW_RESERVATION': `Đặt bàn mới từ ${reservation.customer_name} - ${reservation.party_size} người`,
      'CONFIRMED': `Đặt bàn của ${reservation.customer_name} đã được xác nhận`,
      'CANCELLED': `Đặt bàn của ${reservation.customer_name} đã bị hủy`
    };
    return messages[type] || `Đặt bàn từ ${reservation.customer_name}`;
  }

  // Send push notification (for mobile apps)
  async sendPushNotification(userId, notification) {
    // This would integrate with Firebase Cloud Messaging or similar service
    // For now, we'll just log it
    console.log(`Push notification for user ${userId}:`, notification);
    
    // TODO: Implement actual push notification sending
    // - Get user's device tokens from database
    // - Send to FCM/APNS
    // - Handle delivery status
  }

  // Send email notification
  async sendEmailNotification(email, notification) {
    // This would integrate with email service
    console.log(`Email notification to ${email}:`, notification);
    
    // TODO: Implement actual email sending
    // - Use email service (SendGrid, AWS SES, etc.)
    // - Template-based emails
    // - Handle delivery status
  }

  // Send SMS notification
  async sendSMSNotification(phoneNumber, notification) {
    // This would integrate with SMS service
    console.log(`SMS notification to ${phoneNumber}:`, notification);
    
    // TODO: Implement actual SMS sending
    // - Use SMS service (Twilio, AWS SNS, etc.)
    // - Handle delivery status
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = { NotificationService, notificationService };