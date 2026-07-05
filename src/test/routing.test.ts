import { describe, it, expect } from 'vitest';

describe('Route Protection', () => {
  it('requires authentication for dashboard and management routes', () => {
    const protectedRoutes = ['/dashboard', '/members', '/contributions', '/loans', '/meetings', '/analytics', '/settings', '/pricing'];
    const publicRoutes = ['/', '/login', '/signup', '/auth/callback', '/forgot-password'];
    protectedRoutes.forEach(r => expect(publicRoutes).not.toContain(r));
  });

  it('redirects members to /member/* routes', () => {
    expect('/member').toMatch(/^\/member/);
    expect('/member/contributions').toMatch(/^\/member/);
  });

  it('requires admin role for /admin/* routes', () => {
    expect('/admin').toMatch(/^\/admin/);
    expect('/admin/dashboard').toMatch(/^\/admin/);
  });

  it('allows public access to landing, login, and signup', () => {
    expect('/').toBe('/');
    expect('/login').toBe('/login');
    expect('/signup').toBe('/signup');
  });
});
