import { describe, it, expect, vi } from 'vitest';

describe('Supabase client', () => {
  it('exports supabase and auth', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key-123');

    const { supabase, auth } = await import('../data/supabase');

    expect(supabase).toBeDefined();
    expect(auth).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    expect(typeof auth.signInWithPassword).toBe('function');

    vi.unstubAllEnvs();
  });

  it('throws if URL is missing', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');

    await expect(async () => {
      await import('../data/supabase');
    }).rejects.toThrow();

    vi.unstubAllEnvs();
  });

  it('throws if anon key is missing', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    await expect(async () => {
      await import('../data/supabase');
    }).rejects.toThrow();

    vi.unstubAllEnvs();
  });
});
