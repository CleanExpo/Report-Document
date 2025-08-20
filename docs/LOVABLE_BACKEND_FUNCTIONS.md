# Backend Functions for Lovable.dev - Remediation Report System

## Core Backend Functions Implementation

### 1. Report Generation Function
```typescript
// Edge Function: /api/reports/generate
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  try {
    const { claimId } = await req.json()
    
    // Fetch claim data with all relations
    const claim = await fetchClaimWithRelations(claimId)
    
    // Generate report sections
    const report = {
      id: crypto.randomUUID(),
      claimId,
      generatedAt: new Date().toISOString(),
      sections: {
        executiveSummary: await generateExecutiveSummary(claim),
        causationAnalysis: await analyzeCausation(claim),
        damageAssessment: await assessDamages(claim.damages),
        recommendations: await generateRecommendations(claim),
        citations: await compileCitations(claim)
      }
    }
    
    // Apply IICRC standards citations
    report.sections = await applyCitations(report.sections)
    
    // Store in database
    await storeReport(report)
    
    return new Response(JSON.stringify(report), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    })
  }
})

async function generateExecutiveSummary(claim: any) {
  return {
    incidentDate: claim.dateOfLoss,
    propertyAddress: claim.propertyAddress,
    primaryCause: determinePrimaryCause(claim),
    affectedAreas: claim.damages.length,
    urgentActions: identifyUrgentActions(claim),
    estimatedRestoration: calculateRestorationTime(claim)
  }
}

async function analyzeCausation(claim: any) {
  const analysis = {
    primaryCause: '',
    contributingFactors: [],
    preventability: '',
    citations: []
  }
  
  // Water damage causation
  if (claim.claimType === 'water') {
    const waterSource = identifyWaterSource(claim)
    analysis.primaryCause = waterSource.description
    analysis.citations.push({
      standard: 'IICRC S500',
      section: '10.5.1',
      text: 'Water damage causation analysis'
    })
  }
  
  // Mould causation
  if (claim.claimType === 'mould' || hasMouldGrowth(claim)) {
    analysis.contributingFactors.push('Elevated moisture levels')
    analysis.citations.push({
      standard: 'IICRC S520',
      section: '12.1',
      text: 'Conditions favorable for fungal growth'
    })
  }
  
  return analysis
}
```

### 2. HVAC Contamination Analysis
```typescript
// Edge Function: /api/analysis/hvac
export async function analyzeHVACContamination(req: Request) {
  const { claimId, hvacSystem, contaminationType } = await req.json()
  
  const analysis = {
    systemType: hvacSystem.type,
    zonesAffected: [],
    contaminationRisk: 'low',
    recommendations: [],
    citations: []
  }
  
  // Map affected zones through ductwork
  if (hvacSystem.type === 'ducted') {
    analysis.zonesAffected = mapDuctworkZones(hvacSystem)
    
    // Calculate spread risk
    if (contaminationType === 'mould') {
      analysis.contaminationRisk = 'high'
      analysis.recommendations.push({
        priority: 'immediate',
        action: 'Shut down HVAC system immediately',
        citation: 'IICRC S520 12.2.2'
      })
      analysis.recommendations.push({
        priority: 'immediate',
        action: 'Seal all supply and return vents',
        citation: 'IICRC S520 12.2.2.1'
      })
      analysis.recommendations.push({
        priority: 'urgent',
        action: 'Professional HVAC inspection and cleaning required',
        citation: 'AS/NZS 3666.1:2011'
      })
    }
    
    if (contaminationType === 'smoke') {
      analysis.contaminationRisk = 'medium'
      analysis.recommendations.push({
        priority: 'urgent',
        action: 'Replace all HVAC filters',
        citation: 'IICRC S700 10.6.2'
      })
    }
  }
  
  // Add zone-specific recommendations
  for (const zone of analysis.zonesAffected) {
    analysis.recommendations.push({
      priority: 'standard',
      action: `Inspect and test air quality in ${zone.name}`,
      citation: 'AS/NZS 4849.1:2003'
    })
  }
  
  return new Response(JSON.stringify(analysis), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function mapDuctworkZones(hvacSystem: any) {
  const zones = []
  
  // Calculate based on system layout
  if (hvacSystem.layout) {
    for (const duct of hvacSystem.layout.ducts) {
      zones.push({
        name: duct.servesRoom,
        contaminationProbability: calculateSpreadProbability(duct),
        requiredActions: determineZoneActions(duct)
      })
    }
  }
  
  return zones
}
```

### 3. Restoration Viability Calculator
```typescript
// Edge Function: /api/restoration/calculate
export async function calculateRestorationViability(req: Request) {
  const { materials } = await req.json()
  
  const analysis = {
    totalItems: materials.length,
    restorableItems: 0,
    replaceItems: 0,
    totalRestorationCost: 0,
    totalReplacementCost: 0,
    recommendations: [],
    costSavings: 0
  }
  
  for (const material of materials) {
    const viability = assessMaterialViability(material)
    
    if (viability.restorable) {
      analysis.restorableItems++
      analysis.totalRestorationCost += viability.restorationCost
      
      analysis.recommendations.push({
        item: material.description,
        action: 'Restore',
        method: viability.restorationMethod,
        cost: viability.restorationCost,
        timeframe: viability.timeframe,
        successRate: viability.successProbability,
        citation: getRestorationStandard(material.type)
      })
    } else {
      analysis.replaceItems++
      analysis.totalReplacementCost += material.replacementCost
      
      analysis.recommendations.push({
        item: material.description,
        action: 'Replace',
        reason: viability.replaceReason,
        cost: material.replacementCost
      })
    }
  }
  
  analysis.costSavings = analysis.totalReplacementCost - analysis.totalRestorationCost
  
  return new Response(JSON.stringify(analysis), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function assessMaterialViability(material: any) {
  const viability = {
    restorable: false,
    restorationCost: 0,
    restorationMethod: '',
    timeframe: '',
    successProbability: 0,
    replaceReason: ''
  }
  
  // Check material type and damage level
  if (material.porosity === 'non-porous') {
    viability.restorable = true
    viability.restorationMethod = 'Clean and sanitize'
    viability.successProbability = 0.95
  } else if (material.porosity === 'semi-porous' && material.category <= 2) {
    viability.restorable = true
    viability.restorationMethod = 'Deep clean and antimicrobial treatment'
    viability.successProbability = 0.80
  } else if (material.porosity === 'porous' && material.category === 3) {
    viability.restorable = false
    viability.replaceReason = 'Category 3 water - porous material not restorable per IICRC S500'
  }
  
  // Factor in sentimental value
  if (material.sentimentalValue === 'high' && material.category <= 2) {
    viability.restorable = true
    viability.restorationMethod = 'Specialized restoration techniques'
    viability.successProbability *= 0.9
  }
  
  // Calculate costs
  if (viability.restorable) {
    viability.restorationCost = calculateRestorationCost(material)
    viability.timeframe = estimateRestorationTime(material)
  }
  
  return viability
}
```

### 4. Standards Citation Engine
```typescript
// Edge Function: /api/standards/cite
export async function applyCitationsToText(req: Request) {
  const { text, context } = await req.json()
  
  // Keywords to standard mappings
  const citationMap = {
    'water category': { standard: 'IICRC S500', section: '10.5.3' },
    'water class': { standard: 'IICRC S500', section: '10.5.4' },
    'mould condition': { standard: 'IICRC S520', section: '12.1' },
    'structural drying': { standard: 'IICRC S500', section: '12.2' },
    'hvac': { standard: 'AS/NZS 3666', section: 'General' },
    'indoor air quality': { standard: 'AS/NZS 4849.1', section: '2003' },
    'antimicrobial': { standard: 'IICRC S500', section: '12.2.12' },
    'containment': { standard: 'IICRC S520', section: '12.2.1' },
    'ppe': { standard: 'AS/NZS 1715', section: '2009' },
    'moisture content': { standard: 'IICRC S500', section: '10.6.6' }
  }
  
  let citedText = text
  const citationsUsed = []
  
  // Apply citations based on context
  for (const [keyword, citation] of Object.entries(citationMap)) {
    if (text.toLowerCase().includes(keyword)) {
      const citationText = ` (${citation.standard} ${citation.section})`
      citedText = citedText.replace(
        new RegExp(`(${keyword})`, 'gi'),
        `$1${citationText}`
      )
      citationsUsed.push(citation)
    }
  }
  
  return new Response(JSON.stringify({
    citedText,
    citations: citationsUsed
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 5. Evidence Processing
```typescript
// Edge Function: /api/evidence/process
export async function processEvidence(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const metadata = JSON.parse(formData.get('metadata') as string)
  
  const evidence = {
    id: crypto.randomUUID(),
    claimId: metadata.claimId,
    type: determineEvidenceType(file),
    filename: file.name,
    uploadedAt: new Date().toISOString(),
    location: metadata.location,
    description: metadata.description,
    tags: [],
    analysis: {}
  }
  
  // Process based on file type
  if (evidence.type === 'photo') {
    // Extract EXIF data
    const exifData = await extractEXIF(file)
    evidence.analysis = {
      dateTaken: exifData.dateTime,
      location: exifData.gpsLocation,
      device: exifData.make + ' ' + exifData.model
    }
    
    // Auto-tag based on image content
    evidence.tags = await autoTagImage(file)
  }
  
  if (evidence.type === 'moisture_map') {
    // Parse moisture readings
    evidence.analysis = await parseMoistureMap(file)
  }
  
  if (evidence.type === 'lab_result') {
    // Parse lab results
    evidence.analysis = await parseLabResults(file)
  }
  
  // Store file in Supabase storage
  const { data: uploadData, error } = await supabase.storage
    .from('evidence')
    .upload(`${metadata.claimId}/${evidence.id}/${file.name}`, file)
  
  if (!error) {
    evidence.url = uploadData.path
  }
  
  // Save metadata to database
  await supabase.from('evidence').insert(evidence)
  
  return new Response(JSON.stringify(evidence), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 6. Report PDF Generation
```typescript
// Edge Function: /api/reports/pdf
export async function generatePDF(req: Request) {
  const { reportId } = await req.json()
  
  // Fetch report data
  const report = await fetchReport(reportId)
  
  // Generate HTML template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background: #003366; color: white; padding: 20px; }
        .section { margin: 20px 0; page-break-inside: avoid; }
        .citation { color: #0066cc; font-size: 0.9em; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Remediation Assessment Report</h1>
        <p>Claim: ${report.claimNumber}</p>
        <p>Date: ${report.generatedAt}</p>
      </div>
      
      ${generateSectionsHTML(report.sections)}
      
      <div class="section">
        <h2>Standards and References</h2>
        ${generateCitationsHTML(report.citations)}
      </div>
    </body>
    </html>
  `
  
  // Convert to PDF using external service
  const pdf = await convertHTMLtoPDF(html)
  
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${report.claimNumber}.pdf"`
    }
  })
}
```

### 7. Real-time Sync Function
```typescript
// Edge Function: /api/sync/claims
export async function syncClaims(req: Request) {
  const { userId, lastSync } = await req.json()
  
  // Fetch changes since last sync
  const { data: changes } = await supabase
    .from('claims')
    .select('*')
    .or(`created_at.gte.${lastSync},updated_at.gte.${lastSync}`)
    .eq('assigned_to', userId)
  
  // Include related data
  for (const claim of changes) {
    claim.damages = await fetchDamages(claim.id)
    claim.evidence = await fetchEvidence(claim.id)
    claim.recommendations = await fetchRecommendations(claim.id)
  }
  
  return new Response(JSON.stringify({
    changes,
    syncedAt: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

## Database Triggers and Functions

### Auto-update timestamps
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-generate claim numbers
```sql
-- Function to generate claim number
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.claim_number = 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(NEXTVAL('claim_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_claim_number BEFORE INSERT ON claims
  FOR EACH ROW EXECUTE FUNCTION generate_claim_number();
```

## RLS Policies

```sql
-- Claims: Users can only see their assigned claims
CREATE POLICY "Users can view own claims"
  ON claims FOR SELECT
  USING (auth.uid() = assigned_to);

-- Reports: Read-only for approved reports
CREATE POLICY "View approved reports"
  ON reports FOR SELECT
  USING (status = 'approved');

-- Evidence: Accessible by claim assignee
CREATE POLICY "View evidence for assigned claims"
  ON evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM claims
      WHERE claims.id = evidence.claim_id
      AND claims.assigned_to = auth.uid()
    )
  );
```

## Integration Points

### 1. Laboratory API Integration
```typescript
async function importLabResults(labReportId: string) {
  const response = await fetch(`${LAB_API_URL}/reports/${labReportId}`, {
    headers: { 'Authorization': `Bearer ${LAB_API_KEY}` }
  })
  
  const labData = await response.json()
  
  return {
    sampleId: labData.sampleId,
    collectionDate: labData.collectionDate,
    results: {
      mouldSpecies: labData.fungalIdentification,
      sporeCount: labData.sporeCount,
      bacteriaLevels: labData.bacteriaCount,
      recommendations: labData.recommendations
    }
  }
}
```

### 2. Weather Data Integration
```typescript
async function getWeatherHistory(date: string, location: string) {
  const response = await fetch(
    `${WEATHER_API_URL}/history?date=${date}&location=${location}`,
    { headers: { 'X-API-Key': WEATHER_API_KEY } }
  )
  
  return await response.json()
}
```

### 3. Insurance API Integration
```typescript
async function checkCoverage(policyNumber: string, claimType: string) {
  const response = await fetch(`${INSURANCE_API_URL}/coverage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ policyNumber, claimType })
  })
  
  return await response.json()
}
```

This comprehensive backend specification provides all the functions, database schemas, and integration points needed to build your remediation report system in Lovable.dev!