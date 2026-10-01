// Une capturas de QA en una grilla: node scripts/qa-sheet.mjs <prefijo> <columnas> <ancho celda>
import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
const dir = process.env.TEMP.split(String.fromCharCode(92)).join('/') + '/qa';
const [prefix, cols = '4', w = '360'] = process.argv.slice(2);
const files = readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.png') && !f.includes('sheet')).sort((a, b) => parseInt(a.match(/(\d+)\.png$/)?.[1] ?? 0) - parseInt(b.match(/(\d+)\.png$/)?.[1] ?? 0));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: cols * (+w + 8) + 8, height: 400 } });
await p.setContent(`<body style="margin:0;padding:4px;background:#111;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px;font:12px sans-serif;color:#fff">${files.map(f => `<figure style="margin:0"><img style="width:${w}px;display:block" src="data:image/png;base64,${readFileSync(dir + '/' + f).toString('base64')}"><figcaption>${f}</figcaption></figure>`).join('')}</body>`);
await p.screenshot({ path: `${dir}/${prefix}-sheet.png`, fullPage: true }); await b.close();
