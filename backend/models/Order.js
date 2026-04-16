import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    unitPricePkr: { type: Number, required: true },
    qty: { type: Number, required: true },
    categoryTitle: { type: String, default: '' },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    items: { type: [orderItemSchema], required: true },
    totalPkr: { type: Number, required: true },
    currency: { type: String, default: 'PKR' },
    paymentMethod: { type: String, enum: ['cod', 'stripe'], required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'cod_confirmed', 'cancelled'],
      required: true,
    },
    stripeSessionId: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
