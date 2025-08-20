// API types and validation schemas for the Remediation Report System
import { z } from 'zod';
import type { 
  Claim, 
  Room, 
  Damage, 
  Evidence, 
  Recommendation, 
  Report,
  SearchFilters,
  ApiResponse
} from './database';

// ====== API Request/Response Types ======

export interface ClaimCreateRequest {
  claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
}

export interface ClaimUpdateRequest {
  claim: Partial<Claim>;
}

export interface ClaimSearchRequest {
  filters: SearchFilters;
  pagination: {
    page: number;
    limit: number;
  };
  sort?: {
    field: keyof Claim;
    direction: 'asc' | 'desc';
  };
}

export interface RoomCreateRequest {
  room: Omit<Room, 'id' | 'claimId' | 'damages' | 'createdAt' | 'updatedAt'>;
  claimId: string;
}

export interface DamageCreateRequest {
  damage: Omit<Damage, 'id' | 'roomId' | 'claimId' | 'photos' | 'samples' | 'assessedAt' | 'createdAt' | 'updatedAt'>;
  roomId: string;
  claimId: string;
}

export interface EvidenceUploadRequest {
  claimId: string;
  roomId?: string;
  damageId?: string;
  type: Evidence['type'];
  title: string;
  description?: string;
  location?: string;
}

export interface RecommendationCreateRequest {
  recommendation: Omit<Recommendation, 'id' | 'claimId' | 'createdBy' | 'createdAt' | 'reviewedBy' | 'reviewedAt'>;
  claimId: string;
}

export interface ReportGenerateRequest {
  claimId: string;
  reportType: Report['reportType'];
  sections: string[]; // Section IDs to include
  customSections?: {
    title: string;
    content: string;
  }[];
}

// ====== Validation Schemas ======

// Address schema
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
  country: z.string().default('Australia')
});

// Contact Info schema
export const ContactInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  mobile: z.string().optional(),
  relationship: z.enum(['owner', 'tenant', 'property_manager', 'strata_manager', 'other']),
  preferredContact: z.enum(['email', 'phone', 'mobile'])
});

// Property schema
export const PropertySchema = z.object({
  address: AddressSchema,
  propertyType: z.enum(['residential', 'commercial', 'industrial', 'strata']),
  constructionType: z.enum(['brick', 'timber', 'steel', 'concrete', 'mixed']),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  floorArea: z.number().positive().optional(),
  storeys: z.number().int().min(1).max(50),
  occupancyType: z.string().min(1, 'Occupancy type is required')
});

// Insurance schema
export const InsuranceSchema = z.object({
  insurerName: z.string().min(1, 'Insurer name is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  excessAmount: z.number().nonnegative().optional(),
  coverageType: z.enum(['comprehensive', 'basic', 'third_party']),
  policyLimits: z.object({
    building: z.number().positive().optional(),
    contents: z.number().positive().optional(),
    additionalExpenses: z.number().positive().optional()
  }),
  claimHandler: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string()
  }).optional()
});

// Vulnerable Occupant schema
export const VulnerableOccupantSchema = z.object({
  relationship: z.string().min(1),
  ageGroup: z.enum(['infant', 'child', 'elderly']),
  healthConditions: z.array(z.enum(['asthma', 'allergies', 'respiratory', 'immune_compromised', 'other'])).optional(),
  notes: z.string().optional()
});

// Pet schema
export const PetSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
  healthConditions: z.array(z.string()).optional()
});

// Client schema
export const ClientSchema = z.object({
  primaryContact: ContactInfoSchema,
  secondaryContact: ContactInfoSchema.optional(),
  occupants: z.number().int().nonnegative(),
  vulnerableOccupants: z.array(VulnerableOccupantSchema).optional(),
  pets: z.array(PetSchema).optional()
});

// Weather Conditions schema
export const WeatherConditionsSchema = z.object({
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  rainfall: z.number().nonnegative().optional(),
  windSpeed: z.number().nonnegative().optional()
});

// Main Claim schema
export const ClaimSchema = z.object({
  claimNumber: z.string().min(1, 'Claim number is required'),
  claimDate: z.date(),
  property: PropertySchema,
  insurance: InsuranceSchema,
  damageType: z.array(z.enum(['water', 'fire', 'mould', 'smoke', 'storm', 'impact'])).min(1, 'At least one damage type required'),
  incidentDate: z.date(),
  discoveryDate: z.date(),
  causeOfLoss: z.string().min(1, 'Cause of loss is required'),
  weatherConditions: WeatherConditionsSchema.optional(),
  client: ClientSchema,
  status: z.enum(['intake', 'assessment', 'investigation', 'reporting', 'completed', 'closed']).default('intake'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

// Material Construction schema
export const MaterialConstructionSchema = z.object({
  primary: z.string().min(1),
  secondary: z.string().optional(),
  finish: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'damaged'])
});

// Room schema
export const RoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  roomType: z.enum(['living', 'bedroom', 'bathroom', 'kitchen', 'laundry', 'office', 'storage', 'hallway', 'garage', 'other']),
  level: z.enum(['ground', 'upper', 'basement', 'mezzanine']),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }).optional(),
  construction: z.object({
    walls: MaterialConstructionSchema,
    floor: MaterialConstructionSchema,
    ceiling: MaterialConstructionSchema
  }),
  ventilation: z.object({
    type: z.enum(['natural', 'mechanical', 'mixed', 'none']),
    hvacZone: z.string().optional(),
    ventilation_rate: z.number().positive().optional()
  }),
  moisture: z.object({
    normalLevel: z.number().min(0).max(100).optional(),
    currentLevel: z.number().min(0).max(100).optional(),
    temperatureReading: z.number().optional()
  })
});

// Material Damage schema
export const MaterialDamageSchema = z.object({
  material: z.string().min(1),
  brand: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  condition: z.enum(['salvageable', 'restorable', 'replacement_required', 'hazardous']),
  damageType: z.array(z.string()).min(1),
  estimatedLoss: z.number().nonnegative().optional(),
  restorationCost: z.number().nonnegative().optional(),
  replacementCost: z.number().nonnegative().optional(),
  sentimentalValue: z.enum(['none', 'low', 'medium', 'high', 'irreplaceable']).optional(),
  iicrcClassification: z.string().optional()
});

// Moisture Reading schema
export const MoistureReadingSchema = z.object({
  location: z.string().min(1),
  reading: z.number().nonnegative(),
  unit: z.enum(['percent', 'wme', 'gpp']),
  equipment: z.string().min(1),
  depth: z.string().optional(),
  materialType: z.string().min(1),
  timestamp: z.date()
});

// Air Quality Reading schema
export const AirQualityReadingSchema = z.object({
  parameter: z.enum(['mould_spores', 'vocs', 'co2', 'particles', 'humidity', 'temperature']),
  value: z.number(),
  unit: z.string().min(1),
  location: z.string().min(1),
  standard: z.string().optional(),
  acceptableRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  timestamp: z.date()
});

// Damage schema
export const DamageSchema = z.object({
  type: z.enum(['water', 'fire', 'mould', 'smoke', 'structural', 'content']),
  severity: z.enum(['minor', 'moderate', 'severe', 'catastrophic']),
  category: z.string().optional(),
  location: z.object({
    element: z.enum(['wall', 'floor', 'ceiling', 'fixture', 'content', 'structure']),
    position: z.string().min(1),
    affectedArea: z.number().positive().optional(),
    height: z.number().nonnegative().optional()
  }),
  description: z.string().min(1, 'Damage description is required'),
  extent: z.object({
    affected: z.boolean(),
    contaminated: z.boolean(),
    structuralImpact: z.boolean()
  }),
  cause: z.string().min(1, 'Cause is required'),
  secondaryDamage: z.array(z.string()).optional(),
  riskFactors: z.array(z.string()),
  materials: z.array(MaterialDamageSchema),
  moistureReadings: z.array(MoistureReadingSchema).optional(),
  temperatureReadings: z.array(z.number()).optional(),
  airQualityReadings: z.array(AirQualityReadingSchema).optional(),
  assessedBy: z.string().min(1)
});

// Standard Reference schema
export const StandardReferenceSchema = z.object({
  standard: z.string().min(1),
  section: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().optional(),
  quotation: z.string().min(1),
  relevance: z.string().min(1)
});

// Personnel Requirement schema
export const PersonnelRequirementSchema = z.object({
  certification: z.string().min(1),
  quantity: z.number().int().positive(),
  role: z.string().min(1),
  experience: z.enum(['entry', 'intermediate', 'senior', 'specialist'])
});

// Alternative schema
export const AlternativeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  advantages: z.array(z.string()).min(1),
  disadvantages: z.array(z.string()),
  cost: z.number().nonnegative(),
  timeline: z.number().positive(),
  riskLevel: z.enum(['lower', 'same', 'higher'])
});

// Recommendation schema
export const RecommendationSchema = z.object({
  category: z.enum(['immediate', 'remediation', 'restoration', 'prevention', 'monitoring', 'specialist_referral']),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  type: z.enum(['action', 'further_investigation', 'monitoring', 'specialist_consultation']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  rationale: z.string().min(1, 'Rationale is required'),
  standards: z.array(StandardReferenceSchema),
  evidence: z.array(z.string()), // Evidence IDs
  scope: z.object({
    rooms: z.array(z.string()),
    materials: z.array(z.string()),
    equipment: z.array(z.string()),
    personnel: z.array(PersonnelRequirementSchema)
  }),
  timeline: z.object({
    estimatedDuration: z.number().positive(),
    urgency: z.enum(['immediate', 'within_24h', 'within_week', 'planned']),
    dependencies: z.array(z.string()).optional()
  }),
  costs: z.object({
    labor: z.number().nonnegative().optional(),
    materials: z.number().nonnegative().optional(),
    equipment: z.number().nonnegative().optional(),
    disposal: z.number().nonnegative().optional(),
    total: z.number().nonnegative().optional(),
    confidence: z.enum(['estimate', 'firm_quote', 'preliminary'])
  }),
  risks: z.object({
    healthRisk: z.enum(['none', 'low', 'medium', 'high', 'severe']),
    structuralRisk: z.enum(['none', 'low', 'medium', 'high', 'severe']),
    furtherDamageRisk: z.enum(['none', 'low', 'medium', 'high', 'severe']),
    delayRisk: z.string().min(1)
  }),
  alternatives: z.array(AlternativeSchema).optional(),
  status: z.enum(['recommended', 'approved', 'in_progress', 'completed', 'rejected']).default('recommended')
});

// Evidence metadata schemas
export const CameraMetadataSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  exposureTime: z.string().optional(),
  fNumber: z.string().optional(),
  iso: z.number().optional(),
  focalLength: z.string().optional(),
  flash: z.boolean().optional()
});

export const GPSCoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional()
});

export const AnnotationSchema = z.object({
  type: z.enum(['arrow', 'rectangle', 'circle', 'text', 'measurement']),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional()
  }),
  content: z.string().min(1),
  style: z.object({
    color: z.string(),
    strokeWidth: z.number().positive(),
    fontSize: z.number().positive().optional()
  }).optional(),
  createdBy: z.string().min(1)
});

export const LabResultSchema = z.object({
  parameter: z.string().min(1),
  value: z.union([z.number(), z.string()]),
  unit: z.string().optional(),
  method: z.string().min(1),
  limitOfDetection: z.number().optional(),
  uncertainty: z.number().optional(),
  passFlag: z.boolean(),
  standard: z.string().min(1)
});

export const ChainOfCustodyEntrySchema = z.object({
  timestamp: z.date(),
  action: z.enum(['collected', 'transferred', 'analyzed', 'stored', 'disposed']),
  person: z.string().min(1),
  organization: z.string().min(1),
  location: z.string().min(1),
  notes: z.string().optional()
});

// Evidence schema
export const EvidenceSchema = z.object({
  type: z.enum(['photo', 'video', 'document', 'lab_report', 'measurement', 'sketch']),
  filename: z.string().min(1),
  originalFilename: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  metadata: z.object({
    camera: CameraMetadataSchema.optional(),
    gps: GPSCoordinatesSchema.optional(),
    timestamp: z.date(),
    equipment: z.string().optional(),
    settings: z.string().optional()
  }),
  annotations: z.array(AnnotationSchema),
  labInfo: z.object({
    labName: z.string().min(1),
    sampleId: z.string().min(1),
    testType: z.string().min(1),
    standard: z.string().min(1),
    results: z.array(LabResultSchema)
  }).optional(),
  chainOfCustody: z.array(ChainOfCustodyEntrySchema),
  uploadedBy: z.string().min(1),
  verifiedBy: z.string().optional()
});

// Search filters schema
export const SearchFiltersSchema = z.object({
  claimNumber: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date()
  }).optional(),
  damageType: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
  priority: z.array(z.string()).optional(),
  postcode: z.string().optional(),
  suburb: z.string().optional()
});

// ====== Type Helpers ======

// Extract types from schemas
export type ClaimFormData = z.infer<typeof ClaimSchema>;
export type RoomFormData = z.infer<typeof RoomSchema>;
export type DamageFormData = z.infer<typeof DamageSchema>;
export type RecommendationFormData = z.infer<typeof RecommendationSchema>;
export type EvidenceFormData = z.infer<typeof EvidenceSchema>;

// API Response wrapper
export type ClaimResponse = ApiResponse<Claim>;
export type ClaimsResponse = ApiResponse<Claim[]>;
export type RoomResponse = ApiResponse<Room>;
export type RoomsResponse = ApiResponse<Room[]>;
export type DamageResponse = ApiResponse<Damage>;
export type DamagesResponse = ApiResponse<Damage[]>;
export type EvidenceResponse = ApiResponse<Evidence>;
export type EvidencesResponse = ApiResponse<Evidence[]>;
export type RecommendationResponse = ApiResponse<Recommendation>;
export type RecommendationsResponse = ApiResponse<Recommendation[]>;
export type ReportResponse = ApiResponse<Report>;
export type ReportsResponse = ApiResponse<Report[]>;

// Form validation helpers
export const validateClaim = (data: unknown) => ClaimSchema.safeParse(data);
export const validateRoom = (data: unknown) => RoomSchema.safeParse(data);
export const validateDamage = (data: unknown) => DamageSchema.safeParse(data);
export const validateRecommendation = (data: unknown) => RecommendationSchema.safeParse(data);
export const validateEvidence = (data: unknown) => EvidenceSchema.safeParse(data);
export const validateSearchFilters = (data: unknown) => SearchFiltersSchema.safeParse(data);

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormErrors {
  [key: string]: ValidationError[];
}

// Utility types for forms
export type FormStep = 'property' | 'insurance' | 'client' | 'damage' | 'summary';

export interface FormState<T> {
  data: Partial<T>;
  errors: FormErrors;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  currentStep?: FormStep;
  completedSteps?: FormStep[];
}

export interface MultiStepFormProps<T> {
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onStepChange?: (step: FormStep) => void;
  validationSchema: z.ZodSchema<T>;
}

// File upload types
export interface FileUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  evidenceId?: string;
}

export interface UploadSession {
  id: string;
  claimId: string;
  files: FileUploadProgress[];
  totalSize: number;
  uploadedSize: number;
  startedAt: Date;
  completedAt?: Date;
}

// Standards and citations
export interface StandardsLibrary {
  iicrc: {
    s500: IICRCStandard;
    s520: IICRCStandard;
    s700: IICRCStandard;
    [key: string]: IICRCStandard;
  };
  australian: {
    [standard: string]: AustralianStandard;
  };
  queensland: {
    [regulation: string]: QueenslandRegulation;
  };
}

export interface IICRCStandard {
  title: string;
  version: string;
  sections: StandardSection[];
  keywords: string[];
  applicableScenarios: string[];
}

export interface AustralianStandard {
  number: string;
  title: string;
  sections: StandardSection[];
  keywords: string[];
}

export interface QueenslandRegulation {
  title: string;
  act: string;
  sections: StandardSection[];
  keywords: string[];
}

export interface StandardSection {
  number: string;
  title: string;
  content: string;
  subsections?: StandardSection[];
  citations: string[];
  applicableScenarios: string[];
}