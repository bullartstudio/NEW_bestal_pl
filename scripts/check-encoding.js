#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'tmp_logo_scan', '.git']);
const ALLOWED_EXT = new Set(['.html', '.css', '.js', '.json', '.md', '.xml', '.txt']);

// Frequent mojibake markers for UTF-8/CP1250/Latin-1 mixups.
const MOJIBAKE_PATTERNS = [
  /\u00C3./u,
  /\u00C4./u,
  /\u00C5./u,
  /\u00C2./u,
  /\u00E2\u20AC./u,
  /\u00E2\u20AC\u2122/u,
  /\u00E2\u20AC\u0153/u,
  /\u00E2\u20AC\u009d/u,
  /\u00E2\u20AC\u201C/u,
  /\u00E2\u20AC\u201D/u
];

function walk(dir, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (ALLOWED_EXT.has(ext)) out.push(fullPath);
  }
}

function hasInWordQuestionMark(content) {
  // Detects e.g. "ruroci?gów", "jako?ć", not regular sentence question marks.
  return /\p{L}\?\p{L}/u.test(content);
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath).replaceAll('\\', '/');
  const issues = [];

  if (content.includes('\uFFFD')) {
    issues.push('contains replacement character U+FFFD');
  }

  for (const pattern of MOJIBAKE_PATTERNS) {
    if (pattern.test(content)) {
      issues.push(`contains mojibake pattern ${pattern}`);
      break;
    }
  }

  // "?" inside words is meaningful mainly for CMS text data (content corruption).
  const isCmsJson = rel.startsWith('cms/data/') && rel.endsWith('.json');
  if (isCmsJson && hasInWordQuestionMark(content)) {
    issues.push('contains "?" inside words (possible lost diacritics)');
  }

  return { rel, issues };
}

function main() {
  const files = [];
  walk(ROOT, files);

  let failures = 0;
  for (const file of files) {
    const result = analyzeFile(file);
    if (result.issues.length) {
      failures += 1;
      console.log(`[FAIL] ${result.rel}`);
      for (const issue of result.issues) {
        console.log(`  - ${issue}`);
      }
    }
  }

  if (failures) {
    console.log(`\nEncoding QA failed in ${failures} file(s).`);
    process.exit(1);
  }

  console.log('Encoding QA passed.');
}

main();
