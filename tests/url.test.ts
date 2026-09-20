import { describe, expect, it } from 'vitest';
import { isDisneyPlusUrl } from '../src/shared/url';

describe('isDisneyPlusUrl', () => {
  it('accepts Disney+ HTTPS pages', () => {
    expect(isDisneyPlusUrl('https://www.disneyplus.com/play/example')).toBe(true);
    expect(isDisneyPlusUrl('https://disneyplus.com/')).toBe(true);
  });

  it('rejects lookalike, insecure, and invalid URLs', () => {
    expect(isDisneyPlusUrl('https://disneyplus.com.example.org/')).toBe(false);
    expect(isDisneyPlusUrl('http://www.disneyplus.com/')).toBe(false);
    expect(isDisneyPlusUrl('not a URL')).toBe(false);
    expect(isDisneyPlusUrl(undefined)).toBe(false);
  });
});
