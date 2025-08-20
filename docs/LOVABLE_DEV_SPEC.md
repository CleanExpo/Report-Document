# Lovable.dev Project Specification - Remediation Report System

## 📋 Project Overview

**Project Name**: Remediation Report System  
**Business**: Water, Fire, and Mould Remediation Services  
**Location**: Brisbane, Queensland, Australia  
**Purpose**: AI-powered report generation system with IICRC standards integration

## 1️⃣ Repository Content Details

### File Types in Repository
- **TypeScript/JavaScript**: Report templates, data models, API routes
- **Markdown**: Documentation, standards references, report templates
- **JSON**: Configuration files, standards library, validation rules
- **Component Files**: React/Next.js components for report building

### Main Functionality
The system provides:
1. **Intelligent Report Generation**: Creates comprehensive remediation reports
2. **Standards Compliance**: Auto-cites IICRC and Australian standards
3. **Damage Assessment**: Multi-hazard evaluation (water, fire, mould)
4. **Evidence Management**: Photo/document integration
5. **Restoration Optimization**: Cost-benefit analysis for restoration vs replacement

## 2️⃣ Integration Requirements

### GitHub to Lovable.dev Integration

#### Document Structure Mapping
```
GitHub Repository → Lovable.dev Folders
├── /templates → Report Templates folder
├── /standards → Standards Library folder
├── /claims → Active Claims folder
├── /reports → Generated Reports folder
└── /evidence → Evidence Files folder
```

### Required Integrations
1. **Import Standards Library**: IICRC standards as searchable documents
2. **Template Sync**: Report templates as reusable documents
3. **API Endpoints**: Custom functions for report generation
4. **File Processing**: Handle photos, lab results, PDFs

## 3️⃣ Key Files to Import

### A. Data Models Schema
```typescript
// File: src/models/claim.schema.ts
export interface Claim {
  id: string
  claimNumber: string
  insurer?: string
  insuredName: string
  propertyAddress: {
    street: string
    suburb: string
    state: string
    postcode: string
  }
  dateOfLoss: Date
  dateOfInspection: Date
  claimType: 'water' | 'fire' | 'mould' | 'combined'
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'submitted'
  assignedTo: string
  damages: Damage[]
  recommendations: Recommendation[]
  evidence: Evidence[]
  reportId?: string
}

export interface Damage {
  id: string
  location: string
  roomType: string
  damageType: 'water' | 'fire' | 'mould' | 'smoke' | 'structural'
  category?: 1 | 2 | 3  // Water categories per IICRC S500
  class?: 1 | 2 | 3 | 4  // Water damage classes
  condition?: 1 | 2 | 3  // Mould conditions per IICRC S520
  affectedMaterials: Material[]
  measurements: {
    area?: number  // m²
    moistureReadings?: MoistureReading[]
    relativeHumidity?: number
    temperature?: number
    atmosphericMoisture?: number
  }
  hvacInvolved: boolean
  hiddenDamageRisk: 'low' | 'medium' | 'high'
  photos: string[]  // URLs to photos
}

export interface Material {
  id: string
  type: string  // e.g., 'Gyprock', 'Carpet', 'Timber Framing'
  location: string
  porosity: 'non-porous' | 'semi-porous' | 'porous'
  affectedArea: number  // m²
  restorable: boolean
  restorationMethod?: string
  replacementCost?: number
  restorationCost?: number
  sentimentalValue?: 'none' | 'low' | 'medium' | 'high'
}

export interface Recommendation {
  id: string
  priority: 'immediate' | 'urgent' | 'standard' | 'preventive'
  category: 'safety' | 'mitigation' | 'restoration' | 'prevention'
  action: string
  rationale: string
  standardReference: StandardReference[]
  estimatedTimeframe: string
  estimatedCost?: number
  preventedDamageValue?: number
  requiresSpecialist: boolean
  specialistType?: string
}

export interface StandardReference {
  standard: string  // e.g., 'IICRC S500'
  section: string   // e.g., '12.2.1'
  title: string
  requirement: string
}

export interface Evidence {
  id: string
  type: 'photo' | 'document' | 'lab_result' | 'moisture_map' | 'thermal_image'
  filename: string
  url: string
  uploadedAt: Date
  description: string
  location?: string
  tags: string[]
}

export interface MoistureReading {
  location: string
  material: string
  reading: number
  unit: '%MC' | '%WME' | 'REL'
  timestamp: Date
  equipment: string
}
```

### B. Report Template Structure
```typescript
// File: src/templates/report.template.ts
export const reportSections = {
  executiveSummary: {
    title: 'Executive Summary',
    required: true,
    fields: [
      'incidentOverview',
      'primaryCausation',
      'keyFindings',
      'urgentRecommendations'
    ]
  },
  
  scopeOfInvestigation: {
    title: 'Scope of Investigation',
    required: true,
    subsections: [
      'inspectionDetails',
      'limitationsAndExclusions',
      'investigationMethodology'
    ]
  },
  
  observationsAndFindings: {
    title: 'Observations and Findings',
    required: true,
    dynamicSections: true,  // Creates section per affected area
    template: 'damageAssessment'
  },
  
  causationAnalysis: {
    title: 'Causation Analysis',
    required: true,
    citations: true,
    fields: [
      'primaryCause',
      'contributingFactors',
      'failureAnalysis'
    ]
  },
  
  hvacAssessment: {
    title: 'HVAC System Assessment',
    conditional: 'hasHVAC',
    citations: ['IICRC S520 12.2.2', 'AS/NZS 3666'],
    fields: [
      'systemImpact',
      'contaminationSpread',
      'recommendedActions'
    ]
  },
  
  contentsAssessment: {
    title: 'Contents Assessment',
    required: false,
    template: 'contentsInventory',
    includeRestorationAnalysis: true
  },
  
  recommendations: {
    title: 'Recommendations',
    required: true,
    prioritized: true,
    categories: [
      'immediateSafety',
      'secondaryPrevention',
      'restorationPlan',
      'futurePreventive'
    ]
  },
  
  standardsAndReferences: {
    title: 'Standards and References',
    required: true,
    autoGenerated: true,
    sources: 'citationsUsed'
  }
}
```

### C. Standards Library
```typescript
// File: src/lib/standards.library.ts
export const standardsLibrary = {
  IICRC: {
    S500: {
      title: 'Standard for Professional Water Damage Restoration',
      version: '2021',
      sections: {
        '10.5.3': {
          title: 'Water Categories',
          categories: {
            1: 'Clean water from a sanitary source',
            2: 'Water with significant contamination',
            3: 'Grossly contaminated water'
          }
        },
        '10.5.4': {
          title: 'Classes of Water Damage',
          classes: {
            1: 'Slow evaporation rate',
            2: 'Fast evaporation rate',
            3: 'Fastest evaporation rate',
            4: 'Specialty drying situations'
          }
        },
        '12.2': {
          title: 'Structural Drying',
          requirements: [
            'Remove excess water',
            'Establish drying goals',
            'Monitor and document progress',
            'Achieve drying standard'
          ]
        }
      }
    },
    S520: {
      title: 'Standard for Professional Mold Remediation',
      version: '2015',
      sections: {
        '12.1': {
          title: 'Condition Classification',
          conditions: {
            1: 'Normal fungal ecology',
            2: 'Settled spores elevated',
            3: 'Actual mold growth'
          }
        },
        '12.2.2': {
          title: 'HVAC Remediation',
          requirements: [
            'Shut down HVAC immediately',
            'Seal supply and return vents',
            'Professional cleaning required',
            'Post-remediation verification'
          ]
        }
      }
    }
  },
  ASNZS: {
    '4849.1': {
      title: 'Indoor air quality',
      requirements: ['Sampling methods', 'Analysis procedures']
    },
    '3666': {
      title: 'Air-handling and water systems',
      requirements: ['Microbial control', 'Maintenance requirements']
    }
  },
  Queensland: {
    BuildingCode: {
      relevantSections: ['Waterproofing', 'Ventilation', 'Structural']
    },
    WHS: {
      title: 'Work Health and Safety Act 2011',
      requirements: ['Safe work methods', 'PPE requirements']
    }
  }
}
```

### D. API Endpoints Required
```typescript
// File: src/api/endpoints.ts
export const apiEndpoints = {
  // Report Generation
  '/api/reports/generate': {
    method: 'POST',
    description: 'Generate complete report from claim data',
    payload: 'Claim',
    response: 'Report'
  },
  
  // Standards Citation
  '/api/standards/search': {
    method: 'GET',
    description: 'Search standards library',
    params: ['query', 'standard'],
    response: 'StandardReference[]'
  },
  
  // Damage Analysis
  '/api/analysis/hvac-spread': {
    method: 'POST',
    description: 'Calculate HVAC contamination spread',
    payload: 'HVACSystem',
    response: 'ContaminationMap'
  },
  
  // Restoration Calculator
  '/api/restoration/viability': {
    method: 'POST',
    description: 'Calculate restoration vs replacement',
    payload: 'Material[]',
    response: 'RestorationAnalysis'
  },
  
  // Evidence Management
  '/api/evidence/upload': {
    method: 'POST',
    description: 'Upload and process evidence files',
    payload: 'File',
    response: 'Evidence'
  },
  
  // Lab Results Integration
  '/api/lab/import': {
    method: 'POST',
    description: 'Import laboratory test results',
    payload: 'LabReport',
    response: 'ProcessedResults'
  }
}
```

## 4️⃣ Backend Functions Needed

### Core Functions

#### 1. Report Generation Engine
```typescript
async function generateReport(claim: Claim): Promise<Report> {
  // 1. Validate claim data
  // 2. Apply report template
  // 3. Inject citations
  // 4. Generate recommendations
  // 5. Calculate risk matrices
  // 6. Compile evidence
  // 7. Return formatted report
}
```

#### 2. Standards Citation System
```typescript
async function citationEngine(text: string): Promise<string> {
  // 1. Identify technical claims
  // 2. Match to standards library
  // 3. Insert inline citations
  // 4. Generate references section
}
```

#### 3. HVAC Contamination Analyzer
```typescript
async function analyzeHVACSpread(
  system: HVACSystem, 
  contamination: Contamination
): Promise<SpreadAnalysis> {
  // 1. Map ductwork layout
  // 2. Calculate airflow patterns
  // 3. Identify affected zones
  // 4. Generate containment recommendations
}
```

#### 4. Restoration Optimizer
```typescript
async function optimizeRestoration(
  materials: Material[]
): Promise<RestorationPlan> {
  // 1. Assess each material
  // 2. Calculate restoration costs
  // 3. Compare to replacement
  // 4. Factor sentimental value
  // 5. Generate optimal plan
}
```

#### 5. Evidence Processor
```typescript
async function processEvidence(
  file: File,
  metadata: EvidenceMetadata
): Promise<Evidence> {
  // 1. Validate file type
  // 2. Extract EXIF data
  // 3. Generate thumbnails
  // 4. Tag locations
  // 5. Store in database
}
```

## 5️⃣ Database Schema for Supabase

```sql
-- Claims table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT UNIQUE NOT NULL,
  insurer TEXT,
  insured_name TEXT NOT NULL,
  property_address JSONB NOT NULL,
  date_of_loss TIMESTAMP NOT NULL,
  date_of_inspection TIMESTAMP,
  claim_type TEXT CHECK (claim_type IN ('water', 'fire', 'mould', 'combined')),
  status TEXT DEFAULT 'draft',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Damages table
CREATE TABLE damages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  room_type TEXT,
  damage_type TEXT NOT NULL,
  category INTEGER CHECK (category IN (1, 2, 3)),
  class INTEGER CHECK (class IN (1, 2, 3, 4)),
  condition INTEGER CHECK (condition IN (1, 2, 3)),
  measurements JSONB,
  hvac_involved BOOLEAN DEFAULT FALSE,
  hidden_damage_risk TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  damage_id UUID REFERENCES damages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  location TEXT,
  porosity TEXT,
  affected_area DECIMAL,
  restorable BOOLEAN,
  restoration_method TEXT,
  replacement_cost DECIMAL,
  restoration_cost DECIMAL,
  sentimental_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  priority TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  rationale TEXT,
  standard_references JSONB,
  estimated_timeframe TEXT,
  estimated_cost DECIMAL,
  requires_specialist BOOLEAN DEFAULT FALSE,
  specialist_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Evidence table
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  location TEXT,
  tags TEXT[],
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id),
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  content JSONB NOT NULL,
  citations_used JSONB,
  generated_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP
);

-- Standards library table
CREATE TABLE standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_code TEXT NOT NULL,
  version TEXT,
  title TEXT NOT NULL,
  sections JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(standard_code, version)
);

-- Enable Row Level Security
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE damages ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

## 6️⃣ UI Components Needed

### Essential Components
1. **ClaimIntakeWizard**: Multi-step form for new claims
2. **DamageAssessmentGrid**: Visual damage mapping tool
3. **PhotoEvidenceUploader**: Drag-drop with annotation
4. **StandardsCitationTool**: Search and insert citations
5. **RestorationCalculator**: Cost-benefit analysis UI
6. **HVACContaminationMapper**: Visual ductwork analyzer
7. **ReportBuilder**: Dynamic section management
8. **ReportPreview**: PDF-ready preview
9. **QualityCheckPanel**: Validation checklist
10. **MoistureReadingChart**: Visual moisture data

## 7️⃣ Integration Workflow

### Step 1: Initial Setup
```javascript
// 1. Import standards library
await importStandardsLibrary()

// 2. Create folder structure
await createFolderStructure()

// 3. Set up report templates
await setupTemplates()
```

### Step 2: Claim Processing
```javascript
// 1. Create new claim
const claim = await createClaim(intakeData)

// 2. Document damages
await documentDamages(claim.id, damageData)

// 3. Upload evidence
await uploadEvidence(claim.id, files)

// 4. Generate report
const report = await generateReport(claim)
```

### Step 3: Report Generation
```javascript
// 1. Apply template
const draft = await applyTemplate(claim, template)

// 2. Inject citations
const cited = await addCitations(draft)

// 3. Add recommendations
const complete = await generateRecommendations(cited)

// 4. Export as PDF
const pdf = await exportPDF(complete)
```

## 8️⃣ Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# AI Services
OPENAI_API_KEY=your_openai_key
AI_MODEL=gpt-4-turbo-preview

# Storage
STORAGE_BUCKET=remediation-evidence
MAX_FILE_SIZE=10485760

# Report Generation
PDF_SERVICE_URL=your_pdf_service
REPORT_TEMPLATE_VERSION=1.0

# External APIs
LAB_API_KEY=your_lab_key
WEATHER_API_KEY=your_weather_key
```

## 9️⃣ Key Features Priority

### Phase 1 - Core (Week 1)
✅ Claim intake form
✅ Basic damage documentation
✅ Simple report generation
✅ Evidence upload

### Phase 2 - Enhanced (Week 2)
✅ Standards citation system
✅ HVAC analysis tool
✅ Restoration calculator
✅ Advanced templates

### Phase 3 - Advanced (Week 3)
✅ AI recommendations
✅ Risk matrices
✅ Lab integration
✅ Quality assurance

### Phase 4 - Polish (Week 4)
✅ PDF export
✅ Email delivery
✅ Client portal
✅ Analytics dashboard

## 10️⃣ Success Metrics

- **Report Accuracy**: 100% factual with citations
- **Generation Time**: <2 minutes per report
- **Citation Coverage**: >95% of technical claims
- **User Satisfaction**: >4.5/5 rating
- **Insurance Acceptance**: >95% first submission

This specification provides everything needed to build the remediation report system in Lovable.dev with your existing folder/document infrastructure!