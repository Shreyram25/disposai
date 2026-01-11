/**
 * OpenAI API Service
 * Handles all GPT-powered functionality for medicine identification and disposal guidance
 */

export interface MedicineInfo {
  id: string;
  brandNames: string[];
  genericName: string;
  category: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'cream' | 'ointment' | 'inhaler' | 'injection' | 'drops' | 'patch' | 'other';
  hazardFlags: {
    controlled: boolean;
    antibiotic: boolean;
    cytotoxic: boolean;
    hormonal: boolean;
    flushable: boolean;
  };
  disposalMethods: {
    primary: DisposalMethod;
    alternatives: DisposalMethod[];
  };
  warnings: string[];
  environmentalRisk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  };
  didYouKnow: string;
}

export interface DisposalMethod {
  method: string;
  steps: string[];
  icon: string;
  safetyRating: 'A' | 'B' | 'C' | 'D' | 'E';
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
  console.warn('⚠️ VITE_OPENAI_API_KEY not found in environment variables. AI features will not work.');
}

/**
 * Convert image file/URL to base64 data URL
 * Always converts to a valid format for OpenAI Vision API (PNG, JPEG, GIF, WebP)
 */
async function imageToBase64(imageFile: File | string): Promise<string> {
  if (typeof imageFile === 'string') {
    // If it's already a data URL, validate and return it
    if (imageFile.startsWith('data:image/')) {
      return imageFile;
    }
    // If it's a URL, fetch and convert
    const response = await fetch(imageFile);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result && result.startsWith('data:image/')) {
          resolve(result);
        } else {
          reject(new Error('Invalid image format from URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // Convert File to base64
    // Always use canvas conversion for better compatibility with OpenAI API
    // This ensures images are properly formatted and valid
    return new Promise((resolve, reject) => {
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
        
        // Draw white background for formats that don't support transparency
        if (imageFile.type !== 'image/png') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        
        // Try PNG first (preserves quality), then fallback to JPEG
        try {
          if (imageFile.type === 'image/png') {
            const pngUrl = canvas.toDataURL('image/png');
            if (pngUrl && pngUrl.startsWith('data:image/png;base64,')) {
              resolve(pngUrl);
              return;
            }
          }
          
          // Fallback to JPEG (most compatible with OpenAI)
          const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
          if (jpegUrl && jpegUrl.startsWith('data:image/jpeg;base64,')) {
            resolve(jpegUrl);
          } else {
            reject(new Error('Failed to convert image to valid format'));
          }
        } catch (error) {
          console.error('Canvas conversion error:', error);
          reject(new Error('Canvas conversion failed'));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback: try FileReader as last resort
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (result && result.startsWith('data:image/') && result.includes(';base64,')) {
            resolve(result);
          } else {
            reject(new Error('Invalid image file - could not be read'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(imageFile);
      };
      
      img.src = objectUrl;
    });
  }
}

/**
 * Convert video file to base64
 */
async function videoToBase64(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(videoFile);
  });
}

/**
 * Call OpenAI GPT API
 */
async function callGPT(
  messages: Array<{ 
    role: 'system' | 'user' | 'assistant'; 
    content: string | Array<{ 
      type: 'text' | 'image_url'; 
      text?: string; 
      image_url?: { url: string };
    }> 
  }>,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.3
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('GPT API call failed:', error);
    
    // Provide more informative error messages
    if (error instanceof TypeError && error.message.includes('Load failed')) {
      throw new Error('Network error: Unable to connect to OpenAI API. Please check your internet connection and try again.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to call OpenAI API. Please try again.');
  }
}

/**
 * Identify medicine from image using GPT-4 Vision API
 */
export async function identifyMedicineFromImage(imageFile: File | string, detectedText?: string): Promise<MedicineInfo> {
  const systemPrompt = `You are a pharmaceutical expert. Analyze the medicine package image and identify the medication. 
Return a JSON object with the following structure:
{
  "id": "unique-id-based-on-medicine",
  "brandNames": ["array", "of", "brand", "names"],
  "genericName": "Generic name of the active ingredient",
  "category": "Category (e.g., Painkillers, Antibiotics, Diabetes, etc.)",
  "form": "tablet|capsule|syrup|cream|ointment|inhaler|injection|drops|patch|other",
  "hazardFlags": {
    "controlled": boolean,
    "antibiotic": boolean,
    "cytotoxic": boolean,
    "hormonal": boolean,
    "flushable": false
  },
  "disposalMethods": {
    "primary": {
      "method": "Method name - choose SIMPLEST effective method. For antibiotics/controlled: 'Hospital Take-Back (DHA Drive)'. For simple medicines: 'Household Disposal with Coffee Grounds' or 'Sealed Trash Disposal'",
      "steps": ["step 1", "step 2", "step 3", "step 4"],
      "icon": "Building2|Trash2|Recycle|Droplets|Syringe|AlertTriangle",
      "safetyRating": "A|B|C|D|E"
    },
    "alternatives": [
      {
        "method": "Alternative method name",
        "steps": ["step 1", "step 2"],
        "icon": "Trash2|Package|Droplets",
        "safetyRating": "B|C|D"
      }
    ]
  },
  "warnings": ["warning 1", "warning 2"],
  "environmentalRisk": {
    "level": "low|medium|high|critical",
    "description": "Detailed description of environmental impact"
  },
  "didYouKnow": "Interesting fact about this medication or its disposal"
}

If the medicine cannot be identified, set id to "unknown" and provide general safe disposal guidance.`;

  try {
    // Convert image to base64
    const base64Image = await imageToBase64(imageFile);
    
    // Validate the base64 image format
    if (!base64Image || !base64Image.startsWith('data:image/')) {
      throw new Error('Invalid image format: image conversion failed');
    }
    
    // Log for debugging (remove in production)
    console.log('Image format:', base64Image.substring(0, 50) + '...');
    
    const userPrompt = `Analyze this medicine package image${detectedText ? ` and the detected text: "${detectedText}"` : ''}. 

Identify this medication and provide disposal information. Be specific about:
- Whether it's an antibiotic (CRITICAL - must use hospital take-back)
- Whether it's a controlled substance (must use hospital take-back)
- Environmental risks
- Choose the SIMPLEST effective disposal method:
  * For antibiotics/controlled substances: Hospital Take-Back (DHA Clean Your Medicine Cabinet Drive)
  * For simple painkillers/vitamins: Household disposal (mix with coffee grounds, seal, trash)
  * For liquids: Absorb with cat litter, seal, trash
  * Only recommend hospital take-back if the medicine is truly hazardous

Look at the package label, brand name, generic name, dosage form, and any warnings or symbols.`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> }> = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userPrompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: base64Image,
            },
          },
        ],
      },
    ];

    const response = await callGPT(messages, 'gpt-4o', 0.3);
    const medicineInfo = JSON.parse(response) as MedicineInfo;
    
    // Validate and ensure required fields
    if (!medicineInfo.id) {
      medicineInfo.id = 'unknown';
    }
    if (!medicineInfo.brandNames || medicineInfo.brandNames.length === 0) {
      medicineInfo.brandNames = ['Unknown Medicine'];
    }
    if (!medicineInfo.genericName) {
      medicineInfo.genericName = 'Unidentified Medication';
    }

    return medicineInfo;
  } catch (error) {
    console.error('Failed to identify medicine from image:', error);
    // Fallback to text-based identification if Vision API fails
    if (detectedText) {
      return identifyMedicine(detectedText);
    }
    return getUnknownMedicineResponse();
  }
}

/**
 * Identify medicine from detected text using GPT
 */
export async function identifyMedicine(detectedText: string): Promise<MedicineInfo> {
  const systemPrompt = `You are a pharmaceutical expert. Analyze the detected text from a medicine package and identify the medication. 
Return a JSON object with the following structure:
{
  "id": "unique-id-based-on-medicine",
  "brandNames": ["array", "of", "brand", "names"],
  "genericName": "Generic name of the active ingredient",
  "category": "Category (e.g., Painkillers, Antibiotics, Diabetes, etc.)",
  "form": "tablet|capsule|syrup|cream|ointment|inhaler|injection|drops|patch|other",
  "hazardFlags": {
    "controlled": boolean,
    "antibiotic": boolean,
    "cytotoxic": boolean,
    "hormonal": boolean,
    "flushable": false
  },
  "disposalMethods": {
    "primary": {
      "method": "Method name - choose SIMPLEST effective method. For antibiotics/controlled: 'Hospital Take-Back (DHA Drive)'. For simple medicines: 'Household Disposal with Coffee Grounds' or 'Sealed Trash Disposal'",
      "steps": ["step 1", "step 2", "step 3", "step 4"],
      "icon": "Building2|Trash2|Recycle|Droplets|Syringe|AlertTriangle",
      "safetyRating": "A|B|C|D|E"
    },
    "alternatives": [
      {
        "method": "Alternative method name",
        "steps": ["step 1", "step 2"],
        "icon": "Trash2|Package|Droplets",
        "safetyRating": "B|C|D"
      }
    ]
  },
  "warnings": ["warning 1", "warning 2"],
  "environmentalRisk": {
    "level": "low|medium|high|critical",
    "description": "Detailed description of environmental impact"
  },
  "didYouKnow": "Interesting fact about this medication or its disposal"
}

If the medicine cannot be identified, set id to "unknown" and provide general safe disposal guidance.`;

  const userPrompt = `Detected text from medicine package: "${detectedText}"

Identify this medication and provide disposal information. Be specific about:
- Whether it's an antibiotic (CRITICAL for proper disposal)
- Whether it's a controlled substance
- Environmental risks
- Best disposal method based on UAE/local regulations`;

  try {
    const response = await callGPT([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse JSON response
    const medicineInfo = JSON.parse(response) as MedicineInfo;
    
    // Validate and ensure required fields
    if (!medicineInfo.id) {
      medicineInfo.id = 'unknown';
    }
    if (!medicineInfo.brandNames || medicineInfo.brandNames.length === 0) {
      medicineInfo.brandNames = ['Unknown Medicine'];
    }
    if (!medicineInfo.genericName) {
      medicineInfo.genericName = 'Unidentified Medication';
    }

    return medicineInfo;
  } catch (error) {
    console.error('Failed to identify medicine:', error);
    // Return fallback for unknown medicine
    return getUnknownMedicineResponse();
  }
}

/**
 * Get disposal information for a medicine with full details
 */
export async function getDisposalInfoForMedicine(
  medicineName: string,
  genericName: string,
  category: string,
  form: string
): Promise<MedicineInfo> {
  const systemPrompt = `You are a pharmaceutical waste disposal expert. Provide detailed, accurate disposal information for medications.
Return a JSON object with the same structure as the identifyMedicine function.`;

  const userPrompt = `Provide disposal information for:
- Medicine: ${medicineName}
- Generic Name: ${genericName}
- Category: ${category || 'Unknown'}
- Form: ${form || 'Unknown'}

Include:
1. Proper disposal methods - choose the SIMPLEST effective method. Only use hospital take-back for antibiotics/controlled substances. For simple medicines, recommend household disposal (coffee grounds method).
2. Environmental risks and impact
3. Safety warnings
4. Step-by-step disposal instructions
5. Alternative methods if available

Base recommendations on UAE/local regulations and WHO guidelines.`;

  try {
    const response = await callGPT([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const disposalInfo = JSON.parse(response) as MedicineInfo;
    
    // Validate and ensure all required properties are present
    const validatedInfo: MedicineInfo = {
      id: disposalInfo.id || `${medicineName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      brandNames: disposalInfo.brandNames && Array.isArray(disposalInfo.brandNames) && disposalInfo.brandNames.length > 0
        ? disposalInfo.brandNames
        : [medicineName],
      genericName: disposalInfo.genericName || genericName || 'Unknown',
      category: disposalInfo.category || category || 'Unknown',
      form: disposalInfo.form || (form as any) || 'other',
      hazardFlags: disposalInfo.hazardFlags || {
        controlled: false,
        antibiotic: false,
        cytotoxic: false,
        hormonal: false,
        flushable: false,
      },
      disposalMethods: disposalInfo.disposalMethods || getUnknownMedicineResponse().disposalMethods,
      warnings: Array.isArray(disposalInfo.warnings) ? disposalInfo.warnings : [],
      environmentalRisk: disposalInfo.environmentalRisk || {
        level: 'medium',
        description: 'Environmental impact information unavailable.',
      },
      didYouKnow: disposalInfo.didYouKnow || 'Proper disposal helps protect our environment.',
    };
    
    return validatedInfo;
  } catch (error) {
    console.error('Failed to get disposal info:', error);
    // Return a validated unknown response with the provided medicine name
    const unknownResponse = getUnknownMedicineResponse();
    return {
      ...unknownResponse,
      brandNames: [medicineName],
      genericName: genericName || 'Unknown',
      category: category || 'Unknown',
      form: (form as any) || 'other',
    };
  }
}

/**
 * Get disposal information for a medicine using GPT (legacy function)
 */
export async function getDisposalInfo(medicineName: string, genericName: string): Promise<MedicineInfo> {
  return getDisposalInfoForMedicine(medicineName, genericName, '', 'other');
}

/**
 * Find nearby hospitals for DHA's Clean Your Medicine Cabinet Drive
 * Uses Google Maps API if available, falls back to GPT, then defaults
 */
export async function findNearbyHospitals(
  latitude?: number,
  longitude?: number,
  city: string = 'Dubai'
): Promise<Array<{
  id: number;
  name: string;
  address: string;
  distance: string;
  acceptsAll: boolean;
  hours: string;
}>> {
  // Note: Google Maps Places API cannot be called directly from browser due to CORS restrictions
  // We use GPT to find hospitals, which works reliably without CORS issues
  // GPT-based search
  const systemPrompt = `You are a location finder for Dubai Health Authority's "Clean Your Medicine Cabinet" drive. Return a JSON array of nearby government hospitals that participate in medication take-back.
Format: [{"id": 1, "name": "Hospital Name", "address": "Full address", "distance": "X.X km", "acceptsAll": true, "hours": "9:00 AM - 9:00 PM"}]`;

  const locationContext = latitude && longitude
    ? `User location: ${latitude}, ${longitude}`
    : `User city: ${city}`;

  const userPrompt = `Find 3-5 nearby government hospitals in ${city} that participate in DHA's Clean Your Medicine Cabinet drive for medication disposal. ${locationContext}
Include major government hospitals like Dubai Hospital, Rashid Hospital, Latifa Hospital, and other DHA facilities.`;

  try {
    const response = await callGPT([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const locations = JSON.parse(response);
    
    // Ensure it's an array
    if (Array.isArray(locations)) {
      return locations.map((loc, idx) => ({
        id: loc.id || idx + 1,
        name: loc.name || 'Pharmacy',
        address: loc.address || 'Address not available',
        distance: loc.distance || 'N/A',
        acceptsAll: loc.acceptsAll !== false,
        hours: loc.hours || 'Check with pharmacy',
      }));
    }

    // Fallback to default locations
    return getDefaultLocations();
  } catch (error) {
    console.error('Failed to find hospitals:', error);
    // Return default hospital locations as fallback
    return getDefaultLocations();
  }
}

/**
 * Get unknown medicine fallback response
 */
function getUnknownMedicineResponse(): MedicineInfo {
  return {
    id: 'unknown',
    brandNames: ['Unknown Medicine'],
    genericName: 'Unidentified Medication',
    category: 'Unknown',
    form: 'other',
    hazardFlags: {
      controlled: false,
      antibiotic: false,
      cytotoxic: false,
      hormonal: false,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Hospital Take-Back (DHA Clean Your Medicine Cabinet Drive)',
        steps: [
          'When medication cannot be identified, use hospital take-back',
          'Visit your nearest DHA government hospital',
          'Participate in the Clean Your Medicine Cabinet drive',
          'Hospital staff will assess and dispose safely',
        ],
        icon: 'AlertTriangle',
        safetyRating: 'A',
      },
      alternatives: [],
    },
    warnings: [
      'Unknown medications may contain controlled substances',
      'Do not attempt household disposal',
      'Professional assessment required',
      'When in doubt, use hospital take-back (DHA drive)',
    ],
    environmentalRisk: {
      level: 'high',
      description: 'Unknown medications may contain hazardous compounds requiring specialized disposal.',
    },
    didYouKnow: 'Pharmacists are trained to identify medications and determine appropriate disposal methods - their expertise is free to use!',
  };
}

/**
 * Extract key frames from video at intelligent intervals
 */
async function extractKeyFrames(videoFile: File, maxFrames: number = 10): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frames: string[] = [];

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const duration = video.duration;
      // Extract frames at intelligent intervals (start, middle sections, end)
      const frameTimes: number[] = [];
      
      if (duration <= 5) {
        // Short video: just get middle frame
        frameTimes.push(duration / 2);
      } else {
        // Longer video: get frames at start, middle sections, and end
        const interval = Math.max(3, duration / maxFrames); // At least 3 seconds apart
        for (let i = 0; i < maxFrames; i++) {
          const time = Math.min(i * interval, duration - 1);
          frameTimes.push(time);
        }
        // Always include last frame
        if (frameTimes[frameTimes.length - 1] < duration - 1) {
          frameTimes.push(duration - 1);
        }
      }

      let loadedFrames = 0;

      const loadFrame = (timeIndex: number) => {
        if (timeIndex >= frameTimes.length) {
          resolve(frames);
          return;
        }
        video.currentTime = frameTimes[timeIndex];
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          frames.push(dataUrl);
          loadedFrames++;
          loadFrame(loadedFrames);
        }
      };

      video.onerror = reject;
      loadFrame(0);
    };

    video.src = URL.createObjectURL(videoFile);
  });
}

/**
 * Analyze video and identify all medicines using GPT-4 Vision API
 * Since OpenAI doesn't support video_url directly, we extract key frames and analyze them
 */
export async function identifyMedicinesFromVideo(videoFile: File): Promise<Array<{
  medicine: MedicineInfo;
  confidence: number;
  detectedText: string;
  timestamp?: number;
}>> {
  const systemPrompt = `You are a pharmaceutical expert. Analyze the video frames showing medicine packages and identify ALL unique medications visible across all frames.
Return a JSON object with the following structure:
{
  "medicines": [
    {
      "id": "unique-id-based-on-medicine",
      "brandNames": ["array", "of", "brand", "names"],
      "genericName": "Generic name of the active ingredient",
      "category": "Category (e.g., Painkillers, Antibiotics, Diabetes, etc.)",
      "form": "tablet|capsule|syrup|cream|ointment|inhaler|injection|drops|patch|other",
      "hazardFlags": {
        "controlled": boolean,
        "antibiotic": boolean,
        "cytotoxic": boolean,
        "hormonal": boolean,
        "flushable": false
      },
      "disposalMethods": {
        "primary": {
          "method": "Method name - choose SIMPLEST effective method. For antibiotics/controlled: 'Hospital Take-Back (DHA Drive)'. For simple medicines: 'Household Disposal with Coffee Grounds' or 'Sealed Trash Disposal'",
          "steps": ["step 1", "step 2", "step 3", "step 4"],
          "icon": "Building2|Trash2|Recycle|Droplets|Syringe|AlertTriangle",
          "safetyRating": "A|B|C|D|E"
        },
        "alternatives": [
          {
            "method": "Alternative method name",
            "steps": ["step 1", "step 2"],
            "icon": "Trash2|Package|Droplets",
            "safetyRating": "B|C|D"
          }
        ]
      },
      "warnings": ["warning 1", "warning 2"],
      "environmentalRisk": {
        "level": "low|medium|high|critical",
        "description": "Detailed description of environmental impact"
      },
      "didYouKnow": "Interesting fact about this medication or its disposal",
      "confidence": 85-100,
      "detectedText": "Text visible on package"
    }
  ]
}

Analyze ALL frames together and identify ALL unique medicines shown across the entire video. If the same medicine appears in multiple frames, only include it once in the results.`;

  try {
    // Extract more frames for better accuracy (up to 15 frames)
    const frames = await extractKeyFrames(videoFile, 15);
    
    if (frames.length === 0) {
      throw new Error('Failed to extract frames from video');
    }

    const userPrompt = `Analyze these frames extracted from a video showing medicine packages. Identify ALL unique medications visible across all frames.

For each medicine, provide:
- Brand name and generic name
- Whether it's an antibiotic (CRITICAL - must use hospital take-back)
- Whether it's a controlled substance (must use hospital take-back)
- Environmental risks
- Choose the SIMPLEST effective disposal method:
  * For antibiotics/controlled: Hospital Take-Back (DHA Clean Your Medicine Cabinet Drive)
  * For simple painkillers/vitamins: Household disposal (mix with coffee grounds, seal, trash)
  * For liquids: Absorb with cat litter, seal, trash
  * Only recommend hospital take-back if truly hazardous

Look carefully at all packages shown across all frames and identify each unique medicine.`;

    // Send all frames in one API call (GPT-4o can handle multiple images)
    const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: userPrompt },
      ...frames.map(frame => ({
        type: 'image_url' as const,
        image_url: { url: frame },
      })),
    ];

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content },
    ];

    const response = await callGPT(messages, 'gpt-4o', 0.3);
    const result = JSON.parse(response);
    
    // Handle both old format (array) and new format (object with medicines array)
    let medicines: any[] = [];
    if (Array.isArray(result)) {
      medicines = result;
    } else if (result.medicines && Array.isArray(result.medicines)) {
      medicines = result.medicines;
    } else if (result.id) {
      // Single medicine object
      medicines = [result];
    }

    // Validate and format results
    return medicines.map((med: any) => {
      const medicineInfo: MedicineInfo = {
        id: med.id || 'unknown',
        brandNames: med.brandNames || ['Unknown Medicine'],
        genericName: med.genericName || 'Unidentified Medication',
        category: med.category || 'Unknown',
        form: med.form || 'other',
        hazardFlags: med.hazardFlags || {
          controlled: false,
          antibiotic: false,
          cytotoxic: false,
          hormonal: false,
          flushable: false,
        },
        disposalMethods: med.disposalMethods || getUnknownMedicineResponse().disposalMethods,
        warnings: med.warnings || [],
        environmentalRisk: med.environmentalRisk || {
          level: 'high',
          description: 'Unknown medications may contain hazardous compounds.',
        },
        didYouKnow: med.didYouKnow || 'Proper disposal helps protect our environment.',
      };

      return {
        medicine: medicineInfo,
        confidence: med.confidence || 90,
        detectedText: med.detectedText || med.brandNames?.[0] || 'Medicine detected',
        timestamp: med.timestamp,
      };
    });
  } catch (error) {
    console.error('Failed to identify medicines from video:', error);
    throw error;
  }
}

/**
 * Calculate points based on disposal action and environmental impact using GPT
 */
export async function calculatePointsForDisposal(
  action: 'take-back' | 'sealed-disposal' | 'other' | 'skipped',
  environmentalRisk: 'low' | 'medium' | 'high' | 'critical',
  isAntibiotic: boolean,
  isControlled: boolean,
  recommendedMethod: string
): Promise<number> {
  const systemPrompt = `You are a points calculator for environmental impact. Calculate appropriate eco points based on:
- The disposal action taken
- Environmental risk level of the medicine
- Whether it's an antibiotic or controlled substance
- How well the action matches the recommended method

Return a JSON object: {"points": number}

Point ranges:
- Great action (matches recommendation, high impact medicine): 80-100 points
- Great action (matches recommendation, medium impact): 50-70 points
- Great action (matches recommendation, low impact): 30-50 points
- Okay action (safe but not optimal): 20-40 points
- Risky action (not recommended): 5-20 points
- Skipped: 0 points

Antibiotics and controlled substances with high/critical risk should get more points for proper disposal.`;

  const userPrompt = `Calculate points for:
- Action: ${action}
- Environmental Risk: ${environmentalRisk}
- Is Antibiotic: ${isAntibiotic}
- Is Controlled: ${isControlled}
- Recommended Method: ${recommendedMethod}

Return only the points number as JSON: {"points": number}`;

  try {
    const response = await callGPT([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 'gpt-4o-mini', 0.3);

    const result = typeof response === 'string' ? JSON.parse(response) : response;
    const points = result.points || result.point || 0;
    const finalPoints = Math.max(0, Math.min(100, Number(points)));
    console.log('Calculated points:', finalPoints, 'from response:', result);
    return finalPoints;
  } catch (error) {
    console.error('Failed to calculate points with GPT, using fallback:', error);
    // Fallback calculation
    if (action === 'skipped') return 0;
    if (action === 'take-back') {
      if (environmentalRisk === 'critical' && isAntibiotic) return 100;
      if (environmentalRisk === 'critical') return 90;
      if (environmentalRisk === 'high') return 70;
      if (environmentalRisk === 'medium') return 50;
      return 30;
    }
    if (action === 'sealed-disposal') {
      if (environmentalRisk === 'critical') return 40;
      if (environmentalRisk === 'high') return 30;
      return 20;
    }
    return 10;
  }
}

/**
 * Get impact description and fish preview for improper disposal
 */
export async function getImproperDisposalImpact(
  environmentalRisk: 'low' | 'medium' | 'high' | 'critical',
  medicineName: string,
  genericName: string,
  isAntibiotic: boolean
): Promise<{
  impactDescription: string;
  fishThatWouldDie: string;
  fishYouWillSave: string;
}> {
  const systemPrompt = `You are an environmental impact expert. Describe what would happen if this medicine was improperly disposed (flushed down toilet or thrown in regular trash), and which fish would be affected.

Return JSON: {
  "impactDescription": "Detailed description of environmental damage",
  "fishThatWouldDie": "Type of fish that would be harmed (e.g., 'mackerel', 'salmon', 'tuna', 'shark', 'whale')",
  "fishYouWillSave": "Type of fish that will be saved by proper disposal - MUST be the EXACT SAME as fishThatWouldDie"
}

IMPORTANT: fishYouWillSave MUST be identical to fishThatWouldDie - they represent the same fish species.`;

  const userPrompt = `Medicine: ${medicineName} (${genericName})
Environmental Risk: ${environmentalRisk}
Is Antibiotic: ${isAntibiotic}

Describe the impact of improper disposal and which fish would be harmed.`;

  try {
    const response = await callGPT([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const result = JSON.parse(response);
    return {
      impactDescription: result.impactDescription || 'Improper disposal can contaminate waterways and harm aquatic life.',
      fishThatWouldDie: result.fishThatWouldDie || 'mackerel',
      fishYouWillSave: result.fishYouWillSave || result.fishThatWouldDie || 'mackerel',
    };
  } catch (error) {
    console.error('Failed to get impact description:', error);
    // Fallback
    const fishMap: Record<string, string> = {
      critical: 'whale',
      high: 'tuna',
      medium: 'salmon',
      low: 'mackerel',
    };
    const fish = fishMap[environmentalRisk] || 'mackerel';
    return {
      impactDescription: `Improper disposal of ${medicineName} would contaminate waterways and harm ${fish} populations.`,
      fishThatWouldDie: fish,
      fishYouWillSave: fish,
    };
  }
}

/**
 * Select appropriate fish type based on environmental impact using GPT
 */
export async function selectFishForImpact(
  environmentalRisk: 'low' | 'medium' | 'high' | 'critical',
  medicineName: string,
  genericName: string,
  isAntibiotic: boolean,
  isControlled: boolean
): Promise<'mackerel' | 'sardine' | 'anchovy' | 'guppy' | 'tetra' | 'goldfish' | 'clownfish' | 'angelfish' | 'betta' | 'salmon' | 'tuna' | 'shark' | 'whale'> {
  const systemPrompt = `You are a marine biologist helping to represent environmental impact through fish species. 
Based on the environmental risk level and medicine characteristics, select the most appropriate fish that represents the impact of properly disposing this medicine.

Available fish options (from smallest to largest impact):
- mackerel, sardine, anchovy: Small impact (low risk medicines)
- guppy, tetra: Small-medium impact
- goldfish, clownfish: Medium impact (medium risk medicines)
- angelfish, betta: Medium-high impact
- salmon: High impact (high risk medicines, antibiotics)
- tuna: Very high impact (critical risk medicines)
- shark: Critical impact (antibiotics, controlled substances with high risk)
- whale: Maximum impact (critical antibiotics, cytotoxic drugs)

Return ONLY the fish type name as a string (e.g., "tuna", "salmon", "mackerel").`;

  const userPrompt = `Medicine: ${medicineName} (${genericName})
Environmental Risk Level: ${environmentalRisk}
Is Antibiotic: ${isAntibiotic}
Is Controlled Substance: ${isControlled}

Select the fish that best represents the environmental impact prevented by properly disposing this medicine. Consider:
- Low risk = small fish (mackerel, sardine, anchovy)
- Medium risk = medium fish (goldfish, clownfish, angelfish)
- High risk = large fish (salmon, tuna)
- Critical risk + antibiotic = very large fish (shark, whale)

Return only the fish type name.`;

  try {
    const response = await callGPT([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const fishType = response.trim().toLowerCase().replace(/['"]/g, '') as any;
    
    // Validate the response
    const validFishTypes = ['mackerel', 'sardine', 'anchovy', 'guppy', 'tetra', 'goldfish', 'clownfish', 'angelfish', 'betta', 'salmon', 'tuna', 'shark', 'whale'];
    
    if (validFishTypes.includes(fishType)) {
      return fishType;
    }

    // Fallback based on risk level
    if (environmentalRisk === 'critical' && isAntibiotic) {
      return 'whale';
    } else if (environmentalRisk === 'critical') {
      return 'shark';
    } else if (environmentalRisk === 'high' && isAntibiotic) {
      return 'tuna';
    } else if (environmentalRisk === 'high') {
      return 'salmon';
    } else if (environmentalRisk === 'medium') {
      return 'goldfish';
    } else {
      return 'mackerel';
    }
  } catch (error) {
    console.error('Failed to select fish with GPT, using fallback:', error);
    // Fallback logic
    if (environmentalRisk === 'critical' && isAntibiotic) {
      return 'whale';
    } else if (environmentalRisk === 'critical') {
      return 'shark';
    } else if (environmentalRisk === 'high' && isAntibiotic) {
      return 'tuna';
    } else if (environmentalRisk === 'high') {
      return 'salmon';
    } else if (environmentalRisk === 'medium') {
      return 'goldfish';
    } else {
      return 'mackerel';
    }
  }
}

/**
 * Default locations fallback
 */
function getDefaultLocations() {
  // Default DHA government hospitals for medication take-back
  return [
    {
      id: 1,
      name: 'Dubai Hospital',
      address: 'Al Khaleej Road, Al Baraha, Dubai',
      distance: 'N/A',
      acceptsAll: true,
      hours: '24/7',
    },
    {
      id: 2,
      name: 'Rashid Hospital',
      address: 'Umm Hurair 2, Dubai',
      distance: 'N/A',
      acceptsAll: true,
      hours: '24/7',
    },
    {
      id: 3,
      name: 'Latifa Hospital',
      address: 'Al Jaddaf, Dubai',
      distance: 'N/A',
      acceptsAll: true,
      hours: '24/7',
    },
    {
      id: 4,
      name: 'Al Jalila Children\'s Specialty Hospital',
      address: 'Al Jaddaf, Dubai',
      distance: 'N/A',
      acceptsAll: true,
      hours: '9:00 AM - 9:00 PM',
    },
  ];
}

/**
 * Extract expiry date from medicine package image
 */
export async function extractExpiryDateFromImage(imageFile: File | string): Promise<{
  expiryDate: string | null;
  confidence: 'high' | 'medium' | 'low';
  detectedText?: string;
}> {
  const systemPrompt = `You are a pharmaceutical expert. Analyze the medicine package image and extract the expiry date or expiration date.
Return a JSON object with the following structure:
{
  "expiryDate": "YYYY-MM-DD format (e.g., 2025-12-31) or null if not found",
  "confidence": "high|medium|low",
  "detectedText": "The exact text you found that represents the expiry date"
}

Look for:
- "Expiry Date", "Exp Date", "EXP", "Use By", "Best Before"
- Dates in formats like: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY
- Month names: Jan, Feb, Mar, etc.
- If no expiry date is found, return null for expiryDate and confidence "low"`;

  try {
    // Convert image to base64 - use EXACT same logic as identifyMedicineFromImage
    const base64Image = await imageToBase64(imageFile);
    
    // Validate the base64 image format - EXACT same validation as identifyMedicineFromImage
    if (!base64Image || !base64Image.startsWith('data:image/')) {
      throw new Error('Invalid image format: image conversion failed');
    }
    
    // Ensure base64 string is properly formatted
    if (!base64Image.includes(';base64,')) {
      throw new Error('Invalid base64 format: missing base64 prefix');
    }
    
    // Log for debugging (same as identifyMedicineFromImage)
    console.log('Expiry image format:', base64Image.substring(0, 50) + '...');
    
    const userPrompt = `Analyze this medicine package image and find the expiry date or expiration date. 
Look carefully at all text on the package, especially near labels like "Expiry", "Exp", "Use By", or "Best Before".
Return the date in YYYY-MM-DD format. If you cannot find an expiry date, return null.`;

    // Use EXACT same message structure as identifyMedicineFromImage
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> }> = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userPrompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: base64Image,
            },
          },
        ],
      },
    ];

    // Use EXACT same model and temperature as identifyMedicineFromImage
    const response = await callGPT(messages, 'gpt-4o', 0.3);
    const result = JSON.parse(response);
    
    return {
      expiryDate: result.expiryDate || null,
      confidence: result.confidence || 'low',
      detectedText: result.detectedText,
    };
  } catch (error) {
    console.error('Failed to extract expiry date:', error);
    return {
      expiryDate: null,
      confidence: 'low',
    };
  }
}

/**
 * Extract medicine info and expiry date from video
 */
export async function extractMedicineAndExpiryFromVideo(videoFile: File): Promise<{
  medicine: MedicineInfo | null;
  expiryDate: string | null;
  medicineConfidence: 'high' | 'medium' | 'low';
  expiryConfidence: 'high' | 'medium' | 'low';
  missingInfo: 'medicine' | 'expiry' | 'both' | null;
}> {
  const systemPrompt = `You are a pharmaceutical expert. Analyze video frames showing a medicine package and extract:
1. Medicine identification (name, generic name, category, etc.)
2. Expiry date

Return a JSON object:
{
  "medicine": { MedicineInfo object } or null if medicine cannot be identified,
  "expiryDate": "YYYY-MM-DD" or null if expiry date not found,
  "medicineConfidence": "high|medium|low",
  "expiryConfidence": "high|medium|low",
  "missingInfo": "medicine" if medicine not found, "expiry" if expiry not found, "both" if neither found, null if both found
}`;

  try {
    const frames = await extractKeyFrames(videoFile, 15);
    
    if (frames.length === 0) {
      throw new Error('Failed to extract frames from video');
    }

    const userPrompt = `Analyze these video frames of a medicine package. Extract:
1. Medicine identification (brand name, generic name, category, form, hazard flags)
2. Expiry date (look for "Expiry", "Exp", "Use By", "Best Before" labels)

IMPORTANT: 
- If you cannot clearly see the medicine name/identification, set medicine to null and medicineConfidence to "low"
- If you cannot clearly see the expiry date, set expiryDate to null and expiryConfidence to "low"
- Set missingInfo accordingly: "medicine" if medicine missing, "expiry" if expiry missing, "both" if both missing, null if both found

Be very strict - only return high confidence if you can clearly see the information.`;

    const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: userPrompt },
      ...frames.map(frame => ({
        type: 'image_url' as const,
        image_url: { url: frame },
      })),
    ];

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content },
    ];

    const response = await callGPT(messages, 'gpt-4o', 0.3);
    const result = JSON.parse(response);
    
    return {
      medicine: result.medicine || null,
      expiryDate: result.expiryDate || null,
      medicineConfidence: result.medicineConfidence || 'low',
      expiryConfidence: result.expiryConfidence || 'low',
      missingInfo: result.missingInfo || null,
    };
  } catch (error) {
    console.error('Failed to extract medicine and expiry from video:', error);
    return {
      medicine: null,
      expiryDate: null,
      medicineConfidence: 'low',
      expiryConfidence: 'low',
      missingInfo: 'both',
    };
  }
}

