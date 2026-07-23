import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const markdownPath = path.join(repoRoot, 'releaseNotes.md');
const appJsonPath = path.join(repoRoot, 'app.json');
const outputPath = path.join(repoRoot, 'src/content/releaseNotesData.ts');

function parseReleaseNotes(markdown) {
  const releases = [];
  let currentRelease = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();

    const headerMatch = line.match(/^## \[([^\]]+)\] - (.+)$/);
    if (headerMatch) {
      if (currentRelease) {
        releases.push(currentRelease);
      }

      currentRelease = {
        version: headerMatch[1],
        date: headerMatch[2],
        changes: [],
      };
      continue;
    }

    const changeMatch = line.match(/^-\s+(.*)$/);
    if (currentRelease && changeMatch) {
      currentRelease.changes.push(changeMatch[1]);
    }
  }

  if (currentRelease) {
    releases.push(currentRelease);
  }

  if (releases.length === 0) {
    throw new Error('No release entries found in releaseNotes.md');
  }

  return releases;
}

function formatString(value) {
  return JSON.stringify(value);
}

async function main() {
  const [markdown, appJsonText] = await Promise.all([
    readFile(markdownPath, 'utf8'),
    readFile(appJsonPath, 'utf8'),
  ]);

  const releases = parseReleaseNotes(markdown);
  const appJson = JSON.parse(appJsonText);
  const appVersion = appJson?.expo?.version;

  if (typeof appVersion !== 'string' || !appVersion.trim()) {
    throw new Error('app.json is missing expo.version');
  }

  if (releases[0].version !== appVersion) {
    console.warn(`Warning: app.json version (${appVersion}) does not match the latest release note (${releases[0].version}).`);
  }

  const lines = [];
  lines.push('/**');
  lines.push(' * @license');
  lines.push(' * SPDX-License-Identifier: Apache-2.0');
  lines.push(' *');
  lines.push(' * Generated from releaseNotes.md and app.json by scripts/generateReleaseNotesData.mjs');
  lines.push(' */');
  lines.push('');
  lines.push("import { ReleaseNotesItem } from '../types';");
  lines.push('');
  lines.push('export const RELEASE_NOTES_DATA: ReleaseNotesItem[] = [');

  for (const release of releases) {
    lines.push('  {');
    lines.push(`    version: ${formatString(release.version)},`);
    lines.push(`    date: ${formatString(release.date)},`);
    lines.push('    changes: [');
    for (const change of release.changes) {
      lines.push(`      ${formatString(change)},`);
    }
    lines.push('    ],');
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  lines.push(`export const APP_VERSION = ${formatString(appVersion)};`);
  lines.push('');

  await writeFile(outputPath, `${lines.join('\n')}`, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});