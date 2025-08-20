import { test, expect } from '@playwright/test'

test.describe('App', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/New Project/)
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/non-existent-page')
    await expect(page.locator('text=404')).toBeVisible()
    await expect(page.locator('text=Page not found')).toBeVisible()
  })

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/')
    const homeLink = page.locator('a[href="/"]').first()
    if (await homeLink.isVisible()) {
      await homeLink.click()
      await expect(page).toHaveURL('/')
    }
  })

  test('responsive design works', async ({ page }) => {
    await page.goto('/')
    
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()
    
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible()
    
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('body')).toBeVisible()
  })
})