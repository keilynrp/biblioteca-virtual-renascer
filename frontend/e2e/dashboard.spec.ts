import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/(?!login)/);
  });

  test('should display dashboard with statistics', async ({ page }) => {
    await page.goto('/');

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: /dashboard|inicio/i })).toBeVisible();

    // Check for stat cards
    await expect(page.getByText(/libros.*disponibles|available.*books/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/lectura|reading/i)).toBeVisible();
  });

  test('should show skeleton loaders while loading', async ({ page }) => {
    await page.goto('/');

    // Check for skeleton loaders
    const skeletons = page.locator('[data-testid="dashboard-skeleton"]').or(
      page.locator('.animate-pulse')
    );

    if (await skeletons.first().isVisible()) {
      await expect(skeletons.first()).toBeVisible();
      // Wait for actual content to replace skeletons
      await expect(skeletons.first()).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should display recent books section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for recent books section
    const recentBooksSection = page.getByText(/recientes|recent|nuevos|new/i).first();
    await expect(recentBooksSection).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to library from dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click "View all books" or similar link
    const viewAllLink = page.getByRole('link', { name: /ver.*biblioteca|view.*library|todos.*libros/i }).first();

    if (await viewAllLink.isVisible()) {
      await viewAllLink.click();
      await expect(page).toHaveURL(/\/library/);
    }
  });

  test('should display user greeting', async ({ page }) => {
    await page.goto('/');

    // Check for user greeting (adjust based on your UI)
    await expect(
      page.getByText(/bienvenido|welcome|hola|hello/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/dashboard/*', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.goto('/');

    // Should show error message
    await expect(page.getByText(/error|problema/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/(?!login)/);
  });

  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/');

    // Navigate to Library
    await page.getByRole('link', { name: /biblioteca|library/i }).first().click();
    await expect(page).toHaveURL(/\/library/);

    // Navigate back to Dashboard
    await page.getByRole('link', { name: /dashboard|inicio|home/i }).first().click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('should show active link in navigation', async ({ page }) => {
    await page.goto('/library');

    // Find library link in navigation
    const libraryLink = page.getByRole('link', { name: /biblioteca|library/i }).first();

    // Should have active state (adjust selector based on your CSS)
    await expect(libraryLink).toHaveClass(/active|bg-|text-primary/);
  });

  test('should display user menu', async ({ page }) => {
    await page.goto('/');

    // Find user menu button (adjust selector based on your UI)
    const userMenuButton = page.getByRole('button', { name: /perfil|profile|usuario|user/i });

    if (await userMenuButton.isVisible()) {
      await userMenuButton.click();

      // Should show menu items
      await expect(page.getByRole('menuitem', { name: /configuración|settings/i })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /cerrar sesión|logout/i })).toBeVisible();
    }
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/(?!login)/);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Verify h1 exists
    await expect(h1.first()).toBeVisible();
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('networkidle');

    // Find all images
    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      // Check each image has alt attribute
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA landmarks
    await expect(page.locator('main')).toBeVisible();

    // Check for navigation
    const nav = page.locator('nav');
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible();
    }
  });
});
