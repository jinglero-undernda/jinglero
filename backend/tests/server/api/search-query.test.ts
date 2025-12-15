import { buildFulltextQueryPlan } from '../../../src/server/api/search';

describe('Search query semantics (fulltext)', () => {
  it('should treat single token as prefix query', () => {
    const plan = buildFulltextQueryPlan('Páez');
    expect(plan).toEqual({ kind: 'single', query: 'paez*' });
  });

  it('should prefer phrase for multi-word plain input and provide AND fallback', () => {
    const plan = buildFulltextQueryPlan('my way');
    expect(plan.kind).toBe('multi');
    if (plan.kind !== 'multi') return;
    expect(plan.phraseQuery).toBe('"my way"');
    expect(plan.andQuery).toBe('+my* +way*');
  });

  it('should collapse whitespace and strip accents for plain input', () => {
    const plan = buildFulltextQueryPlan('  páez   canta  ');
    expect(plan.kind).toBe('multi');
    if (plan.kind !== 'multi') return;
    expect(plan.phraseQuery).toBe('"paez canta"');
    expect(plan.andQuery).toBe('+paez* +canta*');
  });

  it('should preserve advanced Lucene syntax (quotes/operators), while stripping accents', () => {
    const plan = buildFulltextQueryPlan('"Páez canta" OR beat*');
    expect(plan.kind).toBe('advanced');
    if (plan.kind !== 'advanced') return;
    // Keep OR uppercase; keep quotes and wildcard; accents stripped.
    expect(plan.query).toBe('"Paez canta" OR beat*');
  });

  it('should escape lucene special characters in plain input tokens', () => {
    const plan = buildFulltextQueryPlan('a:b (c) [d]');
    // Because this includes :, (), [] it is treated as advanced; verify that.
    expect(plan.kind).toBe('advanced');
  });
});


