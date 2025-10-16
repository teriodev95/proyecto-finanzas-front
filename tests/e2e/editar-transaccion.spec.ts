import { test, expect } from '@playwright/test';

test.describe('Editar Transacción', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');

    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');

    // Hacer login
    console.log('Realizando login...');

    // Buscar el campo de email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await emailInput.fill('test@demo.com');

    // Buscar el campo de password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('test123');

    // Hacer clic en el botón de iniciar sesión
    const loginButton = page.locator('button:has-text("Iniciar Sesión")');
    await loginButton.click();

    // Esperar a que cargue la app después del login
    console.log('Esperando a que cargue la aplicación...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Dar tiempo para que se carguen los datos
  });

  test('debería editar una transacción existente correctamente', async ({ page }) => {
    // Paso 1: Esperar a que aparezcan las transacciones
    console.log('Esperando a que carguen las transacciones...');
    await page.waitForSelector('[class*="AccordionItem"]', { timeout: 10000 });

    // Paso 2: Encontrar y hacer clic en la primera transacción
    console.log('Buscando la primera transacción...');
    const primeraTransaccion = page.locator('[class*="cursor-pointer"]').first();
    await primeraTransaccion.waitFor({ state: 'visible' });

    // Obtener el texto original de la transacción antes de editarla
    const montoOriginal = await primeraTransaccion.locator('[class*="font-medium"]:has-text("$")').textContent();
    console.log('Monto original:', montoOriginal);

    await primeraTransaccion.click();

    // Paso 3: Esperar a que se abra el diálogo de edición
    console.log('Esperando que se abra el diálogo de edición...');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Verificar que el título sea "Editar transacción"
    await expect(dialog.locator('h2')).toContainText('Editar transacción');

    // Paso 4: Cambiar el monto
    console.log('Cambiando el monto...');
    const montoInput = dialog.locator('input[type="number"]');
    await montoInput.waitFor({ state: 'visible' });

    // Limpiar el campo y escribir un nuevo valor
    await montoInput.click({ clickCount: 3 }); // Seleccionar todo el texto
    await montoInput.fill('250');

    // Verificar que el valor se haya actualizado
    const nuevoValor = await montoInput.inputValue();
    console.log('Nuevo valor en input:', nuevoValor);
    expect(nuevoValor).toBe('250');

    // Paso 5: Capturar logs de la consola antes de hacer clic
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('Console:', text);
    });

    // Paso 6: Hacer clic en el botón "Guardar cambios"
    console.log('Buscando botón "Guardar cambios"...');
    const botonGuardar = dialog.locator('button[type="submit"]');
    await expect(botonGuardar).toBeVisible();
    await expect(botonGuardar).toHaveText(/Guardar cambios/);

    console.log('Haciendo clic en "Guardar cambios"...');
    await botonGuardar.click();

    // Paso 7: Esperar un momento para que se ejecute el JavaScript
    await page.waitForTimeout(2000);

    // Paso 8: Verificar los logs de la consola
    console.log('\n=== LOGS DE LA CONSOLA ===');
    consoleLogs.forEach(log => console.log(log));
    console.log('=========================\n');

    // Verificar que se hayan ejecutado los logs esperados
    const tieneLogClick = consoleLogs.some(log => log.includes('Click en botón de submit'));
    const tieneLogFormSubmit = consoleLogs.some(log => log.includes('Form onSubmit event triggered'));
    const tieneLogOnSubmit = consoleLogs.some(log => log.includes('onSubmit llamado'));

    console.log('¿Detectó click en botón?', tieneLogClick);
    console.log('¿Se disparó form onSubmit?', tieneLogFormSubmit);
    console.log('¿Se llamó a onSubmit?', tieneLogOnSubmit);

    // Paso 9: Verificar que el diálogo se cierre (esto indicaría que guardó correctamente)
    // O verificar que aparezca algún mensaje de error
    try {
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
      console.log('✅ El diálogo se cerró correctamente');
    } catch (error) {
      console.log('❌ El diálogo NO se cerró - posible error en el guardado');

      // Tomar screenshot para debug
      await page.screenshot({ path: 'tests/screenshots/error-editar-transaccion.png', fullPage: true });

      throw new Error('El diálogo no se cerró después de intentar guardar. Logs capturados: ' + JSON.stringify(consoleLogs, null, 2));
    }
  });

  test('debería mostrar logs de debugging al intentar editar', async ({ page }) => {
    // Este test solo captura los logs para debugging
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
      consoleLogs.push(`[${msg.type()}] ${text}`);
    });

    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });

    // Navegar y esperar
    await page.waitForSelector('[class*="AccordionItem"]', { timeout: 10000 });

    // Click en transacción
    await page.locator('[class*="cursor-pointer"]').first().click();

    // Esperar diálogo
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Cambiar monto
    const montoInput = dialog.locator('input[type="number"]');
    await montoInput.fill('999');

    // Click en guardar
    await dialog.locator('button[type="submit"]').click();

    // Esperar
    await page.waitForTimeout(3000);

    // Imprimir todos los logs
    console.log('\n========== TODOS LOS LOGS ==========');
    consoleLogs.forEach(log => console.log(log));
    console.log('====================================\n');

    if (consoleErrors.length > 0) {
      console.log('\n========== ERRORES ENCONTRADOS ==========');
      consoleErrors.forEach(error => console.log(error));
      console.log('=========================================\n');
    }

    // Este test siempre pasa, solo es para capturar logs
    expect(true).toBe(true);
  });
});
