# Staff Workflow System Guide

## Overview

The Staff Workflow System provides a comprehensive solution for managing customer orders and service requests in the FoodStack mobile application. It enables seamless communication between customers and staff, ensuring efficient service delivery.

## System Components

### 1. Staff Order Management
- **Screen**: `StaffOrderManagementScreen`
- **Service**: `StaffOrderService`
- **Purpose**: Manage customer orders from receipt to completion

#### Order Workflow States:
1. **PENDING** → Staff receives new order, needs confirmation
2. **CONFIRMED** → Order confirmed, ready to send to kitchen
3. **PREPARING** → Kitchen is preparing the order
4. **READY** → Order is ready for serving
5. **SERVED** → Order has been served to customer
6. **COMPLETED** → Order process completed

#### Staff Actions:
- **Confirm Order**: Accept pending orders
- **Reject Order**: Decline orders (with reason)
- **Send to Kitchen**: Move confirmed orders to preparation
- **Mark Ready**: Indicate when food is ready
- **Mark Served**: Confirm delivery to customer

### 2. Service Request Management
- **Screen**: `StaffServiceRequestsScreen`
- **Service**: `ServiceRequestService`
- **Purpose**: Handle customer service requests in real-time

#### Request Types:
- **WATER**: Additional water/beverages
- **CLEAN**: Table cleaning requests
- **ASSISTANCE**: General help requests
- **BILL**: Payment requests
- **COMPLAINT**: Customer complaints
- **OTHER**: Miscellaneous requests

#### Priority Levels:
- **LOW**: Non-urgent requests (cleaning, napkins)
- **NORMAL**: Standard requests (water, utensils)
- **HIGH**: Important requests (assistance, bill)
- **URGENT**: Critical requests (complaints, emergencies)

#### Request Workflow:
1. **PENDING** → New request from customer
2. **IN_PROGRESS** → Staff member assigned and working
3. **COMPLETED** → Request fulfilled

### 3. Customer Integration
- **Screen**: `ServiceRequestScreen` (updated)
- **Purpose**: Allow customers to submit service requests
- **Features**:
  - Quick service buttons
  - Custom message input for complaints/special requests
  - Real-time status tracking
  - Recent request history

## Data Persistence

Both services use AsyncStorage for data persistence:

### StaffOrderService
- **Storage Key**: `staff_orders`
- **Data**: Array of StaffOrder objects
- **Features**:
  - Order status updates
  - Order rejection/cancellation
  - Automatic completion timestamps
  - Cleanup of old completed orders

### ServiceRequestService
- **Storage Key**: `service_requests`
- **Data**: Array of ServiceRequest objects
- **Features**:
  - Request creation and updates
  - Staff assignment tracking
  - Priority-based filtering
  - Automatic completion timestamps

## Navigation Integration

### Staff Dashboard Updates
- **Order Management**: Navigate to `StaffOrderManagement`
- **Service Requests**: Navigate to `StaffServiceRequests`
- **Real-time Counters**: Show pending counts with badges
- **Quick Actions**: Direct access to workflow screens

### Bottom Navigation
- **Dashboard**: Staff overview and statistics
- **Orders**: Order management workflow
- **Tables**: Table status management
- **Requests**: Service request handling
- **Profile**: Staff profile and settings

## Real-time Features

### Auto-refresh
- **Order Screen**: Refreshes every 30 seconds
- **Service Requests**: Refreshes every 15 seconds
- **Dashboard**: Updates counters automatically

### Status Indicators
- **Color-coded Status**: Visual status representation
- **Priority Badges**: Urgent/high priority highlighting
- **Time Tracking**: Shows request/order age
- **Progress Indicators**: Loading states for actions

## Mock Data System

### Initialization
Both services include `initializeMockData()` methods that:
- Check for existing data to avoid overwrites
- Create realistic sample data for testing
- Include various statuses and priorities
- Provide Vietnamese customer names and scenarios

### Sample Data Includes:
- **Orders**: Different food items, customizations, tables
- **Requests**: Various service types, priorities, timestamps
- **Customers**: Vietnamese names and phone numbers
- **Tables**: Different table numbers and areas

## Integration Points

### Customer to Staff Flow
1. Customer submits service request via `ServiceRequestScreen`
2. Request stored in `ServiceRequestService`
3. Staff sees request in `StaffServiceRequestsScreen`
4. Staff accepts and processes request
5. Status updates visible to both sides

### Order Processing Flow
1. Customer places order (existing cart system)
2. Order appears in `StaffOrderManagementScreen`
3. Staff processes through workflow states
4. Customer can track via existing order tracking
5. Integration with payment and loyalty systems

## Technical Implementation

### Service Architecture
```typescript
// Service Pattern
class ServiceRequestService {
  private static instance: ServiceRequestService;
  private storageKey = 'service_requests';
  
  static getInstance(): ServiceRequestService
  async getServiceRequests(): Promise<ServiceRequest[]>
  async createServiceRequest(request): Promise<ServiceRequest>
  async updateServiceRequest(id, updates): Promise<ServiceRequest>
  // ... other methods
}
```

### Data Models
```typescript
interface ServiceRequest {
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
  // ... other fields
}
```

### Error Handling
- Try-catch blocks for all async operations
- User-friendly error messages
- Fallback to empty arrays on data load failures
- Loading states during operations

## Usage Instructions

### For Staff Members

#### Managing Orders:
1. Open Staff Dashboard
2. Tap "Quản lý đơn hàng" or use bottom navigation
3. View orders by status using filter chips
4. Tap action buttons to update order status
5. Use pull-to-refresh for latest updates

#### Handling Service Requests:
1. Navigate to "Yêu cầu dịch vụ" from dashboard
2. See requests filtered by status/priority
3. Tap "Nhận việc" to accept pending requests
4. Tap "Hoàn thành" when task is finished
5. Monitor high-priority requests with red badges

### For Customers

#### Submitting Service Requests:
1. From menu or order screens, tap service request
2. Choose from predefined service types
3. Add custom message for complaints/special requests
4. Submit and receive confirmation
5. Track status in recent requests section

## Future Enhancements

### Planned Features
- **Push Notifications**: Real-time alerts for new requests
- **Staff Chat**: Internal communication system
- **Analytics**: Performance metrics and reporting
- **Voice Commands**: Hands-free operation
- **QR Integration**: Quick table identification

### API Integration
- Replace AsyncStorage with backend APIs
- Real-time WebSocket connections
- Multi-restaurant support
- Staff authentication and permissions
- Advanced reporting and analytics

## Troubleshooting

### Common Issues
1. **Data not persisting**: Check AsyncStorage permissions
2. **Screens not updating**: Verify auto-refresh intervals
3. **Navigation errors**: Ensure all screens are registered
4. **Mock data conflicts**: Clear storage and reinitialize

### Debug Tips
- Check console logs for service errors
- Use React Native Debugger for state inspection
- Verify AsyncStorage data with dev tools
- Test with different device orientations

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Load data only when needed
- **Pagination**: Limit large data sets
- **Caching**: Store frequently accessed data
- **Cleanup**: Remove old completed items
- **Debouncing**: Limit rapid API calls

### Memory Management
- Regular cleanup of old orders/requests
- Efficient data structures
- Proper component unmounting
- AsyncStorage size monitoring

This Staff Workflow System provides a solid foundation for restaurant operations management while maintaining flexibility for future enhancements and integrations.