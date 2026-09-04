import { Router, Request, Response } from 'express';
import { dataStore } from '../models/dataStore.js';
import type { CategoryItem } from '../types/contact.js';

export const categoryRouter = Router();

// GET /api/categories - List all categories with live contact counts
categoryRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await dataStore.getCategories();
    const contacts = await dataStore.getContacts();

    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      contactCount: counts[cat.name] || 0,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/categories - Create category
categoryRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, color, iconName } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'Category name is required' });
      return;
    }

    const categories = await dataStore.getCategories();
    const exists = categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      res.status(409).json({ success: false, error: 'Category already exists' });
      return;
    }

    const newCat: CategoryItem = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      color: color || 'indigo',
      bgLight: `bg-${color || 'indigo'}-50 text-${color || 'indigo'}-700 border-${color || 'indigo'}-200`,
      textColor: `text-${color || 'indigo'}-700`,
      iconName: iconName || 'Tag',
      isDefault: false,
    };

    const saved = await dataStore.saveCategory(newCat);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// PUT /api/categories/:id - Rename / update category
categoryRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const categories = await dataStore.getCategories();
    const existing = categories.find((c) => c.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    const oldName = existing.name;
    const newName = req.body.name ? req.body.name.trim() : oldName;
    const newColor = req.body.color || existing.color;

    const updates: Partial<CategoryItem> = {
      name: newName,
      color: newColor,
      bgLight: `bg-${newColor}-50 text-${newColor}-700 border-${newColor}-200`,
      textColor: `text-${newColor}-700`,
      iconName: req.body.iconName || existing.iconName,
    };

    const updated = await dataStore.updateCategory(id, updates);

    // If category name was modified, update all existing contacts associated
    if (newName !== oldName) {
      const contacts = await dataStore.getContacts();
      const updatedContacts = contacts.map((c) => (c.category === oldName ? { ...c, category: newName } : c));
      await dataStore.saveContacts(updatedContacts);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// DELETE /api/categories/:id - Delete category and reassign contacts
categoryRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const categories = await dataStore.getCategories();
    const catToDelete = categories.find((c) => c.id === id);
    if (!catToDelete) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    await dataStore.deleteCategory(id);

    // Reassign existing contacts in deleted category to 'Other'
    const contacts = await dataStore.getContacts();
    const updatedContacts = contacts.map((c) => (c.category === catToDelete.name ? { ...c, category: 'Other' } : c));
    await dataStore.saveContacts(updatedContacts);

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});
