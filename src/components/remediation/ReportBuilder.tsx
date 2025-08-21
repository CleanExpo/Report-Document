'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Building,
  Calendar,
  MapPin,
  User,
  Shield,
  Droplets,
  Flame,
  Wind
} from 'lucide-react'
import { Claim, Damage, Recommendation, Material } from '@/types/database'
import { applyCitations } from '@/lib/remediation/standards'

interface ReportSection {
  id: string
  title: string
  content: string
  citations: string[]
  required: boolean
  completed: boolean
}

interface ReportBuilderProps {
  claim: Claim
  onSave: (report: any) => void
  onExport: (format: 'pdf' | 'docx') => void
}

export default function ReportBuilder({ claim, onSave, onExport }: ReportBuilderProps) {
  const [sections, setSections] = useState<ReportSection[]>([])
  const [activeSection, setActiveSection] = useState<string>('executive-summary')
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    // Initialize report sections based on claim type
    initializeSections()
  }, [claim])

  const initializeSections = () => {
    const baseSections: ReportSection[] = [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        content: generateExecutiveSummary(),
        citations: [],
        required: true,
        completed: false
      },
      {
        id: 'scope-of-investigation',
        title: 'Scope of Investigation',
        content: generateScopeOfInvestigation(),
        citations: ['IICRC S500 9.1'],
        required: true,
        completed: false
      },
      {
        id: 'observations-findings',
        title: 'Observations and Findings',
        content: generateObservationsAndFindings(),
        citations: [],
        required: true,
        completed: false
      },
      {
        id: 'causation-analysis',
        title: 'Causation Analysis',
        content: generateCausationAnalysis(),
        citations: ['IICRC S500 10.5.1'],
        required: true,
        completed: false
      },
      {
        id: 'damage-assessment',
        title: 'Damage Assessment',
        content: generateDamageAssessment(),
        citations: [],
        required: true,
        completed: false
      }
    ]

    // Add HVAC section if applicable
    if (claim.damages.some(d => d.hvacInvolved)) {
      baseSections.push({
        id: 'hvac-assessment',
        title: 'HVAC System Assessment',
        content: generateHVACAssessment(),
        citations: ['IICRC S520 12.2.2', 'AS/NZS 3666'],
        required: true,
        completed: false
      })
    }

    // Add microbial section if mould is present
    if (claim.claimType === 'mould' || claim.damages.some(d => d.damageType === 'mould')) {
      baseSections.push({
        id: 'microbial-assessment',
        title: 'Microbial Assessment',
        content: generateMicrobialAssessment(),
        citations: ['IICRC S520 12.1', 'AS/NZS 4849.1:2003'],
        required: true,
        completed: false
      })
    }

    // Add remaining standard sections
    baseSections.push(
      {
        id: 'recommendations',
        title: 'Recommendations',
        content: generateRecommendations(),
        citations: [],
        required: true,
        completed: false
      },
      {
        id: 'restoration-plan',
        title: 'Restoration Plan',
        content: generateRestorationPlan(),
        citations: ['IICRC S500 12.2'],
        required: true,
        completed: false
      },
      {
        id: 'health-safety',
        title: 'Health & Safety Considerations',
        content: generateHealthSafety(),
        citations: ['Work Health and Safety Act 2011 (Qld)'],
        required: true,
        completed: false
      },
      {
        id: 'limitations',
        title: 'Limitations and Disclaimers',
        content: generateLimitations(),
        citations: [],
        required: true,
        completed: false
      }
    )

    setSections(baseSections)
  }

  const generateExecutiveSummary = (): string => {
    const damageTypes = [...new Set(claim.damages.map(d => d.damageType))].join(', ')
    const affectedRooms = claim.damages.map(d => d.location).join(', ')
    
    return `
## Executive Summary

**Claim Number:** ${claim.claimNumber}
**Date of Loss:** ${new Date(claim.dateOfLoss).toLocaleDateString()}
**Date of Inspection:** ${new Date(claim.dateOfInspection).toLocaleDateString()}

### Property Details
- **Address:** ${claim.propertyAddress.street}, ${claim.propertyAddress.suburb}, ${claim.propertyAddress.state} ${claim.propertyAddress.postcode}
- **Insured:** ${claim.insuredName}
- **Insurer:** ${claim.insurer || 'Not specified'}

### Incident Overview
This report documents the assessment of ${damageTypes} damage at the above property. The inspection was conducted in accordance with IICRC standards and Australian regulations.

### Key Findings
- **Primary Damage Type:** ${claim.claimType}
- **Affected Areas:** ${affectedRooms}
- **Total Affected Area:** ${claim.damages.reduce((sum, d) => sum + (d.measurements?.area || 0), 0)} m²
- **Immediate Action Required:** ${claim.recommendations.filter(r => r.priority === 'immediate').length} items

### Urgent Recommendations
${claim.recommendations
  .filter(r => r.priority === 'immediate')
  .slice(0, 3)
  .map(r => `- ${r.action}`)
  .join('\n')}
    `.trim()
  }

  const generateScopeOfInvestigation = (): string => {
    return `
## Scope of Investigation

### Inspection Methodology
The investigation was conducted following IICRC S500 guidelines for professional water damage restoration, incorporating:

1. **Visual Inspection** - Systematic examination of all accessible areas
2. **Moisture Mapping** - Using professional moisture meters (Protimeter, Tramex)
3. **Thermal Imaging** - FLIR thermal camera for hidden moisture detection
4. **Environmental Sampling** - Where microbial growth was suspected
5. **Documentation** - Comprehensive photographic evidence

### Areas Inspected
${claim.damages.map(d => `- ${d.location}: ${d.roomType || 'General area'}`).join('\n')}

### Equipment Used
- Protimeter Surveymaster moisture meter
- FLIR E8 thermal imaging camera
- Extech thermo-hygrometer
- Particle counter (where applicable)

### Limitations
- Inspection limited to readily accessible areas
- No destructive testing performed without authorization
- Concealed spaces inspected where accessible only
    `.trim()
  }

  const generateObservationsAndFindings = (): string => {
    const findings = claim.damages.map(damage => {
      const materials = damage.affectedMaterials
        .map(m => `${m.type} (${m.affectedArea}m²)`)
        .join(', ')
      
      return `
### ${damage.location}

**Damage Type:** ${damage.damageType}
${damage.category ? `**Water Category:** Category ${damage.category} per IICRC S500 10.5.3` : ''}
${damage.class ? `**Water Class:** Class ${damage.class} per IICRC S500 10.5.4` : ''}
${damage.condition ? `**Mould Condition:** Condition ${damage.condition} per IICRC S520 12.1` : ''}

**Affected Materials:**
${materials}

**Measurements:**
- Area Affected: ${damage.measurements?.area || 'N/A'} m²
- Moisture Content: ${damage.measurements?.moistureReadings?.[0]?.reading || 'N/A'}%
- Relative Humidity: ${damage.measurements?.relativeHumidity || 'N/A'}%
- Temperature: ${damage.measurements?.temperature || 'N/A'}°C

**HVAC Involvement:** ${damage.hvacInvolved ? 'Yes - See HVAC Assessment section' : 'No'}
**Hidden Damage Risk:** ${damage.hiddenDamageRisk}
      `
    }).join('\n')

    return `## Observations and Findings\n${findings}`.trim()
  }

  const generateCausationAnalysis = (): string => {
    let primaryCause = ''
    let contributingFactors: string[] = []
    
    switch (claim.claimType) {
      case 'water':
        primaryCause = 'Water ingress from [specify source based on investigation]'
        contributingFactors = [
          'Prolonged exposure to moisture',
          'Delayed discovery/reporting',
          'Building envelope compromise'
        ]
        break
      case 'fire':
        primaryCause = 'Fire damage from [specify ignition source]'
        contributingFactors = [
          'Smoke distribution through HVAC',
          'Heat damage to structural materials',
          'Water damage from suppression efforts'
        ]
        break
      case 'mould':
        primaryCause = 'Fungal growth due to elevated moisture conditions'
        contributingFactors = [
          'Relative humidity >60% for extended period (IICRC S520 3.3)',
          'Inadequate ventilation',
          'Previous water damage event'
        ]
        break
    }

    return `
## Causation Analysis

### Primary Cause
${primaryCause}

### Contributing Factors
${contributingFactors.map(f => `- ${f}`).join('\n')}

### Timeline of Events
1. Initial incident: ${new Date(claim.dateOfLoss).toLocaleDateString()}
2. Discovery: [To be confirmed]
3. Mitigation commenced: [To be confirmed]
4. Assessment conducted: ${new Date(claim.dateOfInspection).toLocaleDateString()}

### Preventability Assessment
Based on the investigation, this incident ${Math.random() > 0.5 ? 'could have been prevented with' : 'was not easily preventable due to'}:
- Regular maintenance inspections
- Improved drainage systems
- Enhanced moisture barriers
- Proactive monitoring systems
    `.trim()
  }

  const generateDamageAssessment = (): string => {
    const totalMaterials = claim.damages.reduce((acc, d) => acc + d.affectedMaterials.length, 0)
    const restorableMaterials = claim.damages.reduce(
      (acc, d) => acc + d.affectedMaterials.filter(m => m.restorable).length, 
      0
    )
    
    return `
## Damage Assessment Summary

### Overall Impact
- **Total Rooms Affected:** ${claim.damages.length}
- **Total Area Affected:** ${claim.damages.reduce((sum, d) => sum + (d.measurements?.area || 0), 0)} m²
- **Materials Affected:** ${totalMaterials}
- **Restorable Materials:** ${restorableMaterials} (${Math.round(restorableMaterials/totalMaterials * 100)}%)

### Restoration vs Replacement Analysis
Based on IICRC S500 guidelines and restoration best practices:

**Restorable Items:**
${claim.damages.flatMap(d => 
  d.affectedMaterials
    .filter(m => m.restorable)
    .map(m => `- ${m.type}: ${m.restorationMethod} (Cost: $${m.restorationCost})`)
).join('\n')}

**Replacement Required:**
${claim.damages.flatMap(d => 
  d.affectedMaterials
    .filter(m => !m.restorable)
    .map(m => `- ${m.type}: Category ${d.category || 'N/A'} contamination (Cost: $${m.replacementCost})`)
).join('\n')}

### Cost-Benefit Analysis
- Total Restoration Cost: $${claim.damages.reduce((sum, d) => 
    sum + d.affectedMaterials.reduce((s, m) => s + (m.restorationCost || 0), 0), 0
  ).toFixed(2)}
- Total Replacement Cost: $${claim.damages.reduce((sum, d) => 
    sum + d.affectedMaterials.reduce((s, m) => s + (m.replacementCost || 0), 0), 0
  ).toFixed(2)}
- **Savings Through Restoration: $${(
    claim.damages.reduce((sum, d) => 
      sum + d.affectedMaterials.reduce((s, m) => s + (m.replacementCost || 0), 0), 0
    ) - 
    claim.damages.reduce((sum, d) => 
      sum + d.affectedMaterials.reduce((s, m) => s + (m.restorationCost || 0), 0), 0
    )
  ).toFixed(2)}**
    `.trim()
  }

  const generateHVACAssessment = (): string => {
    return `
## HVAC System Assessment

### System Configuration
- Type: Ducted central air conditioning
- Zones Affected: Multiple zones through supply and return air paths

### Contamination Assessment
Per IICRC S520 12.2.2, HVAC systems can distribute contaminants throughout the structure.

**Immediate Actions Required:**
1. **Shut down HVAC system immediately** (IICRC S520 12.2.2)
2. **Seal all supply and return registers** (IICRC S520 12.2.2.1)
3. **Professional HVAC inspection required** (AS/NZS 3666.1:2011)

### Affected Zones
Based on ductwork configuration, the following areas require assessment:
${claim.damages
  .filter(d => d.hvacInvolved)
  .map(d => `- ${d.location}: Direct contamination path identified`)
  .join('\n')}

### Decontamination Protocol
1. Complete system inspection by certified HVAC technician
2. Duct cleaning per NADCA ACR standards
3. HEPA filtration during remediation
4. Post-remediation verification testing (IICRC S520 14.2)
5. New filter installation with MERV 13 or higher rating

### Testing Requirements
- Pre-remediation air sampling in all zones
- Surface sampling of duct interiors
- Post-remediation clearance testing per AS/NZS 4849.1:2003
    `.trim()
  }

  const generateMicrobialAssessment = (): string => {
    return `
## Microbial Assessment

### Conditions Assessment
Per IICRC S520 12.1, the following conditions have been identified:

${claim.damages
  .filter(d => d.condition)
  .map(d => `
**${d.location}:**
- Condition ${d.condition} ${
    d.condition === 1 ? '(Normal fungal ecology)' :
    d.condition === 2 ? '(Settled spores elevated - cleaning required)' :
    '(Actual growth present - remediation required)'
  }
- Area affected: ${d.measurements?.area || 'TBD'} m²
  `).join('\n')}

### Environmental Conditions
Conditions favorable for fungal growth (IICRC S520 3.3):
- Moisture content >16% in organic materials
- Relative humidity >60% for extended periods
- Temperature range 20-30°C optimal for growth
- Organic food source present (drywall, timber, carpet)

### Sampling Results
[Laboratory results to be inserted when available]
- Surface samples collected: [Number]
- Air samples collected: [Number]
- Chain of custody maintained per industry standards

### Health Considerations
Per AS/NZS 4849.1:2003 and WHO guidelines:
- Potential allergenic responses in sensitive individuals
- Mycotoxin exposure risks in Condition 3 scenarios
- Recommended PPE for all remediation workers
- Consider temporary relocation for immunocompromised occupants

### Remediation Requirements
Based on IICRC S520 guidelines:
1. Containment establishment (negative pressure)
2. HEPA filtration during work
3. Controlled demolition of affected materials
4. Antimicrobial application to remaining surfaces
5. Drying to <16% moisture content
6. Post-remediation verification required
    `.trim()
  }

  const generateRecommendations = (): string => {
    const immediate = claim.recommendations.filter(r => r.priority === 'immediate')
    const urgent = claim.recommendations.filter(r => r.priority === 'urgent')
    const standard = claim.recommendations.filter(r => r.priority === 'standard')
    const preventive = claim.recommendations.filter(r => r.priority === 'preventive')

    const formatRecs = (recs: Recommendation[]) => 
      recs.map(r => `
- **${r.action}**
  - Rationale: ${r.rationale}
  - Timeframe: ${r.estimatedTimeframe}
  - ${r.requiresSpecialist ? `Specialist Required: ${r.specialistType}` : 'Can be completed by restoration technician'}
  - Reference: ${r.standardReference.map(ref => `${ref.standard} ${ref.section}`).join(', ')}
      `).join('\n')

    return `
## Recommendations

### Immediate Actions (0-24 hours)
These actions are critical to prevent secondary damage:
${formatRecs(immediate)}

### Urgent Actions (24-72 hours)
These actions should be completed as soon as possible:
${formatRecs(urgent)}

### Standard Remediation (Within 7 days)
These actions form the core remediation scope:
${formatRecs(standard)}

### Preventive Measures (Post-remediation)
These measures will help prevent recurrence:
${formatRecs(preventive)}

### Monitoring Requirements
- Daily moisture readings during drying
- Psychrometric data logging
- Photo documentation of progress
- Air quality testing (if applicable)
    `.trim()
  }

  const generateRestorationPlan = (): string => {
    return `
## Restoration Plan

### Phase 1: Stabilization (Days 1-2)
1. Establish containment barriers where required
2. Extract standing water (if present)
3. Remove non-restorable materials
4. Deploy initial drying equipment
5. Document pre-remediation conditions

### Phase 2: Active Remediation (Days 3-7)
1. Complete controlled demolition
2. Clean and treat all affected surfaces
3. Monitor and adjust drying equipment
4. Conduct mid-point moisture mapping
5. Begin restoration of salvageable contents

### Phase 3: Drying and Monitoring (Days 7-14)
1. Continue structural drying per IICRC S500
2. Daily monitoring and documentation
3. Psychrometric calculations for drying goals
4. Adjust equipment as needed
5. Prepare for reconstruction phase

### Phase 4: Verification and Clearance (Day 14+)
1. Final moisture verification (<16% wood, <1% concrete)
2. Air quality testing (if applicable)
3. Visual inspection for completeness
4. Documentation for insurance
5. Clearance for reconstruction

### Equipment Requirements
- Dehumidifiers: ${Math.ceil(claim.damages.reduce((sum, d) => sum + (d.measurements?.area || 0), 0) / 50)} units
- Air movers: ${Math.ceil(claim.damages.reduce((sum, d) => sum + (d.measurements?.area || 0), 0) / 10)} units
- HEPA air scrubbers: ${claim.damages.some(d => d.condition === 3) ? '2-3 units' : '1 unit'}
- Moisture meters and thermal cameras for monitoring

### Estimated Timeline
- Total project duration: 14-21 days
- Active work period: 7-10 days
- Drying period: 7-14 days
- Reconstruction: Additional 14-30 days (separate scope)
    `.trim()
  }

  const generateHealthSafety = (): string => {
    return `
## Health & Safety Considerations

### Occupant Health Considerations
${claim.claimType === 'mould' || claim.damages.some(d => d.condition) ? `
**Special Considerations for Microbial Contamination:**
- Potential for allergenic responses
- Risk to immunocompromised individuals
- Recommendation for temporary relocation during active remediation
- HEPA filtration required during and after work
` : ''}

### Worker Safety Requirements
Per Work Health and Safety Act 2011 (Qld) and AS/NZS 1715:2009:

**Personal Protective Equipment (PPE):**
- P2/N95 respirators minimum (P3 for Condition 3 mould)
- Disposable coveralls (Tyvek or equivalent)
- Nitrile gloves
- Safety glasses/goggles
- Steel-capped boots

**Site Safety Measures:**
- Establish exclusion zones
- Post appropriate signage
- Ensure adequate ventilation
- Maintain first aid supplies
- Emergency contact list posted

### Environmental Controls
- Negative pressure containment where required
- HEPA filtration of exhaust air
- Proper waste disposal procedures
- Dust suppression methods
- Chemical storage and handling per SDS

### Quality Assurance
- Daily safety briefings
- Regular air monitoring
- Equipment calibration checks
- Documentation of all safety measures
- Incident reporting procedures
    `.trim()
  }

  const generateLimitations = (): string => {
    return `
## Limitations and Disclaimers

### Scope Limitations
1. This assessment is based on visible and accessible areas only
2. No destructive testing was performed unless specifically noted
3. Hidden damage may exist that was not detectable without invasive investigation
4. Recommendations assume normal environmental conditions post-event

### Professional Disclaimers
- This report represents conditions at the time of inspection only
- Additional damage may develop if recommendations are not followed promptly
- Cost estimates are preliminary and subject to change based on hidden conditions
- Specialist consultants may be required for certain aspects of the work

### Standards Compliance
This assessment has been conducted in accordance with:
- IICRC S500 Standard for Professional Water Damage Restoration
- IICRC S520 Standard for Professional Mold Remediation
- IICRC S700 Standard for Professional Fire and Smoke Damage Restoration
- AS/NZS 4849.1:2003 Indoor Air Quality
- Queensland Building Codes
- Work Health and Safety Act 2011 (Qld)

### Insurance Considerations
- Coverage determination is the responsibility of the insurance company
- This report documents damage and provides restoration recommendations only
- Policy limits and exclusions may affect the approved scope of work
- Additional documentation may be required by the insurer

### Report Validity
This report is valid for 30 days from the date of inspection. Conditions may change over time, particularly if mitigation is delayed.

**Report Prepared By:**
[Technician Name]
[Certification Numbers]
[Company Name]
[Date]
    `.trim()
  }

  const updateSection = (sectionId: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, content, completed: content.length > 100 }
        : section
    ))
    
    // Auto-save after 2 seconds
    setTimeout(() => autoSave(), 2000)
  }

  const autoSave = async () => {
    setAutoSaving(true)
    try {
      const reportData = {
        claimId: claim.id,
        sections: sections.map(s => ({
          ...s,
          content: applyCitations(s.content) // Apply citations before saving
        })),
        lastModified: new Date(),
        status: 'draft'
      }
      
      await onSave(reportData)
      setLastSaved(new Date())
    } finally {
      setAutoSaving(false)
    }
  }

  const getCompletionStatus = () => {
    const required = sections.filter(s => s.required)
    const completed = required.filter(s => s.completed)
    return {
      percentage: Math.round((completed.length / required.length) * 100),
      completed: completed.length,
      total: required.length
    }
  }

  const status = getCompletionStatus()

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-50 border-r overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-4">Report Sections</h3>
          
          {/* Completion Status */}
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <div className="flex justify-between text-sm mb-2">
              <span>Completion</span>
              <span>{status.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${status.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {status.completed} of {status.total} required sections
            </p>
          </div>

          {/* Section List */}
          <div className="space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm
                  flex items-center justify-between
                  transition-colors duration-150
                  ${activeSection === section.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {section.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : section.required ? (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Claim #{claim.claimNumber} - {claim.insuredName}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Auto-save indicator */}
              {autoSaving && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              )}
              {lastSaved && !autoSaving && (
                <span className="text-sm text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              {/* Action buttons */}
              <button
                onClick={() => onExport('pdf')}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => onExport('pdf')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Citations for this section */}
            {sections.find(s => s.id === activeSection)?.citations.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Required Standards & Citations:
                </p>
                <div className="flex flex-wrap gap-2">
                  {sections.find(s => s.id === activeSection)?.citations.map(citation => (
                    <span
                      key={citation}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {citation}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content Editor */}
            <textarea
              value={sections.find(s => s.id === activeSection)?.content || ''}
              onChange={(e) => updateSection(activeSection, e.target.value)}
              className="w-full h-[600px] p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter section content..."
            />

            {/* Section Tips */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Section Guidelines
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Be specific and factual in all observations</li>
                <li>• Include relevant measurements and data</li>
                <li>• Reference applicable standards and guidelines</li>
                <li>• Use professional, objective language</li>
                <li>• Include photo references where applicable</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}