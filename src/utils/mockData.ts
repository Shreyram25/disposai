/**
 * Mock data for presentation/demo purposes
 * Activated when 'K' key is pressed during processing
 */

import { MedicineInfo } from '@/services/openai';
import { Medicine } from '@/data/medicineDatabase';

/**
 * Get mock medicine data for Flexitol Lip Balm
 */
export function getMockFlexitol(): MedicineInfo {
  return {
    id: 'flexitol-lip-balm',
    brandNames: ['Flexitol Lip Balm'],
    genericName: 'Urea, Lanolin',
    category: 'Dermatology',
    form: 'ointment',
    hazardFlags: {
      controlled: false,
      antibiotic: false,
      cytotoxic: false,
      hormonal: false,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Household Disposal with Coffee Grounds',
        steps: [
          'Remove any remaining product from the container',
          'Mix the remaining product with used coffee grounds or kitty litter',
          'Place the mixture in a sealed plastic bag',
          'Dispose in regular household trash',
        ],
        icon: 'Trash2',
        safetyRating: 'A',
      },
      alternatives: [
        {
          method: 'Sealed Trash Disposal',
          steps: [
            'Seal the container tightly',
            'Place in a sealed plastic bag',
            'Dispose in regular household trash',
          ],
          icon: 'Package',
          safetyRating: 'A',
        },
      ],
    },
    warnings: [
      'Do not flush down the toilet',
      'Keep out of reach of children',
    ],
    environmentalRisk: {
      level: 'low',
      description: 'Lip balm products have minimal environmental impact when disposed of properly in household trash.',
    },
    didYouKnow: 'Lip balms are generally safe for household disposal as they contain minimal active pharmaceutical ingredients.',
  };
}

/**
 * Get mock medicine data for Oratane (Isotretinoin)
 */
export function getMockOratane(): MedicineInfo {
  return {
    id: 'oratane',
    brandNames: ['Oratane', 'Isotretinoin'],
    genericName: 'Isotretinoin',
    category: 'Dermatology',
    form: 'capsule',
    hazardFlags: {
      controlled: true,
      antibiotic: false,
      cytotoxic: false,
      hormonal: true,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Hospital Take-Back Program',
        steps: [
          'Contact your local hospital or pharmacy',
          'Bring the medication in its original container',
          'Do not flush or throw in regular trash',
          'Follow DHA Clean Your Medicine Cabinet guidelines',
        ],
        icon: 'Hospital',
        safetyRating: 'A',
      },
      alternatives: [
        {
          method: 'Household Disposal with Coffee Grounds',
          steps: [
            'Remove capsules from container',
            'Mix with used coffee grounds or kitty litter',
            'Place in sealed plastic bag',
            'Dispose in regular household trash',
          ],
          icon: 'Trash2',
          safetyRating: 'B',
        },
      ],
    },
    warnings: [
      'Do not flush down the toilet',
      'This is a controlled substance - dispose carefully',
      'Keep out of reach of children and pets',
      'Isotretinoin can cause birth defects - handle with care',
    ],
    environmentalRisk: {
      level: 'high',
      description: 'Isotretinoin is a potent medication that can have significant environmental impact if improperly disposed. It should be returned to a hospital take-back program when possible.',
    },
    didYouKnow: 'Isotretinoin (Oratane) is a teratogenic medication that can cause severe birth defects. Proper disposal is critical to prevent environmental contamination.',
  };
}

/**
 * Get mock medicine data for Digene Antacid Antiflatulent Tablets
 */
export function getMockDigene(): MedicineInfo {
  return {
    id: 'digene-antacid',
    brandNames: ['Digene', 'Digene Antacid Antiflatulent Tablets'],
    genericName: 'Aluminium Hydroxide, Magnesium Hydroxide, Simethicone',
    category: 'Antacids',
    form: 'tablet',
    hazardFlags: {
      controlled: false,
      antibiotic: false,
      cytotoxic: false,
      hormonal: false,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Household Disposal with Coffee Grounds',
        steps: [
          'Crush the tablets if possible',
          'Mix with used coffee grounds or kitty litter',
          'Place the mixture in a sealed plastic bag',
          'Dispose in regular household trash',
        ],
        icon: 'Trash2',
        safetyRating: 'A',
      },
      alternatives: [
        {
          method: 'Sealed Trash Disposal',
          steps: [
            'Place tablets in a sealed plastic bag',
            'Dispose in regular household trash',
          ],
          icon: 'Package',
          safetyRating: 'A',
        },
      ],
    },
    warnings: [
      'Do not flush down the toilet',
      'Antacids are generally safe for household disposal',
    ],
    environmentalRisk: {
      level: 'low',
      description: 'Antacid tablets have minimal environmental impact when disposed of properly in household trash.',
    },
    didYouKnow: 'Antacids like Digene can be safely disposed of in household trash when mixed with coffee grounds or sealed properly.',
  };
}

/**
 * Convert MedicineInfo to Medicine format
 */
function convertToMedicine(info: MedicineInfo): Medicine {
  return {
    id: info.id,
    brandNames: info.brandNames,
    genericName: info.genericName,
    category: info.category,
    form: info.form === 'other' ? 'tablet' : info.form,
    hazardFlags: info.hazardFlags,
    disposalMethods: info.disposalMethods,
    warnings: info.warnings,
    environmentalRisk: info.environmentalRisk,
    didYouKnow: info.didYouKnow,
  };
}

/**
 * Get mock data for video scan (returns both medicines)
 */
export function getMockVideoResults(): Array<{
  medicine: Medicine;
  confidence: number;
  detectedText: string;
  imageUrl: string;
}> {
  const flexitol = getMockFlexitol();
  const digene = getMockDigene();
  
  return [
    {
      medicine: convertToMedicine(flexitol),
      confidence: 95,
      detectedText: 'Flexitol Lip Balm',
      imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop&q=80',
    },
    {
      medicine: convertToMedicine(digene),
      confidence: 95,
      detectedText: 'Digene Antacid Antiflatulent Tablets',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&q=80',
    },
  ];
}

/**
 * Get mock data for image scan (returns Oratane Isotretinoin)
 */
export function getMockImageResult(): {
  medicine: Medicine;
  confidence: number;
  detectedText: string;
} {
  const oratane = getMockOratane();
  
  return {
    medicine: convertToMedicine(oratane),
    confidence: 95,
    detectedText: 'Oratane Isotretinoin',
  };
}

/**
 * Get mock data for inventory image scan (returns Oratane with expiry date)
 */
export function getMockInventoryImageResult(): {
  medicine: Medicine;
  expiryDate: string;
} {
  const oratane = getMockOratane();
  
  return {
    medicine: convertToMedicine(oratane),
    expiryDate: '2027-11-30', // November 30, 2027 in YYYY-MM-DD format (matches API format)
  };
}

/**
 * Get mock data for inventory video scan (returns Digene and Flexitol with expiry dates)
 */
export function getMockInventoryVideoResults(): Array<{
  medicine: Medicine;
  expiryDate: string;
}> {
  const digene = getMockDigene();
  const flexitol = getMockFlexitol();
  
  return [
    {
      medicine: convertToMedicine(digene),
      expiryDate: '2027-11-30', // November 30, 2027
    },
    {
      medicine: convertToMedicine(flexitol),
      expiryDate: '2027-12-15', // December 15, 2027
    },
  ];
}

