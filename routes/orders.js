const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// POST - زبون بيعمل طلب جديد (public)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, customerCity, customerNotes, productId, productName, productPrice, quantity } = req.body;
    const order = new Order({
      customerName, customerPhone, customerAddress, customerCity,
      customerNotes: customerNotes || '',
      productId, productName, productPrice,
      quantity: quantity || 1
    });
    await order.save();
    res.status(201).json({ success: true, orderId: order._id, message: 'تم استلام طلبك بنجاح!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET - كل الطلبات (admin فقط)
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .populate('productId', 'name images price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - إحصائيات الطلبات (admin)
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'pending' });
    const accepted = await Order.countDocuments({ status: 'accepted' });
    const rejected = await Order.countDocuments({ status: 'rejected' });
    const shipped = await Order.countDocuments({ status: 'shipped' });
    const delivered = await Order.countDocuments({ status: 'delivered' });
    res.json({ total, pending, accepted, rejected, shipped, delivered });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - تغيير حالة الطلب (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote || '' },
      { new: true }
    ).populate('productId', 'name images price');
    if (!order) return res.status(404).json({ message: 'الطلب مش موجود' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - حذف طلب (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'تم حذف الطلب' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
