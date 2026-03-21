/**
 * ORDER-101: CreateOrderUseCase
 * Tạo đơn hàng mới khi khách quét QR tại bàn
 */

const { v4: uuidv4 } = require('uuid');

class CreateOrderUseCase {
  constructor(orderRepository, tableRepository, branchRepository, menuItemRepository) {
    this.orderRepository = orderRepository;
    this.tableRepository = tableRepository;
    this.branchRepository = branchRepository;
    this.menuItemRepository = menuItemRepository;
  }

  async execute(dto) {
    const { tableId, branchId, items = [], customer_count = 1, notes } = dto;

    // ✅ Acceptance 1: Table exists and is valid
    const table = await this.tableRepository.findById(tableId);
    if (!table || table.deleted_at) {
      const err = new Error('Table not found');
      err.status = 404;
      throw err;
    }

    // ✅ Acceptance 2: Branch exists and is active
    const branch = await this.branchRepository.findById(branchId);
    if (!branch || branch.status !== 'ACTIVE') {
      const err = new Error('Branch is not active');
      err.status = 400;
      throw err;
    }

    // Validate menu items if provided
    let orderItems = [];
    let subtotal = 0;

    if (items && items.length > 0) {
      for (const item of items) {
        const menuItem = await this.menuItemRepository.findById(item.menuItemId);
        if (!menuItem || !menuItem.available) {
          const err = new Error(`Menu item ${item.menuItemId} not available`);
          err.status = 400;
          throw err;
        }

        // Calculate item price including customizations
        let itemPrice = Number(menuItem.price);
        if (item.customizations && item.customizations.length > 0) {
          for (const custom of item.customizations) {
            itemPrice += Number(custom.priceDelta || 0);
          }
        }

        const itemSubtotal = itemPrice * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          price: itemPrice,
          subtotal: itemSubtotal,
          notes: item.notes || null,
          customizations: item.customizations || []
        });
      }
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    const service_charge = subtotal * 0.05; // 5% service charge
    const total = subtotal + tax + service_charge;

    // Generate order number
    const orderNumber = await this.generateOrderNumber(branch.id);

    // ✅ Create order with items
    const order = await this.orderRepository.createWithItems({
      branch_id: branch.id,
      table_id: table.id,
      order_number: orderNumber,
      status: 'PENDING',
      subtotal,
      tax,
      service_charge,
      total,
      payment_status: 'UNPAID',
      customer_count,
      notes: notes || null,
      items: orderItems
    });

    // Update table status to occupied if it was available
    if (table.status === 'AVAILABLE') {
      await this.tableRepository.updateStatus(table.id, 'OCCUPIED');
    }

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      serviceCharge: order.service_charge,
      total: order.total,
      paymentStatus: order.payment_status,
      table: {
        id: table.id,
        name: table.table_number,
        area: table.areas?.name || 'Unknown Area'
      },
      branch: {
        id: branch.id,
        name: branch.name
      },
      items: order.order_items || [],
      createdAt: order.created_at
    };
  }

  async generateOrderNumber(branchId) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const count = await this.orderRepository.countOrdersToday(branchId);
    const orderNum = String(count + 1).padStart(3, '0');
    
    return `ORD-${dateStr}-${orderNum}`;
  }
}

module.exports = { CreateOrderUseCase };