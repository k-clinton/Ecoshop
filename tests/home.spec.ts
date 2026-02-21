import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test('should load correctly and display the site name', async ({ page }) => {
        await page.goto('/');

        // Check for the logo/site name (defaulting to EcoShop in mocks/defaults)
        const logo = page.locator('header').getByRole('link', { name: /EcoShop/i });
        await expect(logo).toBeVisible();
    });

    test('should navigate to products page', async ({ page }) => {
        await page.goto('/');

        // Click on "All Products" in the categories dropdown or navigation
        // Based on Header.tsx, there's a "Categories" dropdown
        await page.getByRole('button', { name: /Categories/i }).click();
        await page.getByRole('link', { name: /All Products/i }).click();

        await expect(page).toHaveURL(/\/products/);
        await expect(page.locator('h1')).toContainText(/All Products/i);
    });
});
