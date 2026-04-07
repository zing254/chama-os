import { useState } from 'react';
import { plans } from '../data/store';

type Props = { onEnterApp: () => void };

const features = [
  {
    icon: '💰',
    title: 'Contributions Tracker',
    desc: 'Track monthly contributions, shares & fines per member. Auto-reconcile with M-Pesa statements in seconds.',
  },
  {
    icon: '🏦',
    title: 'Loan Management',
    desc: 'Issue loans, track repayments, calculate interest automatically. Never chase a defaulter manually again.',
  },
  {
    icon: '📱',
    title: 'M-Pesa Integration',
    desc: 'Members pay via M-Pesa and it\'s recorded instantly. STK Push, Paybill & confirmation SMS — all built-in.',
  },
  {
    icon: '📋',
    title: 'Meeting Minutes',
    desc: 'Digital agenda, attendance, voting and auto-generated minutes. Share instantly via WhatsApp.',
  },
  {
    icon: '📊',
    title: 'Smart Analytics',
    desc: 'Growth charts, contribution trends, loan performance and fund allocation — visual dashboards your treasurer will love.',
  },
  {
    icon: '🔔',
    title: 'Smart Reminders',
    desc: 'Auto-SMS & WhatsApp reminders before contribution deadlines. Zero chasing. Zero awkward calls.',
  },
  {
    icon: '🤝',
    title: 'Member Portal',
    desc: 'Every member gets their own dashboard — see their statement, apply for loans, pay contributions, all self-service.',
  },
  {
    icon: '📈',
    title: 'Investment Tracking',
    desc: 'Track your chama\'s T-Bills, Sacco deposits, property investments, unit trusts and calculate returns.',
  },
];

const testimonials = [
  {
    name: 'Grace Wanjiku', role: 'Chairman, Umoja Wetu Group', location: 'Nairobi', avatar: 'GW',
    quote: 'Before ChamaOS, I spent 3 hours every meeting reconciling contributions in Excel. Now it takes 5 minutes. Our members trust the numbers completely.',
    stars: 5,
  },
  {
    name: 'David Otieno', role: 'Treasurer, Pamoja Savings Group', location: 'Kisumu', avatar: 'DO',
    quote: 'The loan tracking feature alone is worth it. We used to lose track of repayments. Now everything is clear — who owes what, when it\'s due, and the interest breakdown.',
    stars: 5,
  },
  {
    name: 'Faith Njeri', role: 'Secretary, Mama Akiba Chama', location: 'Mombasa', avatar: 'FN',
    quote: 'Our chama went from WhatsApp chaos to a proper system in one weekend. The M-Pesa integration is magic — members pay and it reflects immediately!',
    stars: 5,
  },
];

const stats = [
  { value: '300,000+', label: 'Chamas in Kenya' },
  { value: 'KSh 300B', label: 'Total chama assets' },
  { value: '1 in 3', label: 'Kenyans in a chama' },
  { value: '85%', label: 'Still using spreadsheets' },
];

export default function LandingPage({ onEnterApp }: Props) {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'Does ChamaOS work with M-Pesa?', a: 'Yes! ChamaOS integrates directly with M-Pesa via Safaricom\'s Daraja API. Members can pay contributions via STK Push (they get a prompt on their phone), Paybill, or till number. Payments are reflected instantly in the dashboard.' },
    { q: 'Is my chama\'s data safe?', a: 'Absolutely. ChamaOS uses bank-grade 256-bit encryption. Your data is stored on secure AWS servers in South Africa. We are fully GDPR and Kenya Data Protection Act 2019 compliant. Only your chama officers can access your data.' },
    { q: 'Can we try it before paying?', a: 'Yes! The Free plan is free forever for groups up to 10 members. The Starter, Pro and Enterprise plans come with a 30-day free trial — no credit card required.' },
    { q: 'What happens if we exceed our member limit?', a: 'We\'ll notify you well in advance and suggest an upgrade. We never lock you out or delete data. Your chama always comes first.' },
    { q: 'Can ChamaOS handle multiple chamas?', a: 'Yes! On the Enterprise plan, you can manage multiple chamas under one account — perfect for SACCO societies and umbrella groups.' },
    { q: 'Do members need to create accounts?', a: 'Each member gets a simple profile. They can check their statement, apply for loans and pay contributions from their mobile browser — no app download required.' },
  ];

  return (
    <div className="bg-white font-inter">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">CO</span>
            </div>
            <span className="text-xl font-black text-gray-900">Chama<span className="text-green-600">OS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-green-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-green-600 transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-green-600 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onEnterApp} className="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors">Sign In</button>
            <button onClick={onEnterApp} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-green-200 hover:shadow-lg">
              Start Free →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
        </div>

        {/* Kenya flag stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-black"></div>
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-green-500"></div>
          <div className="flex-1 bg-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-green-800/50 border border-green-600/30 rounded-full px-4 py-1.5 text-sm text-green-300 font-medium mb-6">
                <span>🇰🇪</span> Built for Kenya, by Kenyans
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                Run Your Chama Like a
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400">
                  Professional Bank
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-green-100 mb-8 leading-relaxed max-w-xl">
                Kenya has <strong>300,000+ chamas</strong> managing KSh 300 Billion — yet 85% still use WhatsApp and Excel. ChamaOS brings every chama into the digital age: contributions, loans, meetings, analytics and M-Pesa — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={onEnterApp} className="bg-green-500 hover:bg-green-400 text-white font-black text-lg px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-green-400/30 hover:-translate-y-0.5">
                  🚀 Start Free — No Credit Card
                </button>
                <button onClick={onEnterApp} className="bg-white/10 hover:bg-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl border border-white/20 transition-all">
                  👀 See Live Demo
                </button>
              </div>
              <p className="text-green-400 text-sm mt-4">✅ Free for groups up to 10 members &nbsp;·&nbsp; ✅ 30-day free trial on all plans</p>
            </div>

            {/* Dashboard mockup */}
            <div className="lg:w-1/2 w-full max-w-lg mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
                {/* Mockup header */}
                <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
                    <span className="text-white font-bold text-sm">Umoja Wetu Group</span>
                  </div>
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <div className="p-4 bg-gray-50">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[['KSh 1.85M', 'Total Fund', 'text-green-600'], ['24', 'Members', 'text-blue-600'], ['KSh 420K', 'Loans Out', 'text-orange-600']].map(([v, l, c]) => (
                      <div key={l} className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 text-center">
                        <div className={`font-black text-sm ${c}`}>{v}</div>
                        <div className="text-gray-500 text-xs">{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Contribution bars */}
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-3">
                    <div className="text-xs font-bold text-gray-700 mb-2">November Contributions</div>
                    {[['Grace W.', 100, 'bg-green-500'], ['David O.', 100, 'bg-green-500'], ['James K.', 100, 'bg-green-500'], ['Robert K.', 60, 'bg-yellow-400'], ['John M.', 0, 'bg-red-400']].map(([n, p, c]) => (
                      <div key={n as string} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-gray-600 w-16 shrink-0">{n}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`${c} h-2 rounded-full transition-all`} style={{ width: `${p}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-8">{p}%</span>
                      </div>
                    ))}
                  </div>
                  {/* M-Pesa badge */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-black">M</div>
                    <div>
                      <div className="text-xs font-bold text-green-800">M-Pesa Confirmed</div>
                      <div className="text-xs text-green-600">Faith N. paid KSh 5,000 · Ref: QHJ4K7</div>
                    </div>
                    <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-3xl font-black text-green-400">{s.value}</div>
                <div className="text-gray-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-bold text-sm uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">A complete operating system<br />for your chama</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">Stop running your chama on WhatsApp, Excel and guesswork. ChamaOS brings professional-grade tools built specifically for the Kenyan chama context.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl hover:shadow-green-50 transition-all hover:-translate-y-1 bg-white">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-bold text-sm uppercase tracking-widest">Simple Setup</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Get your chama live in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your chama', desc: 'Sign up, enter your chama name, constitution details, and member list. Takes under 5 minutes.', icon: '🏗️' },
              { step: '02', title: 'Invite members', desc: 'Members get an SMS with a link to their personal dashboard. No app download needed.', icon: '👥' },
              { step: '03', title: 'Start collecting', desc: 'Set contribution amounts, members pay via M-Pesa, loans are tracked automatically. You\'re live!', icon: '💚' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-4xl mx-auto">{s.icon}</div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-black">{s.step}</div>
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-3">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={onEnterApp} className="bg-green-600 hover:bg-green-700 text-white font-black text-lg px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-green-200 hover:shadow-xl">
              Launch Your Chama Dashboard →
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-green-600 font-bold text-sm uppercase tracking-widest">Real Stories</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Trusted by chama leaders<br />across Kenya</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div key={t.name} className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border border-green-100">
                <div className="flex mb-4">
                  {[...Array(t.stars)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                    <div className="text-green-600 text-xs">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-400 font-bold text-sm uppercase tracking-widest">Simple Pricing</span>
            <h2 className="text-4xl font-black text-white mt-2">Transparent plans. No hidden fees.</h2>
            <p className="text-gray-400 mt-3">All prices in Kenyan Shillings. Pay via M-Pesa.</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm font-medium ${!billingAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-green-500' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${billingAnnual ? 'translate-x-6' : ''}`}></span>
              </button>
              <span className={`text-sm font-medium ${billingAnnual ? 'text-white' : 'text-gray-400'}`}>Annual <span className="text-green-400 font-bold">(Save 20%)</span></span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map(plan => {
              const price = billingAnnual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price;
              const colorMap: Record<string, string> = { gray: 'border-gray-700', green: 'border-green-500', blue: 'border-blue-500', purple: 'border-purple-500' };
              const btnMap: Record<string, string> = { gray: 'bg-gray-700 hover:bg-gray-600 text-white', green: 'bg-green-500 hover:bg-green-400 text-white', blue: 'bg-blue-600 hover:bg-blue-500 text-white', purple: 'bg-purple-600 hover:bg-purple-500 text-white' };
              const badgeMap: Record<string, string> = { gray: 'text-gray-400', green: 'text-green-400', blue: 'text-blue-400', purple: 'text-purple-400' };
              return (
                <div key={plan.name} className={`relative bg-gray-800 rounded-2xl p-6 border-2 ${colorMap[plan.color]} transition-all hover:-translate-y-1 hover:shadow-xl`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full">
                      🔥 MOST POPULAR
                    </div>
                  )}
                  <div className={`text-sm font-bold uppercase tracking-widest mb-1 ${badgeMap[plan.color]}`}>{plan.name}</div>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-white font-black text-3xl">{price === 0 ? 'FREE' : `KSh ${price.toLocaleString()}`}</span>
                    {price > 0 && <span className="text-gray-400 text-sm mb-1">{plan.period}</span>}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-green-400 mt-0.5 shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={onEnterApp} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${btnMap[plan.color]}`}>
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">All plans include 30-day free trial. Pay via M-Pesa Paybill 247247.</p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-600 font-bold text-sm uppercase tracking-widest">Got Questions?</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className={`text-green-600 text-xl transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-green-700 to-emerald-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-5xl mb-4">🇰🇪</div>
          <h2 className="text-4xl font-black mb-4">Your chama deserves better than WhatsApp forwards</h2>
          <p className="text-green-200 text-lg mb-8">Join hundreds of chamas running smarter with ChamaOS. Start free today — upgrade when you're ready.</p>
          <button onClick={onEnterApp} className="bg-white text-green-800 font-black text-xl px-12 py-5 rounded-2xl hover:bg-green-50 transition-all shadow-2xl">
            Enter ChamaOS Dashboard →
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-xs">CO</span>
                </div>
                <span className="text-white font-black">ChamaOS</span>
              </div>
              <p className="text-sm leading-relaxed">Kenya's most trusted chama management platform. Built in Nairobi 🇰🇪 for Kenyans.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Roadmap'] },
              { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'WhatsApp Chat', 'API Docs', 'Status'] },
            ].map(col => (
              <div key={col.title}>
                <div className="text-white font-bold text-sm mb-3">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><a href="#" className="text-sm hover:text-green-400 transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2024 ChamaOS Ltd. All rights reserved. Reg. No. KE/2024/78432</p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-green-400 transition-colors">Data Protection</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
