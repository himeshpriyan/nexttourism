import { createWorker } from 'tesseract.js';
import type { OCRScanResult } from '../../types/contact';
import { parseVisitingCardText } from './HeuristicCardParser';

export interface OCRProgressCallback {
  (status: string, progress: number): void;
}

export interface IOCRService {
  recognizeCard(imageSource: string | File | Blob, onProgress?: OCRProgressCallback): Promise<OCRScanResult>;
}

export class TesseractOCRService implements IOCRService {
  async recognizeCard(
    imageSource: string | File | Blob,
    onProgress?: OCRProgressCallback
  ): Promise<OCRScanResult> {
    try {
      if (onProgress) onProgress('Initializing OCR engine...', 10);

      // Create Tesseract worker
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            const pct = 30 + Math.round((m.progress || 0) * 60);
            onProgress(`Scanning visiting card (${Math.round((m.progress || 0) * 100)}%)...`, pct);
          }
        },
      });

      if (onProgress) onProgress('Analyzing text patterns & layout...', 85);

      const ret = await worker.recognize(imageSource);
      await worker.terminate();

      if (onProgress) onProgress('Extracting structured contact fields...', 95);

      const parsed = parseVisitingCardText(ret.data.text);
      if (onProgress) onProgress('Extraction complete!', 100);

      return parsed;
    } catch (err) {
      console.warn('Tesseract OCR error, attempting heuristic fallback on input', err);
      // Fallback: If imageSource is SVG or data URL with text embedded
      if (typeof imageSource === 'string' && imageSource.includes('data:image/svg+xml')) {
        try {
          const decoded = decodeURIComponent(imageSource);
          const stripped = decoded.replace(/<[^>]*>/g, ' ');
          return parseVisitingCardText(stripped);
        } catch {
          // ignore
        }
      }
      throw new Error('Could not recognize text from the card image. Please verify lighting and try again or fill manually.');
    }
  }
}

export const ocrService = new TesseractOCRService();
