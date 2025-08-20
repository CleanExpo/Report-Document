// Database schema types for the Remediation Report System
// Comprehensive type definitions for claims, damages, materials, recommendations, evidence, and reports

export interface Claim {
  id: string;
  claimNumber: string;
  claimDate: Date;
  
  // Property Information
  property: {
    address: {
      street: string;
      suburb: string;
      state: string;
      postcode: string;
      country: string;
    };
    propertyType: 'residential' | 'commercial' | 'industrial' | 'strata';
    constructionType: 'brick' | 'timber' | 'steel' | 'concrete' | 'mixed';
    yearBuilt?: number;
    floorArea?: number;
    storeys: number;
    occupancyType: string;
  };
  
  // Insurance Information
  insurance: {
    insurerName: string;
    policyNumber: string;
    excessAmount?: number;
    coverageType: 'comprehensive' | 'basic' | 'third_party';
    policyLimits: {
      building?: number;
      contents?: number;
      additionalExpenses?: number;
    };
    claimHandler?: {
      name: string;
      email: string;
      phone: string;
    };
  };
  
  // Damage Information
  damageType: ('water' | 'fire' | 'mould' | 'smoke' | 'storm' | 'impact')[];
  incidentDate: Date;
  discoveryDate: Date;
  causeOfLoss: string;
  weatherConditions?: {
    temperature: number;
    humidity: number;
    rainfall?: number;
    windSpeed?: number;
  };
  
  // Client Information
  client: {
    primaryContact: ContactInfo;
    secondaryContact?: ContactInfo;
    occupants: number;
    vulnerableOccupants?: VulnerableOccupant[];
    pets?: Pet[];
  };
  
  // Claim Status
  status: 'intake' | 'assessment' | 'investigation' | 'reporting' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  assignedTo?: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  relationship: 'owner' | 'tenant' | 'property_manager' | 'strata_manager' | 'other';
  preferredContact: 'email' | 'phone' | 'mobile';
}

export interface VulnerableOccupant {
  relationship: string;
  ageGroup: 'infant' | 'child' | 'elderly';
  healthConditions?: ('asthma' | 'allergies' | 'respiratory' | 'immune_compromised' | 'other')[];
  notes?: string;
}

export interface Pet {
  type: string;
  name: string;
  healthConditions?: string[];
}

export interface Room {
  id: string;
  claimId: string;
  name: string;
  roomType: 'living' | 'bedroom' | 'bathroom' | 'kitchen' | 'laundry' | 'office' | 'storage' | 'hallway' | 'garage' | 'other';
  level: 'ground' | 'upper' | 'basement' | 'mezzanine';
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  construction: {
    walls: MaterialConstruction;
    floor: MaterialConstruction;
    ceiling: MaterialConstruction;
  };
  ventilation: {
    type: 'natural' | 'mechanical' | 'mixed' | 'none';
    hvacZone?: string;
    ventilation_rate?: number;
  };
  moisture: {
    normalLevel?: number;
    currentLevel?: number;
    temperatureReading?: number;
  };
  damages: Damage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialConstruction {
  primary: string;
  secondary?: string;
  finish?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
}

export interface Damage {
  id: string;
  roomId: string;
  claimId: string;
  
  // Damage Classification
  type: 'water' | 'fire' | 'mould' | 'smoke' | 'structural' | 'content';
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  category?: WaterCategory | FireCategory | MouldCategory;
  
  // Location
  location: {
    element: 'wall' | 'floor' | 'ceiling' | 'fixture' | 'content' | 'structure';
    position: string; // e.g., "north wall", "centre of room"
    affectedArea?: number; // m² or linear metres
    height?: number; // height from floor
  };
  
  // Damage Details
  description: string;
  extent: {
    affected: boolean;
    contaminated: boolean;
    structuralImpact: boolean;
  };
  
  // Assessment
  cause: string;
  secondaryDamage?: string[];
  riskFactors: string[];
  
  // Material Information
  materials: MaterialDamage[];
  
  // Readings and Measurements
  moistureReadings?: MoistureReading[];
  temperatureReadings?: number[];
  airQualityReadings?: AirQualityReading[];
  
  // Evidence
  photos: string[]; // Evidence IDs
  samples?: string[]; // Evidence IDs for lab samples
  
  // Metadata
  assessedBy: string;
  assessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialDamage {
  material: string;
  brand?: string;
  age?: number; // years
  condition: 'salvageable' | 'restorable' | 'replacement_required' | 'hazardous';
  damageType: string[];
  estimatedLoss?: number;
  restorationCost?: number;
  replacementCost?: number;
  sentimentalValue?: 'none' | 'low' | 'medium' | 'high' | 'irreplaceable';
  iicrcClassification?: string;
}

export interface MoistureReading {
  location: string;
  reading: number;
  unit: 'percent' | 'wme' | 'gpp';
  equipment: string;
  depth?: string;
  materialType: string;
  timestamp: Date;
}

export interface AirQualityReading {
  parameter: 'mould_spores' | 'vocs' | 'co2' | 'particles' | 'humidity' | 'temperature';
  value: number;
  unit: string;
  location: string;
  standard?: string; // e.g., "AS/NZS 4849.1"
  acceptableRange?: {
    min?: number;
    max?: number;
  };
  timestamp: Date;
}

// Water damage categories per IICRC S500
export type WaterCategory = '1' | '2' | '3';

// Fire damage categories
export type FireCategory = 'light_smoke' | 'medium_smoke' | 'heavy_smoke' | 'protein_smoke' | 'wet_smoke' | 'dry_smoke';

// Mould categories per IICRC S520
export type MouldCategory = 'condition_1' | 'condition_2' | 'condition_3';

export interface Evidence {
  id: string;
  claimId: string;
  type: 'photo' | 'video' | 'document' | 'lab_report' | 'measurement' | 'sketch';
  
  // File Information
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  
  // Content Information
  title: string;
  description?: string;
  location?: string;
  roomId?: string;
  damageId?: string;
  
  // Technical Metadata
  metadata: {
    camera?: CameraMetadata;
    gps?: GPSCoordinates;
    timestamp: Date;
    equipment?: string;
    settings?: string;
  };
  
  // Annotations
  annotations: Annotation[];
  
  // Laboratory Information (for lab reports)
  labInfo?: {
    labName: string;
    sampleId: string;
    testType: string;
    standard: string;
    results: LabResult[];
  };
  
  // Chain of Custody
  chainOfCustody: ChainOfCustodyEntry[];
  
  // Metadata
  uploadedBy: string;
  uploadedAt: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface CameraMetadata {
  make?: string;
  model?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: number;
  focalLength?: string;
  flash?: boolean;
}

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Annotation {
  id: string;
  type: 'arrow' | 'rectangle' | 'circle' | 'text' | 'measurement';
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  content: string;
  style?: {
    color: string;
    strokeWidth: number;
    fontSize?: number;
  };
  createdBy: string;
  createdAt: Date;
}

export interface LabResult {
  parameter: string;
  value: number | string;
  unit?: string;
  method: string;
  limitOfDetection?: number;
  uncertainty?: number;
  passFlag: boolean;
  standard: string;
}

export interface ChainOfCustodyEntry {
  timestamp: Date;
  action: 'collected' | 'transferred' | 'analyzed' | 'stored' | 'disposed';
  person: string;
  organization: string;
  location: string;
  notes?: string;
}

export interface Recommendation {
  id: string;
  claimId: string;
  
  // Recommendation Details
  category: 'immediate' | 'remediation' | 'restoration' | 'prevention' | 'monitoring' | 'specialist_referral';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  type: 'action' | 'further_investigation' | 'monitoring' | 'specialist_consultation';
  
  title: string;
  description: string;
  rationale: string;
  
  // Technical Backing
  standards: StandardReference[];
  evidence: string[]; // Evidence IDs supporting this recommendation
  
  // Implementation Details
  scope: {
    rooms: string[]; // Room IDs
    materials: string[];
    equipment: string[];
    personnel: PersonnelRequirement[];
  };
  
  // Timeline and Costs
  timeline: {
    estimatedDuration: number; // hours
    urgency: 'immediate' | 'within_24h' | 'within_week' | 'planned';
    dependencies?: string[];
  };
  
  costs: {
    labor?: number;
    materials?: number;
    equipment?: number;
    disposal?: number;
    total?: number;
    confidence: 'estimate' | 'firm_quote' | 'preliminary';
  };
  
  // Risk Assessment
  risks: {
    healthRisk: 'none' | 'low' | 'medium' | 'high' | 'severe';
    structuralRisk: 'none' | 'low' | 'medium' | 'high' | 'severe';
    furtherDamageRisk: 'none' | 'low' | 'medium' | 'high' | 'severe';
    delayRisk: string;
  };
  
  // Alternative Options
  alternatives?: Alternative[];
  
  // Outcome Tracking
  status: 'recommended' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  outcome?: {
    completedAt?: Date;
    actualCost?: number;
    effectiveness: 'poor' | 'fair' | 'good' | 'excellent';
    notes?: string;
  };
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface StandardReference {
  standard: string; // e.g., "IICRC S500"
  section: string; // e.g., "12.2.2"
  title: string;
  url?: string;
  quotation: string;
  relevance: string;
}

export interface PersonnelRequirement {
  certification: string; // e.g., "IICRC WRT", "Hygienist"
  quantity: number;
  role: string;
  experience: 'entry' | 'intermediate' | 'senior' | 'specialist';
}

export interface Alternative {
  title: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  cost: number;
  timeline: number;
  riskLevel: 'lower' | 'same' | 'higher';
}

export interface Report {
  id: string;
  claimId: string;
  
  // Report Information
  reportNumber: string;
  reportType: 'preliminary' | 'detailed' | 'final' | 'supplementary';
  title: string;
  purpose: string;
  
  // Sections Configuration
  sections: ReportSection[];
  
  // Technical Details
  investigation: {
    scope: string;
    limitations: string[];
    methodology: string[];
    standards: string[];
    personnel: InvestigationPersonnel[];
  };
  
  // Executive Summary
  executiveSummary: {
    overview: string;
    keyFindings: string[];
    majorRecommendations: string[];
    urgentActions: string[];
    estimatedCosts: {
      immediate: number;
      total: number;
      restoration: number;
      replacement: number;
    };
  };
  
  // Findings and Analysis
  findings: {
    observations: string[];
    causationAnalysis: string;
    riskAssessment: RiskAssessment;
    secondaryDamage: string[];
    hvacAssessment?: HVACAssessment;
  };
  
  // Professional Opinion
  professionalOpinion: {
    conclusion: string;
    restorationViability: string;
    timeline: string;
    costBenefit: string;
    alternativeOptions: string[];
  };
  
  // Appendices
  appendices: {
    photos: string[]; // Evidence IDs
    labReports: string[]; // Evidence IDs
    sketches: string[]; // Evidence IDs
    calculations: string[];
    references: StandardReference[];
  };
  
  // Generation Details
  generatedBy: string;
  generatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Version Control
  version: string;
  status: 'draft' | 'review' | 'approved' | 'final' | 'superseded';
  previousVersions?: string[];
  
  // Delivery Information
  deliveredTo?: {
    insurer: boolean;
    client: boolean;
    other: string[];
  };
  deliveredAt?: Date;
}

export interface ReportSection {
  id: string;
  type: 'executive_summary' | 'scope' | 'observations' | 'causation' | 'risk_assessment' | 'recommendations' | 'appendices' | 'custom';
  title: string;
  content: string;
  order: number;
  required: boolean;
  pageBreak?: boolean;
}

export interface RiskAssessment {
  healthRisks: HealthRisk[];
  structuralRisks: StructuralRisk[];
  environmentalRisks: EnvironmentalRisk[];
  furtherDamageRisks: FurtherDamageRisk[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'severe';
  mitigationRequired: boolean;
}

export interface HealthRisk {
  type: 'mould' | 'asbestos' | 'chemical' | 'biological' | 'particulate';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'severe';
  affectedPopulation: string[];
  mitigationMeasures: string[];
  standard: string;
}

export interface StructuralRisk {
  element: string;
  type: 'stability' | 'integrity' | 'deterioration' | 'failure';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  mitigationMeasures: string[];
}

export interface EnvironmentalRisk {
  type: 'contamination' | 'disposal' | 'runoff' | 'air_quality';
  description: string;
  impact: 'local' | 'property' | 'community' | 'environmental';
  regulations: string[];
  mitigationMeasures: string[];
}

export interface FurtherDamageRisk {
  type: 'spread' | 'deterioration' | 'secondary' | 'consequential';
  description: string;
  likelihood: 'low' | 'medium' | 'high' | 'certain';
  impact: 'minor' | 'moderate' | 'major' | 'catastrophic';
  timeframe: string;
  preventionMeasures: string[];
}

export interface HVACAssessment {
  systemType: 'ducted' | 'split' | 'evaporative' | 'central' | 'other';
  contamination: {
    detected: boolean;
    type: string[];
    extent: 'localized' | 'zone' | 'system_wide';
    affectedZones: string[];
  };
  airflow: {
    direction: string;
    velocity: number;
    pressure: number;
  };
  recommendations: {
    shutdown: boolean;
    cleaning: boolean;
    replacement: boolean;
    testing: boolean;
  };
  standards: string[];
}

export interface InvestigationPersonnel {
  name: string;
  role: string;
  certifications: string[];
  license?: string;
  company: string;
}

// User and System Types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'technician' | 'assessor' | 'reviewer' | 'manager' | 'admin';
  certifications: string[];
  licenseNumber?: string;
  company: string;
  permissions: Permission[];
  createdAt: Date;
  lastLogin?: Date;
  active: boolean;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve')[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchFilters {
  claimNumber?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  damageType?: string[];
  status?: string[];
  assignedTo?: string;
  priority?: string[];
  postcode?: string;
  suburb?: string;
}

// Form Types
export interface ClaimFormData extends Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> {}

export interface RoomFormData extends Omit<Room, 'id' | 'claimId' | 'damages' | 'createdAt' | 'updatedAt'> {}

export interface DamageFormData extends Omit<Damage, 'id' | 'roomId' | 'claimId' | 'photos' | 'samples' | 'assessedAt' | 'createdAt' | 'updatedAt'> {}