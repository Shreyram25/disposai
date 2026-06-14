// Popular medications with stock images
export interface PopularMedicine {
  id: string;
  brandNames: string[];
  genericName: string;
  category: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'cream' | 'ointment' | 'inhaler' | 'injection' | 'drops' | 'patch';
  imageUrl: string;
  searchTerms: string[]; // Terms to match when identifying
}

export const popularMedicines: PopularMedicine[] = [
  {
    id: 'telfast',
    brandNames: ['Telfast', 'Fexofenadine'],
    genericName: 'Fexofenadine',
    category: 'Antihistamines',
    form: 'tablet',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&q=80',
    searchTerms: ['telfast', 'fexofenadine', 'allegra'],
  },
  {
    id: 'panadol',
    brandNames: ['Panadol', 'Panadol Extra', 'Panadol Advance'],
    genericName: 'Paracetamol (Acetaminophen)',
    category: 'Painkillers',
    form: 'tablet',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&q=80',
    searchTerms: ['panadol', 'paracetamol', 'acetaminophen', 'tylenol'],
  },
  {
    id: 'adol',
    brandNames: ['Adol', 'Adol Syrup'],
    genericName: 'Paracetamol',
    category: 'Painkillers',
    form: 'syrup',
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop&q=80',
    searchTerms: ['adol', 'paracetamol syrup'],
  },
  {
    id: 'hyalo-atlantic',
    brandNames: ['Hyalo Atlantic', 'Hyalo Atlantic Nasal Spray'],
    genericName: 'Sodium Hyaluronate',
    category: 'Nasal Care',
    form: 'drops',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop&q=80',
    searchTerms: ['hyalo', 'hyalo atlantic', 'nasal spray', 'sodium hyaluronate'],
  },
  {
    id: 'lorinase-d',
    brandNames: ['Lorinase-D', 'Loratadine'],
    genericName: 'Loratadine',
    category: 'Antihistamines',
    form: 'tablet',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&q=80',
    searchTerms: ['lorinase', 'loratadine', 'claritin'],
  },
  {
    id: 'oratane',
    brandNames: ['Oratane', 'Isotretinoin'],
    genericName: 'Isotretinoin',
    category: 'Dermatology',
    form: 'capsule',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop&q=80',
    searchTerms: ['oratane', 'isotretinoin', 'accutane'],
  },
];

/**
 * Match medicine name to popular medicine and get stock image
 */
export function getMedicineImage(medicineName: string, genericName?: string): string | null {
  const searchText = `${medicineName} ${genericName || ''}`.toLowerCase();
  
  for (const med of popularMedicines) {
    const matches = med.searchTerms.some(term => searchText.includes(term.toLowerCase())) ||
                    med.brandNames.some(brand => searchText.includes(brand.toLowerCase())) ||
                    searchText.includes(med.genericName.toLowerCase());
    
    if (matches) {
      return med.imageUrl;
    }
  }
  
  return null;
}

