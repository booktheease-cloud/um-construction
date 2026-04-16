import mongoose from 'mongoose'

const adminSessionSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.models.AdminSession || mongoose.model('AdminSession', adminSessionSchema)
