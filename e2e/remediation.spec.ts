import { test, expect } from '@playwright/test'

test.describe('Remediation Report System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/remediation')
  })

  test('should display dashboard with statistics', async ({ page }) => {
    // Check dashboard elements
    await expect(page.getByText('Remediation Report System')).toBeVisible()
    await expect(page.getByText('Active Claims')).toBeVisible()
    await expect(page.getByText('Completed')).toBeVisible()
    await expect(page.getByText('Restoration Rate')).toBeVisible()
    
    // Check recent claims table
    await expect(page.getByText('Recent Claims')).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('should create a new water damage claim', async ({ page }) => {
    // Navigate to new claim form
    await page.getByRole('button', { name: 'New Claim' }).click()
    await expect(page.getByText('New Claim Intake')).toBeVisible()
    
    // Fill in Step 1: Basic Information
    await page.fill('input[placeholder="Enter claim number"]', 'CLM-TEST-001')
    await page.fill('input[placeholder="Enter insured name"]', 'Test Client')
    await page.fill('input[placeholder="Enter insurer name"]', 'Test Insurance Co')
    
    // Fill in property address
    await page.fill('input[placeholder="Street address"]', '123 Test Street')
    await page.fill('input[placeholder="Suburb"]', 'Brisbane')
    await page.selectOption('select', 'QLD')
    await page.fill('input[placeholder="Postcode"]', '4000')
    
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Step 2: Incident Details
    await expect(page.getByText('Incident Details')).toBeVisible()
    await page.selectOption('select', 'water')
    await page.fill('input[type="date"]', '2024-12-20')
    
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Step 3: Initial Assessment
    await expect(page.getByText('Initial Assessment')).toBeVisible()
    await page.getByLabel('Living Room').check()
    await page.getByLabel('Kitchen').check()
    await page.getByLabel('Master Bedroom').check()
    
    await page.getByLabel('Immediate water extraction required').check()
    await page.getByLabel('Mould growth present').check()
    
    await page.getByRole('button', { name: 'Submit Claim' }).click()
    
    // Verify navigation to assessment
    await expect(page.getByText('Damage Assessment')).toBeVisible()
  })

  test('should perform damage assessment with IICRC categories', async ({ page }) => {
    // Navigate to existing claim assessment
    await page.goto('/remediation')
    await page.getByRole('button', { name: 'View' }).first().click()
    
    // Add room to assessment
    await page.getByRole('button', { name: 'Add Room' }).click()
    await page.fill('input[placeholder="e.g., Master Bedroom"]', 'Living Room')
    await page.selectOption('select', 'Living Area')
    
    // Set damage details
    await page.selectOption('select[aria-label="Damage Type"]', 'water')
    await page.selectOption('select[aria-label="Water Category"]', '2')
    await page.selectOption('select[aria-label="Water Class"]', '2')
    
    // Add affected materials
    await page.getByRole('button', { name: 'Add Material' }).click()
    await page.fill('input[placeholder="Material type"]', 'Carpet')
    await page.fill('input[placeholder="Area (m²)"]', '25')
    await page.selectOption('select[aria-label="Porosity"]', 'porous')
    
    // Check IICRC citation appears
    await expect(page.getByText('IICRC S500 10.5.3')).toBeVisible()
    await expect(page.getByText('Category 2 - Water with significant contamination')).toBeVisible()
  })

  test('should analyze HVAC contamination spread', async ({ page }) => {
    // Navigate to HVAC analyzer
    await page.goto('/remediation')
    await page.getByRole('button', { name: 'Assessment' }).click()
    
    // Check HVAC system
    await page.getByText('HVAC Analysis').scrollIntoViewIfNeeded()
    await page.getByLabel('System Active During Incident').check()
    
    // Verify contamination warnings
    await expect(page.getByText('⚠️ Critical: HVAC System Contamination Risk')).toBeVisible()
    await expect(page.getByText('Shut down HVAC system immediately')).toBeVisible()
    await expect(page.getByText('IICRC S520 12.2.2')).toBeVisible()
    
    // Check affected zones
    await expect(page.getByText('All zones potentially affected')).toBeVisible()
  })

  test('should calculate restoration vs replacement costs', async ({ page }) => {
    // Navigate to restoration calculator
    await page.goto('/remediation')
    await page.getByRole('button', { name: 'Assessment' }).click()
    
    await page.getByText('Restoration Calculator').scrollIntoViewIfNeeded()
    
    // Verify restoration analysis
    await expect(page.getByText('Restoration Viability Analysis')).toBeVisible()
    await expect(page.getByText('Cost Savings Through Restoration')).toBeVisible()
    
    // Check for specific material recommendations
    await expect(page.getByText(/Clean, sanitize, and dry/)).toBeVisible()
    await expect(page.getByText(/Success Rate:/)).toBeVisible()
  })

  test('should upload and tag evidence files', async ({ page }) => {
    // Navigate to evidence uploader
    await page.goto('/remediation')
    await page.getByRole('button', { name: 'Assessment' }).click()
    
    await page.getByText('Evidence Upload').scrollIntoViewIfNeeded()
    
    // Upload file (simulated)
    const fileInput = await page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'moisture-reading.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    })
    
    // Add description and location
    await page.fill('input[placeholder="Add description..."]', 'Moisture meter reading - 45% MC')
    await page.fill('input[placeholder="Location (e.g., Master Bedroom)"]', 'Living Room - North Wall')
    
    // Add tags
    const tagInput = page.locator('input[placeholder="Add tag and press Enter"]').first()
    await tagInput.fill('Category 2')
    await tagInput.press('Enter')
    await tagInput.fill('45% MC')
    await tagInput.press('Enter')
    
    // Verify tags appear
    await expect(page.getByText('Category 2')).toBeVisible()
    await expect(page.getByText('45% MC')).toBeVisible()
    
    // Upload evidence
    await page.getByRole('button', { name: 'Upload All' }).click()
    await expect(page.getByText('Uploading...')).toBeVisible()
  })

  test('should generate report with all sections', async ({ page }) => {
    // Navigate to report builder
    await page.goto('/remediation')
    await page.getByRole('button', { name: 'Report' }).click()
    
    // Verify report sections
    await expect(page.getByText('Executive Summary')).toBeVisible()
    await expect(page.getByText('Scope of Investigation')).toBeVisible()
    await expect(page.getByText('Causation Analysis')).toBeVisible()
    await expect(page.getByText('Damage Assessment')).toBeVisible()
    await expect(page.getByText('Recommendations')).toBeVisible()
    
    // Check for IICRC citations in content
    const editorContent = await page.locator('textarea').inputValue()
    expect(editorContent).toContain('IICRC S500')
    expect(editorContent).toContain('Category')
    expect(editorContent).toContain('Restoration')
    
    // Verify completion tracking
    await expect(page.getByText(/\d+% complete/)).toBeVisible()
    
    // Test auto-save
    await page.locator('textarea').fill('Updated content with new findings')
    await page.waitForTimeout(2500) // Wait for auto-save
    await expect(page.getByText('Saved')).toBeVisible()
  })

  test('should export report as PDF', async ({ page }) => {
    // Navigate to report
    await page.goto('/remediation')
    await page.getByRole('button', { name: 'Report' }).click()
    
    // Click export button
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export PDF' }).click()
    
    // Verify download starts
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit incomplete form
    await page.getByRole('button', { name: 'New Claim' }).click()
    await page.getByRole('button', { name: 'Next' }).click()
    
    // Check validation messages
    await expect(page.getByText('Claim number is required')).toBeVisible()
    await expect(page.getByText('Insured name is required')).toBeVisible()
  })

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/remediation')
    
    // Check mobile menu
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
    
    // Verify cards stack vertically
    const statsCards = await page.locator('.grid').first()
    const classList = await statsCards.getAttribute('class')
    expect(classList).toContain('grid-cols-1')
  })
})