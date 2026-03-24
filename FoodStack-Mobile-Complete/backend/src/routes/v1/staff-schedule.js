const express = require('express');
const router = express.Router();

// Mock schedule data
let scheduleData = {
  currentWeek: [
    {
      id: '1',
      date: '2024-01-22',
      startTime: '06:00',
      endTime: '14:00',
      type: 'MORNING',
      status: 'COMPLETED',
      location: 'Chi nhánh chính',
      role: 'Phục vụ',
      breakTime: { start: '10:00', end: '10:30', duration: 30 },
    },
    {
      id: '2',
      date: '2024-01-23',
      startTime: '14:00',
      endTime: '22:00',
      type: 'AFTERNOON',
      status: 'COMPLETED',
      location: 'Chi nhánh chính',
      role: 'Phục vụ',
      breakTime: { start: '18:00', end: '18:30', duration: 30 },
    },
    {
      id: '3',
      date: '2024-01-24',
      startTime: '06:00',
      endTime: '14:00',
      type: 'MORNING',
      status: 'CONFIRMED',
      location: 'Chi nhánh chính',
      role: 'Phục vụ',
      breakTime: { start: '10:00', end: '10:30', duration: 30 },
    },
    {
      id: '4',
      date: '2024-01-25',
      startTime: '14:00',
      endTime: '22:00',
      type: 'AFTERNOON',
      status: 'SCHEDULED',
      location: 'Chi nhánh chính',
      role: 'Phục vụ',
    },
    {
      id: '5',
      date: '2024-01-26',
      startTime: '06:00',
      endTime: '14:00',
      type: 'MORNING',
      status: 'SCHEDULED',
      location: 'Chi nhánh chính',
      role: 'Phục vụ',
    },
  ],
  nextWeek: [
    {
      id: '6',
      date: '2024-01-29',
      startTime: '14:00',
      endTime: '22:00',
      type: 'AFTERNOON',
      status: 'SCHEDULED',
      location: 'Chi nhánh chính',
      role: 'Phục vụ',
    },
    {
      id: '7',
      date: '2024-01-30',
      startTime: '06:00',
      endTime: '14:00',
      type: 'MORNING',
      status: 'SCHEDULED',
      location: 'Chi nhánh chính',
      role: 'Phục vụ',
    },
  ],
  timeOffRequests: [
    {
      id: '1',
      startDate: '2024-02-05',
      endDate: '2024-02-07',
      type: 'VACATION',
      status: 'PENDING',
      reason: 'Nghỉ phép thăm gia đình',
      requestedAt: '2024-01-20',
    },
    {
      id: '2',
      startDate: '2024-01-15',
      endDate: '2024-01-15',
      type: 'SICK_LEAVE',
      status: 'APPROVED',
      reason: 'Ốm',
      requestedAt: '2024-01-14',
      approvedBy: 'Quản lý ca',
    },
  ],
  weeklyHours: {
    scheduled: 40,
    worked: 32,
    overtime: 2,
  },
  monthlyStats: {
    totalShifts: 22,
    completedShifts: 20,
    absences: 1,
    lateArrivals: 0,
  },
};

// GET /api/v1/staff/schedule - Get staff schedule
router.get('/', async (req, res) => {
  try {
    const { staffId, week = 'current' } = req.query;
    
    // TODO: Filter by staffId and week
    // TODO: Replace with actual database queries
    
    res.json({
      success: true,
      data: scheduleData,
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải lịch làm việc',
    });
  }
});

// GET /api/v1/staff/schedule/shifts - Get shifts for specific period
router.get('/shifts', async (req, res) => {
  try {
    const { staffId, startDate, endDate, status } = req.query;
    
    let shifts = [...scheduleData.currentWeek, ...scheduleData.nextWeek];
    
    // Filter by status if provided
    if (status && status !== 'ALL') {
      shifts = shifts.filter(shift => shift.status === status);
    }
    
    // TODO: Filter by date range and staffId
    
    res.json({
      success: true,
      data: {
        shifts,
        stats: {
          total: shifts.length,
          scheduled: shifts.filter(s => s.status === 'SCHEDULED').length,
          confirmed: shifts.filter(s => s.status === 'CONFIRMED').length,
          completed: shifts.filter(s => s.status === 'COMPLETED').length,
          cancelled: shifts.filter(s => s.status === 'CANCELLED').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải ca làm việc',
    });
  }
});

// PUT /api/v1/staff/schedule/shifts/:id/status - Update shift status
router.put('/shifts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Find shift in current or next week
    let shiftFound = false;
    let updatedShift = null;
    
    // Check current week
    const currentWeekIndex = scheduleData.currentWeek.findIndex(s => s.id === id);
    if (currentWeekIndex !== -1) {
      scheduleData.currentWeek[currentWeekIndex].status = status;
      if (notes) {
        scheduleData.currentWeek[currentWeekIndex].notes = notes;
      }
      updatedShift = scheduleData.currentWeek[currentWeekIndex];
      shiftFound = true;
    }
    
    // Check next week if not found
    if (!shiftFound) {
      const nextWeekIndex = scheduleData.nextWeek.findIndex(s => s.id === id);
      if (nextWeekIndex !== -1) {
        scheduleData.nextWeek[nextWeekIndex].status = status;
        if (notes) {
          scheduleData.nextWeek[nextWeekIndex].notes = notes;
        }
        updatedShift = scheduleData.nextWeek[nextWeekIndex];
        shiftFound = true;
      }
    }
    
    if (!shiftFound) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ca làm việc',
      });
    }
    
    res.json({
      success: true,
      data: updatedShift,
      message: 'Đã cập nhật trạng thái ca làm việc',
    });
  } catch (error) {
    console.error('Error updating shift status:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái ca làm việc',
    });
  }
});

// GET /api/v1/staff/schedule/time-off - Get time off requests
router.get('/time-off', async (req, res) => {
  try {
    const { staffId, status } = req.query;
    
    let requests = [...scheduleData.timeOffRequests];
    
    // Filter by status if provided
    if (status && status !== 'ALL') {
      requests = requests.filter(request => request.status === status);
    }
    
    // TODO: Filter by staffId
    
    res.json({
      success: true,
      data: {
        requests,
        stats: {
          total: requests.length,
          pending: requests.filter(r => r.status === 'PENDING').length,
          approved: requests.filter(r => r.status === 'APPROVED').length,
          rejected: requests.filter(r => r.status === 'REJECTED').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching time off requests:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải yêu cầu nghỉ phép',
    });
  }
});

// POST /api/v1/staff/schedule/time-off - Create time off request
router.post('/time-off', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type = 'VACATION',
      reason,
      staffId,
    } = req.body;
    
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
      });
    }
    
    const newRequest = {
      id: Date.now().toString(),
      startDate,
      endDate,
      type,
      status: 'PENDING',
      reason,
      requestedAt: new Date().toISOString(),
      staffId: staffId || 'current-staff',
    };
    
    scheduleData.timeOffRequests.push(newRequest);
    
    res.status(201).json({
      success: true,
      data: newRequest,
      message: 'Đã tạo yêu cầu nghỉ phép',
    });
  } catch (error) {
    console.error('Error creating time off request:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo yêu cầu nghỉ phép',
    });
  }
});

// PUT /api/v1/staff/schedule/time-off/:id - Update time off request
router.put('/time-off/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, rejectionReason } = req.body;
    
    const requestIndex = scheduleData.timeOffRequests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu nghỉ phép',
      });
    }
    
    scheduleData.timeOffRequests[requestIndex].status = status;
    
    if (status === 'APPROVED' && approvedBy) {
      scheduleData.timeOffRequests[requestIndex].approvedBy = approvedBy;
      scheduleData.timeOffRequests[requestIndex].approvedAt = new Date().toISOString();
    }
    
    if (status === 'REJECTED' && rejectionReason) {
      scheduleData.timeOffRequests[requestIndex].rejectionReason = rejectionReason;
      scheduleData.timeOffRequests[requestIndex].rejectedAt = new Date().toISOString();
    }
    
    res.json({
      success: true,
      data: scheduleData.timeOffRequests[requestIndex],
      message: 'Đã cập nhật yêu cầu nghỉ phép',
    });
  } catch (error) {
    console.error('Error updating time off request:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật yêu cầu nghỉ phép',
    });
  }
});

// GET /api/v1/staff/schedule/stats - Get schedule statistics
router.get('/stats', async (req, res) => {
  try {
    const { staffId, period = 'month' } = req.query;
    
    // TODO: Calculate actual stats from database
    
    const stats = {
      weekly: scheduleData.weeklyHours,
      monthly: scheduleData.monthlyStats,
      attendance: {
        rate: Math.round((scheduleData.monthlyStats.completedShifts / scheduleData.monthlyStats.totalShifts) * 100),
        onTimeRate: Math.round(((scheduleData.monthlyStats.totalShifts - scheduleData.monthlyStats.lateArrivals) / scheduleData.monthlyStats.totalShifts) * 100),
      },
      performance: {
        averageHoursPerWeek: scheduleData.weeklyHours.worked,
        overtimeHours: scheduleData.weeklyHours.overtime,
        totalHoursThisMonth: scheduleData.weeklyHours.worked * 4,
      },
    };
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching schedule stats:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải thống kê lịch làm việc',
    });
  }
});

// POST /api/v1/staff/schedule/shifts/:id/swap - Request shift swap
router.post('/shifts/:id/swap', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetStaffId, reason } = req.body;
    
    // TODO: Implement shift swap logic
    
    res.json({
      success: true,
      message: 'Đã gửi yêu cầu đổi ca',
      data: {
        swapRequestId: Date.now().toString(),
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error requesting shift swap:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể gửi yêu cầu đổi ca',
    });
  }
});

module.exports = router;