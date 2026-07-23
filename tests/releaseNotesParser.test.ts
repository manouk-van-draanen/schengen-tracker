import { describe, expect, it } from 'vitest';
import { parseReleaseNotes } from '../src/utils/releaseNotesParser';

describe('parseReleaseNotes', () => {
  it('parses markdown releases and bullet changes', () => {
    const markdown = `# Release Notes\n\n## [1.0.1] - July 21, 2026\n- First change\n- Second change\n\n## [1.0.0] - July 10, 2026\n* Initial release`;

    const parsed = parseReleaseNotes(markdown);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].version).toBe('1.0.1');
    expect(parsed[0].date).toBe('July 21, 2026');
    expect(parsed[0].changes).toEqual(['First change', 'Second change']);
    expect(parsed[1].version).toBe('1.0.0');
    expect(parsed[1].changes).toEqual(['Initial release']);
  });

  it('ignores bullet points before the first release header', () => {
    const markdown = `- Random bullet\n## 1.0.0 - July 10, 2026\n- App launch`;
    const parsed = parseReleaseNotes(markdown);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].version).toBe('1.0.0');
    expect(parsed[0].changes).toEqual(['App launch']);
  });
});