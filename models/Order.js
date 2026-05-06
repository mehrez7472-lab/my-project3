const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // بيانات الزبون
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  customerCity: { type: String, required: true },
  customerNotes: { type: String, default: '' },

  // المنتج المطلوب
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1 },

  // حالة الطلب
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered'],
    default: 'pending'
  },

  // ملاحظة الأدمن
  adminNote: { type: String, default: '' },

  // هل الزبون اتبلغ؟
  notified: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
