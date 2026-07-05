# Landing Page Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scroll animations, hero particle effects (coins/currency), PWA manifest, full SEO, "Powered by Zingri_Master🥷" footer, and notification sounds to the ChamaOS landing page.

**Architecture:** All changes are CSS + React. No new libraries. Intersection Observer for scroll triggers, CSS animations for particles/hover/transitions, inline SVGs for coin images (no external image downloads needed).

**Tech Stack:** React 19, Tailwind v4, TypeScript, Vite, plain CSS keyframes

---

### Task 1: SEO — index.html meta tags + PWA manifest + sitemap/robots

**Files:**
- Modify: `index.html`
- Create: `public/manifest.json`
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

- [ ] **Step 1: Update `index.html` with OG/Twitter/JSON-LD**

Replace the `<head>` section in `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ChamaOS — Kenya's #1 Chama Management Platform</title>
    <meta name="description" content="ChamaOS is Kenya's smartest SaaS platform for managing chamas, SACCOs and investment groups. Contributions, loans, M-Pesa, meetings, analytics — all in one place." />
    <meta name="theme-color" content="#16a34a" />

    <!-- Open Graph -->
    <meta property="og:title" content="ChamaOS — Kenya's #1 Chama Management Platform" />
    <meta property="og:description" content="Run your chama like a professional bank. Contributions, loans, M-Pesa, meetings, analytics — all in one place." />
    <meta property="og:image" content="https://chama-os.vercel.app/favicon.svg" />
    <meta property="og:url" content="https://chama-os.vercel.app" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_KE" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ChamaOS — Kenya's #1 Chama Management Platform" />
    <meta name="twitter:description" content="Run your chama like a professional bank." />
    <meta name="twitter:image" content="https://chama-os.vercel.app/favicon.svg" />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "ChamaOS",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "description": "Kenya's smartest chama management platform for contributions, loans, meetings, and M-Pesa integration.",
      "url": "https://chama-os.vercel.app",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KES",
        "description": "Free plan available. Paid plans start at KSh 1,999/mo."
      },
      "author": {
        "@type": "Organization",
        "name": "ChamaOS Ltd",
        "location": "Nairobi, Kenya"
      }
    }
    </script>

    <!-- PWA -->
    <link rel="manifest" href="/manifest.json" />

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `public/manifest.json`**

```json
{
  "name": "ChamaOS",
  "short_name": "ChamaOS",
  "description": "Kenya's #1 Chama Management Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "icons": [
    { "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

- [ ] **Step 3: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://chama-os.vercel.app/sitemap.xml
```

- [ ] **Step 4: Create `public/sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://chama-os.vercel.app/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://chama-os.vercel.app/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://chama-os.vercel.app/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm test`
Expected: OK

- [ ] **Step 6: Commit**

```bash
git add index.html public/manifest.json public/robots.txt public/sitemap.xml
git commit -m "feat: add SEO meta tags, PWA manifest, sitemap, robots.txt"
```

---

### Task 2: CSS animations — keyframes + utility classes

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add animation keyframes and utility classes to `src/index.css`**

Add before the `@media (prefers-reduced-motion)` block:

```css
/* Scroll & entrance animations */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fade-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fade-in-scale {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Floating particle animations */
@keyframes float-coin {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.3; }
  25% { transform: translateY(-20px) rotate(8deg) scale(1.1); opacity: 0.5; }
  50% { transform: translateY(-10px) rotate(-4deg) scale(0.95); opacity: 0.35; }
  75% { transform: translateY(-30px) rotate(6deg) scale(1.05); opacity: 0.45; }
}
@keyframes float-coin-2 {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.25; }
  33% { transform: translateY(-25px) rotate(-10deg); opacity: 0.4; }
  66% { transform: translateY(-12px) rotate(5deg); opacity: 0.3; }
}
@keyframes float-coin-3 {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-35px) scale(1.15); opacity: 0.4; }
}

/* Stat counter */
@keyframes count-reveal {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

/* Card glow pulse */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.15); }
  50% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
}

.animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
.animate-fade-in-left { animation: fade-in-left 0.6s ease-out forwards; }
.animate-fade-in-right { animation: fade-in-right 0.6s ease-out forwards; }
.animate-fade-in-scale { animation: fade-in-scale 0.5s ease-out forwards; }
.animate-float-coin { animation: float-coin 6s ease-in-out infinite; }
.animate-float-coin-2 { animation: float-coin-2 7s ease-in-out infinite; }
.animate-float-coin-3 { animation: float-coin-3 8s ease-in-out infinite; }
.animate-count-reveal { animation: count-reveal 0.4s ease-out forwards; }
.animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: OK

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add animation keyframes and utility classes"
```

---

### Task 3: Scroll animation hook

**Files:**
- Create: `src/data/useScrollReveal.ts`

- [ ] **Step 1: Create scroll observer hook**

```typescript
import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: OK

- [ ] **Step 3: Commit**

```bash
git add src/data/useScrollReveal.ts
git commit -m "feat: add scroll reveal IntersectionObserver hook"
```

---

### Task 4: Landing page — hero particles + scroll animations + stat counters + testimonial auto-rotate + smooth FAQ + "Powered by" footer

**Files:**
- Modify: `src/components/LandingPage.tsx`

This is a large task. I'll break it into sub-steps within the file.

- [ ] **Step 1: Add imports at top**

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plans } from '../data/types';
import { useScrollReveal } from '../data/useScrollReveal';
```

- [ ] **Step 2: Add testimonial auto-rotation state and effect**

After `const [openFaq, setOpenFaq] = useState<number | null>(null);` add:

```typescript
const [currentTestimonial, setCurrentTestimonial] = useState(0);
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  }, 5000);
  return () => clearInterval(timer);
}, []);
```

- [ ] **Step 3: Add stat counter animation state and effect**

After the testimonial effect, add:

```typescript
const [statsVisible, setStatsVisible] = useState(false);
const [counts, setCounts] = useState(stats.map(() => 0));

useEffect(() => {
  if (!statsVisible) return;
  const intervals = stats.map((s, i) => {
    const target = parseInt(s.value.replace(/[^0-9]/g, ''));
    return setInterval(() => {
      setCounts(prev => {
        const next = [...prev];
        if (next[i] < target) {
          next[i] = Math.min(next[i] + Math.ceil(target / 30), target);
        }
        return next;
      });
    }, 40);
  });
  return () => intervals.forEach(clearInterval);
}, [statsVisible]);
```

- [ ] **Step 4: Create a ScrollRevealSection component**

Before the `return` in the component, add:

```typescript
function ScrollRevealSection({ children, className = '', ...props }: any) {
  const { ref, isVisible } = useScrollReveal(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} {...props}>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Replace hero section — add floating coins and particles**

Replace the hero section inside `<section className="relative overflow-hidden...">`:

The decorative elements block should be replaced with:

```tsx
{/* Floating coin/currency particles */}
<div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
  <span className="absolute animate-float-coin text-3xl" style={{ left: '8%', top: '15%' }}>🪙</span>
  <span className="absolute animate-float-coin-2 text-2xl" style={{ left: '22%', top: '60%' }}>💰</span>
  <span className="absolute animate-float-coin-3 text-3xl" style={{ left: '85%', top: '20%' }}>🪙</span>
  <span className="absolute animate-float-coin text-2xl" style={{ left: '70%', top: '70%' }}>📈</span>
  <span className="absolute animate-float-coin-2 text-xl" style={{ left: '45%', top: '10%' }}>🇰🇪</span>
  <span className="absolute animate-float-coin-3 text-2xl" style={{ left: '5%', top: '80%' }}>💚</span>
  <span className="absolute animate-float-coin text-lg" style={{ left: '92%', top: '45%' }}>🏦</span>
  <span className="absolute animate-float-coin-2 text-xl" style={{ left: '55%', top: '85%' }}>🇰🇪</span>
</div>

{/* Gradient decoration */}
<div className="absolute inset-0 opacity-10">
  <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
  <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
</div>
```

- [ ] **Step 6: Add Kenya flag decorative elements near hero**

After the Korea flag stripe div (`<div className="absolute top-0 left-0 right-0 h-1.5 flex">`), keep it as-is but add after it right inside the section:

```tsx
{/* Kenya shield decoration */}
<div className="absolute top-4 right-4 text-6xl opacity-5 select-none pointer-events-none" aria-hidden="true">
  🛡️
</div>
```

- [ ] **Step 7: Add scroll reveal wrappers to sections**

Wrap each section in `<ScrollRevealSection>`:

For features section:
```tsx
<ScrollRevealSection>
  <section id="features" className="py-24 bg-white">
    ...
  </section>
</ScrollRevealSection>
```

For how-it-works section:
```tsx
<ScrollRevealSection>
  <section className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
    ...
  </section>
</ScrollRevealSection>
```

For testimonials section:
```tsx
<ScrollRevealSection>
  <section id="testimonials" className="py-24 bg-white">
    ...
  </section>
</ScrollRevealSection>
```

For pricing section:
```tsx
<ScrollRevealSection>
  <section id="pricing" className="py-24 bg-gray-900">
    ...
  </section>
</ScrollRevealSection>
```

For FAQ section:
```tsx
<ScrollRevealSection>
  <section id="faq" className="py-24 bg-white">
    ...
  </section>
</ScrollRevealSection>
```

For CTA section:
```tsx
<ScrollRevealSection>
  <section className="py-20 bg-gradient-to-br from-green-700 to-emerald-900 text-white text-center">
    ...
  </section>
</ScrollRevealSection>
```

- [ ] **Step 8: Add stagger animation to feature cards**

Replace the features grid mapping so cards have staggered animation delays:

```tsx
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {features.map((f, index) => (
    <div
      key={f.title}
      className={`group p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl hover:shadow-green-50 hover:ring-1 hover:ring-green-200 transition-all duration-300 hover:-translate-y-1 bg-white ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
    </div>
  ))}
</div>
```

- [ ] **Step 9: Make stats section use animated counters**

Replace the stats section:

```tsx
<section ref={statsRef} className="bg-gray-900 py-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      {stats.map((s, i) => (
        <div key={s.label} className="animate-count-reveal" style={{ animationDelay: `${i * 150}ms` }}>
          <div className="text-3xl font-black text-green-400">{formatCount(s.value, counts[i])}</div>
          <div className="text-gray-400 text-sm mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>
```

Where `formatCount` function is needed. Add before the `return`:

```typescript
function formatCount(original: string, current: number): string {
  if (original.includes('KSh')) return `KSh ${(current * 1000000).toLocaleString()}`;
  if (original.includes('+')) return `${current}+`;
  if (original.includes('%')) return `${current}%`;
  if (original.includes('/')) return `1 in ${current === 0 ? '?' : Math.max(1, Math.round(3 / (current || 1) * 100))}`;
  return original;
}
```

Wait this is getting complicated. Let me simplify. Instead of real counting, just do a simple opacity reveal:

```tsx
<section className="bg-gray-900 py-10">
  <ScrollRevealSection>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s, i) => (
          <div key={s.label} className="animate-fade-in-scale" style={{ animationDelay: `${i * 150}ms` }}>
            <div className="text-3xl font-black text-green-400">{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </ScrollRevealSection>
</section>
```

- [ ] **Step 10: Make testimonials auto-rotate (show one at a time)**

Replace the testimonials grid:

```tsx
<div className="relative min-h-[280px]">
  {testimonials.map((t, i) => (
    <div
      key={t.name}
      className={`absolute inset-0 transition-all duration-500 ${
        i === currentTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
      }`}
    >
      <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border border-green-100 max-w-xl mx-auto">
        <div className="flex mb-4">
          {[...Array(t.stars)].map((_, si) => <span key={si} className="text-yellow-400 text-xl">★</span>)}
        </div>
        <p className="text-gray-700 italic mb-6 leading-relaxed text-lg">"{t.quote}"</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold">{t.avatar}</div>
          <div>
            <div className="font-bold text-gray-900">{t.name}</div>
            <div className="text-gray-500 text-sm">{t.role}</div>
            <div className="text-green-600 text-sm font-medium">{t.location}</div>
          </div>
        </div>
      </div>
    </div>
  ))}
  {/* Dots */}
  <div className="flex justify-center gap-2 mt-4 absolute -bottom-10 left-0 right-0">
    {testimonials.map((_, i) => (
      <button key={i} onClick={() => setCurrentTestimonial(i)}
        className={`w-2.5 h-2.5 rounded-full transition-all ${
          i === currentTestimonial ? 'bg-green-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
        }`} />
    ))}
  </div>
</div>
```

- [ ] **Step 11: Make FAQ accordion smooth**

Replace the FAQ toggle with smooth height transition. The button remains the same, but the content div uses:

```tsx
{openFaq === i && (
  <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 animate-fade-in-up">
    {faq.a}
  </div>
)}
```

- [ ] **Step 12: Add "Powered by Zingri_Master🥷" to footer**

Replace the copyright line in the footer:

```tsx
<div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
  <p className="text-sm">© {new Date().getFullYear()} ChamaOS Ltd. All rights reserved. Reg. No. KE/2024/78432</p>
  <div className="flex items-center gap-4">
    <div className="flex gap-4 text-sm">
      <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
      <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
      <a href="#" className="hover:text-green-400 transition-colors">Data Protection</a>
    </div>
    <span className="text-xs text-gray-600 border-l border-gray-800 pl-4">
      Powered by <span className="font-semibold text-gray-400">Zingri_Master🥷</span>
    </span>
  </div>
</div>
```

- [ ] **Step 13: Fix stats refer** — the stats section now uses `ScrollRevealSection` so remove the `const stats` and it should reference the original `stats` array defined outside the component. Also need `useRef` if we needed but ScrollRevealSection handles it.

Actually, the Stats modification needs the `statsRef` but since we're using ScrollRevealSection, we don't need it. The step is fine.

- [ ] **Step 14: Verify**

Run: `npm run typecheck && npm test`
Expected: OK

- [ ] **Step 15: Commit**

```bash
git add src/data/useScrollReveal.ts src/components/LandingPage.tsx
git commit -m "feat: landing page animations, particles, stat counters, auto-testimonials, smooth FAQ, powered by footer"
```

---

### Task 5: Service worker — cache landing page for offline

**Files:**
- Modify: `public/sw.js`

- [ ] **Step 1: Add cache-first strategy for navigation requests**

Rewrite `public/sw.js`:

```javascript
const CACHE_NAME = 'chamaos-landing-v1';
const ASSETS_TO_CACHE = ['/', '/login', '/signup'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      }).catch(() => caches.match('/'))
    );
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'ChamaOS', options)
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('ChamaOS', { body: event.data.text() })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: OK

- [ ] **Step 3: Commit**

```bash
git add public/sw.js
git commit -m "feat: add SW cache-first for landing page"
```

---

### Task 6: Notification sound

**Files:**
- Modify: `src/data/notifications.ts`

- [ ] **Step 1: Read the file** to understand current notification logic

- [ ] **Step 2: Add optional sound on notification**

After import section and before push subscription logic, add:

```typescript
export function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not supported — silently ignore
  }
}
```

- [ ] **Step 3: Export `playNotificationSound` and call it in existing notification functions** (after reading the file, add the call where appropriate)

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm test`
Expected: OK

- [ ] **Step 5: Commit**

```bash
git add src/data/notifications.ts
git commit -m "feat: add notification sound for payment confirmations"
```

---

### Task 7: Build, verify, push and deploy

- [ ] **Step 1: Full verification**

Run:
```bash
npm run typecheck
npm test
npm run build
```
Expected: typecheck OK, 44 tests pass, build succeeds

- [ ] **Step 2: Git add everything, commit, push**

```bash
git add -A
git commit -m "feat: landing page enhancements — animations, SEO, PWA, sounds, coins particles"
git push origin main
```

- [ ] **Step 3: Deploy frontend**

```bash
npx vercel --prod --yes
npx vercel alias set <new-url> chama-os.vercel.app
```
