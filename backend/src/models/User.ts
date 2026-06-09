import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingHistory {
  blogId: string;
  readAt: Date;
  duration: number; // in seconds
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'reader' | 'author' | 'admin' | 'superadmin';
  googleId?: string;
  streakCount: number;
  lastReadDate?: Date;
  referralCode: string;
  referredBy?: string;
  referredCount: number;
  isSubscribed: boolean;
  subscriptionExpiresAt?: Date;
  readingHistory: IReadingHistory[];
  bookmarks: string[]; // Blog ObjectIds as strings
  founderRole?: string;
  startupStage?: string;
  interests?: string[];
  goals?: string[];
  contentPreferences?: string[];
  completedOnboarding: boolean;
  onboardingCompleted: boolean;
  themePreference?: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['reader', 'author', 'admin', 'superadmin'],
      default: 'reader',
    },
    googleId: { type: String },
    streakCount: { type: Number, default: 0 },
    lastReadDate: { type: Date },
    referralCode: { type: String, unique: true, required: true },
    referredBy: { type: String },
    referredCount: { type: Number, default: 0 },
    isSubscribed: { type: Boolean, default: false },
    subscriptionExpiresAt: { type: Date },
    readingHistory: [
      {
        blogId: { type: Schema.Types.ObjectId, ref: 'Blog' },
        readAt: { type: Date, default: Date.now },
        duration: { type: Number, default: 0 },
      },
    ],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
    founderRole: { type: String },
    startupStage: { type: String },
    interests: [{ type: String }],
    goals: [{ type: String }],
    contentPreferences: [{ type: String }],
    completedOnboarding: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
