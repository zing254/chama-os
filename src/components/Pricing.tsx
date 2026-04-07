import { useState } from 'react';
import { plans } from '../data/store';

export default function Pricing() {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [mpesaStep, setMpesaStep] = useState(0);

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setShowMpesa(true);
    setMpesaStep(0);
  };

  const colorMap: Record<string, { border: string; btn: string; badge: string; text: string }> = {
    gray: { border: 'border-gray-200', btn: 'bg-gray-800 hover:bg-gray-700 text-white', badge: 'text-gray-500', text: 'text-gray-600' },
    green: { border: 'border-green-400', btn: 'bg-green-600 hover:bg-green-700 text-white', badge: 'text-green-600', text: 'text-green-700' },
    blue: { border: 'border-blue-400', btn: 'bg-blue-600 hover:bg-blue-700 text-white', badge: 'text-blue-600', text: 'text-blue-700' },
    purple: { border: 'border-purple-400', btn: 'bg-purple-600 hover:bg-purple-700 text-white', badge: 'text-purple-600', text: 'text-purple-700' },
  };

  const comparisons = [
    { feature: 'Monthly contribution tracking', free: true, starter: true, pro: true, enterprise: true },
    { feature: 'Member management', free: '10 members', starter: '30 members', pro: '100 members', enterprise: 'Unlimited' },
    { feature: 'Loan management', free: false, starter: true, pro: true, enterprise: true },
    { feature: 'M-Pesa integration', free: false, starter: true, pro: true, enterprise: true },
    { feature: 'Meeting minutes & agenda', free: false, starter: true, pro: true, enterprise: true },
    { feature: 'SMS/WhatsApp reminders', free: false, starter: true, pro: true, enterprise: true },
    { feature: 'Advanced analytics', free: false, starter: false, pro: true, enterprise: true },
    { feature: 'Investment tracking', free: false, starter: false, pro: true, enterprise: true },
    { feature: 'Custom branding', free: false, starter: false, pro: true, enterprise: true },
    { feature: 'Multi-chama management', free: false, starter: false, pro: false, enterprise: true },
    { feature: 'API access', free: false, starter: false, pro: false, enterprise: true },
    { feature: 'Dedicated account manager', free: false, starter: false, pro: false, enterprise: true },
    { feature: 'SACCO compliance reports', free: false, starter: false, pro: false, enterprise: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black text-gray-900">Upgrade Your Plan</h1>
        <p className="text-gray-500 mt-2">All prices in Kenyan Shillings. Pay via M-Pesa. Cancel anytime.</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className={`text-sm font-medium ${!billingAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBillingAnnual(!billingAnnual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingAnnual ? 'translate-x-6' : ''}`}></span>
          </button>
          <span className={`text-sm font-medium ${billingAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
            Annual <span className="text-green-600 font-bold">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Current plan banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <div className="font-bold">You're on the Starter Plan</div>
            <div className="text-green-200 text-sm">Next billing: December 1, 2024 · KSh 999 via M-Pesa</div>
          </div>
        </div>
        <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">ACTIVE</span>
      </div>

      {/* Plan cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map(plan => {
          const price = billingAnnual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price;
          const colors = colorMap[plan.color];
          const isCurrent = plan.name === 'Starter';
          return (
            <div key={plan.name} className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${colors.border}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                  🔥 MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">
                  CURRENT
                </div>
              )}
              <div className={`text-sm font-bold uppercase tracking-widest mb-1 ${colors.badge}`}>{plan.name}</div>
              <div className="flex items-end gap-1 mb-4">
                <span className="font-black text-3xl text-gray-900">{price === 0 ? 'FREE' : `KSh ${price.toLocaleString()}`}</span>
                {price > 0 && <span className="text-gray-400 text-sm mb-1">/mo</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className={`mt-0.5 shrink-0 font-bold ${colors.text}`}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !isCurrent && plan.price > 0 && handleUpgrade(plan.name)}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isCurrent ? 'bg-gray-100 text-gray-400 cursor-default' : colors.btn
                }`}
              >
                {isCurrent ? '✓ Current Plan' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">Full Feature Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-bold text-gray-600">Feature</th>
                {['Free', 'Starter', 'Pro', 'Enterprise'].map(p => (
                  <th key={p} className="px-4 py-3 text-center text-sm font-bold text-gray-600">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {comparisons.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-700">{row.feature}</td>
                  {[row.free, row.starter, row.pro, row.enterprise].map((val, j) => (
                    <td key={j} className="px-4 py-3 text-center">
                      {typeof val === 'boolean' ? (
                        val
                          ? <span className="text-green-600 text-lg">✓</span>
                          : <span className="text-gray-300 text-lg">—</span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* M-Pesa Payment Modal */}
      {showMpesa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">M</div>
            <h2 className="font-black text-gray-900 text-xl mb-1">Pay via M-Pesa</h2>
            <p className="text-gray-500 text-sm mb-4">Upgrading to {selectedPlan} Plan</p>

            {mpesaStep === 0 && (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-bold">{selectedPlan}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-green-700">KSh {plans.find(p => p.name === selectedPlan)?.price.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Paybill</span><span className="font-bold font-mono">247247</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Account</span><span className="font-bold font-mono">CHAMAOS</span></div>
                </div>
                <button onClick={() => setMpesaStep(1)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  📱 Send STK Push to My Phone
                </button>
                <p className="text-xs text-gray-400 mt-3">Or pay manually via Paybill 247247, Account: CHAMAOS</p>
              </>
            )}
            {mpesaStep === 1 && (
              <>
                <div className="my-4 text-4xl animate-bounce">📱</div>
                <p className="text-gray-700 font-semibold mb-2">Check your phone!</p>
                <p className="text-gray-500 text-sm mb-4">We've sent an M-Pesa prompt to <strong>0712 345 678</strong>. Enter your PIN to complete payment.</p>
                <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <button onClick={() => setMpesaStep(2)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  I've Entered My PIN →
                </button>
              </>
            )}
            {mpesaStep === 2 && (
              <>
                <div className="text-5xl my-4">🎉</div>
                <p className="text-gray-900 font-black text-lg mb-1">Payment Confirmed!</p>
                <p className="text-gray-500 text-sm mb-2">Ref: MPE{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
                <p className="text-green-700 font-semibold text-sm mb-5">Welcome to ChamaOS {selectedPlan} Plan! 🚀</p>
                <button onClick={() => { setShowMpesa(false); setMpesaStep(0); }} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Start Using {selectedPlan} Features →
                </button>
              </>
            )}
            {mpesaStep < 2 && (
              <button onClick={() => setShowMpesa(false)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full">Cancel</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
