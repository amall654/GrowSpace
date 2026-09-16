const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    localStorage.setItem('growspace-dashboard-v2', JSON.stringify({ tasks: [{ title: 'PRIVATE_ACCOUNT_SENTINEL' }] }));
    localStorage.setItem('account-draft-test', 'PRIVATE_DRAFT_SENTINEL');
    window.previewStorageCalls = [];
    for (const method of ['getItem', 'setItem', 'removeItem', 'clear', 'key']) {
      Storage.prototype[method] = function () { window.previewStorageCalls.push(method); throw new Error('Preview accessed browser storage'); };
    }
    if (window.indexedDB) window.indexedDB.open = function () { window.previewStorageCalls.push('indexedDB'); throw new Error('Preview opened IndexedDB'); };
  });
  const page = await context.newPage();
  const errors = [], external = [], writes = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => {
    const r = route.request();
    if (!r.url().startsWith('http://127.0.0.1:4173/')) { external.push(new URL(r.url()).hostname); return route.abort(); }
    if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.method());
    return route.continue();
  });
  const readOnly = async () => {
    assert.equal(await page.locator('input,textarea,select,form,[contenteditable=true]').count(), 0);
    assert.equal(await page.getByText(/PRIVATE_.*SENTINEL/).count(), 0);
    assert.deepEqual(await page.evaluate(() => window.previewStorageCalls), []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  };
  for (const path of ['/preview/', '/demo/']) {
    await page.goto('http://127.0.0.1:4173' + path);
    await page.getByRole('heading', { name: 'معاينة لوحة الطالب' }).waitFor();
    for (const tab of ['المهام', 'المواد', 'المحاضرات والاختبارات', 'التذكيرات', 'المكتبة', 'لوحة الطالب']) {
      await page.locator('aside').getByRole('button', { name: tab, exact: true }).click(); await readOnly();
    }
    await page.locator('aside').getByRole('button', { name: 'المهام', exact: true }).click();
    assert.equal(await page.locator('[data-preview-task]').count(), 6);
    await page.getByRole('button', { name: 'المكتملة', exact: true }).click();
    assert.equal(await page.locator('[data-preview-task]').count(), 2);
    await page.getByRole('button', { name: 'English', exact: true }).click();
    assert.equal(await page.locator('html').getAttribute('dir'), 'ltr'); await readOnly();
    await page.reload();
    await page.getByRole('heading', { name: 'معاينة لوحة الطالب' }).waitFor();
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl'); await readOnly();
  }
  await page.screenshot({path:'C:/Users/HP/Documents/project/tmp/preview-desktop.png',fullPage:true});
  await page.setViewportSize({width:360,height:800});
  for (const tab of ['المهام', 'المواد', 'المحاضرات والاختبارات', 'التذكيرات', 'المكتبة', 'لوحة الطالب']) {
    await page.locator('nav.lg\\:hidden').getByRole('button', {name:tab,exact:true}).click(); await readOnly();
  }
  await page.screenshot({path:'C:/Users/HP/Documents/project/tmp/preview-mobile.png',fullPage:true});
  await page.getByRole('button', {name:'English',exact:true}).click(); await readOnly();
  await page.screenshot({path:'C:/Users/HP/Documents/project/tmp/preview-mobile-en.png',fullPage:true});
  assert.equal(await page.getByRole('link', {name:'Create an account',exact:true}).getAttribute('href'), '/login/');
  assert.deepEqual(errors, []); assert.deepEqual(external, []); assert.deepEqual(writes, []);
  assert.deepEqual(await context.cookies(), []);
  const homeContext = await browser.newContext();
  await homeContext.addInitScript(() => localStorage.setItem('growspace-dashboard-v2', JSON.stringify({tasks:[{id:'private',title:'PRIVATE_ACCOUNT_SENTINEL',done:false,due:'2026-09-08'}]})));
  const home = await homeContext.newPage();
  const homeExternal = [];
  await home.route('**/*', route => {
    if (!route.request().url().startsWith('http://127.0.0.1:4173/')) { homeExternal.push('external'); return route.abort(); }
    return route.continue();
  });
  await home.goto('http://127.0.0.1:4173/');
  const card = home.getByRole('region', {name:'نموذج لوحة الطالب'});
  await card.waitFor();
  assert.equal(await card.locator('input,textarea,form,button').count(), 0);
  assert.equal(await home.getByText('PRIVATE_ACCOUNT_SENTINEL').count(), 0);
  assert.equal(await card.getByRole('link').getAttribute('href'), '/preview/');
  assert.deepEqual(homeExternal, []);
  await homeContext.close();
  const report = {routes:['/preview/','/demo/'],languages:['ar','en'],widths:[360,1440],sections:6,forms:0,storageCalls:0,externalRequests:0,writeRequests:0,pageErrors:0,filters:'6 total / 2 completed',reload:'fixed examples; view state reset'};
  fs.writeFileSync('C:/Users/HP/Documents/project/tmp/preview-qa.json', JSON.stringify(report,null,2)); console.log(report);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
