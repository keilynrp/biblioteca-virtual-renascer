import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show login form with all elements', async ({ page }) => {
    await page.goto('/login');

    // Verify form elements exist
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel(/correo electrónico|email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña|password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /registrarse|crear cuenta/i })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill form with invalid credentials
    await page.getByLabel(/correo electrónico|email/i).fill('invalid@example.com');
    await page.getByLabel(/contraseña|password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Wait for error message
    await expect(page.getByText(/credenciales inválidas|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill form with valid credentials (adjust based on your test user)
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/(?!login)/, { timeout: 10000 });

    // Verify we're in the dashboard
    await expect(page.getByRole('heading', { name: /dashboard|inicio/i })).toBeVisible({ timeout: 5000 });
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');

    // Click and immediately check for disabled state
    const loginButton = page.getByRole('button', { name: /iniciar sesión/i });
    await loginButton.click();

    // Button should be disabled during loading
    await expect(loginButton).toBeDisabled();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('link', { name: /registrarse|crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/register/);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/correo electrónico|email/i).fill('notanemail');
    await page.getByLabel(/contraseña|password/i).fill('password123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Check for validation error
    await expect(page.getByText(/correo electrónico|email.*válido|inválido/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling fields
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Should show validation errors
    const emailInput = page.getByLabel(/correo electrónico|email/i);
    const passwordInput = page.getByLabel(/contraseña|password/i);

    await expect(emailInput).toBeFocused();
  });
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should show registration form with all elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /registrarse|crear cuenta/i })).toBeVisible();
    await expect(page.getByLabel(/nombre|name/i)).toBeVisible();
    await expect(page.getByLabel(/correo electrónico|email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña|password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /registrarse|crear cuenta/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.getByLabel(/nombre|name/i).fill('Test User');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('short');
    await page.getByRole('button', { name: /registrarse|crear cuenta/i }).click();

    // Should show password validation error
    await expect(page.getByText(/contraseña.*caracteres|password.*characters/i)).toBeVisible();
  });

  test('should navigate back to login page', async ({ page }) => {
    await page.getByRole('link', { name: /iniciar sesión/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Logout Flow', () => {
  test('should logout successfully', async ({ page, context }) => {
    // First, login (you may need to adjust this based on your auth setup)
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/(?!login)/, { timeout: 10000 });

    // Find and click logout button (adjust selector based on your UI)
    await page.getByRole('button', { name: /cerrar sesión|logout/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Verify session is cleared by trying to access protected route
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
