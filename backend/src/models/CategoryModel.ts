import mongoose, { Schema, Document } from 'mongoose';
import type { CategoryItem } from '../types/contact.js';

export interface CategoryDocument extends Omit<CategoryItem, 'id'>, Document {
  id: string;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: 'indigo' },
    bgLight: { type: String, default: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    textColor: { type: String, default: 'text-indigo-700' },
    iconName: { type: String, default: 'Tag' },
    isDefault: { type: Boolean, default: false },
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

export const CategoryModel = mongoose.model<CategoryDocument>('Category', categorySchema);
