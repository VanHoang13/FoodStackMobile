const { z } = require('zod');

const CreatePaymentDto = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  paymentMethod: z.enum(['PAYOS', 'MOMO', 'ZALOPAY', 'BANKING_QR', 'CASH'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  }),
  amount: z.number().positive('Amount must be positive'),
  customerInfo: z.object({
    name: z.string().min(1, 'Customer name is required').max(100, 'Name must not exceed 100 characters'),
    phone: z.string().regex(/^(\+84|0)[0-9]{9,10}$/, 'Invalid phone number format').optional(),
    email: z.string().email('Invalid email format').optional()
  }).optional(),
  returnUrl: z.string().url('Invalid return URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
  description: z.string().max(200, 'Description must not exceed 200 characters').optional()
});

module.exports = { CreatePaymentDto };