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
    
    // Convert File to data URL if needed - always use canvas for reliability
    let imageSource: string;
    if (typeof imageFile === 'string') {
      imageSource = imageFile;
    } else {
      // Convert File to data URL using canvas for better compatibility
      imageSource = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(imageFile);
        
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not create canvas context'));
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw white background first
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          // Convert to PNG for OCR (better for text)
          try {
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          } catch (error) {
            // Fallback to JPEG
            const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
            resolve(jpegUrl);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          // Fallback: try FileReader
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            if (result && result.startsWith('data:image/')) {
              resolve(result);
            } else {
              reject(new Error('Invalid image file'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(imageFile);
        };
        
        img.src = objectUrl;
      });
    }
    
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

