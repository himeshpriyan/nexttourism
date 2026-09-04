import mongoose, { Schema, Document } from 'mongoose';
import type { Contact } from '../types/contact.js';

export interface ContactDocument extends Omit<Contact, 'id'>, Document {
  id: string;
}

const contactSchema = new Schema<ContactDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, default: '' },
    email: { type: String, default: '' },
    company: { type: String, default: '' },
    designation: { type: String, default: '' },
    category: { type: String, default: 'Other' },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
    source: { type: String, default: 'Manual Entry' },
    visitingCardImage: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
    isFavorite: { type: Boolean, default: false },
  },
  {
    timestamps: false,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        const obj = { ...ret };
        delete (obj as Record<string, unknown>)._id;
        delete (obj as Record<string, unknown>).__v;
        return obj;
      },
    },
  }
);

export const ContactModel = mongoose.model<ContactDocument>('Contact', contactSchema);
