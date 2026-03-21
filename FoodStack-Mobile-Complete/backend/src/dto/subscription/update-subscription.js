const { z } = require('zod');

const UpdateSubscriptionSchema = z.object({
  planId: z.string().uuid('Invalid plan ID').optional(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Billing cycle must be MONTHLY or YEARLY' })
  }).optional(),
  paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'PAYOS'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  }).optional(),
  autoRenew: z.boolean().optional(),
  couponCode: z.string().optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional()
});

module.exports = { UpdateSubscriptionSchema };