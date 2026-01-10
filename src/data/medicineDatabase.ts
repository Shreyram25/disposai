export interface Medicine {
  id: string;
  brandNames: string[];
  genericName: string;
  category: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'cream' | 'ointment' | 'inhaler' | 'injection' | 'drops' | 'patch';
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

export const medicineDatabase: Medicine[] = [
  {
    id: 'panadol',
    brandNames: ['Panadol', 'Panadol Extra', 'Panadol Advance'],
    genericName: 'Paracetamol (Acetaminophen)',
    category: 'Painkillers',
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
        method: 'Pharmacy Take-Back',
        steps: [
          'Keep tablets in original packaging if possible',
          'Visit your nearest pharmacy with take-back program',
          'Hand over to pharmacist for proper disposal',
          'Request a disposal receipt if available'
        ],
        icon: 'Building2',
        safetyRating: 'A'
      },
      alternatives: [
        {
          method: 'Sealed Household Disposal',
          steps: [
            'Remove tablets from packaging',
            'Mix with coffee grounds or cat litter',
            'Place in sealed container or bag',
            'Dispose in household trash (not recycling)'
          ],
          icon: 'Trash2',
          safetyRating: 'B'
        }
      ]
    },
    warnings: [
      'Never flush down toilet',
      'Keep away from children before disposal',
      'Do not crush or dissolve in water'
    ],
    environmentalRisk: {
      level: 'medium',
      description: 'Paracetamol can persist in water systems and affect aquatic life reproduction.'
    },
    didYouKnow: 'Paracetamol is one of the most commonly detected pharmaceuticals in waterways worldwide, found in 65% of European rivers.'
  },
  {
    id: 'adol',
    brandNames: ['Adol', 'Adol Extra', 'Adol PM'],
    genericName: 'Paracetamol (Acetaminophen)',
    category: 'Painkillers',
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
        method: 'Pharmacy Take-Back',
        steps: [
          'Keep tablets in original blister pack',
          'Locate nearest pharmacy with disposal service',
          'Submit for professional disposal',
          'Receive confirmation of safe disposal'
        ],
        icon: 'Building2',
        safetyRating: 'A'
      },
      alternatives: [
        {
          method: 'Sealed Household Disposal',
          steps: [
            'Remove from blister pack',
            'Mix with undesirable substance (coffee grounds)',
            'Seal in opaque container',
            'Place in general waste bin'
          ],
          icon: 'Trash2',
          safetyRating: 'B'
        }
      ]
    },
    warnings: [
      'Do not flush medications',
      'Avoid burning or incinerating',
      'Remove personal information from packaging'
    ],
    environmentalRisk: {
      level: 'medium',
      description: 'Can contaminate groundwater and affect fish liver function.'
    },
    didYouKnow: 'In the UAE, community pharmacies are increasingly offering free medication take-back services.'
  },
  {
    id: 'amoxicillin',
    brandNames: ['Amoxil', 'Augmentin', 'Clavamox', 'Amoxicillin'],
    genericName: 'Amoxicillin',
    category: 'Antibiotics',
    form: 'capsule',
    hazardFlags: {
      controlled: false,
      antibiotic: true,
      cytotoxic: false,
      hormonal: false,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Pharmacy Take-Back (Required)',
        steps: [
          'Antibiotics MUST be returned to pharmacy',
          'Do not mix with household waste',
          'Keep in original packaging',
          'Inform pharmacist of antibiotic type'
        ],
        icon: 'AlertTriangle',
        safetyRating: 'A'
      },
      alternatives: []
    },
    warnings: [
      'CRITICAL: Never dispose in regular trash',
      'Antibiotic resistance is a global health crisis',
      'Improper disposal contributes to superbugs',
      'Always complete full course before disposing unused'
    ],
    environmentalRisk: {
      level: 'critical',
      description: 'Antibiotics in the environment accelerate antimicrobial resistance, threatening global health security.'
    },
    didYouKnow: 'Antibiotic-resistant infections cause 1.27 million deaths annually. Proper disposal helps prevent new resistant strains.'
  },
  {
    id: 'ibuprofen',
    brandNames: ['Brufen', 'Advil', 'Nurofen', 'Motrin'],
    genericName: 'Ibuprofen',
    category: 'Painkillers',
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
        method: 'Pharmacy Take-Back',
        steps: [
          'Collect all unused ibuprofen tablets',
          'Visit community pharmacy',
          'Deposit in designated collection bin',
          'Ibuprofen will be incinerated safely'
        ],
        icon: 'Building2',
        safetyRating: 'A'
      },
      alternatives: [
        {
          method: 'Sealed Disposal',
          steps: [
            'Crush tablets to prevent misuse',
            'Mix with absorbent material',
            'Double-bag in opaque containers',
            'Dispose with regular household waste'
          ],
          icon: 'Package',
          safetyRating: 'B'
        }
      ]
    },
    warnings: [
      'Toxic to aquatic organisms',
      'Keep away from water sources',
      'Do not compost'
    ],
    environmentalRisk: {
      level: 'high',
      description: 'NSAIDs like ibuprofen cause kidney damage in fish and disrupt their osmoregulation.'
    },
    didYouKnow: 'Ibuprofen concentrations in some rivers are high enough to affect fish behavior and reproduction.'
  },
  {
    id: 'ventolin',
    brandNames: ['Ventolin', 'Salamol', 'Proventil', 'Albuterol'],
    genericName: 'Salbutamol',
    category: 'Respiratory',
    form: 'inhaler',
    hazardFlags: {
      controlled: false,
      antibiotic: false,
      cytotoxic: false,
      hormonal: false,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Pharmacy Take-Back',
        steps: [
          'Do not puncture the canister',
          'Return to pharmacy for specialist disposal',
          'Inhalers contain pressurized gases',
          'Some pharmacies have specific inhaler recycling'
        ],
        icon: 'Recycle',
        safetyRating: 'A'
      },
      alternatives: []
    },
    warnings: [
      'NEVER puncture or incinerate',
      'Pressurized container - explosion risk',
      'Contains greenhouse gases',
      'Special hazardous waste disposal required'
    ],
    environmentalRisk: {
      level: 'high',
      description: 'Inhaler propellants are potent greenhouse gases with warming potential 1,430x greater than CO2.'
    },
    didYouKnow: 'One inhaler\'s carbon footprint equals a 180-mile car journey. Proper recycling captures these gases.'
  },
  {
    id: 'insulin',
    brandNames: ['Lantus', 'Humalog', 'NovoRapid', 'Insulin'],
    genericName: 'Insulin',
    category: 'Diabetes',
    form: 'injection',
    hazardFlags: {
      controlled: true,
      antibiotic: false,
      cytotoxic: false,
      hormonal: true,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Sharps Container + Take-Back',
        steps: [
          'Place used needles in approved sharps container',
          'Never recap used needles',
          'When container is ¾ full, seal it',
          'Return to pharmacy or hospital for incineration'
        ],
        icon: 'Syringe',
        safetyRating: 'A'
      },
      alternatives: []
    },
    warnings: [
      'Needles are biohazardous waste',
      'Risk of needlestick injuries',
      'Never dispose in regular trash',
      'Insulin is temperature sensitive'
    ],
    environmentalRisk: {
      level: 'high',
      description: 'Improper sharps disposal causes injuries to waste workers and can transmit bloodborne pathogens.'
    },
    didYouKnow: 'Healthcare workers suffer 385,000 needlestick injuries annually from improperly disposed sharps.'
  },
  {
    id: 'aspirin',
    brandNames: ['Aspirin', 'Bayer', 'Disprin', 'Aspro'],
    genericName: 'Acetylsalicylic Acid',
    category: 'Painkillers',
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
        method: 'Pharmacy Take-Back',
        steps: [
          'Gather expired or unused aspirin',
          'Keep in original container if labeled',
          'Take to participating pharmacy',
          'Dispose through official program'
        ],
        icon: 'Building2',
        safetyRating: 'A'
      },
      alternatives: [
        {
          method: 'Household Disposal',
          steps: [
            'Dissolve tablets in small amount of water',
            'Mix with coffee grounds or dirt',
            'Place in sealed container',
            'Dispose in household trash'
          ],
          icon: 'Trash2',
          safetyRating: 'B'
        }
      ]
    },
    warnings: [
      'Do not flush',
      'Keep away from pets (toxic to cats)',
      'Remove personal info from bottles'
    ],
    environmentalRisk: {
      level: 'medium',
      description: 'Aspirin affects plant growth and can alter soil microorganism communities.'
    },
    didYouKnow: 'Willow bark, the natural source of aspirin, was used for pain relief over 3,500 years ago.'
  },
  {
    id: 'metformin',
    brandNames: ['Glucophage', 'Metformin', 'Fortamet', 'Riomet'],
    genericName: 'Metformin',
    category: 'Diabetes',
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
        method: 'Pharmacy Take-Back',
        steps: [
          'Collect unused metformin tablets',
          'Visit diabetes clinic or pharmacy',
          'Submit for controlled disposal',
          'Ask about diabetes medication programs'
        ],
        icon: 'Building2',
        safetyRating: 'A'
      },
      alternatives: [
        {
          method: 'Sealed Disposal',
          steps: [
            'Remove from packaging',
            'Mix with unpalatable substance',
            'Seal in container',
            'Place in general waste'
          ],
          icon: 'Package',
          safetyRating: 'B'
        }
      ]
    },
    warnings: [
      'Do not share with others',
      'Dispose of expired medication promptly',
      'Keep away from water sources'
    ],
    environmentalRisk: {
      level: 'medium',
      description: 'Metformin persists in water treatment and has been linked to intersex fish development.'
    },
    didYouKnow: 'Metformin is the most widely prescribed diabetes medication worldwide, with billions of doses taken annually.'
  },
  {
    id: 'omeprazole',
    brandNames: ['Prilosec', 'Losec', 'Omeprazole', 'Zegerid'],
    genericName: 'Omeprazole',
    category: 'Gastrointestinal',
    form: 'capsule',
    hazardFlags: {
      controlled: false,
      antibiotic: false,
      cytotoxic: false,
      hormonal: false,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Pharmacy Take-Back',
        steps: [
          'Keep capsules intact',
          'Return to any community pharmacy',
          'Deposit in medication collection',
          'Receive disposal confirmation'
        ],
        icon: 'Building2',
        safetyRating: 'A'
      },
      alternatives: [
        {
          method: 'Household Disposal',
          steps: [
            'Empty capsules into disposable container',
            'Mix with coffee grounds or kitty litter',
            'Seal container completely',
            'Place in regular trash'
          ],
          icon: 'Trash2',
          safetyRating: 'B'
        }
      ]
    },
    warnings: [
      'Do not crush enteric-coated capsules',
      'Avoid disposal near food prep areas',
      'Keep children away during disposal'
    ],
    environmentalRisk: {
      level: 'low',
      description: 'Proton pump inhibitors have relatively low environmental persistence but can affect soil pH.'
    },
    didYouKnow: 'PPIs like omeprazole are among the most overprescribed medications globally.'
  },
  {
    id: 'cough-syrup',
    brandNames: ['Robitussin', 'Delsym', 'Mucinex', 'Benylin'],
    genericName: 'Dextromethorphan / Guaifenesin',
    category: 'Cough & Cold',
    form: 'syrup',
    hazardFlags: {
      controlled: false,
      antibiotic: false,
      cytotoxic: false,
      hormonal: false,
      flushable: false,
    },
    disposalMethods: {
      primary: {
        method: 'Pharmacy Take-Back',
        steps: [
          'Keep liquid in original bottle',
          'Ensure cap is tightly sealed',
          'Return to pharmacy for disposal',
          'Liquids require special handling'
        ],
        icon: 'Building2',
        safetyRating: 'A'
      },
      alternatives: [
        {
          method: 'Absorbent Disposal',
          steps: [
            'Pour syrup onto absorbent material (cat litter)',
            'Allow to fully absorb',
            'Place in sealed bag',
            'Dispose in household trash'
          ],
          icon: 'Droplets',
          safetyRating: 'B'
        }
      ]
    },
    warnings: [
      'Never pour down drain',
      'Liquids can contaminate water easily',
      'Some contain codeine - check for controlled substances',
      'Sweet taste attracts children - secure disposal'
    ],
    environmentalRisk: {
      level: 'medium',
      description: 'Liquid medications enter waterways more easily and can affect aquatic ecosystems.'
    },
    didYouKnow: 'Pharmaceutical pollution from improper liquid disposal affects over 40% of global freshwater sources.'
  }
];

export const getUnknownMedicineResponse = (): Medicine => ({
  id: 'unknown',
  brandNames: ['Unknown Medicine'],
  genericName: 'Unidentified Medication',
  category: 'Unknown',
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
      method: 'Pharmacy Take-Back (Recommended)',
      steps: [
        'When medication cannot be identified, always use take-back',
        'Visit your nearest pharmacy or hospital',
        'Pharmacist will assess and dispose safely',
        'This ensures proper handling of unknown substances'
      ],
      icon: 'HelpCircle',
      safetyRating: 'A'
    },
    alternatives: []
  },
  warnings: [
    'Unknown medications may contain controlled substances',
    'Do not attempt household disposal',
    'Professional assessment required',
    'When in doubt, always use pharmacy take-back'
  ],
  environmentalRisk: {
    level: 'high',
    description: 'Unknown medications may contain hazardous compounds requiring specialized disposal.'
  },
  didYouKnow: 'Pharmacists are trained to identify medications and determine appropriate disposal methods - their expertise is free to use!'
});

export const findMedicine = (searchText: string): Medicine | null => {
  const normalizedSearch = searchText.toLowerCase().trim();
  
  for (const medicine of medicineDatabase) {
    // Check brand names
    for (const brand of medicine.brandNames) {
      if (normalizedSearch.includes(brand.toLowerCase()) || 
          brand.toLowerCase().includes(normalizedSearch)) {
        return medicine;
      }
    }
    // Check generic name
    if (normalizedSearch.includes(medicine.genericName.toLowerCase()) ||
        medicine.genericName.toLowerCase().includes(normalizedSearch)) {
      return medicine;
    }
  }
  
  return null;
};

export const takeBackLocations = [
  {
    id: 1,
    name: 'Life Pharmacy - Dubai Mall',
    address: 'The Dubai Mall, Ground Floor, Dubai',
    distance: '2.3 km',
    acceptsAll: true,
    hours: '10:00 AM - 10:00 PM'
  },
  {
    id: 2,
    name: 'Aster Pharmacy - JBR',
    address: 'Jumeirah Beach Residence, Dubai',
    distance: '4.1 km',
    acceptsAll: true,
    hours: '9:00 AM - 11:00 PM'
  },
  {
    id: 3,
    name: 'Dubai Health Authority Clinic',
    address: 'Al Barsha Health Center, Dubai',
    distance: '5.8 km',
    acceptsAll: true,
    hours: '8:00 AM - 8:00 PM'
  }
];
