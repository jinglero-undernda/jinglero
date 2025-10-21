import { setupSchema, validateSchema } from '../../src/server/db/schema/setup';

describe('Neo4j Schema', () => {
  beforeAll(async () => {
    await setupSchema();
  });

  it('should have all required constraints', async () => {
    const { constraints } = await validateSchema();
    
    // Check user constraints
    expect(constraints.some(c => c.name.includes('user_email'))).toBe(true);
    expect(constraints.some(c => c.name.includes('user_required'))).toBe(true);
    
    // Check clip constraints
    expect(constraints.some(c => c.name.includes('clip_id'))).toBe(true);
    expect(constraints.some(c => c.name.includes('clip_required'))).toBe(true);
    
    // Check artist constraints
    expect(constraints.some(c => c.name.includes('artist_name'))).toBe(true);
    expect(constraints.some(c => c.name.includes('artist_required'))).toBe(true);
    
    // Check song constraints
    expect(constraints.some(c => c.name.includes('song_id'))).toBe(true);
    expect(constraints.some(c => c.name.includes('song_required'))).toBe(true);
    
    // Check term constraints
    expect(constraints.some(c => c.name.includes('term_name'))).toBe(true);
    expect(constraints.some(c => c.name.includes('term_required'))).toBe(true);
    
    // Check stream constraints
    expect(constraints.some(c => c.name.includes('stream_id'))).toBe(true);
    expect(constraints.some(c => c.name.includes('stream_required'))).toBe(true);
  });

  it('should have all required indexes', async () => {
    const { indexes } = await validateSchema();
    
    // Check fulltext search indexes
    expect(indexes.some(i => i.name.includes('clip_search'))).toBe(true);
    expect(indexes.some(i => i.name.includes('term_search'))).toBe(true);
    
    // Check regular indexes
    expect(indexes.some(i => i.name.includes('clip_timestamp'))).toBe(true);
    expect(indexes.some(i => i.name.includes('stream_date'))).toBe(true);
    expect(indexes.some(i => i.name.includes('song_year'))).toBe(true);
    expect(indexes.some(i => i.name.includes('term_category'))).toBe(true);
  });
});