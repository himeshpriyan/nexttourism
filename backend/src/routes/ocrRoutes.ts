import { Router, Request, Response } from 'express';

export const ocrRouter = Router();

// Heuristic pattern parser for text
function extractFields(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  const phoneMatch = text.match(/(?:TEL|PHONE|MOB|MOBILE|PH)?[:\s.-]*(\+?[0-9]{1,3}[-.\s]?)?\(?([0-9]{3,5})\)?[-.\s]?([0-9]{3,5})[-.\s]?([0-9]{3,5})/i);
  
  return {
    name: lines.length > 0 ? lines[0] : '',
    phone: phoneMatch ? phoneMatch[0].replace(/[^0-9+]/g, '') : '',
    email: emailMatch ? emailMatch[0].toLowerCase() : '',
    company: lines.length > 1 ? lines[1] : '',
    rawText: text,
  };
}

// POST /api/ocr/scan - Process visiting card image/text
ocrRouter.post('/scan', (req: Request, res: Response) => {
  const { rawText, imageBase64 } = req.body;

  if (!rawText && !imageBase64) {
    res.status(400).json({ success: false, error: 'Raw text or imageBase64 is required for OCR scanning' });
    return;
  }

  // If text is supplied, parse directly
  if (rawText) {
    const extracted = extractFields(rawText);
    res.json({ success: true, data: extracted });
    return;
  }

  // If base64 image is passed, return structured response
  res.json({
    success: true,
    message: 'Image received for OCR pipeline',
    data: {
      rawText: 'Sample OCR text from Cloud Vision / OCR Engine',
      confidence: 95,
    },
  });
});
