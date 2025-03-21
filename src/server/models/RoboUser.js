import mongoose from "mongoose";

const RoboUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  domains: [
    {
      name: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  authCodeHash: { type: String },
  authCodeExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false },
});

const RoboUser = mongoose.models.RoboUser || mongoose.model("RoboUser", RoboUserSchema);
export default RoboUser;
