import mongoose from 'mongoose'

const serviceItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const serviceCategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    items: { type: [serviceItemSchema], default: [] },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.ServiceCategory ||
  mongoose.model('ServiceCategory', serviceCategorySchema)
