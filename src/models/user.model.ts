import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  googleSyncFlag: boolean;
  googleToken?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleSyncFlag: { type: Boolean, default: false },
    googleToken: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
