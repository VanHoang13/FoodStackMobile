const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { validation } = require('../../middleware/validation');
const { CreatePaymentDto } = require('../../dto/payment/create-payment');

// Payment Repository
const { PaymentRepository } = require('../../repository/payment');
const { OrderRepository } = require('../../repository/order');
const { prisma } = require('../../config/database.config');
const paymentRepository = new PaymentRepository();
const orderRepository = new OrderRepository(prisma);

/**
 * @route POST /api/v1/payments/create
 * @desc Create payment for an order
 * @access Public
 */
router.post('/create', validation(CreatePaymentDto), async (req, res) => {
  try {
    const {
      orderId,
      paymentMethod,
      amount,
      customerInfo
    } = req.body;

    // Get order details
    const order = await orderRepository.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.payment_status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }

    // Validate amount
    if (parseFloat(amount) !== parseFloat(order.total)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${amount}) does not match order total (${order.total})`
      });
    }

    // Create payment record
    const payment = await paymentRepository.create({
      orderId: orderId,
      paymentMethod: paymentMethod,
      amount: amount,
      transactionRef: null,
      payosData: null,
      idempotencyKey: `payment_${orderId}_${Date.now()}`
    });

    let paymentUrl = null;
    let qrCode = null;

    // Handle different payment methods
    switch (paymentMethod) {
      case 'PAYOS':
        // Integrate with PayOS
        paymentUrl = await createPayOSPayment(payment, order);
        break;
      
      case 'MOMO':
        // Integrate with MoMo
        paymentUrl = await createMoMoPayment(payment, order);
        break;
      
      case 'ZALOPAY':
        // Integrate with ZaloPay
        paymentUrl = await createZaloPayPayment(payment, order);
        break;
      
      case 'BANKING':
        // Generate banking QR code
        qrCode = await generateBankingQR(payment, order);
        break;
      
      case 'CASH':
        // Cash payment - mark as pending for staff confirmation
        await paymentRepository.updateStatus(payment.id, 'PENDING_CONFIRMATION');
        break;
    }

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        paymentId: payment.id,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        status: payment.status,
        paymentUrl,
        qrCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      }
    });
  } catch (error) {
    console.error('❌ Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/payments/:orderId
 * @desc Get payment status for an order
 * @access Public
 */
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await paymentRepository.findByOrderId(orderId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: payment.id,
        orderId: payment.order_id,
        paymentMethod: payment.payment_method,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.created_at,
        paidAt: payment.paid_at,
        failureReason: payment.failure_reason,
        transactionId: payment.transaction_id,
      }
    });
  } catch (error) {
    console.error('❌ Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment',
      error: error.message
    });
  }
});

/**
 * @route POST /api/v1/payments/webhook/payos
 * @desc PayOS webhook handler
 * @access Public (PayOS)
 */
router.post('/webhook/payos', async (req, res) => {
  try {
    const { paymentId, status, transactionId, amount } = req.body;

    // Verify webhook signature (implement PayOS signature verification)
    
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Update payment status
    const updateData = {
      status: status === 'PAID' ? 'SUCCESS' : 'FAILED',
      transaction_id: transactionId,
      paid_at: status === 'PAID' ? new Date() : null,
      updated_at: new Date(),
    };

    await paymentRepository.updateStatus(payment.id, updateData);

    // Update order payment status
    if (status === 'PAID') {
      await orderRepository.updatePaymentStatus(payment.order_id, 'PAID');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ PayOS webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/v1/payments/webhook/momo
 * @desc MoMo webhook handler
 * @access Public (MoMo)
 */
router.post('/webhook/momo', async (req, res) => {
  try {
    // Handle MoMo webhook
    // Similar to PayOS webhook
    res.json({ success: true });
  } catch (error) {
    console.error('❌ MoMo webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/v1/payments/:id/confirm
 * @desc Confirm cash payment (for staff)
 * @access Private (Staff+)
 */
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { received_amount, change_amount } = req.body;
    const staffId = req.user.id;

    const payment = await paymentRepository.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.payment_method !== 'CASH') {
      return res.status(400).json({
        success: false,
        message: 'Only cash payments can be confirmed manually'
      });
    }

    // Update payment status
    await paymentRepository.updateStatus(id, {
      status: 'SUCCESS',
      received_amount,
      change_amount,
      confirmed_by: staffId,
      paid_at: new Date(),
      updated_at: new Date(),
    });

    // Update order payment status
    await orderRepository.updatePaymentStatus(payment.order_id, 'PAID');

    res.json({
      success: true,
      message: 'Cash payment confirmed successfully'
    });
  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
});

/**
 * @route GET /api/v1/payments/branch/:branchId/pending
 * @desc Get pending cash payments for a branch
 * @access Private (Staff+)
 */
router.get('/branch/:branchId/pending', auth, async (req, res) => {
  try {
    const { branchId } = req.params;

    const payments = await paymentRepository.findPendingCashPayments(branchId);

    res.json({
      success: true,
      data: payments.map(payment => ({
        id: payment.id,
        orderId: payment.order_id,
        orderNumber: payment.order.order_number,
        amount: payment.amount,
        table: {
          name: payment.order.table.table_number,
          area: payment.order.table.areas?.name || 'Unknown'
        },
        customerName: payment.customer_name,
        createdAt: payment.created_at,
      }))
    });
  } catch (error) {
    console.error('❌ Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending payments',
      error: error.message
    });
  }
});

// Helper functions for payment integrations
async function createPayOSPayment(payment, order) {
  // TODO: Implement PayOS integration
  return `https://pay.payos.vn/web/${payment.id}`;
}

async function createMoMoPayment(payment, order) {
  // TODO: Implement MoMo integration
  return `https://test-payment.momo.vn/pay/${payment.id}`;
}

async function createZaloPayPayment(payment, order) {
  // TODO: Implement ZaloPay integration
  return `https://zalopay.vn/pay/${payment.id}`;
}

async function generateBankingQR(payment, order) {
  // TODO: Generate banking QR code
  return {
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'FOODSTACK RESTAURANT',
    amount: payment.amount,
    content: `Thanh toan don hang ${order.order_number}`,
    qrString: `banking_qr_${payment.id}`,
  };
}

module.exports = router;