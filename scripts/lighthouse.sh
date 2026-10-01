#!/usr/bin/env bash
# Lighthouse contra el preview (npm run build && npm run preview). Uso: bash scripts/lighthouse.sh [mobile|desktop] [salida.json]
MODE="${1:-mobile}"
OUT="${2:-$TEMP/qa/lh-$MODE.json}"
export CHROME_PATH=$(node -e "const {chromium}=require('playwright');console.log(chromium.executablePath())")
EXTRA=""
[ "$MODE" = "desktop" ] && EXTRA="--preset=desktop"
npx --yes lighthouse@12 http://localhost:4173/ --quiet $EXTRA --chrome-flags="--headless=new" \
  --only-categories=performance,accessibility,best-practices,seo --output=json --output-path="$OUT" >/dev/null 2>&1
node -e "
const r=require(process.argv[1]);
console.log(Object.entries(r.categories).map(([k,v])=>k+' '+Math.round(v.score*100)).join(' · '));
console.log(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(id=>id.replace(/-/g,' ')+': '+r.audits[id].displayValue).join(' · '));
" "$OUT"
