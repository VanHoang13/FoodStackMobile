// src/dto/staff/get-staff-list.js

const { z } = require('zod');

const GetStaffListSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(500).default(10), // Tăng từ 100 lên 500 để hỗ trợ thống kê
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

module.exports = { GetStaffListSchema };
