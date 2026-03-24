// src/use-cases/staff/get-staff-list.js

const { ValidationError } = require('../../exception/validation-error');
const { UnauthorizedError } = require('../../exception/unauthorized-error');

class GetStaffListUseCase {
  constructor(userRepository, restaurantRepository, branchRepository, prisma) {
    this.userRepository = userRepository;
    this.restaurantRepository = restaurantRepository;
    this.branchRepository = branchRepository;
    this.prisma = prisma;
  }

  async execute(dto, currentUser) {
    // 1. Validate current user is OWNER or MANAGER
    if (!['OWNER', 'MANAGER'].includes(currentUser.role)) {
      throw new UnauthorizedError('Only Owner or Manager can view staff list');
    }

    const { page, limit, search, status } = dto;

    // 2. Get restaurant ID from current user
    const restaurantId = currentUser.restaurantId || currentUser.restaurant_id;
    if (!restaurantId) {
      console.error('Current user missing restaurantId:', currentUser);
      throw new ValidationError('Current user does not have a restaurantId');
    }

    console.log('🔍 Fetching staff for restaurant:', restaurantId);

    // 3. Build filter conditions
    const where = {
      restaurant_id: restaurantId,
      role: { in: ['MANAGER', 'STAFF'] }, // Exclude OWNER and CUSTOMER
    };

    // Add status filter if specified
    if (status) {
      where.status = status;
    }

    // 4. Add search filter if specified
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    console.log('🔍 Query conditions:', where);

    try {
      // 6. Calculate pagination
      const skip = (page - 1) * limit;

      // 7. Fetch staff list with pagination
      const [staffList, total] = await this.prisma.$transaction([
        this.prisma.users.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            email: true,
            full_name: true,
            phone: true,
            role: true,
            status: true,
            created_at: true,
            updated_at: true,
          },
        }),
        this.prisma.users.count({ where }),
      ]);

      console.log('✅ Found staff members:', staffList.length);

      // 8. Map staff data
      const staffWithBranch = staffList.map((staff) => ({
        userId: staff.id,
        email: staff.email,
        name: staff.full_name,
        phone: staff.phone,
        role: staff.role,
        status: staff.status,
        createdAt: staff.created_at,
        updatedAt: staff.updated_at,
      }));

      return {
        staff: staffWithBranch,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Staff list retrieved successfully',
      };
    } catch (error) {
      console.error('❌ Database error in GetStaffListUseCase:', error);
      throw error;
    }
  }
}

module.exports = { GetStaffListUseCase };
