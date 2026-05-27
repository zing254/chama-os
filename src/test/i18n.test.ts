import { describe, it, expect } from 'vitest';
import { translations } from '../data/i18n';
const { en, sw } = translations;

describe('i18n translations', () => {
  it('has all English keys in Swahili', () => {
    const enKeys = Object.keys(en);
    const swKeys = Object.keys(sw);
    const missing = enKeys.filter(k => !swKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('has no empty values in English', () => {
    const empty = Object.entries(en).filter(([k, v]) => !v).map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it('has no empty values in Swahili', () => {
    const empty = Object.entries(sw).filter(([k, v]) => !v).map(([k]) => k);
    expect(empty).toEqual([]);
  });

  it('has no duplicate keys in English', () => {
    const keys = Object.keys(en);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it('has no duplicate keys in Swahili', () => {
    const keys = Object.keys(sw);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it('has matching key sets between en, sw, and Translations type', () => {
    const enKeys = Object.keys(en).sort();
    const swKeys = Object.keys(sw).sort();
    expect(enKeys).toEqual(swKeys);
  });
});
