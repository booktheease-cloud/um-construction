import mongoose from 'mongoose'

const adminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema)
