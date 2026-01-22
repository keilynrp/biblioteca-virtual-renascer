import { test, expect } from '@playwright/test';

test.describe('Sistema de Préstamos', () => {
    // Setup: Login before tests
    test.beforeEach(async ({ page }) => {
        // Mock login or use a test account
        // For now we assume a test user exists or we mock the auth state
        // This is a simplified example. In real app we might use storageState or API login

        await page.goto('/login');
        await page.fill('input[name="email"]', 'testuser@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('Debe permitir pedir prestado un libro disponible', async ({ page }) => {
        // 1. Navegar a un libro
        await page.goto('/library');
        await page.click('text=El Señor de los Anillos'); // Asumiendo que este libro existe

        // 2. Click en Pedir Prestado
        const borrowBtn = page.locator('button:has-text("Pedir Prestado")');
        await expect(borrowBtn).toBeVisible();
        await borrowBtn.click();

        // 3. Confirmar en el diálogo (si existe) o verificar toast
        // Si hay confirmación:
        const confirmBtn = page.locator('button:has-text("Confirmar")');
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }

        // 4. Verificar éxito
        await expect(page.locator('.toast')).toContainText('Préstamo realizado');
        await expect(page.locator('button:has-text("Devolver Libro")')).toBeVisible();
    });

    test('Debe mostrar el libro en "Mis Préstamos"', async ({ page }) => {
        await page.goto('/my-loans');
        // Verificar que el libro prestado aparece en la lista
        await expect(page.locator('text=El Señor de los Anillos')).toBeVisible();
        // Verificar estado "Activo"
        await expect(page.locator('.badge:has-text("Activo")').first()).toBeVisible();
    });

    test('Debe permitir devolver un libro', async ({ page }) => {
        await page.goto('/my-loans');

        // Encontrar el botón de devolver del libro específico
        const loanCard = page.locator('.card', { hasText: 'El Señor de los Anillos' });
        const returnBtn = loanCard.locator('button:has-text("Devolver")');

        await returnBtn.click();

        // Verificar toast y desaparición
        await expect(page.locator('.toast')).toContainText('Libro devuelto');
        await expect(loanCard).not.toBeVisible();
    });

    test.afterAll(async ({ request }) => {
        // Cleanup: Asegurar que el usuario de test no tenga préstamos pendientes
        // Call backend API directy to cleanup
    });
});
