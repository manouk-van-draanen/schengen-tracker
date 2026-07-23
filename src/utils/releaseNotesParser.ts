import { ReleaseNotesItem } from '../types';

/**
 * Parses standard Markdown release notes files into structured ReleaseNotesItem objects.
 * Matches lines like: ## [1.0.2] - July 21, 2026
 * And list items like: - Improved rolling window calculator.
 */
export function parseReleaseNotes(mdText: string): ReleaseNotesItem[] {
  const items: ReleaseNotesItem[] = [];
  const lines = mdText.split(/\r?\n/);
  let currentItem: ReleaseNotesItem | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match header like: ## [1.0.2] - July 21, 2026 or ## 1.0.2 - July 21, 2026
    const headerMatch = trimmed.match(/^##\s+\[?([0-9.]+)\]?\s*-\s*(.+)$/);
    if (headerMatch) {
      if (currentItem) {
        items.push(currentItem);
      }
      currentItem = {
        version: headerMatch[1],
        date: headerMatch[2].trim(),
        changes: []
      };
    } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      if (currentItem) {
        const changeText = trimmed.replace(/^[-*]\s*/, '').trim();
        if (changeText) {
          currentItem.changes.push(changeText);
        }
      }
    }
  }

  if (currentItem) {
    items.push(currentItem);
  }

  return items;
}