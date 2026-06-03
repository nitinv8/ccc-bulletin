#!/usr/bin/env node
/**
 * CCC Bulletin Parser
 *
 * Usage:
 *   node scripts/parse-bulletin.mjs <heyzine-url> [bulletin-id]
 *
 * Example:
 *   node scripts/parse-bulletin.mjs https://heyzine.com/flip-book/027fd718e1.html may-2026
 *
 * This script:
 *   1. Opens the heyzine flipbook in a headless browser
 *   2. Finds the PDF URL from the page
 *   3. Extracts all text from the PDF
 *   4. Saves raw text to scripts/raw-text/<id>.txt
 *   5. Uses the Anthropic API (if ANTHROPIC_API_KEY is set) to structure the text into JSON
 *   6. Merges the new bulletin into src/data/bulletins.json
 *
 * Prerequisites:
 *   npm install puppeteer
 *   (optional) Set ANTHROPIC_API_KEY env variable for auto-structuring
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "src", "data", "bulletins.json");
const RAW_DIR = path.join(__dirname, "raw-text");

// ─── Helpers ───────────────────────────────────────────────────────

function usage() {
  console.log(`
  CCC Bulletin Parser

  Usage:
    node scripts/parse-bulletin.mjs <heyzine-url> [bulletin-id]

  Arguments:
    heyzine-url   The full URL to the heyzine flipbook (required)
    bulletin-id   An ID for this bulletin, e.g. "jun-2026" (optional, auto-generated)

  Environment:
    ANTHROPIC_API_KEY   If set, auto-structures text into JSON via Claude API

  Examples:
    node scripts/parse-bulletin.mjs https://heyzine.com/flip-book/027fd718e1.html
    node scripts/parse-bulletin.mjs https://heyzine.com/flip-book/abc123.html jun-2026
  `);
  process.exit(1);
}

function generateId(url) {
  const now = new Date();
  const months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  return `${months[now.getMonth()]}-${now.getFullYear()}`;
}

// ─── Step 1: Extract PDF URL from Heyzine ──────────────────────────

async function extractPdfUrl(page, heyzineUrl) {
  console.log("📖 Loading heyzine flipbook...");
  await page.goto(heyzineUrl, { waitUntil: "networkidle2", timeout: 60000 });

  // Wait for scripts to load
  await page.waitForFunction(() => window.hzpdf && window.hzpdf.pdfFile, {
    timeout: 30000,
  });

  const pdfUrl = await page.evaluate(() => {
    if (window.hzpdf && window.hzpdf.pdfFile) {
      return window.hzpdf.pdfFile;
    }
    // Fallback: look in script tags
    const scripts = document.querySelectorAll("script");
    for (const s of scripts) {
      const match = s.textContent.match(/pdfFile\s*[:=]\s*["']([^"']+\.pdf)["']/);
      if (match) return match[1];
    }
    return null;
  });

  if (!pdfUrl) throw new Error("Could not find PDF URL in the heyzine page");

  // Make absolute
  const absoluteUrl = pdfUrl.startsWith("http")
    ? pdfUrl
    : `https://cdnc.heyzine.com${pdfUrl}`;

  console.log(`📄 Found PDF: ${absoluteUrl}`);
  return absoluteUrl;
}

// ─── Step 2: Extract Text from PDF ─────────────────────────────────

async function extractPdfText(page, pdfUrl) {
  console.log("📝 Extracting text from PDF...");

  const text = await page.evaluate(async (url) => {
    // Use the pdfjsLib already loaded by heyzine
    const lib = window.pdfjsLib;
    if (!lib) throw new Error("pdfjsLib not available");

    const pdf = await lib.getDocument(url).promise;
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const content = await pg.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      pages.push(`--- PAGE ${i} ---\n${pageText}`);
    }

    return pages.join("\n\n");
  }, pdfUrl);

  console.log(`✅ Extracted text from ${text.split("--- PAGE").length - 1} pages`);
  return text;
}

// ─── Step 3: Structure with Claude API ─────────────────────────────

async function structureWithClaude(rawText, bulletinId) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  console.log("🤖 Structuring with Claude API...");

  const prompt = `You are parsing a school Career Counselling Centre (CCC) Weekly Bulletin from The Shri Ram School.
The bulletin contains programs, events, competitions, internships, and summer programs for students of grades 8-12.

Extract ALL programs/events from the text below and return a JSON object with this exact structure:

{
  "id": "${bulletinId}",
  "title": "Career Counselling Centre Weekly Bulletin",
  "month": "<MONTH YEAR, e.g. MAY 2026>",
  "source": "<heyzine URL>",
  "contact": "<contact email from the bulletin>",
  "school": "The Shri Ram School, Aravali & Moulsari",
  "programs": [
    {
      "id": "<kebab-case-short-id>",
      "title": "<program title>",
      "type": "<one of: Summer Program, Competition, Workshop, Internship, In-Person Session, Virtual Session, Podcast, Information>",
      "category": "<university-visits OR future-ready>",
      "campus": "SAR & ML",
      "grades": "<e.g. 9-12, 8-10, 11-12>",
      "audience": "<e.g. Students of Grades 9 to 12>",
      "overview": "<1-2 sentence summary>",
      "date": "<if mentioned>",
      "deadline": "<if mentioned>",
      "venue": "<if mentioned>",
      "time": "<if mentioned>",
      "mode": "<Online, In-Person, or Online/In-Person>",
      "tags": ["<3-4 relevant tags>"]
    }
  ]
}

Rules:
- "category" should be "university-visits" for university visits, admissions sessions, and CCC initiatives. Everything else is "future-ready".
- Omit optional fields (date, deadline, venue, time) if not mentioned rather than setting them to null.
- Each program ID should be a short, descriptive kebab-case string.
- Return ONLY valid JSON, no markdown, no explanation.

RAW BULLETIN TEXT:
${rawText}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const jsonText = data.content[0].text.trim();

  // Parse and validate
  const bulletin = JSON.parse(jsonText);
  console.log(`✅ Structured ${bulletin.programs.length} programs`);
  return bulletin;
}

// ─── Step 4: Merge into bulletins.json ─────────────────────────────

function mergeBulletin(newBulletin) {
  let data = { bulletins: [] };
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  }

  // Replace existing bulletin with same ID, or append
  const idx = data.bulletins.findIndex((b) => b.id === newBulletin.id);
  if (idx >= 0) {
    data.bulletins[idx] = newBulletin;
    console.log(`🔄 Updated existing bulletin: ${newBulletin.id}`);
  } else {
    data.bulletins.unshift(newBulletin); // newest first
    console.log(`➕ Added new bulletin: ${newBulletin.id}`);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`💾 Saved to ${DATA_FILE}`);
}

// ─── Main ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help") usage();

  const heyzineUrl = args[0];
  const bulletinId = args[1] || generateId(heyzineUrl);

  if (!heyzineUrl.includes("heyzine.com")) {
    console.error("❌ Please provide a valid heyzine.com URL");
    process.exit(1);
  }

  // Ensure raw-text directory exists
  if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Extract PDF URL
    const pdfUrl = await extractPdfUrl(page, heyzineUrl);

    // Extract text
    const rawText = await extractPdfText(page, pdfUrl);

    // Save raw text
    const rawFile = path.join(RAW_DIR, `${bulletinId}.txt`);
    fs.writeFileSync(rawFile, rawText);
    console.log(`💾 Raw text saved to ${rawFile}`);

    // Try auto-structuring with Claude
    const bulletin = await structureWithClaude(rawText, bulletinId);

    if (bulletin) {
      bulletin.source = heyzineUrl;
      mergeBulletin(bulletin);
      console.log("\n🎉 Done! New bulletin is ready. Run 'npm run build' or push to GitHub to deploy.");
    } else {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Raw text extracted! Next steps:

  Option A — Auto-structure (recommended):
    Set your Anthropic API key and re-run:
    ANTHROPIC_API_KEY=sk-... node scripts/parse-bulletin.mjs ${heyzineUrl} ${bulletinId}

  Option B — Manual structuring:
    1. Open ${rawFile}
    2. Copy the text into Claude (claude.ai or Cowork)
    3. Ask Claude to structure it using the template in scripts/TEMPLATE.md
    4. Paste the JSON into src/data/bulletins.json
    5. Run 'git push' to deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
