import { test, expect } from '@playwright/test';

test.describe('Library Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first (adjust based on your auth setup)
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/(?!login)/);

    // Navigate to library
    await page.goto('/library');
  });

  test('should display library page with books', async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole('heading', { name: /biblioteca|library/i })).toBeVisible();

    // Check for book cards (should appear after loading)
    const bookCards = page.locator('[data-testid="book-card"]').or(page.locator('.book-card'));
    await expect(bookCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show skeleton loaders while loading', async ({ page }) => {
    // Reload page to see loading state
    await page.reload();

    // Check for skeleton loaders
    const skeletons = page.locator('[data-testid="skeleton"]').or(page.locator('.animate-pulse'));
    await expect(skeletons.first()).toBeVisible();

    // Wait for skeletons to disappear
    await expect(skeletons.first()).not.toBeVisible({ timeout: 10000 });
  });

  test('should filter books by category', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');

    // Click on a category filter (adjust selector based on your UI)
    const categoryFilter = page.getByRole('button', { name: /ficción|novela|categoría/i }).first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();

      // Wait for filtered results
      await page.waitForTimeout(500);

      // Verify URL or UI updated with filter
      const url = page.url();
      expect(url).toContain('category=');
    }
  });

  test('should search for books', async ({ page }) => {
    // Wait for search input to be visible
    const searchInput = page.getByPlaceholder(/buscar|search/i);
    await searchInput.waitFor({ state: 'visible' });

    // Type search query
    await searchInput.fill('test book');
    await searchInput.press('Enter');

    // Wait for search results
    await page.waitForTimeout(1000);

    // Verify URL updated with search query
    const url = page.url();
    expect(url).toContain('search=') || expect(url).toContain('q=');
  });

  test('should navigate to book details', async ({ page }) => {
    // Wait for books to load
    await page.waitForLoadState('networkidle');

    // Click on first book card
    const firstBook = page.locator('[data-testid="book-card"]').or(page.locator('.book-card')).first();
    await firstBook.waitFor({ state: 'visible', timeout: 10000 });
    await firstBook.click();

    // Should navigate to book details page
    await expect(page).toHaveURL(/\/books\/\d+/);
  });

  test('should handle pagination', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for pagination controls
    const nextButton = page.getByRole('button', { name: /siguiente|next/i }).or(
      page.locator('[aria-label="Next page"]')
    );

    if (await nextButton.isVisible()) {
      // Click next page
      await nextButton.click();

      // Wait for page to update
      await page.waitForTimeout(500);

      // Verify URL updated with page parameter
      const url = page.url();
      expect(url).toContain('page=');
    }
  });

  test('should show error message when API fails', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/books/*', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Reload page to trigger error
    await page.reload();

    // Wait for error message
    await expect(page.getByText(/error|problema/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display empty state when no books found', async ({ page }) => {
    // Intercept API and return empty results
    await page.route('**/api/books/*', (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ results: [], count: 0 }),
      });
    });

    // Reload page
    await page.reload();

    // Wait for empty state message
    await expect(
      page.getByText(/no.*libros|no books|sin resultados/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Book Details Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/(?!login)/);
  });

  test('should display book details', async ({ page }) => {
    // Navigate to a specific book (adjust ID as needed)
    await page.goto('/books/1');

    // Wait for book title to be visible
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    // Verify key elements are present
    await expect(page.getByText(/autor|author/i)).toBeVisible();
    await expect(page.getByText(/descripción|description/i)).toBeVisible();
  });

  test('should allow adding book to favorites', async ({ page }) => {
    await page.goto('/books/1');

    // Find and click favorite button
    const favoriteButton = page.getByRole('button', { name: /favorito|favorite/i });
    await favoriteButton.waitFor({ state: 'visible', timeout: 10000 });
    await favoriteButton.click();

    // Should show success message
    await expect(page.getByText(/agregado.*favoritos|added.*favorites/i)).toBeVisible({ timeout: 5000 });
  });

  test('should allow reading book if user has access', async ({ page }) => {
    await page.goto('/books/1');

    // Look for read button
    const readButton = page.getByRole('button', { name: /leer|read/i }).or(
      page.getByRole('link', { name: /leer|read/i })
    );

    if (await readButton.isVisible()) {
      await readButton.click();

      // Should navigate to reader page
      await expect(page).toHaveURL(/\/reader\/\d+/);
    }
  });
});
