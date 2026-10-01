// QA visual: captura fotogramas de la secuencia del preloader → hero
import { chromium } from 'playwright';
const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa';
const vp = process.argv[2] === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const b = await chromium.launch();
const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
const errors = [];
p.on('pageerror', e => errors.push(e.message)); p.on('console', m => m.type() === 'error' && errors.push(m.text()));
await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
const t0 = Date.now();
for (const t of [600, 1500, 2600, 3400, 4300, 5600, 6600, 8200]) {
  await p.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
  await p.screenshot({ path: `${out}/${process.argv[2] || 'desktop'}-pre-${t}.png` });
}
console.log('errors:', errors);
await b.close();
