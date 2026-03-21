const { z } = require('zod');

const UpdateServiceRequestDto = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid status' })
  }).optional(),
  assignedTo: z.string().uuid('Invalid staff ID').optional(),
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  completedAt: z.string().datetime().optional()
});

module.exports = { UpdateServiceRequestDto };