const express = require('express');
const router = express.Router();

// Mock tasks data
let tasks = [
  {
    id: '1',
    title: 'Vệ sinh khu vực bàn ăn',
    description: 'Lau chùi tất cả bàn ghế trong khu vực A',
    category: 'CLEANING',
    priority: 'HIGH',
    status: 'PENDING',
    assignedBy: 'Quản lý ca',
    assignedTo: 'staff-1',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    estimatedTime: 30,
    location: 'Khu vực A',
    checklist: [
      { id: '1', text: 'Lau sạch mặt bàn', completed: false },
      { id: '2', text: 'Sắp xếp ghế ngồi', completed: false },
      { id: '3', text: 'Kiểm tra đồ dùng trên bàn', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Kiểm tra tồn kho nguyên liệu',
    description: 'Kiểm tra và cập nhật số lượng nguyên liệu trong kho',
    category: 'INVENTORY',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
    assignedBy: 'Quản lý kho',
    assignedTo: 'staff-1',
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    estimatedTime: 45,
    location: 'Kho nguyên liệu',
    checklist: [
      { id: '1', text: 'Kiểm tra thịt bò', completed: true },
      { id: '2', text: 'Kiểm tra rau củ', completed: true },
      { id: '3', text: 'Kiểm tra gia vị', completed: false },
      { id: '4', text: 'Cập nhật hệ thống', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Hỗ trợ khách hàng VIP',
    description: 'Phục vụ đặc biệt cho khách hàng VIP tại bàn B01',
    category: 'CUSTOMER_SERVICE',
    priority: 'URGENT',
    status: 'COMPLETED',
    assignedBy: 'Quản lý ca',
    assignedTo: 'staff-1',
    dueDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedTime: 20,
    actualTime: 18,
    location: 'Bàn B01',
  },
];

// GET /api/v1/staff/tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const { status, category, assignedTo, priority } = req.query;
    
    let filteredTasks = [...tasks];
    
    // Filter by status
    if (status && status !== 'ALL') {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    // Filter by category
    if (category) {
      filteredTasks = filteredTasks.filter(task => task.category === category);
    }
    
    // Filter by assigned staff
    if (assignedTo) {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === assignedTo);
    }
    
    // Filter by priority
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    // Sort by priority and due date
    filteredTasks.sort((a, b) => {
      const priorityOrder = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    
    res.json({
      success: true,
      data: {
        tasks: filteredTasks,
        stats: {
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'PENDING').length,
          inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          completed: tasks.filter(t => t.status === 'COMPLETED').length,
          overdue: tasks.filter(t => 
            t.status !== 'COMPLETED' && new Date(t.dueDate) < new Date()
          ).length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách công việc',
    });
  }
});

// GET /api/v1/staff/tasks/:id - Get task details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }
    
    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải chi tiết công việc',
    });
  }
});

// POST /api/v1/staff/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority = 'NORMAL',
      assignedTo,
      dueDate,
      estimatedTime,
      location,
      checklist = [],
    } = req.body;
    
    if (!title || !description || !category || !assignedTo || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc',
      });
    }
    
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      category,
      priority,
      status: 'PENDING',
      assignedBy: 'System', // TODO: Get from authenticated user
      assignedTo,
      dueDate,
      createdAt: new Date().toISOString(),
      estimatedTime: estimatedTime || 30,
      location,
      checklist: checklist.map((item, index) => ({
        id: (index + 1).toString(),
        text: item,
        completed: false,
      })),
    };
    
    tasks.push(newTask);
    
    res.status(201).json({
      success: true,
      data: newTask,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo công việc mới',
    });
  }
});

// PUT /api/v1/staff/tasks/:id/status - Update task status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualTime } = req.body;
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }
    
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }
    
    tasks[taskIndex].status = status;
    
    if (status === 'COMPLETED') {
      tasks[taskIndex].completedAt = new Date().toISOString();
      if (actualTime) {
        tasks[taskIndex].actualTime = actualTime;
      }
    }
    
    res.json({
      success: true,
      data: tasks[taskIndex],
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái công việc',
    });
  }
});

// PUT /api/v1/staff/tasks/:id/checklist/:checklistId - Update checklist item
router.put('/:id/checklist/:checklistId', async (req, res) => {
  try {
    const { id, checklistId } = req.params;
    const { completed } = req.body;
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }
    
    const task = tasks[taskIndex];
    if (!task.checklist) {
      return res.status(400).json({
        success: false,
        message: 'Công việc không có checklist',
      });
    }
    
    const checklistItemIndex = task.checklist.findIndex(item => item.id === checklistId);
    if (checklistItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục checklist',
      });
    }
    
    task.checklist[checklistItemIndex].completed = completed;
    
    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật checklist',
    });
  }
});

// DELETE /api/v1/staff/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc',
      });
    }
    
    tasks.splice(taskIndex, 1);
    
    res.json({
      success: true,
      message: 'Đã xóa công việc',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa công việc',
    });
  }
});

// GET /api/v1/staff/tasks/templates - Get task templates
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: '1',
        title: 'Vệ sinh khu vực bàn ăn',
        description: 'Lau chùi và sắp xếp bàn ghế',
        category: 'CLEANING',
        estimatedTime: 30,
        checklist: [
          'Lau sạch mặt bàn',
          'Sắp xếp ghế ngồi',
          'Kiểm tra đồ dùng trên bàn',
          'Lau sàn khu vực',
        ],
      },
      {
        id: '2',
        title: 'Kiểm tra tồn kho',
        description: 'Kiểm tra và cập nhật số lượng nguyên liệu',
        category: 'INVENTORY',
        estimatedTime: 45,
        checklist: [
          'Kiểm tra nguyên liệu chính',
          'Kiểm tra rau củ tươi',
          'Kiểm tra gia vị',
          'Cập nhật hệ thống',
        ],
      },
      {
        id: '3',
        title: 'Phục vụ khách hàng VIP',
        description: 'Dịch vụ đặc biệt cho khách hàng VIP',
        category: 'CUSTOMER_SERVICE',
        estimatedTime: 20,
        checklist: [
          'Chào đón khách hàng',
          'Tư vấn menu đặc biệt',
          'Theo dõi suốt bữa ăn',
          'Thu thập phản hồi',
        ],
      },
    ];
    
    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching task templates:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tải mẫu công việc',
    });
  }
});

module.exports = router;