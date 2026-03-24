import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ServiceRequest {
  id: string;
  table: string;
  customerName: string;
  type: 'WATER' | 'CLEAN' | 'ASSISTANCE' | 'BILL' | 'COMPLAINT' | 'OTHER';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  message?: string;
  requestTime: string;
  assignedStaff?: string;
  completedTime?: string;
  estimatedTime?: number;
  customerPhone?: string;
  branchId?: string;
  restaurantId?: string;
}

class ServiceRequestService {
  private static instance: ServiceRequestService;
  private storageKey = 'foodstack_service_requests'; // Global key for all users

  static getInstance(): ServiceRequestService {
    if (!ServiceRequestService.instance) {
      ServiceRequestService.instance = new ServiceRequestService();
    }
    return ServiceRequestService.instance;
  }

  // Get all service requests
  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting service requests:', error);
      return [];
    }
  }

  // Create a new service request (from customer side)
  async createServiceRequest(request: Omit<ServiceRequest, 'id' | 'requestTime' | 'status'>): Promise<ServiceRequest> {
    try {
      console.log('ServiceRequestService: Creating new service request...');
      console.log('Request data:', request);
      
      const requests = await this.getServiceRequests();
      const newRequest: ServiceRequest = {
        ...request,
        id: Date.now().toString(),
        requestTime: new Date().toISOString(),
        status: 'PENDING'
      };
      
      console.log('Generated service request:', newRequest);
      
      requests.push(newRequest);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(requests));
      
      console.log('ServiceRequestService: Service request created successfully');
      console.log('Total requests now:', requests.length);
      
      return newRequest;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  // Update service request status (from staff side)
  async updateServiceRequest(id: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
    try {
      const requests = await this.getServiceRequests();
      const index = requests.findIndex(req => req.id === id);
      
      if (index === -1) {
        return null;
      }
      
      requests[index] = { ...requests[index], ...updates };
      
      // Add completion time if status is completed
      if (updates.status === 'COMPLETED' && !requests[index].completedTime) {
        requests[index].completedTime = new Date().toISOString();
      }
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(requests));
      return requests[index];
    } catch (error) {
      console.error('Error updating service request:', error);
      throw error;
    }
  }

  // Accept service request (staff takes responsibility)
  async acceptServiceRequest(id: string, staffName: string): Promise<ServiceRequest | null> {
    return this.updateServiceRequest(id, {
      status: 'IN_PROGRESS',
      assignedStaff: staffName
    });
  }

  // Complete service request
  async completeServiceRequest(id: string): Promise<ServiceRequest | null> {
    return this.updateServiceRequest(id, {
      status: 'COMPLETED',
      completedTime: new Date().toISOString()
    });
  }

  // Get pending requests count
  async getPendingRequestsCount(): Promise<number> {
    try {
      const requests = await this.getServiceRequests();
      return requests.filter(req => req.status === 'PENDING').length;
    } catch (error) {
      console.error('Error getting pending requests count:', error);
      return 0;
    }
  }

  // Get requests by status
  async getRequestsByStatus(status: ServiceRequest['status']): Promise<ServiceRequest[]> {
    try {
      const requests = await this.getServiceRequests();
      return requests.filter(req => req.status === status);
    } catch (error) {
      console.error('Error getting requests by status:', error);
      return [];
    }
  }

  // Get requests by priority
  async getRequestsByPriority(priority: ServiceRequest['priority']): Promise<ServiceRequest[]> {
    try {
      const requests = await this.getServiceRequests();
      return requests.filter(req => req.priority === priority);
    } catch (error) {
      console.error('Error getting requests by priority:', error);
      return [];
    }
  }

  // Get high priority requests (HIGH + URGENT)
  async getHighPriorityRequests(): Promise<ServiceRequest[]> {
    try {
      const requests = await this.getServiceRequests();
      return requests.filter(req => req.priority === 'HIGH' || req.priority === 'URGENT');
    } catch (error) {
      console.error('Error getting high priority requests:', error);
      return [];
    }
  }

  // Delete old completed requests (cleanup)
  async cleanupOldRequests(daysOld: number = 7): Promise<void> {
    try {
      const requests = await this.getServiceRequests();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const filteredRequests = requests.filter(req => {
        if (req.status !== 'COMPLETED') return true;
        if (!req.completedTime) return true;
        
        const completedDate = new Date(req.completedTime);
        return completedDate > cutoffDate;
      });
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(filteredRequests));
    } catch (error) {
      console.error('Error cleaning up old requests:', error);
    }
  }

  // Initialize with mock data for testing
  async initializeMockData(): Promise<void> {
    try {
      const existingRequests = await this.getServiceRequests();
      if (existingRequests.length > 0) {
        console.log('ServiceRequestService: Mock data already exists, skipping initialization');
        return; // Don't overwrite existing data
      }
      
      console.log('ServiceRequestService: Initializing mock data...');
      
      const mockRequests: ServiceRequest[] = [
        {
          id: '1',
          table: 'B01',
          customerName: 'Nguyễn Văn A',
          type: 'WATER',
          priority: 'NORMAL',
          status: 'PENDING',
          message: 'Cần thêm nước lọc',
          requestTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          estimatedTime: 5,
          customerPhone: '0901234567'
        },
        {
          id: '2',
          table: 'A05',
          customerName: 'Trần Thị B',
          type: 'ASSISTANCE',
          priority: 'HIGH',
          status: 'PENDING',
          message: 'Cần hỗ trợ thanh toán',
          requestTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          estimatedTime: 3,
          customerPhone: '0901234568'
        },
        {
          id: '3',
          table: 'B07',
          customerName: 'Lê Văn C',
          type: 'CLEAN',
          priority: 'LOW',
          status: 'IN_PROGRESS',
          message: 'Bàn cần dọn dẹp',
          requestTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          assignedStaff: 'Nhân viên 1',
          estimatedTime: 10,
          customerPhone: '0901234569'
        },
        {
          id: '4',
          table: 'C02',
          customerName: 'Phạm Thị D',
          type: 'COMPLAINT',
          priority: 'URGENT',
          status: 'PENDING',
          message: 'Món ăn không đúng yêu cầu',
          requestTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          estimatedTime: 5,
          customerPhone: '0901234570'
        },
        {
          id: '5',
          table: 'A03',
          customerName: 'Hoàng Văn E',
          type: 'BILL',
          priority: 'NORMAL',
          status: 'COMPLETED',
          message: 'Yêu cầu hóa đơn',
          requestTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          assignedStaff: 'Nhân viên 2',
          completedTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          customerPhone: '0901234571'
        }
      ];
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(mockRequests));
      console.log('ServiceRequestService: Mock data initialized successfully');
    } catch (error) {
      console.error('Error initializing mock data:', error);
    }
  }
}

export default ServiceRequestService.getInstance();