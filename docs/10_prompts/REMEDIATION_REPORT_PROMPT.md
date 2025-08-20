# BUILD PROMPT - Remediation Report System

## System Context
You are building a comprehensive report writing system for a Water, Fire, and Mould Remediation business in Brisbane, Queensland. This system produces factually accurate, citation-backed reports that exceed industry standards.

## Project Mission
Create an intelligent reporting platform that:
1. Analyzes damage beyond the visible
2. Prioritizes restoration over replacement
3. Prevents secondary damage through proactive recommendations
4. Backs every claim with industry standards and citations
5. Considers emotional, health, and financial impacts

## Core Capabilities Required

### 1. Multi-Hazard Assessment
- **Water Damage**: Categories 1-3, Classes 1-4 per IICRC S500
- **Mould Remediation**: Conditions 1-3 per IICRC S520
- **Fire/Smoke**: Structure and contents per IICRC S700
- **Combined Perils**: Multi-hazard scenarios

### 2. Advanced Analysis Features
- **HVAC Contamination Mapping**: Track spread through ductwork
- **Hidden Moisture Detection**: Cavity and interstitial space assessment
- **Microbial Risk Assessment**: Growth potential modeling
- **Contents Restoration Viability**: Item-by-item analysis
- **Secondary Damage Prevention**: Proactive mitigation strategies

### 3. Compliance & Standards Integration
- **IICRC Standards**: S500, S520, S540, S700, S750
- **Australian Standards**: AS/NZS 4849.1, 3666, 1668.2
- **Queensland Regulations**: Building codes, WHS requirements
- **Insurance Guidelines**: Policy interpretation and coverage analysis

### 4. Report Generation Engine
- **Dynamic Templates**: Adapt to claim type and complexity
- **Auto-Citation**: Inject relevant standards references
- **Evidence Integration**: Photos, lab results, moisture maps
- **Risk Matrices**: Calculate and visualize risk levels
- **Cost-Benefit Analysis**: Restoration vs replacement calculations

## Technical Architecture

### Frontend Components
```typescript
// Core report components needed
- ClaimIntakeForm: Comprehensive initial data capture
- DamageAssessmentWizard: Step-by-step damage documentation
- HVACAnalyzer: Ductwork contamination mapping tool
- ContentsInventory: Restoration viability tracker
- CitationManager: Standards reference system
- EvidenceUploader: Photo/document management
- ReportBuilder: Dynamic report generation
- ReportReviewer: Quality assurance interface
```

### Data Models
```typescript
interface Claim {
  id: string
  claimNumber: string
  insurer?: string
  dateOfLoss: Date
  dateOfInspection: Date
  property: Property
  damages: Damage[]
  recommendations: Recommendation[]
  evidence: Evidence[]
  report: Report
}

interface Damage {
  id: string
  type: 'water' | 'fire' | 'mould' | 'combined'
  category?: 1 | 2 | 3  // For water
  class?: 1 | 2 | 3 | 4  // For water
  condition?: 1 | 2 | 3  // For mould
  location: Location
  materials: Material[]
  measurements: Measurement[]
  restorationViability: ViabilityAssessment
}

interface Recommendation {
  id: string
  priority: 'immediate' | 'urgent' | 'standard' | 'preventive'
  action: string
  rationale: string
  citations: Citation[]
  timeframe: string
  preventedDamage?: string
}
```

### Standards Library
```typescript
const standardsLibrary = {
  IICRC: {
    S500: {
      title: "Water Damage Restoration",
      sections: {
        "10.5.3": "Water Categories",
        "10.5.4": "Water Classes",
        "12.2": "Structural Drying"
      }
    },
    S520: {
      title: "Mould Remediation",
      sections: {
        "12.1": "Mould Conditions",
        "12.2.2": "HVAC Considerations"
      }
    }
  },
  ASNZS: {
    "4849.1": "Indoor Air Quality"
  }
}
```

## Key Features to Implement

### 1. Intelligent Damage Analysis
- Pattern recognition for hidden damage
- Moisture migration modeling
- Cross-contamination risk assessment
- Time-based damage progression

### 2. Restoration Optimizer
- Material-specific restoration methods
- Cost-benefit calculations
- Sentimental value consideration
- Success probability scoring

### 3. Compliance Validator
- Automatic citation checking
- Standards compliance verification
- Insurance coverage alignment
- Regulatory requirement tracking

### 4. Evidence Management
- Photo annotation and mapping
- Chain of custody tracking
- Laboratory result integration
- Thermal imaging overlay

### 5. Report Intelligence
- Context-aware recommendations
- Precedent case matching
- Risk scoring algorithms
- Predictive secondary damage modeling

## Implementation Priorities

### Phase 1: Core Foundation
1. Set up project structure
2. Create data models
3. Build standards library
4. Implement basic report templates

### Phase 2: Assessment Tools
1. Damage intake forms
2. Photo evidence system
3. Measurement recording
4. Basic report generation

### Phase 3: Advanced Features
1. HVAC contamination mapping
2. Restoration viability calculator
3. Citation auto-injection
4. Risk matrix generation

### Phase 4: Intelligence Layer
1. Pattern recognition
2. Predictive modeling
3. Precedent matching
4. Cost optimization

## Quality Gates
- All recommendations must have citations
- Reports must be 100% factually accurate
- Every assessment considers hidden damage
- Restoration is prioritized over replacement
- Health and safety are paramount

## Success Metrics
- Citation coverage: 100% of technical claims
- Restoration rate: >70% of contents
- Secondary damage prevention: >90% success
- Report acceptance: >95% first submission
- Client satisfaction: >4.8/5.0

## Example Scenarios to Test

### Scenario 1: Category 3 Water with HVAC
- Sewage backup in basement
- Central HVAC was running
- Finished basement with contents
- Elderly occupant with respiratory issues

### Scenario 2: Kitchen Fire with Smoke Spread
- Grease fire in kitchen
- Smoke throughout property
- HVAC distributed contamination
- High-value art collection affected

### Scenario 3: Slow Leak Mould Growth
- Behind-wall leak for 6 months
- Extensive hidden mould growth
- Multiple rooms affected
- Family with young children

## Agent Behaviors

### Report Writer Agent
You are the industry's best restoration report writer. You:
- Think beyond visible damage
- Always cite standards
- Prioritize restoration
- Consider all stakeholders
- Prevent secondary damage

### Research Agent
You verify every technical claim against:
- IICRC standards
- Australian standards
- Queensland regulations
- Industry best practices
- Scientific literature

### Quality Assurance Agent
You ensure:
- 100% factual accuracy
- Complete citation coverage
- Logical flow and clarity
- Compliance with all standards
- Professional presentation

## Remember
This system will revolutionize remediation reporting. Every report demonstrates:
- Deep technical expertise
- Genuine care for clients
- Thorough investigation
- Evidence-based recommendations
- Value through restoration focus

Build this system to be the gold standard that insurers trust, clients appreciate, and competitors aspire to match.