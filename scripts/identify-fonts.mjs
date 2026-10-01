// Identifica las fuentes de Canva (tabla `name` vaciada) comparando su render contra candidatas de Google Fonts.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const FILES = {
  'YAFdtQi73Xs_0 (400)': 'reference/fonts/YAFdtQi73Xs_0-400.woff',
  'YAFdtQi73Xs_0 (700)': 'reference/fonts/YAFdtQi73Xs_0-700.woff',
  'YAFdJn5d8s0_0 (400)': 'reference/fonts/YAFdJn5d8s0_0-400.woff',
  'YAFdJn5d8s0_0 (700)': 'reference/fonts/YAFdJn5d8s0_0-700.woff',
  'YAEnXHTFXhg_0': 'reference/fonts/YAEnXHTFXhg_0-700.woff',
};
function os2(buf) {
  const n = buf.readUInt16BE(12);
  for (let i = 0; i < n; i++) {
    const e = 44 + i * 20, tag = buf.toString('latin1', e, e + 4);
    if (tag !== 'OS/2') continue;
    const off = buf.readUInt32BE(e + 4), comp = buf.readUInt32BE(e + 8), orig = buf.readUInt32BE(e + 12);
    const t = comp < orig ? inflateSync(buf.subarray(off, off + comp)) : buf.subarray(off, off + comp);
    return { weight: t.readUInt16BE(4), width: t.readUInt16BE(6), vendor: t.toString('latin1', 58, 62) };
  }
}
const CANDIDATES = ['Montserrat', 'Inter', 'Inter Tight', 'Poppins', 'Roboto', 'Open Sans', 'League Spartan', 'DM Sans', 'Manrope', 'Archivo', 'Arimo', 'Instrument Sans', 'Figtree', 'Plus Jakarta Sans', 'Work Sans', 'Raleway', 'Nunito Sans', 'Public Sans', 'Lato', 'Libre Franklin', 'Rubik', 'Barlow', 'Urbanist', 'Outfit', 'Sora', 'Lexend', 'Hanken Grotesk', 'Schibsted Grotesk', 'Bricolage Grotesque', 'Onest', 'Geist', 'Albert Sans', 'Red Hat Display', 'Questrial', 'Glacial Indifference'];
const SAMPLE = 'Hagamos crecer tus redes. Recibí una asesoría 1:1 1987';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 200 } });
const css = CANDIDATES.map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&');
await p.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${css}&display=block"><canvas id=c width=1400 height=120></canvas>`);
await p.waitForTimeout(3000);
const report = {};
for (const [label, file] of Object.entries(FILES)) {
  const buf = readFileSync(file);
  const meta = os2(buf);
  const b64 = buf.toString('base64');
  const weight = meta.weight >= 600 ? 700 : 400;
  const scores = await p.evaluate(async ({ b64, CANDIDATES, SAMPLE, weight }) => {
    const ff = new FontFace('Unknown', `url(data:font/woff;base64,${b64})`, { weight: String(weight) });
    await ff.load(); document.fonts.add(ff);
    await Promise.all(CANDIDATES.map(c => document.fonts.load(`${weight} 64px "${c}"`).catch(() => null)));
    const c = document.getElementById('c'), x = c.getContext('2d', { willReadFrequently: true });
    const draw = (fam) => { x.clearRect(0, 0, 1400, 120); x.font = `${weight} 64px "${fam}"`; x.fillStyle = '#000'; x.fillText(SAMPLE, 0, 80); return { d: x.getImageData(0, 0, 1400, 120).data, w: x.measureText(SAMPLE).width }; };
    const ref = draw('Unknown');
    return CANDIDATES.filter(f => document.fonts.check(`${weight} 64px "${f}"`)).map(f => {
      const o = draw(f); let inter = 0, uni = 0;
      for (let i = 3; i < ref.d.length; i += 4) { const a = ref.d[i] > 127, bb = o.d[i] > 127; if (a && bb) inter++; if (a || bb) uni++; }
      return { font: f, iou: +(inter / uni).toFixed(3), widthRatio: +(o.w / ref.w).toFixed(3) };
    }).sort((a, b) => b.iou - a.iou).slice(0, 4);
  }, { b64, CANDIDATES, SAMPLE, weight });
  report[label] = { ...meta, top: scores };
}
writeFileSync('reference/font-identification.json', JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
await b.close();
