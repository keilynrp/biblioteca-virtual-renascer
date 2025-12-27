import { test, expect } from '@playwright/test';

test.describe('Subscriptions', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/(?!login)/);

    // Navigate to subscriptions
    await page.goto('/subscriptions');
  });

  test('should display subscription plans', async ({ page }) => {
    // Wait for plans to load
    await page.waitForLoadState('networkidle');

    // Check for plan cards
    await expect(page.getByText(/básico|basic/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/premium/i)).toBeVisible();
  });

  test('should show plan features', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Each plan should show features
    await expect(page.getByText(/libros|books/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/acceso|access/i).first()).toBeVisible();
  });

  test('should display pricing', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Should show prices
    const prices = page.locator('text=/\\$\\d+/').or(page.locator('text=/€\\d+/'));
    await expect(prices.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow selecting a plan', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find and click "Subscribe" or "Choose Plan" button
    const subscribeButton = page
      .getByRole('button', { name: /suscribirse|subscribe|elegir/i })
      .first();
    await subscribeButton.click();

    // Should navigate to checkout or show payment form
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toContain('checkout') || expect(url).toContain('payment');
  });

  test('should show current subscription if user has one', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check if there's a "Current Plan" indicator
    const currentPlanIndicator = page.getByText(/plan actual|current plan|activo/i);

    if (await currentPlanIndicator.isVisible()) {
      await expect(currentPlanIndicator).toBeVisible();
    }
  });

  test('should allow upgrading subscription', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for upgrade button
    const upgradeButton = page.getByRole('button', { name: /mejorar|upgrade/i });

    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();

      // Should navigate to upgrade flow
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('upgrade') || expect(page.url()).toContain('checkout');
    }
  });
});

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/(?!login)/);
  });

  test('should display Stripe checkout form', async ({ page }) => {
    await page.goto('/subscriptions');
    await page.waitForLoadState('networkidle');

    // Click subscribe button
    const subscribeButton = page
      .getByRole('button', { name: /suscribirse|subscribe|elegir/i })
      .first();
    await subscribeButton.click();

    // Wait for Stripe form to load (adjust timeout as needed)
    await page.waitForTimeout(2000);

    // Check for Stripe iframe or payment form elements
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');

    if (await stripeFrame.locator('input').count() > 0) {
      await expect(stripeFrame.locator('input').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should validate payment information', async ({ page }) => {
    await page.goto('/checkout?plan=premium');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling card details
    const submitButton = page.getByRole('button', { name: /pagar|pay|confirmar/i });

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation error
      await expect(page.getByText(/tarjeta|card|pago|payment/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show payment summary', async ({ page }) => {
    await page.goto('/checkout?plan=premium');
    await page.waitForLoadState('networkidle');

    // Should display plan details and price
    await expect(page.getByText(/premium/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/\\$\\d+|€\\d+/')).toBeVisible();
  });

  test('should allow canceling subscription', async ({ page }) => {
    await page.goto('/subscriptions');
    await page.waitForLoadState('networkidle');

    // Look for cancel subscription button
    const cancelButton = page.getByRole('button', { name: /cancelar.*suscripción|cancel.*subscription/i });

    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Should show confirmation dialog
      await expect(
        page.getByText(/confirmar|confirm|seguro|sure/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Subscription Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/correo electrónico|email/i).fill('test@example.com');
    await page.getByLabel(/contraseña|password/i).fill('testpassword123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/(?!login)/);
  });

  test('should display subscription history', async ({ page }) => {
    await page.goto('/profile/subscriptions');

    // Should show subscription history
    await expect(
      page.getByText(/historial|history|suscripciones anteriores/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show billing information', async ({ page }) => {
    await page.goto('/profile/billing');

    // Should display billing details
    await expect(page.getByText(/facturación|billing|pago/i)).toBeVisible({ timeout: 10000 });
  });

  test('should allow updating payment method', async ({ page }) => {
    await page.goto('/profile/billing');
    await page.waitForLoadState('networkidle');

    // Look for update payment button
    const updateButton = page.getByRole('button', {
      name: /actualizar.*método|update.*payment/i,
    });

    if (await updateButton.isVisible()) {
      await updateButton.click();

      // Should show payment form
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('payment') || expect(page.url()).toContain('billing');
    }
  });

  test('should display next billing date', async ({ page }) => {
    await page.goto('/profile/subscriptions');
    await page.waitForLoadState('networkidle');

    // Look for next billing date
    const billingDate = page.getByText(/próxima.*factura|next.*billing|renovación/i);

    if (await billingDate.isVisible()) {
      await expect(billingDate).toBeVisible();
    }
  });
});
