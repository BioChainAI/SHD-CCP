const { test, expect } = require('@playwright/test');

// Test doubles exercise the existing client gate without Google credentials or
// production Firestore writes. These tests do not validate live Firebase setup.
async function mockFirebase(page, accountStatus = 'allowed') {
  await page.addInitScript(status => { window.__accountStatus = status; }, accountStatus);
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://cdnjs.cloudflare.com/**', route => route.abort());
  await page.route('https://www.gstatic.com/firebasejs/**', route => {
    const path = new URL(route.request().url()).pathname;
    let body = 'export const initializeApp = config => config;';
    if (path.endsWith('firebase-auth.js')) body = `
      const auth = { currentUser: null };
      let observer;
      export const getAuth = () => auth;
      export class GoogleAuthProvider {}
      export function onAuthStateChanged(a, callback) { observer = callback; callback(null); }
      export async function signInWithPopup() {
        auth.currentUser = { uid: 'test-user', displayName: 'Test Visitor' };
        await observer(auth.currentUser);
        return { user: auth.currentUser || { displayName: 'Test Visitor' } };
      }
      export async function signOut() {
        if (window.__holdSignOut) await new Promise(resolve => { window.__resolveSignOut = resolve; });
        auth.currentUser = null; await observer(null);
      }
    `;
    if (path.endsWith('firebase-firestore.js')) body = `
      export const getFirestore = () => ({});
      export const doc = (...args) => args;
      export async function getDoc() {
        if (window.__holdAccountCheck) await new Promise(resolve => { window.__resolveAccountCheck = resolve; });
        if (window.__accountStatus === 'error') throw new Error('Test read failure');
        return { exists: () => window.__accountStatus === 'banned' };
      }
    `;
    return route.fulfill({ contentType: 'application/javascript', body });
  });
}

async function signIn(page) {
  await page.goto('/');
  await page.locator('#gate-auth-button').click();
  await expect(page.locator('#interactive-explainer')).toBeVisible();
  await expect(page.locator('#pipeline-pills button')).toHaveCount(7);
}

test('signed-out gate keeps the guide and briefing hidden', async ({ page }) => {
  await mockFirebase(page);
  await page.goto('/');
  await expect(page.locator('#auth-gate')).toBeVisible();
  await expect(page.locator('#main-content')).toBeHidden();
  await expect(page.locator('#genesis-preview')).toBeVisible();
  await expect(page.locator('#bit-grid-container button')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SHD-CCP, Explained');
});

test('guest entry works without Firebase and persists when returning from the manual', async ({ page }) => {
  await page.route('https://www.gstatic.com/**', route => route.abort());
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://cdnjs.cloudflare.com/**', route => route.abort());
  await page.goto('/');
  await page.locator('#guest-auth-button').click();
  await expect(page.locator('#interactive-explainer')).toBeVisible();
  await expect(page.locator('#user-status')).toHaveText('Guest browsing');
  await expect(page.locator('#auth-gate')).toBeHidden();
  await expect(page.locator('#pipeline-pills button')).toHaveCount(7);
  await page.locator('header a[href="manual/"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SHD-CCP: How the Protocol Works');
  await page.locator('.home-link').click();
  await expect(page.locator('#guest-browsing-note')).toBeVisible();
  await page.locator('#exit-guest-button').click();
  await expect(page.locator('#auth-gate')).toBeVisible();
  await expect(page.locator('#main-content')).toBeHidden();
});

test('guest choice wins over an older pending account check', async ({ page }) => {
  await mockFirebase(page);
  await page.goto('/');
  await page.evaluate(() => { window.__holdAccountCheck = true; window.__holdSignOut = true; });
  await page.locator('#gate-auth-button').click();
  await expect(page.locator('#gate-status')).toContainText('Checking account');
  await page.locator('#guest-auth-button').click();
  await page.evaluate(() => window.__resolveAccountCheck());
  await expect(page.locator('#user-status')).toHaveText('Guest browsing');
  await expect(page.locator('#interactive-explainer')).toBeVisible();
  await page.evaluate(() => window.__resolveSignOut());
  await expect(page.locator('#user-status')).toHaveText('Guest browsing');
});

test('manual is public with working chapter scaffolds and responsive navigation', async ({ page }) => {
  await page.goto('/manual/');
  await expect(page.locator('h1')).toHaveText('SHD-CCP: How the Protocol Works');
  await page.getByRole('navigation', { name: 'Manual chapters' }).getByRole('link', { name: '64-Bit Einstein Tile' }).click();
  await expect(page.locator('.chapter-status')).toContainText('Planned');
  await expect(page.locator('h1')).toHaveText('64-Bit Einstein Tile');
  await page.goto('/manual/');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('Genesis preview uses the real 3D module and shares bits with its seed input', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockFirebase(page);
  await page.goto('/');
  const frame = page.frameLocator('#genesis-preview');
  await expect(frame.locator('#canvas-container canvas')).toHaveCount(1);
  await expect(frame.locator('#bit-matrix button')).toHaveCount(64);
  await frame.locator('#packet-seed').fill('0000000000000000');
  await frame.locator('#apply-seed').click();
  await frame.locator('#bit-63').click();
  await expect(frame.locator('#packet-seed')).toHaveValue('0000000000000001');
  await frame.locator('#packet-seed').fill('not-a-packet');
  await frame.locator('#apply-seed').click();
  await expect(frame.locator('#packet-seed')).toHaveAttribute('aria-invalid', 'true');
  await frame.locator('#btn-topology').click();
  await expect(frame.locator('#btn-topology')).toContainText('TOROIDAL');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await frame.locator('html').evaluate(el => el.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('authorized guide supports pipeline, register, models, calculators, and reference', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockFirebase(page);
  await signIn(page);
  await expect(page.locator('#cube-canvas-container canvas')).toHaveCount(1);
  await expect(page.locator('#torus-canvas-container canvas')).toHaveCount(1);
  await page.getByRole('button', { name: 'Next Stage' }).click();
  await expect(page.locator('#pipe-stage-badge')).toContainText('2 OF 7');
  await expect(page.locator('#pipe-stage-takeaway')).not.toBeEmpty();
  const firstBit = page.locator('#bit-grid-container button').first();
  const before = await page.locator('#live-register-hex').innerText();
  await firstBit.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#live-register-hex')).not.toHaveText(before);
  await expect(page.locator('#bit-grid-container button').first()).toBeFocused();
  await page.locator('#torus-theta-slider').fill('80');
  await expect(page.locator('#torus-theta-val')).toHaveText('80°');
  await page.locator('#falcon-btn-1024').click();
  await expect(page.locator('#falcon-gen-size')).toHaveText('3,089 Bytes');
  await page.locator('#ttp-float-input').fill('2.71828');
  await expect(page.locator('#ttp-recon-val')).toContainText('2.7182800');
  await page.locator('#faq-accordion-container button').first().click();
  await expect(page.locator('#faq-body-0')).toBeHidden();
  await page.locator('[aria-controls="prompt-module-body"]').click();
  await page.locator('#builtin-prompt-select').selectOption('02_pseudo_fpga_form_modes.md');
  await expect(page.locator('#prompt-markdown-viewer')).toHaveValue(/Pseudo-FPGA/);
  await page.locator('#digital-seed-briefing summary').click();
  await expect(page.getByRole('heading', { name: 'The Master Seed Concept' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore the Geometric Engine' })).toHaveAttribute('href', 'Geometric_Engine/Geometric_Engine_Tutorial.html');
  await page.locator('#auth-button').click();
  await expect(page.locator('#main-content')).toBeHidden();
  await page.locator('#gate-auth-button').click();
  await expect(page.locator('#cube-canvas-container canvas')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('unverified account stays gated and banned account redirects', async ({ page }) => {
  await mockFirebase(page, 'error');
  await page.goto('/');
  await page.locator('#gate-auth-button').click();
  await expect(page.locator('#gate-status')).toContainText('Could not verify');
  await expect(page.locator('#main-content')).toBeHidden();
  await page.evaluate(() => { window.__accountStatus = 'banned'; });
  // The first click signs out the unverified user; the next retries sign-in.
  await page.locator('#auth-button').click();
  await page.locator('#gate-auth-button').click();
  await expect(page).toHaveURL(/access-denied\.html$/);
});

test('remote Markdown selection loads text and a failed scan restores built-ins', async ({ page }) => {
  await mockFirebase(page);
  await page.route('**/prompt-manifest.json', route => route.fulfill({
    json: [{ name: 'example.md', download_url: '/example.md' }],
  }));
  await page.route('**/example.md', route => route.fulfill({
    contentType: 'text/plain', body: '# Example prompt\nUnicode: Θ — inert <script>text</script>',
  }));
  await page.route('**/missing-manifest.json', route => route.fulfill({ status: 403, body: 'Forbidden' }));
  await signIn(page);
  await page.locator('[aria-controls="prompt-module-body"]').click();
  await page.locator('#github-folder-url').fill('/prompt-manifest.json');
  await page.getByRole('button', { name: 'Scan', exact: true }).click();
  await expect(page.locator('#prompt-markdown-viewer')).toHaveValue(/Unicode: Θ/);
  await page.locator('#github-folder-url').fill('/missing-manifest.json');
  await page.getByRole('button', { name: 'Scan', exact: true }).click();
  await expect(page.locator('#builtin-prompt-select option')).toHaveCount(5);
  await expect(page.locator('#github-scan-status')).toContainText('Using the five bundled prompts');
});

test('mobile layout, reduced motion, and no-Three fallback remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockFirebase(page);
  await page.route('**/assets/vendor/three.min.js', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await signIn(page);
  await expect(page.locator('#cube-canvas-container')).toContainText(/unavailable/i);
  await expect(page.locator('#bit-grid-container button')).toHaveCount(64);
  await page.locator('[aria-controls="prompt-module-body"]').click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await expect(page.locator('#torus-pump-btn')).toHaveAttribute('aria-pressed', 'false');
});
