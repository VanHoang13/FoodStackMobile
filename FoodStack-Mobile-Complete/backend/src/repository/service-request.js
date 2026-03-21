const { prisma } = require('../config/database.config');
const { v4: uuidv4 } = require('uuid');

class ServiceRequestRepository {
  async create(data) {
    // Since service_requests table doesn't exist, we'll use notifications as a workaround
    // or create the table first
    const serviceRequestData = {
      id: uuidv4(),
      type: 'SERVICE_REQUEST',
      title: `Service Request: ${data.type}`,
      message: data.description || `${data.type} request from table ${data.tableId}`,
      data: {
        tableId: data.tableId,
        branchId: data.branchId,
        requestType: data.type,
        priority: data.priority || 'MEDIUM',
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        status: 'PENDING'
      },
      branch_id: data.branchId,
      created_at: new Date()
    };
    
    return await prisma.notifications.create({
      data: serviceRequestData
    });
  }

  async findById(id) {
    return await prisma.notifications.findUnique({
      where: { id },
      include: {
        // Note: notifications table doesn't have direct relations to tables/branches
        // We'll need to handle this in the service layer
      }
    });
  }

  async findByTable(tableId, status = null) {
    const where = { 
      type: 'SERVICE_REQUEST',
      data: {
        path: ['tableId'],
        equals: tableId
      }
    };

    if (status) {
      where.data = {
        path: ['status'],
        equals: status
      };
    }

    return await prisma.notifications.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });
  }

  async findByBranch(branchId, filters = {}) {
    const where = { 
      branch_id: branchId,
      type: 'SERVICE_REQUEST'
    };
    
    if (filters.status) {
      where.data = {
        path: ['status'],
        equals: filters.status
      };
    }

    return await prisma.notifications.findMany({
      where,
      orderBy: { created_at: 'asc' }
    });
  }

  async updateStatus(id, updateData) {
    // Get current notification
    const current = await prisma.notifications.findUnique({
      where: { id }
    });

    if (!current) return null;

    const updatedData = {
      ...current.data,
      ...updateData,
      updatedAt: new Date()
    };

    return await prisma.notifications.update({
      where: { id },
      data: {
        data: updatedData,
        is_read: updateData.status === 'COMPLETED'
      }
    });
  }

  async cancel(id, reason) {
    const current = await prisma.notifications.findUnique({
      where: { id }
    });

    if (!current) return null;

    const updatedData = {
      ...current.data,
      status: 'CANCELLED',
      cancellationReason: reason,
      cancelledAt: new Date()
    };

    return await prisma.notifications.update({
      where: { id },
      data: {
        data: updatedData,
        is_read: true
      }
    });
  }

  async getStats(branchId, filters = {}) {
    const where = { 
      branch_id: branchId,
      type: 'SERVICE_REQUEST'
    };
    
    if (filters.from && filters.to) {
      where.created_at = {
        gte: new Date(filters.from),
        lte: new Date(filters.to)
      };
    }

    const [total, notifications] = await Promise.all([
      prisma.notifications.count({ where }),
      prisma.notifications.findMany({
        where,
        select: {
          data: true,
          created_at: true
        }
      })
    ]);

    // Process stats from notification data
    let pending = 0, inProgress = 0, completed = 0, cancelled = 0;
    const byType = {};
    const byPriority = {};

    notifications.forEach(notif => {
      const data = notif.data || {};
      const status = data.status || 'PENDING';
      const type = data.requestType || 'OTHER';
      const priority = data.priority || 'MEDIUM';

      switch (status) {
        case 'PENDING': pending++; break;
        case 'IN_PROGRESS': inProgress++; break;
        case 'COMPLETED': completed++; break;
        case 'CANCELLED': cancelled++; break;
      }

      byType[type] = (byType[type] || 0) + 1;
      byPriority[priority] = (byPriority[priority] || 0) + 1;
    });

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      averageResponseTime: 0, // Would need more complex calculation
      byType,
      byPriority
    };
  }
}

module.exports = { ServiceRequestRepository };