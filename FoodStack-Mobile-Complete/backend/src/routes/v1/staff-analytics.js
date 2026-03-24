const express = require('express');
const router = express.Router();

// Mock analytics data
let analyticsData = {
  performance: {
    ordersProcessed: 156,
    averageProcessingTime: 8.5,
    customerSatisfaction: 4.7,
    efficiency: 92,
  },
  trends: {
    dailyOrders: [
      { date: '2024-01-15', count: 22 },
      { date: '2024-01-16', count: 28 },
      { date: '2024-01-17', count: 31 },
      { date: '2024-01-18', count: 25 },
      { date: '2024-01-19', count: 35 },
      { date: '2024-01-20', count: 29 },
      { date: '2024-01-21', count: 33 },
    ],
    hourlyDistribution: [
      { hour: 8, orders: 5 },
      { hour: 9, orders: 8 },
      { hour: 10, orders: 12 },
      { hour: 11, orders: 18 },
      { hour: 12, orders: 25 },
      { hour: 13, orders: 22 },
      { hour: 14, orders: 15 },
      { hour: 15, orders: 10 },
      { hour: 16, orders: 8 },
      { hour: 17, orders: 12 },
      { hour: 18, orders: 20 },
      { hour: 19, orders: 18 },
    ],
    categoryPerformance: [
      { category: 'Phở', orders: 45, revenue: 2250000 },
      { category: 'Bún', orders: 32, revenue: 1600000 },
      { category: 'Cơm', orders: 28, revenue: 1260000 },
      { category: 'Đồ uống', orders: 51, revenue: 765000 },
    ],
  },
  comparisons: {
    lastWeek: 12.5,
    lastMonth: 8.3,
    teamAverage: 85,
    ranking: 3,
  },
  goals: {
    ordersTarget: 180,
    ordersActual: 156,
    timeTarget: 10,
    timeActual: 8.5,
    satisfactionTarget: 4.5,
    satisfactionActual: 4.7,
  },
};

// GET /api/v1/staff/analytics - Get analytics data
router.get('/', async (req, res) => {
  try {
    const { period = 'WEEK', staffId } = req.query;
    
    // TODO: Filter by period and staffId
    // TODO: Replace with actual database queries
    
    res.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải dữ liệu phân tích',
    });
  }
});

// GET /api/v1/staff/analytics/performance - Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    const { staffId, period = 'WEEK' } = req.query;
    
    // Mock performance data
    const performanceData = {
      kpis: [
        {
          id: '1',
          name: 'Đơn hàng/giờ',
          value: 12.5,
          target: 15,
          unit: 'đơn',
          trend: 'up',
          trendValue: 8.3,
          color: '#3498DB',
          icon: 'trending-up',
        },
        {
          id: '2',
          name: 'Thời gian phục vụ',
          value: 8.2,
          target: 10,
          unit: 'phút',
          trend: 'down',
          trendValue: -12.5,
          color: '#27AE60',
          icon: 'clock',
        },
        {
          id: '3',
          name: 'Độ chính xác',
          value: 96.8,
          target: 95,
          unit: '%',
          trend: 'up',
          trendValue: 2.1,
          color: '#E67E22',
          icon: 'target',
        },
        {
          id: '4',
          name: 'Đánh giá khách hàng',
          value: 4.7,
          target: 4.5,
          unit: '/5',
          trend: 'stable',
          trendValue: 0,
          color: '#9B59B6',
          icon: 'star',
        },
      ],
      achievements: [
        {
          id: '1',
          title: 'Speed Demon',
          description: 'Xử lý 100 đơn hàng trong 1 ngày',
          icon: 'zap',
          color: '#F39C12',
          unlockedAt: '2024-01-20',
        },
        {
          id: '2',
          title: 'Customer Favorite',
          description: 'Nhận 50 đánh giá 5 sao',
          icon: 'heart',
          color: '#E74C3C',
          unlockedAt: '2024-01-18',
        },
        {
          id: '3',
          title: 'Perfect Week',
          description: 'Hoàn thành mục tiêu cả tuần',
          icon: 'award',
          color: '#27AE60',
          unlockedAt: '2024-01-15',
        },
        {
          id: '4',
          title: 'Team Player',
          description: 'Hỗ trợ đồng nghiệp 20 lần',
          icon: 'users',
          color: '#3498DB',
          unlockedAt: '',
          progress: 15,
          maxProgress: 20,
        },
      ],
      ranking: {
        position: 3,
        totalStaff: 15,
        score: 892,
        change: 2,
      },
      streaks: {
        current: 7,
        longest: 12,
        type: 'Đạt mục tiêu hàng ngày',
      },
      feedback: {
        positive: 85,
        neutral: 12,
        negative: 3,
        recent: [
          {
            rating: 5,
            comment: 'Phục vụ rất tốt, nhanh chóng và chu đáo',
            date: '2024-01-21',
          },
          {
            rating: 4,
            comment: 'Nhân viên thân thiện, món ăn ngon',
            date: '2024-01-20',
          },
          {
            rating: 5,
            comment: 'Excellent service!',
            date: '2024-01-19',
          },
        ],
      },
    };
    
    res.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải dữ liệu hiệu suất',
    });
  }
});

// GET /api/v1/staff/analytics/reports - Generate reports
router.get('/reports', async (req, res) => {
  try {
    const { type = 'DAILY', startDate, endDate, format = 'JSON' } = req.query;
    
    // TODO: Generate actual reports based on parameters
    
    const reportData = {
      type,
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      data: {
        summary: {
          totalOrders: 156,
          totalRevenue: 7800000,
          averageOrderValue: 50000,
          customerSatisfaction: 4.7,
        },
        details: analyticsData.trends.dailyOrders,
      },
    };
    
    if (format === 'CSV') {
      // TODO: Convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=staff-report.csv');
      res.send('Date,Orders,Revenue\n' + 
        reportData.data.details.map(d => `${d.date},${d.count},${d.count * 50000}`).join('\n'));
    } else {
      res.json({
        success: true,
        data: reportData,
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo báo cáo',
    });
  }
});

module.exports = router;