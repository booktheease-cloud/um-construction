import mongoose from 'mongoose'

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    service: { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },
  },
  { timestamps: true }
)

export default mongoose.model('ContactInquiry', contactInquirySchema)
