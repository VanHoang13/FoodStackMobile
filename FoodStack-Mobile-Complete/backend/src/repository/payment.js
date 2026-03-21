const { prisma } = require('../config/database.config');
const { v4: uuidv4 } = require('uuid');

class PaymentRepository {
  async create(data) {
    return await prisma.payments.create({
      data: {
        id: uuidv4(),
        order_id: data.orderId,
        amount: data.amount,
        method: data.paymentMethod,
        status: 'PENDING',
        transaction_ref: data.transactionRef,
        payos_data: data.payosData || null,
        idempotency_key: data.idempotencyKey || uuidv4(),
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        orders: true
      }
    });
  }

  async findById(id) {
    return await prisma.payments.findUnique({
      where: { id },
      include: {
        orders: true
      }
    });
  }

  async findByOrderId(orderId) {
    return await prisma.payments.findFirst({
      where: { order_id: orderId },
      orderBy: { created_at: 'desc' },
      include: {
        orders: true
      }
    });
  }

  async updateStatus(id, updateData) {
    return await prisma.payments.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });
  }

  async findPendingCashPayments(branchId) {
    return await prisma.payments.findMany({
      where: {
        method: 'CASH',
        status: 'PENDING_CONFIRMATION',
        orders: {
          branch_id: branchId
        }
      },
      include: {
        orders: true
      },
      orderBy: { created_at: 'asc' }
    });
  }

  async getPaymentStats(branchId, filters = {}) {
    const where = {
      orders: {
        branch_id: branchId
      }
    };

    if (filters.from && filters.to) {
      where.created_at = {
        gte: new Date(filters.from),
        lte: new Date(filters.to)
      };
    }

    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalAmount,
      byMethod
    ] = await Promise.all([
      prisma.payments.count({ where }),
      prisma.payments.count({ where: { ...where, status: 'SUCCESS' } }),
      prisma.payments.count({ where: { ...where, status: 'FAILED' } }),
      prisma.payments.count({ where: { ...where, status: { in: ['PENDING', 'PENDING_CONFIRMATION'] } } }),
      prisma.payments.aggregate({
        where: { ...where, status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      prisma.payments.groupBy({
        by: ['method'],
        where: { ...where, status: 'SUCCESS' },
        _count: { method: true },
        _sum: { amount: true }
      })
    ]);

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalAmount: totalAmount._sum.amount || 0,
      successRate: totalPayments > 0 ? (successfulPayments / totalPayments * 100) : 0,
      byMethod: byMethod.reduce((acc, item) => {
        acc[item.method] = {
          count: item._count.method,
          amount: item._sum.amount || 0
        };
        return acc;
      }, {})
    };
  }
}

module.exports = { PaymentRepository };