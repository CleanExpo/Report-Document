// IICRC Standards Library
// Comprehensive database of IICRC S500, S520, and S700 standards with sections and citations

export interface IICRCSection {
  number: string;
  title: string;
  content: string;
  subsections?: IICRCSection[];
  keywords: string[];
  applicableScenarios: string[];
  damageTypes: string[];
  citations: string[];
}

export interface IICRCStandard {
  code: string;
  title: string;
  version: string;
  description: string;
  sections: IICRCSection[];
  lastUpdated: string;
}

// IICRC S500 - Water Damage Restoration Standard
export const IICRC_S500: IICRCStandard = {
  code: 'S500',
  title: 'Standard for Professional Water Damage Restoration',
  version: '2015',
  description: 'Standard and Reference Guide for Professional Water Damage Restoration',
  lastUpdated: '2015-04-01',
  sections: [
    {
      number: '4.2',
      title: 'Categories of Water',
      content: 'Water damage restoration projects are classified by the probable degree of contamination of the water based on its source.',
      keywords: ['water category', 'contamination', 'classification', 'source'],
      applicableScenarios: ['water damage assessment', 'contamination evaluation'],
      damageTypes: ['water'],
      citations: ['Category 1: Clean water from a sanitary source', 'Category 2: Water with substantial contamination', 'Category 3: Grossly unsanitary water'],
      subsections: [
        {
          number: '4.2.1',
          title: 'Category 1 Water',
          content: 'Water that originates from a sanitary source and does not pose substantial risk from dermal, ingestion, or inhalation exposure.',
          keywords: ['category 1', 'clean water', 'sanitary source'],
          applicableScenarios: ['clean water damage', 'supply line break'],
          damageTypes: ['water'],
          citations: ['Examples include broken water supply lines, tub or sink overflows with no contaminants']
        },
        {
          number: '4.2.2',
          title: 'Category 2 Water',
          content: 'Water that has a substantial degree of chemical, biological, or physical contamination and has the potential to cause discomfort or sickness if contacted or consumed by humans.',
          keywords: ['category 2', 'contaminated water', 'grey water'],
          applicableScenarios: ['washing machine overflow', 'dishwasher leak', 'toilet overflow'],
          damageTypes: ['water'],
          citations: ['May contain potentially unsafe levels of microorganisms or nutrients for microorganisms']
        },
        {
          number: '4.2.3',
          title: 'Category 3 Water',
          content: 'Water that is grossly unsanitary and could cause severe discomfort or sickness if contacted or consumed by humans.',
          keywords: ['category 3', 'black water', 'sewage', 'grossly unsanitary'],
          applicableScenarios: ['sewage backup', 'flooding from rivers', 'toilet overflow with feces'],
          damageTypes: ['water'],
          citations: ['Contains unsanitary agents, harmful bacteria and fungi, requiring specialized restoration procedures']
        }
      ]
    },
    {
      number: '5.1',
      title: 'Classes of Water Damage',
      content: 'Classification system based on the rate of evaporation of water from wet materials and assemblies in the affected space.',
      keywords: ['water damage class', 'evaporation rate', 'drying time'],
      applicableScenarios: ['damage assessment', 'drying planning'],
      damageTypes: ['water'],
      citations: ['Class 1: Slow rate of evaporation', 'Class 2: Fast rate of evaporation', 'Class 3: Fastest rate of evaporation', 'Class 4: Deep pockets of saturation'],
      subsections: [
        {
          number: '5.1.1',
          title: 'Class 1',
          content: 'Slow rate of evaporation. Water has been absorbed into low porosity materials; minimum moisture is absorbed by materials.',
          keywords: ['class 1', 'slow evaporation', 'low porosity'],
          applicableScenarios: ['minimal water damage', 'concrete floors', 'plaster walls'],
          damageTypes: ['water'],
          citations: ['Concrete, plaster, masonry, wood hardwood floors that are on concrete']
        },
        {
          number: '5.1.2',
          title: 'Class 2',
          content: 'Fast rate of evaporation. Water has been absorbed into high porosity, cushioned carpet, carpet padding, etc.',
          keywords: ['class 2', 'fast evaporation', 'high porosity', 'carpet'],
          applicableScenarios: ['carpet water damage', 'cushioned flooring'],
          damageTypes: ['water'],
          citations: ['Room with carpet, cushioned carpet padding that may have wicked up the walls']
        },
        {
          number: '5.1.3',
          title: 'Class 3',
          content: 'Fastest rate of evaporation. Water has come from overhead, saturating walls, insulation, carpet, pad, and sub-floor.',
          keywords: ['class 3', 'fastest evaporation', 'overhead water', 'saturation'],
          applicableScenarios: ['roof leak', 'overhead pipe burst', 'ceiling collapse'],
          damageTypes: ['water'],
          citations: ['Area is saturated with water absorbed from overhead or other sources that have a fast rate of evaporation']
        },
        {
          number: '5.1.4',
          title: 'Class 4',
          content: 'Deep pockets of saturation. Requires very low humidity and extended drying time. Materials with very low permeance/porosity.',
          keywords: ['class 4', 'deep saturation', 'low humidity', 'extended drying'],
          applicableScenarios: ['hardwood floors', 'concrete saturation', 'specialty drying'],
          damageTypes: ['water'],
          citations: ['Hardwood, concrete, crawlspaces, plaster, brick, stone, lightweight concrete']
        }
      ]
    },
    {
      number: '6.3',
      title: 'Moisture Detection and Measurement',
      content: 'Proper moisture detection and measurement is essential for effective water damage restoration.',
      keywords: ['moisture detection', 'measurement', 'monitoring'],
      applicableScenarios: ['moisture assessment', 'drying monitoring'],
      damageTypes: ['water', 'mould'],
      citations: ['Use appropriate moisture detection equipment calibrated to material being tested'],
      subsections: [
        {
          number: '6.3.1',
          title: 'Moisture Meters',
          content: 'Non-invasive and invasive moisture meters should be used to detect and monitor moisture levels.',
          keywords: ['moisture meters', 'non-invasive', 'invasive', 'monitoring'],
          applicableScenarios: ['moisture detection', 'drying progress'],
          damageTypes: ['water'],
          citations: ['Equipment should be appropriate to the material being tested and properly calibrated']
        }
      ]
    },
    {
      number: '8.2',
      title: 'Controlled Demolition',
      content: 'Removal of materials should be performed in a controlled manner to prevent cross-contamination.',
      keywords: ['controlled demolition', 'material removal', 'cross-contamination'],
      applicableScenarios: ['material removal', 'contamination control'],
      damageTypes: ['water', 'mould'],
      citations: ['Use appropriate containment and filtration to prevent spread of contaminants']
    },
    {
      number: '12.2',
      title: 'HVAC Systems',
      content: 'HVAC systems can distribute contaminants throughout a structure and should be evaluated and addressed.',
      keywords: ['HVAC', 'contamination distribution', 'air systems'],
      applicableScenarios: ['HVAC assessment', 'contamination spread'],
      damageTypes: ['water', 'mould', 'fire', 'smoke'],
      citations: ['HVAC systems should be shut down to prevent spread of contaminants'],
      subsections: [
        {
          number: '12.2.1',
          title: 'HVAC Shutdown',
          content: 'HVAC systems should be shut down when contamination is suspected to prevent distribution of contaminants.',
          keywords: ['HVAC shutdown', 'contamination prevention'],
          applicableScenarios: ['mould contamination', 'smoke damage', 'water damage'],
          damageTypes: ['water', 'mould', 'smoke'],
          citations: ['Shut down HVAC system if contamination suspected to prevent cross-contamination']
        },
        {
          number: '12.2.2',
          title: 'HVAC Cleaning',
          content: 'Contaminated HVAC systems require professional cleaning by qualified personnel.',
          keywords: ['HVAC cleaning', 'professional cleaning', 'qualified personnel'],
          applicableScenarios: ['HVAC contamination', 'post-damage restoration'],
          damageTypes: ['mould', 'smoke', 'fire'],
          citations: ['HVAC cleaning should be performed by personnel trained in HVAC restoration procedures']
        }
      ]
    }
  ]
};

// IICRC S520 - Mould Remediation Standard
export const IICRC_S520: IICRCStandard = {
  code: 'S520',
  title: 'Standard for Professional Mould Damage Remediation',
  version: '2015',
  description: 'Standard and Reference Guide for Professional Mould Damage Remediation',
  lastUpdated: '2015-04-01',
  sections: [
    {
      number: '5.4',
      title: 'Mould Damage Inspection Conditions',
      content: 'Classification system for mould conditions to guide remediation scope and procedures.',
      keywords: ['mould conditions', 'classification', 'inspection'],
      applicableScenarios: ['mould assessment', 'remediation planning'],
      damageTypes: ['mould'],
      citations: ['Condition 1: Normal fungal ecology', 'Condition 2: Settled spores/growth not from HVAC', 'Condition 3: Actual growth/amplification'],
      subsections: [
        {
          number: '5.4.1',
          title: 'Condition 1',
          content: 'An indoor environment that may have settled spores, fragments, or traces of mould that are not from an ongoing indoor amplification.',
          keywords: ['condition 1', 'normal ecology', 'settled spores'],
          applicableScenarios: ['normal indoor environment', 'routine maintenance'],
          damageTypes: ['mould'],
          citations: ['Represents normal fungal ecology for a given environment']
        },
        {
          number: '5.4.2',
          title: 'Condition 2',
          content: 'An indoor environment that is primarily contaminated with settled spores that were not generated by an ongoing indoor amplification.',
          keywords: ['condition 2', 'settled spores', 'no ongoing amplification'],
          applicableScenarios: ['external spore infiltration', 'HVAC contamination'],
          damageTypes: ['mould'],
          citations: ['May be the result of disturbance of mould growth in a nearby area, failure of HVAC filtration, or other factors']
        },
        {
          number: '5.4.3',
          title: 'Condition 3',
          content: 'An indoor environment contaminated with the presence of actual mould growth and associated spores/fragments.',
          keywords: ['condition 3', 'actual growth', 'amplification', 'spores'],
          applicableScenarios: ['active mould growth', 'water damage', 'humidity problems'],
          damageTypes: ['mould'],
          citations: ['Actual growth and amplification of mould has occurred and should be remediated']
        }
      ]
    },
    {
      number: '6.2',
      title: 'Source Removal',
      content: 'Primary objective of mould remediation is source removal to return conditions to normal fungal ecology.',
      keywords: ['source removal', 'primary objective', 'normal fungal ecology'],
      applicableScenarios: ['mould remediation', 'restoration planning'],
      damageTypes: ['mould'],
      citations: ['Source removal is the primary and most important objective of mould remediation']
    },
    {
      number: '8.1',
      title: 'Containment',
      content: 'Containment is critical to preventing cross-contamination during mould remediation.',
      keywords: ['containment', 'cross-contamination', 'prevention'],
      applicableScenarios: ['mould remediation', 'contamination control'],
      damageTypes: ['mould'],
      citations: ['Containment procedures must be established to prevent cross-contamination'],
      subsections: [
        {
          number: '8.1.1',
          title: 'Containment Barriers',
          content: 'Physical barriers should be constructed to isolate the work area from clean areas.',
          keywords: ['physical barriers', 'isolation', 'work area'],
          applicableScenarios: ['remediation setup', 'work area isolation'],
          damageTypes: ['mould'],
          citations: ['Use plastic sheeting and other materials to create effective barriers']
        },
        {
          number: '8.1.2',
          title: 'Negative Air Pressure',
          content: 'Negative air pressure should be maintained in the work area to prevent migration of airborne contaminants.',
          keywords: ['negative air pressure', 'airborne contaminants', 'migration'],
          applicableScenarios: ['active remediation', 'containment maintenance'],
          damageTypes: ['mould'],
          citations: ['Air filtration devices should create negative pressure differential']
        }
      ]
    },
    {
      number: '9.3',
      title: 'Personal Protective Equipment',
      content: 'Appropriate PPE is essential for worker safety during mould remediation.',
      keywords: ['PPE', 'personal protective equipment', 'worker safety'],
      applicableScenarios: ['mould remediation', 'worker protection'],
      damageTypes: ['mould'],
      citations: ['PPE selection based on hazard assessment and exposure potential']
    },
    {
      number: '12.2',
      title: 'HVAC System Remediation',
      content: 'HVAC systems require special attention during mould remediation due to distribution potential.',
      keywords: ['HVAC remediation', 'distribution potential', 'system cleaning'],
      applicableScenarios: ['HVAC contamination', 'system-wide mould'],
      damageTypes: ['mould'],
      citations: ['HVAC systems can distribute mould spores throughout structure'],
      subsections: [
        {
          number: '12.2.1',
          title: 'HVAC Shutdown',
          content: 'HVAC systems should be shut down during mould remediation to prevent spore distribution.',
          keywords: ['HVAC shutdown', 'spore distribution', 'prevention'],
          applicableScenarios: ['remediation preparation', 'contamination control'],
          damageTypes: ['mould'],
          citations: ['Turn off HVAC systems to prevent distribution of mould spores during remediation']
        },
        {
          number: '12.2.2',
          title: 'Duct System Evaluation',
          content: 'Ductwork should be evaluated for contamination and cleaned if necessary.',
          keywords: ['duct evaluation', 'contamination assessment', 'duct cleaning'],
          applicableScenarios: ['HVAC assessment', 'duct contamination'],
          damageTypes: ['mould'],
          citations: ['Contaminated ductwork requires professional cleaning by qualified technicians']
        }
      ]
    }
  ]
};

// IICRC S700 - Fire and Smoke Damage Restoration Standard
export const IICRC_S700: IICRCStandard = {
  code: 'S700',
  title: 'Standard for Professional Fire Damage Restoration',
  version: '2020',
  description: 'Standard and Reference Guide for Professional Fire Damage Restoration',
  lastUpdated: '2020-01-01',
  sections: [
    {
      number: '4.1',
      title: 'Types of Smoke',
      content: 'Different types of smoke require different cleaning approaches and techniques.',
      keywords: ['smoke types', 'cleaning approaches', 'restoration techniques'],
      applicableScenarios: ['fire damage assessment', 'smoke damage evaluation'],
      damageTypes: ['fire', 'smoke'],
      citations: ['Dry smoke', 'Wet smoke', 'Protein smoke', 'Fuel oil smoke'],
      subsections: [
        {
          number: '4.1.1',
          title: 'Dry Smoke',
          content: 'Results from fast-burning, high-temperature fires. Leaves a powdery residue that is easier to clean.',
          keywords: ['dry smoke', 'fast-burning', 'high-temperature', 'powdery residue'],
          applicableScenarios: ['paper fires', 'wood fires', 'fast-burning materials'],
          damageTypes: ['fire', 'smoke'],
          citations: ['Typically easier to clean than wet smoke residues']
        },
        {
          number: '4.1.2',
          title: 'Wet Smoke',
          content: 'Results from slow-burning, low-temperature fires. Creates sticky, smeary residues that are difficult to clean.',
          keywords: ['wet smoke', 'slow-burning', 'low-temperature', 'sticky residues'],
          applicableScenarios: ['plastic fires', 'synthetic materials', 'smoldering fires'],
          damageTypes: ['fire', 'smoke'],
          citations: ['Creates thick, sticky residues that penetrate porous materials']
        },
        {
          number: '4.1.3',
          title: 'Protein Smoke',
          content: 'Results from evaporated oils from overheated cooking. Nearly invisible but has strong odor.',
          keywords: ['protein smoke', 'cooking fires', 'evaporated oils', 'odor'],
          applicableScenarios: ['kitchen fires', 'cooking incidents', 'food burning'],
          damageTypes: ['fire', 'smoke'],
          citations: ['Requires specialized cleaning techniques due to protein-based residues']
        }
      ]
    },
    {
      number: '6.1',
      title: 'Structural Cleaning',
      content: 'Systematic approach to cleaning fire and smoke damaged structures.',
      keywords: ['structural cleaning', 'systematic approach', 'fire damage'],
      applicableScenarios: ['fire restoration', 'smoke damage cleanup'],
      damageTypes: ['fire', 'smoke'],
      citations: ['Clean from least damaged to most damaged areas', 'Top to bottom cleaning approach']
    },
    {
      number: '7.2',
      title: 'Content Restoration',
      content: 'Procedures for cleaning and restoring fire and smoke damaged contents.',
      keywords: ['content restoration', 'cleaning procedures', 'smoke damage'],
      applicableScenarios: ['content cleaning', 'item restoration'],
      damageTypes: ['fire', 'smoke'],
      citations: ['Evaluate each item for restoration potential', 'Use appropriate cleaning methods for material type']
    },
    {
      number: '8.1',
      title: 'Odor Control',
      content: 'Odor removal is critical component of fire damage restoration.',
      keywords: ['odor control', 'odor removal', 'deodorization'],
      applicableScenarios: ['smoke odor', 'fire damage restoration'],
      damageTypes: ['fire', 'smoke'],
      citations: ['Source removal is primary method of odor control', 'Sealing and deodorization as secondary methods'],
      subsections: [
        {
          number: '8.1.1',
          title: 'Source Removal',
          content: 'Primary method of odor control is removal of the odor source.',
          keywords: ['source removal', 'primary method', 'odor source'],
          applicableScenarios: ['odor elimination', 'contaminated materials'],
          damageTypes: ['fire', 'smoke'],
          citations: ['Remove contaminated materials that cannot be effectively cleaned']
        },
        {
          number: '8.1.2',
          title: 'Deodorization Techniques',
          content: 'Various techniques available for neutralizing or masking remaining odors.',
          keywords: ['deodorization', 'neutralizing', 'odor treatment'],
          applicableScenarios: ['residual odors', 'final odor treatment'],
          damageTypes: ['fire', 'smoke'],
          citations: ['Ozone treatment', 'Thermal fogging', 'Hydroxyl generators', 'Encapsulation']
        }
      ]
    },
    {
      number: '9.1',
      title: 'HVAC System Restoration',
      content: 'HVAC systems can distribute smoke and odors throughout structure and require attention.',
      keywords: ['HVAC restoration', 'smoke distribution', 'system cleaning'],
      applicableScenarios: ['fire damage', 'smoke contamination', 'HVAC cleaning'],
      damageTypes: ['fire', 'smoke'],
      citations: ['HVAC systems can spread smoke contamination throughout entire structure'],
      subsections: [
        {
          number: '9.1.1',
          title: 'System Evaluation',
          content: 'Evaluate HVAC system for smoke and soot contamination before operation.',
          keywords: ['system evaluation', 'contamination assessment'],
          applicableScenarios: ['post-fire assessment', 'HVAC inspection'],
          damageTypes: ['fire', 'smoke'],
          citations: ['Do not operate HVAC system until evaluated and cleaned if necessary']
        },
        {
          number: '9.1.2',
          title: 'Duct Cleaning',
          content: 'Contaminated ductwork requires professional cleaning to prevent recontamination.',
          keywords: ['duct cleaning', 'professional cleaning', 'recontamination'],
          applicableScenarios: ['HVAC contamination', 'post-fire restoration'],
          damageTypes: ['fire', 'smoke'],
          citations: ['Professional duct cleaning required for contaminated systems']
        }
      ]
    }
  ]
};

// Combined standards library
export const IICRC_STANDARDS = {
  S500: IICRC_S500,
  S520: IICRC_S520,
  S700: IICRC_S700
};

// Helper functions for searching standards
export function searchStandardsByKeywords(keywords: string[]): IICRCSection[] {
  const results: IICRCSection[] = [];
  const standards = [IICRC_S500, IICRC_S520, IICRC_S700];
  
  for (const standard of standards) {
    for (const section of standard.sections) {
      const searchSections = (sections: IICRCSection[]) => {
        for (const sect of sections) {
          const matchesKeywords = keywords.some(keyword => 
            sect.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
            sect.content.toLowerCase().includes(keyword.toLowerCase()) ||
            sect.title.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (matchesKeywords) {
            results.push({
              ...sect,
              citations: [`${standard.code} ${sect.number}: ${sect.title}`]
            });
          }
          
          if (sect.subsections) {
            searchSections(sect.subsections);
          }
        }
      };
      
      searchSections([section]);
    }
  }
  
  return results;
}

export function searchStandardsByDamageType(damageType: string): IICRCSection[] {
  const results: IICRCSection[] = [];
  const standards = [IICRC_S500, IICRC_S520, IICRC_S700];
  
  for (const standard of standards) {
    for (const section of standard.sections) {
      const searchSections = (sections: IICRCSection[]) => {
        for (const sect of sections) {
          if (sect.damageTypes.includes(damageType.toLowerCase())) {
            results.push({
              ...sect,
              citations: [`${standard.code} ${sect.number}: ${sect.title}`]
            });
          }
          
          if (sect.subsections) {
            searchSections(sect.subsections);
          }
        }
      };
      
      searchSections([section]);
    }
  }
  
  return results;
}

export function searchStandardsByScenario(scenario: string): IICRCSection[] {
  const results: IICRCSection[] = [];
  const standards = [IICRC_S500, IICRC_S520, IICRC_S700];
  
  for (const standard of standards) {
    for (const section of standard.sections) {
      const searchSections = (sections: IICRCSection[]) => {
        for (const sect of sections) {
          const matchesScenario = sect.applicableScenarios.some(s => 
            s.toLowerCase().includes(scenario.toLowerCase()) ||
            scenario.toLowerCase().includes(s.toLowerCase())
          );
          
          if (matchesScenario) {
            results.push({
              ...sect,
              citations: [`${standard.code} ${sect.number}: ${sect.title}`]
            });
          }
          
          if (sect.subsections) {
            searchSections(sect.subsections);
          }
        }
      };
      
      searchSections([section]);
    }
  }
  
  return results;
}