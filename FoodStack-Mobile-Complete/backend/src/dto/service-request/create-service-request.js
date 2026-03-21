const { z } = require('zod');

const CreateServiceRequestDto = z.object({
  tableId: z.string().uuid('Invalid table ID'),
  branchId: z.string().uuid('Invalid branch ID'),
  type: z.enum(['CALL_STAFF', 'WATER', 'NAPKINS', 'UTENSILS', 'BILL', 'CLEAN_TABLE', 'COMPLAINT', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid service request type' })
  }),
  description: z.string().min(1, 'Description is required').max(500, 'Description must not exceed 500 characters'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name must not exceed 100 characters').optional(),
  customerPhone: z.string().regex(/^(\+84|0)[0-9]{9,10}$/, 'Invalid phone number format').optional()
});

module.exports = { CreateServiceRequestDto };