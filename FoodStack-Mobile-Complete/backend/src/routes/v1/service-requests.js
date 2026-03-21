const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { validation } = require('../../middleware/validation');
const { CreateServiceRequestDto } = require('../../dto/service-request/create-service-request');
const { UpdateServiceRequestDto } = require('../../dto/service-request/update-service-request');

// Service Request Repository
const { ServiceRequestRepository } = require('../../repository/service-request');
const serviceRequestRepository = new ServiceRequestRepository();

/**
 * @route POST /api/v1/service-requests
 * @desc Create a new service request
 * @access Public (for customers at tables)
 */
router.post('/', validation(CreateServiceRequestDto), async (req, res) => {
  try {
    const {
      tableId,
      branchId,
      type,
      description,
      priority = 'NORMAL',
      customerName,
      customerPhone
    } = req.body;

    // Create service request
    const serviceRequest = await serviceRequestRepository.create({
      table_id: tableId,
      branch_id: branchId,
      type,
      description,
      priority,
      status: 'PENDING',
      customer_name: customerName,
      customer_phone: customerPhone,
      created_at: new Date(),
    });

    // TODO: Send real-time notification to staff

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: {
        id: serviceRequest.id,
        type: serviceRequest.type,
        status: serviceRequest.status,
        priority: serviceRequest.priority,
        description: serviceRequest.description,
        createdAt: serviceRequest.created_at,
      }
    });
  } catch (error) {
    console.error('❌ Create service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service request',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/service-requests/table/:tableId
 * @desc Get service requests for a table
 * @access Public
 */
router.get('/table/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { status } = req.query;

    const requests = await serviceRequestRepository.findByTable(tableId, status);

    res.json({
      success: true,
      data: requests.map(request => ({
        id: request.id,
        type: request.type,
        status: request.status,
        priority: request.priority,
        description: request.description,
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        resolvedAt: request.resolved_at,
        staffResponse: request.staff_response,
      }))
    });
  } catch (error) {
    console.error('❌ Get table service requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service requests',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/service-requests/branch/:branchId
 * @desc Get service requests for a branch (for staff)
 * @access Private (Staff+)
 */
router.get('/branch/:branchId', auth, async (req, res) => {
  try {
    const { branchId } = req.params;
    const { status = 'PENDING', priority } = req.query;

    const requests = await serviceRequestRepository.findByBranch(branchId, { status, priority });

    res.json({
      success: true,
      data: requests.map(request => ({
        id: request.id,
        type: request.type,
        status: request.status,
        priority: request.priority,
        description: request.description,
        table: {
          id: request.table.id,
          name: request.table.table_number,
          area: request.table.areas?.name || 'Unknown'
        },
        customerName: request.customer_name,
        customerPhone: request.customer_phone,
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        resolvedAt: request.resolved_at,
        staffResponse: request.staff_response,
        assignedStaff: request.assigned_staff ? {
          id: request.assigned_staff.id,
          name: request.assigned_staff.full_name
        } : null,
      }))
    });
  } catch (error) {
    console.error('❌ Get branch service requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service requests',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/v1/service-requests/:id/status
 * @desc Update service request status
 * @access Private (Staff+)
 */
router.put('/:id/status', auth, validation(UpdateServiceRequestDto), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staffResponse, estimatedTime } = req.body;
    const staffId = req.user.id;

    const serviceRequest = await serviceRequestRepository.updateStatus(id, {
      status,
      staff_response: staffResponse,
      estimated_time: estimatedTime,
      assigned_staff_id: staffId,
      resolved_at: status === 'COMPLETED' ? new Date() : null,
      updated_at: new Date(),
    });

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // TODO: Send real-time notification to customer

    res.json({
      success: true,
      message: 'Service request updated successfully',
      data: {
        id: serviceRequest.id,
        status: serviceRequest.status,
        staffResponse: serviceRequest.staff_response,
        updatedAt: serviceRequest.updated_at,
        resolvedAt: serviceRequest.resolved_at,
      }
    });
  } catch (error) {
    console.error('❌ Update service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service request',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/v1/service-requests/:id
 * @desc Cancel service request
 * @access Public (Customer) / Private (Staff+)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const serviceRequest = await serviceRequestRepository.cancel(id, reason);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.json({
      success: true,
      message: 'Service request cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Cancel service request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel service request',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/service-requests/stats/:branchId
 * @desc Get service request statistics for a branch
 * @access Private (Manager+)
 */
router.get('/stats/:branchId', auth, async (req, res) => {
  try {
    const { branchId } = req.params;
    const { from, to } = req.query;

    const stats = await serviceRequestRepository.getStats(branchId, { from, to });

    res.json({
      success: true,
      data: {
        total: stats.total,
        pending: stats.pending,
        inProgress: stats.inProgress,
        completed: stats.completed,
        cancelled: stats.cancelled,
        averageResponseTime: stats.averageResponseTime,
        byType: stats.byType,
        byPriority: stats.byPriority,
      }
    });
  } catch (error) {
    console.error('❌ Get service request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service request statistics',
      error: error.message
    });
  }
});

module.exports = router;