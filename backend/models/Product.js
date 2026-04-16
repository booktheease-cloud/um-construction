import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    note: { type: String, default: '', trim: true },
    image: { type: String, default: '', trim: true },
    pricePkr: { type: Number, required: true, min: 0 },
    categoryId: { type: String, required: true, trim: true },
    categoryTitle: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

productSchema.index({ categoryId: 1, active: 1 })

export default mongoose.model('Product', productSchema)

