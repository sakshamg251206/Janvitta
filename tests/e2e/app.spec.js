import { expect, test } from '@playwright/test';

/**
 * Fill the form for a small farmer in a village.
 * @param {import('@playwright/test').Page} page
 */
async function fillFarmerProfile(page) {
  await page.getByLabel('Your age').fill('42');
  await page.getByRole('radio', { name: 'Male', exact: true }).check();
  await page.getByRole('radio', { name: 'Farmer', exact: true }).check();
  await page.getByLabel('Annual family income').fill('1,50,000');
  await page.getByRole('radio', { name: 'OBC', exact: true }).check();
  await page.getByRole('radio', { name: 'Village / rural', exact: true }).check();
  await page.getByRole('switch', { name: /I own agricultural land/ }).check();
}

test.beforeEach(async ({ page }) => {
  // Keep tests independent of third-party font loading.
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Show my schemes' })).toBeEnabled();
});

test('explains what the app does before asking anything', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find the government schemes you qualify for');
  await expect(page.getByText(/central government schemes/)).toBeVisible();
  await expect(page.getByText('Your answers stay in this browser.', { exact: false })).toBeVisible();
});

test('shows accessible validation errors for an empty form', async ({ page }) => {
  await page.getByRole('button', { name: 'Show my schemes' }).click();
  const summary = page.getByRole('alert');
  await expect(summary).toBeFocused();
  await expect(summary.getByRole('listitem')).toHaveCount(6);
  await expect(page.getByLabel('Your age')).toHaveAttribute('aria-invalid', 'true');

  await summary.getByRole('link', { name: /Enter your age/ }).click();
  await expect(page.getByLabel('Your age')).toBeFocused();
  await page.getByLabel('Your age').fill('30');
  await expect(page.locator('#age-error')).toBeEmpty();
});

test('finds schemes for a farmer and explains them, without any network call', async ({ page }) => {
  /** @type {string[]} */
  const apiCalls = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/')) apiCalls.push(req.url());
  });

  await fillFarmerProfile(page);
  await expect(page.locator('#income-preview')).toHaveText('₹1,50,000 (₹1.5 lakh) per year');
  await page.getByRole('button', { name: 'Show my schemes' }).click();

  await expect(page.getByRole('heading', { name: 'Your results' })).toBeFocused();
  await expect(page.locator('#stat-cash')).toHaveText('₹6,000');

  const pmKisan = page.locator('[data-scheme-id="pm-kisan"]');
  await expect(pmKisan.getByRole('heading', { name: 'PM Kisan Samman Nidhi' })).toBeVisible();
  await expect(pmKisan.getByRole('listitem').filter({ hasText: 'Owns agricultural land' })).toBeVisible();
  await expect(pmKisan.getByRole('link', { name: /Apply on official site/ })).toHaveAttribute(
    'href',
    'https://pmkisan.gov.in',
  );

  await pmKisan.getByText('Documents & important notes').click();
  await expect(pmKisan.getByText('Land records')).toBeVisible();

  expect(apiCalls).toEqual([]);
});

test('tabs work with the keyboard', async ({ page }) => {
  await fillFarmerProfile(page);
  await page.getByRole('button', { name: 'Show my schemes' }).click();

  const eligibleTab = page.getByRole('tab', { name: /Eligible/ }).first();
  await eligibleTab.focus();
  await page.keyboard.press('ArrowRight');
  const almostTab = page.getByRole('tab', { name: /Almost eligible/ });
  await expect(almostTab).toHaveAttribute('aria-selected', 'true');
  await expect(almostTab).toBeFocused();
  await expect(page.locator('#panel-almost')).toBeVisible();
  await expect(page.locator('#panel-eligible')).toBeHidden();
});

test('keeps answers when editing and clears them on start over', async ({ page }) => {
  await fillFarmerProfile(page);
  await page.getByRole('button', { name: 'Show my schemes' }).click();
  await page.getByRole('button', { name: 'Edit answers' }).click();
  await expect(page.getByLabel('Your age')).toHaveValue('42');

  await page.getByRole('button', { name: 'Show my schemes' }).click();
  await page.getByRole('button', { name: 'Start over' }).click();
  await expect(page.getByLabel('Your age')).toHaveValue('');
});

test('asks about pregnancy only for women', async ({ page }) => {
  const pregnancy = page.getByRole('switch', { name: /pregnant/ });
  await expect(pregnancy).toBeHidden();
  await page.getByRole('radio', { name: 'Female', exact: true }).check();
  await expect(pregnancy).toBeVisible();
  await page.getByRole('radio', { name: 'Male', exact: true }).check();
  await expect(pregnancy).toBeHidden();
});

test('switches to Hindi, including results, and remembers the choice', async ({ page }) => {
  await fillFarmerProfile(page);
  await page.getByRole('button', { name: 'Show my schemes' }).click();

  await page.getByRole('button', { name: 'हिंदी' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
  await expect(page.getByRole('heading', { name: 'आपके परिणाम' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'पीएम किसान सम्मान निधि' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('जानिए आप किन सरकारी योजनाओं के पात्र हैं');
});

test('has no horizontal overflow', async ({ page }) => {
  await fillFarmerProfile(page);
  await page.getByRole('button', { name: 'Show my schemes' }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
