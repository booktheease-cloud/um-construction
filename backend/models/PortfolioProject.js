import mongoose from 'mongoose'

const portfolioProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    beforeImage: { type: String, required: true, trim: true },
    afterImage: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

portfolioProjectSchema.index({ active: 1, sortOrder: -1, createdAt: -1 })

export default mongoose.model('PortfolioProject', portfolioProjectSchema)

