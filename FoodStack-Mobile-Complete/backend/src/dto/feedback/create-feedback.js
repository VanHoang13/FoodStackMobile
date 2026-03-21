const { z } = require('zod');

const CreateFeedbackDto = z.object({
  orderId: z.string().uuid('Invalid order ID').optional(),
  branchId: z.string().uuid('Invalid branch ID'),
  restaurantId: z.string().uuid('Invalid restaurant ID'),
  overallRating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
  categoryRatings: z.object({
    foodQuality: z.number().int().min(1).max(5).optional(),
    service: z.number().int().min(1).max(5).optional(),
    atmosphere: z.number().int().min(1).max(5).optional(),
    price: z.number().int().min(1).max(5).optional(),
    cleanliness: z.number().int().min(1).max(5).optional()
  }).optional(),
  comment: z.string().max(1000, 'Comment must not exceed 1000 characters').optional(),
  customerInfo: z.object({
    name: z.string().min(1, 'Customer name is required').max(100, 'Name must not exceed 100 characters'),
    phone: z.string().regex(/^(\+84|0)[0-9]{9,10}$/, 'Invalid phone number format').optional(),
    email: z.string().email('Invalid email format').optional()
  }).optional(),
  isAnonymous: z.boolean().default(false),
  wouldRecommend: z.boolean().optional(),
  visitAgain: z.boolean().optional()
});

module.exports = { CreateFeedbackDto };