const express = require('express');
const router = express.Router();

// Mock performance data
const mockPerformance = {
  overall: {
    score: 87,
    rank: 3,
    totalStaff: 15,
    level: 'ADVANCED',
  },
  kpis: {
    speed: { value: 92, target: 90, trend: 5 },
    accuracy: { value: 88, target: 95, trend: -2 },
    customerService: { value: 94, target: 90, trend: 8 },
    teamwork: { value: 85, target: 85, trend: 3 },
  },
  goals: {
    daily: { 
      completed: 4, 
      total: 5, 
      tasks: ['Xử lý 20 đơn hàng', 'Đánh giá 4.5+ sao', 'Không có khiếu nại', 'Hỗ trợ đồng nghiệp', 'Hoàn thành ca đúng giờ']
    },
    weekly: { 
      completed: 3, 
      total: 4, 
      tasks: ['Xử lý 100 đơn hàng', 'Đạt 90% độ chính xác', 'Tham gia đào tạo', 'Cải thiện thời gian phục vụ']
    },
    monthly: { 
      completed: 2, 
      total: 3, 
      tasks: ['Đạt KPI tháng', 'Nhận phản hồi tích cực', 'Hoàn thành khóa học']
    },
  },
  badges: [
    {
      id: '1',
      name: 'Speed Demon',
      description: 'Xử lý đơn hàng nhanh nhất trong tuần',
      icon: '⚡',
      earnedAt: '2024-01-15',
      rarity: 'RARE',
    },
    {
      id: '2',
      name: 'Customer Hero',
      description: 'Nhận 50 đánh giá 5 sao',
      icon: '⭐',
      earnedAt: '2024-01-10',
      rarity: 'EPIC',
    },
    {
      id: '3',
      name: 'Team Player',
      description: 'Hỗ trợ đồng nghiệp 20 lần',
      icon: '🤝',
      earnedAt: '2024-01-05',
      rarity: 'COMMON',
    },
  ],
  feedback: {
    positive: [
      'Phục vụ khách hàng rất tốt',
      'Luôn đúng giờ và có trách nhiệm',
      'Hỗ trợ đồng nghiệp nhiệt tình',
    ],
    improvements: [
      'Cần cải thiện tốc độ xử lý đơn hàng',
      'Chú ý hơn đến chi tiết',
    ],
    managerNotes: 'Nhân viên có tiềm năng phát triển tốt. Cần tập trung vào việc cải thiện độ chính xác trong công việc.',
  },
};

// GET /api/v1/staff/performance - Get overall performance data
router.get('/', async (req, res) => {
  try {
    const { staffId } = req.query;
    
    // TODO: Replace with actual database queries
    
    res.json({
      success: true,
      data: mockPerformance,
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải dữ liệu hiệu suất',
    });
  }
});

// GET /api/v1/staff/performance/kpis - Get KPI data
router.get('/kpis', async (req, res) => {
  try {
    const { staffId, period = 'MONTH' } = req.query;
    
    // TODO: Calculate actual KPIs from database
    
    res.json({
      success: true,
      data: mockPerformance.kpis,
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải dữ liệu KPI',
    });
  }
});

// GET /api/v1/staff/performance/goals - Get goals data
router.get('/goals', async (req, res) => {
  try {
    const { staffId } = req.query;
    
    // TODO: Fetch actual goals from database
    
    res.json({
      success: true,
      data: mockPerformance.goals,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải dữ liệu mục tiêu',
    });
  }
});

// PUT /api/v1/staff/performance/goals/:goalId - Update goal progress
router.put('/goals/:goalId', async (req, res) => {
  try {
    const { goalId } = req.params;
    const { completed } = req.body;
    
    // TODO: Update goal in database
    
    res.json({
      success: true,
      message: 'Đã cập nhật tiến độ mục tiêu',
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật mục tiêu',
    });
  }
});

// GET /api/v1/staff/performance/badges - Get badges data
router.get('/badges', async (req, res) => {
  try {
    const { staffId } = req.query;
    
    // TODO: Fetch actual badges from database
    
    res.json({
      success: true,
      data: mockPerformance.badges,
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải dữ liệu huy hiệu',
    });
  }
});

// GET /api/v1/staff/performance/feedback - Get feedback data
router.get('/feedback', async (req, res) => {
  try {
    const { staffId } = req.query;
    
    // TODO: Fetch actual feedback from database
    
    res.json({
      success: true,
      data: mockPerformance.feedback,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải dữ liệu phản hồi',
    });
  }
});

// POST /api/v1/staff/performance/feedback - Add new feedback
router.post('/feedback', async (req, res) => {
  try {
    const { staffId, type, message, rating } = req.body;
    
    // TODO: Save feedback to database
    
    res.status(201).json({
      success: true,
      message: 'Đã thêm phản hồi thành công',
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thêm phản hồi',
    });
  }
});

module.exports = router;