import { api } from './api';

export interface StaffDashboardStats {
  ordersToday: number;
  ordersCompleted: number;
  averageTime: number;
  activeOrders: number;
  pendingRequests: number;
  tablesAssigned: number;
}

export interface StaffProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  joinDate: string;
  branch: string;
  restaurant: string;
}

export interface StaffPerformanceStats {
  ordersProcessed: number;
  averageTime: number;
  customerRating: number;
  shiftsCompleted: number;
}

export interface Table {
  id: string;
  number: string;
  area: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  currentOrder?: {
    id: string;
    orderNumber: string;
    customerCount: number;
    startTime: string;
    totalAmount: number;
  };
  reservedFor?: {
    customerName: string;
    time: string;
    partySize: number;
  };
}

export interface ServiceRequest {
  id: string;
  table: string;
  type: 'WATER' | 'CLEAN' | 'ASSISTANCE' | 'BILL';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  time: string;
  message?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export const staffApi = {
  // Dashboard
  async getDashboardStats(): Promise<StaffDashboardStats> {
    const response = await api.get('/staff/dashboard/stats');
    return response.data;
  },

  // Profile
  async getProfile(): Promise<StaffProfile> {
    const response = await api.get('/staff/profile');
    return response.data;
  },

  async updateProfile(data: Partial<StaffProfile>): Promise<StaffProfile> {
    const response = await api.put('/staff/profile', data);
    return response.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.post('/staff/change-password', data);
  },

  // Performance
  async getPerformanceStats(): Promise<StaffPerformanceStats> {
    const response = await api.get('/staff/performance');
    return response.data;
  },

  // Tables
  async getTables(branchId?: string): Promise<Table[]> {
    const response = await api.get('/staff/tables', {
      params: { branchId }
    });
    return response.data;
  },

  async updateTableStatus(tableId: string, status: string, notes?: string): Promise<void> {
    await api.patch(`/staff/tables/${tableId}/status`, {
      status,
      notes
    });
  },

  // Service Requests
  async getServiceRequests(status?: string): Promise<ServiceRequest[]> {
    const response = await api.get('/staff/service-requests', {
      params: { status }
    });
    return response.data;
  },

  async updateServiceRequestStatus(
    requestId: string, 
    status: string, 
    response?: string
  ): Promise<void> {
    await api.patch(`/staff/service-requests/${requestId}/status`, {
      status,
      response
    });
  },

  async acceptServiceRequest(requestId: string): Promise<void> {
    await api.post(`/staff/service-requests/${requestId}/accept`);
  },

  // Orders (Kitchen)
  async getKitchenOrders(status?: string): Promise<any[]> {
    const response = await api.get('/staff/kitchen/orders', {
      params: { status }
    });
    return response.data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await api.patch(`/staff/orders/${orderId}/status`, { status });
  },
};
// Phase 2 APIs - Notifications
export interface Notification {
  id: string;
  type: 'ORDER' | 'SERVICE_REQUEST' | 'SYSTEM' | 'CHAT';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

// Phase 2 APIs - Chat
export interface ChatRoom {
  id: string;
  name: string;
  type: 'GENERAL' | 'SHIFT' | 'EMERGENCY' | 'MANAGEMENT';
  participants: number;
  unreadCount: number;
  lastMessage?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
  type: 'TEXT' | 'SYSTEM' | 'ALERT';
  isRead: boolean;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  total: number;
  hasMore: boolean;
}

// Phase 2 APIs - Order History
export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  table: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: 'CASH' | 'CARD' | 'DIGITAL_WALLET';
  createdAt: string;
  completedAt?: string;
  handledBy: string;
}

// Phase 2 APIs - Inventory
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: string;
  updatedBy: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  price?: number;
}

// Extended staffApi with Phase 2 methods
export const staffApiPhase2 = {
  ...staffApi,

  // Notifications
  async getNotifications(params?: {
    type?: string;
    isRead?: boolean;
    limit?: number;
  }): Promise<NotificationResponse> {
    const response = await api.get('/staff/notifications', { params });
    return response.data;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await api.put(`/staff/notifications/${notificationId}/read`);
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await api.put('/staff/notifications/read-all');
  },

  async clearAllNotifications(): Promise<void> {
    await api.delete('/staff/notifications');
  },

  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: string;
  }): Promise<Notification> {
    const response = await api.post('/staff/notifications', data);
    return response.data;
  },

  // Chat
  async getChatRooms(): Promise<ChatRoom[]> {
    const response = await api.get('/staff/chat/rooms');
    return response.data;
  },

  async getChatMessages(roomId: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<ChatMessagesResponse> {
    const response = await api.get(`/staff/chat/rooms/${roomId}/messages`, { params });
    return response.data;
  },

  async sendChatMessage(roomId: string, data: {
    message: string;
    senderId?: string;
    senderName?: string;
    senderRole?: string;
  }): Promise<ChatMessage> {
    const response = await api.post(`/staff/chat/rooms/${roomId}/messages`, data);
    return response.data;
  },

  async markChatRoomAsRead(roomId: string): Promise<void> {
    await api.put(`/staff/chat/rooms/${roomId}/read`);
  },

  async createChatRoom(data: {
    name: string;
    type?: string;
    participants?: string[];
  }): Promise<ChatRoom> {
    const response = await api.post('/staff/chat/rooms', data);
    return response.data;
  },

  // Order History
  async getOrderHistory(params?: {
    period?: 'TODAY' | 'WEEK' | 'MONTH';
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    orders: OrderHistoryItem[];
    total: number;
    stats: {
      totalOrders: number;
      completedOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
    };
  }> {
    const response = await api.get('/staff/order-history', { params });
    return response.data;
  },

  // Inventory
  async getInventory(params?: {
    category?: string;
    search?: string;
    status?: string;
  }): Promise<{
    items: InventoryItem[];
    stats: {
      total: number;
      inStock: number;
      lowStock: number;
      outOfStock: number;
    };
  }> {
    const response = await api.get('/staff/inventory', { params });
    return response.data;
  },

  async updateInventoryStock(itemId: string, data: {
    currentStock: number;
    notes?: string;
  }): Promise<InventoryItem> {
    const response = await api.put(`/staff/inventory/${itemId}/stock`, data);
    return response.data;
  },

  async createInventoryItem(data: {
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unit: string;
    price?: number;
  }): Promise<InventoryItem> {
    const response = await api.post('/staff/inventory', data);
    return response.data;
  },
};

// Phase 3 APIs - Analytics & Performance
export interface AnalyticsData {
  performance: {
    ordersProcessed: number;
    averageProcessingTime: number;
    customerSatisfaction: number;
    efficiency: number;
  };
  trends: {
    dailyOrders: { date: string; count: number }[];
    hourlyDistribution: { hour: number; orders: number }[];
    categoryPerformance: { category: string; orders: number; revenue: number }[];
  };
  comparisons: {
    lastWeek: number;
    lastMonth: number;
    teamAverage: number;
    ranking: number;
  };
  goals: {
    ordersTarget: number;
    ordersActual: number;
    timeTarget: number;
    timeActual: number;
    satisfactionTarget: number;
    satisfactionActual: number;
  };
}

export interface PerformanceData {
  kpis: {
    id: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    color: string;
    icon: string;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    unlockedAt: string;
    progress?: number;
    maxProgress?: number;
  }[];
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

// Phase 3 APIs - Tasks
export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'CLEANING' | 'INVENTORY' | 'CUSTOMER_SERVICE' | 'MAINTENANCE' | 'TRAINING';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedBy: string;
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  estimatedTime: number;
  actualTime?: number;
  location?: string;
  checklist?: {
    id: string;
    text: string;
    completed: boolean;
  }[];
}

// Phase 3 APIs - Schedule
export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'ABSENT';
  location: string;
  role: string;
  notes?: string;
  breakTime?: {
    start: string;
    end: string;
    duration: number;
  };
}

export interface TimeOffRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'EMERGENCY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  requestedAt: string;
  approvedBy?: string;
}

export interface ScheduleData {
  currentWeek: Shift[];
  nextWeek: Shift[];
  timeOffRequests: TimeOffRequest[];
  weeklyHours: {
    scheduled: number;
    worked: number;
    overtime: number;
  };
  monthlyStats: {
    totalShifts: number;
    completedShifts: number;
    absences: number;
    lateArrivals: number;
  };
}

// Extended staffApi with Phase 3 methods
export const staffApiPhase3 = {
  ...staffApiPhase2,

  // Analytics
  async getAnalytics(params?: {
    period?: 'TODAY' | 'WEEK' | 'MONTH';
    staffId?: string;
  }): Promise<AnalyticsData> {
    const response = await api.get('/staff/analytics', { params });
    return response.data.data;
  },

  async getPerformanceData(params?: {
    staffId?: string;
    period?: 'WEEK' | 'MONTH';
  }): Promise<PerformanceData> {
    const response = await api.get('/staff/analytics/performance', { params });
    return response.data.data;
  },

  async generateReport(params: {
    type?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    startDate?: string;
    endDate?: string;
    format?: 'JSON' | 'CSV';
  }): Promise<any> {
    const response = await api.get('/staff/analytics/reports', { params });
    return response.data.data;
  },

  // Tasks
  async getTasks(params?: {
    status?: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    category?: string;
    assignedTo?: string;
    priority?: string;
  }): Promise<{
    tasks: Task[];
    stats: {
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      overdue: number;
    };
  }> {
    const response = await api.get('/staff/tasks', { params });
    return response.data.data;
  },

  async getTaskDetails(taskId: string): Promise<Task> {
    const response = await api.get(`/staff/tasks/${taskId}`);
    return response.data.data;
  },

  async createTask(data: {
    title: string;
    description: string;
    category: string;
    priority?: string;
    assignedTo: string;
    dueDate: string;
    estimatedTime?: number;
    location?: string;
    checklist?: string[];
  }): Promise<Task> {
    const response = await api.post('/staff/tasks', data);
    return response.data.data;
  },

  async updateTaskStatus(taskId: string, data: {
    status: string;
    actualTime?: number;
  }): Promise<Task> {
    const response = await api.put(`/staff/tasks/${taskId}/status`, data);
    return response.data.data;
  },

  async updateChecklistItem(taskId: string, checklistId: string, data: {
    completed: boolean;
  }): Promise<Task> {
    const response = await api.put(`/staff/tasks/${taskId}/checklist/${checklistId}`, data);
    return response.data.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/staff/tasks/${taskId}`);
  },

  async getTaskTemplates(): Promise<{
    id: string;
    title: string;
    description: string;
    category: string;
    estimatedTime: number;
    checklist: string[];
  }[]> {
    const response = await api.get('/staff/tasks/templates');
    return response.data.data;
  },

  // Schedule
  async getSchedule(params?: {
    staffId?: string;
    week?: 'current' | 'next';
  }): Promise<ScheduleData> {
    const response = await api.get('/staff/schedule', { params });
    return response.data.data;
  },

  async getShifts(params?: {
    staffId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{
    shifts: Shift[];
    stats: {
      total: number;
      scheduled: number;
      confirmed: number;
      completed: number;
      cancelled: number;
    };
  }> {
    const response = await api.get('/staff/schedule/shifts', { params });
    return response.data.data;
  },

  async updateShiftStatus(shiftId: string, data: {
    status: string;
    notes?: string;
  }): Promise<Shift> {
    const response = await api.put(`/staff/schedule/shifts/${shiftId}/status`, data);
    return response.data.data;
  },

  async getTimeOffRequests(params?: {
    staffId?: string;
    status?: string;
  }): Promise<{
    requests: TimeOffRequest[];
    stats: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  }> {
    const response = await api.get('/staff/schedule/time-off', { params });
    return response.data.data;
  },

  async createTimeOffRequest(data: {
    startDate: string;
    endDate: string;
    type?: string;
    reason: string;
    staffId?: string;
  }): Promise<TimeOffRequest> {
    const response = await api.post('/staff/schedule/time-off', data);
    return response.data.data;
  },

  async updateTimeOffRequest(requestId: string, data: {
    status: string;
    approvedBy?: string;
    rejectionReason?: string;
  }): Promise<TimeOffRequest> {
    const response = await api.put(`/staff/schedule/time-off/${requestId}`, data);
    return response.data.data;
  },

  async getScheduleStats(params?: {
    staffId?: string;
    period?: 'week' | 'month';
  }): Promise<{
    weekly: {
      scheduled: number;
      worked: number;
      overtime: number;
    };
    monthly: {
      totalShifts: number;
      completedShifts: number;
      absences: number;
      lateArrivals: number;
    };
    attendance: {
      rate: number;
      onTimeRate: number;
    };
    performance: {
      averageHoursPerWeek: number;
      overtimeHours: number;
      totalHoursThisMonth: number;
    };
  }> {
    const response = await api.get('/staff/schedule/stats', { params });
    return response.data.data;
  },

  async requestShiftSwap(shiftId: string, data: {
    targetStaffId: string;
    reason: string;
  }): Promise<{
    swapRequestId: string;
    status: string;
    requestedAt: string;
  }> {
    const response = await api.post(`/staff/schedule/shifts/${shiftId}/swap`, data);
    return response.data.data;
  },
};