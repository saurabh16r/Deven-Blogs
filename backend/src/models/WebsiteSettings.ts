import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial {
  name: string;
  role: string;
  feedback: string;
  avatar: string;
}

export interface IFaq {
  question: string;
  answer: string;
}

export interface IWebsiteSettings extends Document {
  heroTitle: string;
  heroSubheadline: string;
  heroImage: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  trustIndicators: string[];
  logoText: string;
  logoColor: string;
  testimonials: ITestimonial[];
  faqs: IFaq[];
  pricingPrice: number;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteSettingsSchema: Schema = new Schema(
  {
    heroTitle: { type: String, default: 'Learn Faster. Grow Smarter.' },
    heroSubheadline: {
      type: String,
      default: 'Premium blogs, AI summaries, and expert insights designed for modern learners.',
    },
    heroImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
    },
    primaryCtaText: { type: String, default: 'Start Building' },
    primaryCtaLink: { type: String, default: '/blogs' },
    secondaryCtaText: { type: String, default: 'Explore Founder Resources' },
    secondaryCtaLink: { type: String, default: '#resources' },
    trustIndicators: {
      type: [String],
      default: ['Startup Resources', 'Founder Community', 'AI Learning Tools', 'Execution-Focused Content'],
    },
    logoText: { type: String, default: 'Deven' },
    logoColor: { type: String, default: '#FFC247' },
    testimonials: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
        feedback: { type: String, required: true },
        avatar: { type: String, default: '' },
      },
    ],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    pricingPrice: { type: Number, default: 299 },
    contactEmail: { type: String, default: 'support@deven.io' },
    contactPhone: { type: String, default: '+91 98765 43210' },
    contactAddress: { type: String, default: 'Mumbai, Maharashtra, India' },
  },
  { timestamps: true }
);

export default mongoose.models.WebsiteSettings ||
  mongoose.model<IWebsiteSettings>('WebsiteSettings', WebsiteSettingsSchema);

