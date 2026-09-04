import { Router, Request, Response } from 'express';
import { dataStore } from '../models/dataStore.js';
import { checkDuplicatePhone, normalizePhoneNumber } from '../services/duplicateChecker.js';
import type { Contact } from '../types/contact.js';

export const contactRouter = Router();

// GET /api/contacts - List all contacts with optional search & filters
contactRouter.get('/', async (req: Request, res: Response) => {
  try {
    const contacts = await dataStore.getContacts();
    const { q, category, tag, source, sortBy } = req.query;

    let filtered = [...contacts];

    // Search query filter
    if (typeof q === 'string' && q.trim()) {
      const query = q.toLowerCase().trim();
      const queryDigits = normalizePhoneNumber(q);
      filtered = filtered.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(query);
        const emailMatch = c.email?.toLowerCase().includes(query) ?? false;
        const companyMatch = c.company?.toLowerCase().includes(query) ?? false;
        const desigMatch = c.designation?.toLowerCase().includes(query) ?? false;
        const notesMatch = c.notes?.toLowerCase().includes(query) ?? false;
        const phoneMatch = queryDigits
          ? normalizePhoneNumber(c.phone).includes(queryDigits) || (c.alternatePhone ? normalizePhoneNumber(c.alternatePhone).includes(queryDigits) : false)
          : c.phone.includes(query) || (c.alternatePhone?.includes(query) ?? false);

        return nameMatch || emailMatch || companyMatch || desigMatch || notesMatch || phoneMatch;
      });
    }

    // Category filter
    if (typeof category === 'string' && category && category !== 'All') {
      filtered = filtered.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }

    // Tag filter
    if (typeof tag === 'string' && tag) {
      filtered = filtered.filter((c) => c.tags && c.tags.includes(tag));
    }

    // Source filter
    if (typeof source === 'string' && source && source !== 'All') {
      filtered = filtered.filter((c) => c.source === source);
    }

    // Sorting
    if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'created-desc') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'updated-desc') {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/contacts/:id - Get single contact
contactRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const contact = await dataStore.getContactById(id);
    if (!contact) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/contacts - Create contact with duplicate phone check
contactRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, alternatePhone, email, company, designation, category, address, notes, tags, source, visitingCardImage, force } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, error: 'Name and Phone are required.' });
      return;
    }

    const contacts = await dataStore.getContacts();

    // Duplicate phone check
    if (!force) {
      const dupCheck = checkDuplicatePhone(contacts, phone);
      if (dupCheck.isDuplicate) {
        res.status(409).json({
          success: false,
          isDuplicate: true,
          error: 'Contact already exists with this phone number',
          existingContact: dupCheck.existingContact,
        });
        return;
      }
    }

    const now = new Date().toISOString();
    const newContact: Contact = {
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      phone: phone.trim(),
      alternatePhone: alternatePhone ? alternatePhone.trim() : undefined,
      email: email ? email.trim() : undefined,
      company: company ? company.trim() : undefined,
      designation: designation ? designation.trim() : undefined,
      category: category || 'Other',
      address: address ? address.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
      tags: Array.isArray(tags) ? tags : [],
      source: source || 'Manual Entry',
      visitingCardImage: visitingCardImage || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await dataStore.saveContact(newContact);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// PUT /api/contacts/:id - Update contact
contactRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await dataStore.getContactById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }

    const updated = await dataStore.updateContact(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// DELETE /api/contacts/:id - Delete contact
contactRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const success = await dataStore.deleteContact(id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/contacts/:id/favorite - Toggle favorite
contactRouter.post('/:id/favorite', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await dataStore.getContactById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Contact not found' });
      return;
    }

    const updated = await dataStore.updateContact(id, {
      isFavorite: !existing.isFavorite,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/contacts/bulk-import - Bulk import contacts
contactRouter.post('/bulk-import', async (req: Request, res: Response) => {
  try {
    const { contacts: importItems, strategy } = req.body;
    if (!Array.isArray(importItems) || importItems.length === 0) {
      res.status(400).json({ success: false, error: 'Invalid or empty contacts list' });
      return;
    }

    const existing = await dataStore.getContacts();
    const now = new Date().toISOString();
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const phoneMap = new Map<string, number>();
    existing.forEach((c, idx) => {
      const n = normalizePhoneNumber(c.phone);
      if (n) phoneMap.set(n, idx);
    });

    const updatedList = [...existing];

    for (const item of importItems) {
      const norm = normalizePhoneNumber(item.phone);
      const existingIndex = norm ? phoneMap.get(norm) : undefined;

      if (existingIndex !== undefined && strategy === 'skip') {
        skippedCount++;
        continue;
      }

      if (existingIndex !== undefined && strategy === 'update') {
        updatedList[existingIndex] = {
          ...updatedList[existingIndex],
          name: item.name || updatedList[existingIndex].name,
          email: item.email || updatedList[existingIndex].email,
          company: item.company || updatedList[existingIndex].company,
          designation: item.designation || updatedList[existingIndex].designation,
          category: item.category || updatedList[existingIndex].category,
          address: item.address || updatedList[existingIndex].address,
          notes: item.notes ? `${updatedList[existingIndex].notes || ''} | ${item.notes}` : updatedList[existingIndex].notes,
          tags: Array.from(new Set([...(updatedList[existingIndex].tags || []), ...(item.tags || [])])),
          updatedAt: now,
        };
        updatedCount++;
        continue;
      }

      const newContact: Contact = {
        id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: item.name,
        phone: item.phone,
        alternatePhone: item.alternatePhone,
        email: item.email,
        company: item.company,
        designation: item.designation,
        category: item.category || 'Other',
        address: item.address,
        notes: item.notes,
        tags: item.tags || [],
        source: 'CSV Import',
        createdAt: now,
        updatedAt: now,
      };
      updatedList.unshift(newContact);
      if (norm) phoneMap.set(norm, 0);
      importedCount++;
    }

    await dataStore.saveContacts(updatedList);
    res.json({ success: true, importedCount, updatedCount, skippedCount });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});
