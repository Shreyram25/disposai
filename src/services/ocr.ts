/**
 * OCR Service using Tesseract.js
 * Extracts text from medicine package images
 */

import { createWorker } from 'tesseract.js';

let worker: any = null;

/**
 * Initialize Tesseract worker
 */
async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,/- ',
    });
  }
  return worker;
}

/**
 * Extract text from image using OCR
 */
export async function extractTextFromImage(imageFile: File | string): Promise<{
  text: string;
  confidence: number;
}> {
  try {
    const ocrWorker = await getWorker();
    
    // If string, assume it's a data URL or URL
    const imageSource = typeof imageFile === 'string' ? imageFile : imageFile;
    
    const { data } = await ocrWorker.recognize(imageSource);
    
    // Clean up the text
    const cleanedText = data.text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Calculate average confidence
    const confidence = data.confidence || 0;

    return {
      text: cleanedText || 'No text detected',
      confidence: Math.min(100, Math.max(0, confidence)),
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    return {
      text: 'Text extraction failed',
      confidence: 0,
    };
  }
}

/**
 * Cleanup worker when done
 */
export async function cleanupOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

