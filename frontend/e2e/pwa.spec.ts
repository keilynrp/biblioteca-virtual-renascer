import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
    test('Debe tener un Web App Manifest válido', async ({ page }) => {
        await page.goto('/');

        const manifestLink = page.locator('link[rel="manifest"]');
        await expect(manifestLink).toHaveCount(1);

        const manifestUrl = await manifestLink.getAttribute('href');
        const response = await page.request.get(manifestUrl!);
        expect(response.status()).toBe(200);

        const manifest = await response.json();
        expect(manifest.name).toBe('Biblioteca Virtual Renascer do Saber');
        expect(manifest.start_url).toBe('/');
        expect(manifest.display).toBe('standalone');
    });

    test('Debe tener configurados los meta tags de Apple Mobile', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
        await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'default');
    });

    test('Debe mostrar el indicador Offline cuando no hay red', async ({ page }) => {
        await page.goto('/');

        // Verificar que inicialmente NO está visible
        const offlineIndicator = page.locator('text=Estás navegando sin conexión');
        await expect(offlineIndicator).not.toBeVisible();

        // Simular Offline
        await page.context().setOffline(true);

        // Verificar que aparece
        await expect(offlineIndicator).toBeVisible();

        // Restaurar red
        await page.context().setOffline(false);

        // Verificar que desaparece
        await expect(offlineIndicator).not.toBeVisible();
    });
});
