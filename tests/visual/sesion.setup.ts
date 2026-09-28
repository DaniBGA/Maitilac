import { expect, test as setup } from "@playwright/test";

// Inicia sesión en el gestor una sola vez y guarda la cookie para los demás tests.
setup("iniciar sesión en el gestor", async ({ page }) => {
  await page.goto("/gestor/ingresar");
  await page.fill("#gi-email", process.env.GESTOR_PRUEBA_EMAIL!);
  await page.fill("#gi-clave", process.env.GESTOR_PRUEBA_CLAVE!);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL("/gestor");
  await page.context().storageState({ path: "tests/visual/.sesion/gestor.json" });
});
