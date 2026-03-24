const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth'); // Optional if we want full protection

// Simple in-memory store for inventory since the backend uses mockData.js
let mockInventory = [
  {
    id: 'inv_1',
    name: 'Thịt bò Mỹ',
    category: 'MEAT',
    quantity: 15.5,
    unit: 'kg',
    min_quantity: 5,
    cost_per_unit: 250000,
    supplier: 'Nhà cung cấp A',
    last_restock: new Date().toISOString()
  },
  {
    id: 'inv_2',
    name: 'Cà rốt Đà Lạt',
    category: 'VEGETABLE',
    quantity: 8,
    unit: 'kg',
    min_quantity: 10,
    cost_per_unit: 25000,
    supplier: 'Nông sản B',
    last_restock: new Date(Date.now() - 86400000).toISOString()
  }
];

/**
 * @route GET /api/v1/inventory
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockInventory
  });
});

/**
 * @route POST /api/v1/inventory
 */
router.post('/', (req, res) => {
  const newItem = {
    id: `inv_${Date.now()}`,
    ...req.body,
    last_restock: new Date().toISOString()
  };
  mockInventory.push(newItem);
  res.status(201).json({
    success: true,
    data: newItem
  });
});

/**
 * @route PUT /api/v1/inventory/:id
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const index = mockInventory.findIndex(item => item.id === id);
  
  if (index !== -1) {
    mockInventory[index] = { ...mockInventory[index], ...req.body };
    return res.json({
      success: true,
      data: mockInventory[index]
    });
  }
  
  res.status(404).json({ success: false, message: 'Item not found' });
});

/**
 * @route DELETE /api/v1/inventory/:id
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = mockInventory.length;
  mockInventory = mockInventory.filter(item => item.id !== id);
  
  if (mockInventory.length < initialLength) {
    return res.json({ success: true, message: 'Deleted successfully' });
  }
  
  res.status(404).json({ success: false, message: 'Item not found' });
});

module.exports = router;
