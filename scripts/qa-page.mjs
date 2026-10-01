// QA visual: recorre secciones y prueba el menú. node scripts/qa-page.mjs [desktop|mobile]
import { chromium } from 'playwright';
const out = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa';
const name = process.argv[2] || 'desktop';
const vp = name === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const b = await chromium.launch();
const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1, hasTouch: name === 'mobile', isMobile: name === 'mobile' });
const errors = [];
p.on('pageerror', e => errors.push(e.message)); p.on('console', m => m.type() === 'error' && errors.push(m.text()));
await p.goto('http://localhost:4173/', { waitUntil: 'load' });
await p.waitForTimeout(9500);
const shot = (n) => p.screenshot({ path: `${out}/${name}-page-${n}.png` });
let i = 0;
const scrollTo = async (y) => { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(1800); };
for (const id of ['inicio', 'nosotros', 'servicios', 'proceso', 'planes', 'casos', 'founder', 'contacto']) {
  const top = await p.evaluate(id => document.getElementById(id).offsetTop, id);
  await scrollTo(top + (id === 'nosotros' ? 300 : 0));
  await shot(String(++i).padStart(2, '0') + 0);
  if (id === 'proceso') { const h = await p.evaluate(() => document.getElementById('proceso').offsetHeight); await scrollTo(top + h * 0.55); await shot(String(i).padStart(2, '0') + 5); }
  if (id === 'planes' || id === 'casos' || id === 'servicios') { await scrollTo(top + vp.height * 1.1); await shot(String(i).padStart(2, '0') + 5); }
}
const footerTop = await p.evaluate(() => document.querySelector('footer').offsetTop);
await scrollTo(footerTop); await shot('900');
// Menú desde el medio de la página
const mid = await p.evaluate(() => document.getElementById('servicios').offsetTop + 200);
await scrollTo(mid);
await p.click('button[aria-controls="menu-panel"]');
await p.waitForTimeout(500); await shot('910');
await p.waitForTimeout(1800); await shot('920');
if (name !== 'mobile') { await p.hover('[data-menu-item]:nth-child(3) a'); await p.waitForTimeout(900); await shot('930'); }
const state = await p.evaluate(() => ({ expanded: document.querySelector('button[aria-controls]').getAttribute('aria-expanded'), focus: document.activeElement?.textContent?.slice(0, 20) }));
await p.click('[data-menu-item]:nth-child(4) a');
await p.waitForTimeout(700); await shot('940');
await p.waitForTimeout(1600); await shot('950');
const after = await p.evaluate(() => ({ y: Math.round(scrollY), planes: document.getElementById('planes').offsetTop, focus: document.activeElement?.getAttribute('aria-label') }));
console.log('menu state', state, 'after close', after, 'errors:', errors);
await b.close();
