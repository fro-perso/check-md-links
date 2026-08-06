#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const file = process.argv[2] ?? 'README.md';
let markdown;
try {
  markdown = await readFile(file, 'utf8');
} catch (error) {
  console.error(`❌ Impossible de lire ${file} : ${error.message}`);
  process.exit(1);
}

const urls = [...new Set(
  [...markdown.matchAll(/https?:\/\/[^\s<>"']+/g)]
    .map(([url]) => url.replace(/[\]),.;:!?]+$/, '')),
)];

console.log(`🔎 Vérification de ${urls.length} lien(s) dans ${file}\n`);
let failures = 0;

for (const url of urls) {
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10_000) });
    await response.body?.cancel();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log(`✅ ${url}`);
  } catch (error) {
    failures += 1;
    console.log(`❌ ${url} (${error.message})`);
  }
}

console.log(`\n${failures ? `❌ ${failures} lien(s) cassé(s)` : '✅ Tous les liens sont valides'}`);
if (failures) process.exit(1);
