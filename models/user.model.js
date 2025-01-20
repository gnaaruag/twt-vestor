import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    likeCount: { type: Number, default: 500 }, // Default to 500 for new users
    positions: { type: [String], default: [] }, // Array of strings
    history: { type: [String], default: [] }, // Array of strings
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UserModel;
