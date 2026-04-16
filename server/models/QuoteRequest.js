import mongoose from 'mongoose'

const quoteRequestSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true },
    phone: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    problemDescription: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

export default mongoose.model('QuoteRequest', quoteRequestSchema)
