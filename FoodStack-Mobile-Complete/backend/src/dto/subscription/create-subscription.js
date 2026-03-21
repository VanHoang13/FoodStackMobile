const { z } = require('zod');

const CreateSubscriptionSchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID'),
  planId: z.string().uuid('Invalid plan ID'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY'], {
    errorMap: () => ({ message: 'Billing cycle must be MONTHLY or YEARLY' })
  }),
  paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'PAYOS'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  }),
  autoRenew: z.boolean().default(true),
  couponCode: z.string().optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional()
});

module.exports = { CreateSubscriptionSchema };