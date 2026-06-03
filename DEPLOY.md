# CCC Bulletin — Setup & Workflow

## First-time setup

```bash
cd ccc-bulletin
npm install
npm install puppeteer    # for the parser script
```

## Adding a new bulletin

### Option A: Automated (with Anthropic API key)

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run parse https://heyzine.com/flip-book/XXXX.html jun-2026
git add -A && git commit -m "Add June 2026 bulletin" && git push
```

Vercel auto-deploys on push.

### Option B: Semi-automated

```bash
# 1. Extract raw text
npm run parse https://heyzine.com/flip-book/XXXX.html jun-2026

# 2. Open scripts/raw-text/jun-2026.txt
# 3. Paste into Claude with the template in scripts/TEMPLATE.md
# 4. Copy the JSON output into src/data/bulletins.json
# 5. Push to deploy
git add -A && git commit -m "Add June 2026 bulletin" && git push
```

### Option C: Via Cowork

Just paste the heyzine link in Cowork and say "Add this new bulletin to the CCC website" — Claude will handle the rest.

## Local development

```bash
npm run dev    # http://localhost:3000
```

## Deploy

Connected to Vercel via GitHub — auto-deploys on push to main.
Live URL: https://ccc-bulletin-vert.vercel.app
