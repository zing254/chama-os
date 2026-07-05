# WhatsApp-Native AI Chama Manager — Design Spec

**Date:** 2026-07-05
**Status:** Approved for implementation

## 1. Overview

Add 5 WhatsApp-native AI features to ChamaOS using Africa's Talking WhatsApp sandbox and Google Gemini (existing API key).

## 2. Integration Architecture

```
Africa's Talking WhatsApp
       │
       │ POST (inbound msg)
       ▼
whatsapp-webhook (Supabase Edge Function)
       │
       ├── Text → Session router
       │     ├─ Forwarded M-Pesa SMS → Gemini parse → Contributions.insert
       │     ├─ "PING" → confirm weekly auditor summary
       │     ├─ "DISPUTE" → create audit_log entry + notify admin
       │     └─ Help/default → send menu
       │
       ├── Voice note → Google STT → Gemini structure → minutes_archive
       │
       └── Africa's Talking REST API → send reply messages
```

**WhatsApp is the ONLY channel users interact with for these features.** No frontend pages needed for the AI features themselves — admin settings (turn auditor on/off, configure risk threshold) live in the existing Settings panel.

### WhatsApp Number → User Account Linking

When a member first texts any keyword to the bot, the system checks if their phone number (`wa_id`) matches an existing `profiles.phone` in the database. If matched, the user is linked to the session automatically. If unmatched, the bot asks for their registered email or phone to link their account:

> *"Sijakutambua. Tafadhali tumia namba ya simu uliyosajili kwenye ChamaOS."*

Admin can also pre-link by updating the member's phone number in the Members panel — the system will then auto-match on first WhatsApp message.

## 3. Database Tables

### whatsapp_sessions
```sql
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id TEXT NOT NULL,                      -- Africa's Talking sender number
  user_id UUID REFERENCES auth.users(id),
  state TEXT NOT NULL DEFAULT 'idle',       -- idle | awaiting_voice | disputing
  context JSONB DEFAULT '{}'::jsonb,        -- session-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wa_sessions_wa_id ON whatsapp_sessions(wa_id);
```

### whatsapp_messages
```sql
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  msg_type TEXT NOT NULL DEFAULT 'text',    -- text | voice | interactive
  content JSONB NOT NULL,
  session_id UUID REFERENCES whatsapp_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### minutes_archive
```sql
CREATE TABLE IF NOT EXISTS minutes_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  chama_id UUID REFERENCES chamas(id) ON DELETE CASCADE,
  transcript TEXT,
  structured_minutes JSONB,
  sent_ts TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. Gemini AI Tasks (single API key, 4 use cases)

All use `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent`.

| Task | Prompt | Response format |
|------|--------|----------------|
| **M-Pesa parser** | "Extract amount, sender name, date, and M-Pesa code from this SMS: {text}. Return JSON." | `{amount: number, sender: string, date: string, code: string}` |
| **Auditor summary** | Generator: "Write a friendly weekly financial summary in plain language for a chama. Total collected: {amount}. Total loans: {amount}. Members: {count}. Expenses: {items}. Use Kiswahili or English." | Plain text, ~3-4 sentences |
| **Loan risk** | "Analyze this member's 6-month contribution pattern: {data}. Calculate default risk percentage and give one-line reason." | `{risk_pct: 0-100, reason: string}` |
| **Minutes structurer** | "Turn this meeting transcript into structured minutes: {transcript}. Include: Agenda, Decisions, Action Items, Next Meeting." | `{agenda: string[], decisions: string[], actions: {who: string, what: string}[], next_meeting: string}` |

### Implementation: `src/data/gemini.ts`

```typescript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt: string): Promise<string> { ... }
export const ai = {
  parseMpesaSms(text: string): Promise<MpesaParseResult>,
  generateAuditorSummary(data: AuditorData): Promise<string>,
  predictLoanRisk(history: Contribution[]): Promise<RiskResult>,
  structureMinutes(transcript: string): Promise<MinutesDoc>,
};
```

**Edge functions** call Gemini directly via `fetch` (Deno). **Frontend** also calls it directly via the browser — this is safe because Gemini API keys can be restricted to specific URLs in Google Cloud Console.

## 5. WhatsApp Webhook (`supabase/functions/whatsapp-webhook/`)

### Inbound message handling

```typescript
serve(async (req) => {
  const { from, text, media, type } = await req.json(); // Africa's Talking format

  if (type === 'voice') {
    // 1. Download audio from media.url
    // 2. Send to Google STT (using same API key)
    // 3. Send transcript to Gemini structurer
    // 4. Save to minutes_archive
    // 5. Reply: "Minutes saved. Will be shared with all members."
    return;
  }

  const session = await getOrCreateSession(from);
  switch (session.state) {
    case 'awaiting_mpesa':  return handleMpesaSms(session, text);
    case 'disputing':       return handleDispute(session, text);
    default:                return handleDefault(session, text);
  }
});
```

### Outbound sending helper (`src/data/whatsapp-helper.ts`)

Two implementations, shared filename but different env access patterns:

**Edge function (Deno):**
```typescript
const username = Deno.env.get('AT_USERNAME')!;
const apiKey   = Deno.env.get('AT_API_KEY')!;
```

**Frontend (browser):**
```typescript
const username = import.meta.env.VITE_AT_USERNAME;
const apiKey   = import.meta.env.VITE_AT_API_KEY;
```

POST to `https://api.sandbox.africastalking.com/version1/messaging` with Basic Auth.

## 6. Feature Flows

### 6.1 Member Onboarding

When a new member is added (via invite or signup), the system sends them a WhatsApp message:

> *"Karibu ChamaOS! 💰\nSubscribe to stay connected:\nJibu CHAMA to 24300\n\nWhat you can do:\n• Forward M-Pesa SMS to log contributions\n• Reply HELP for menu"*

Implementation: Hook into `invite-member` edge function and `auth-context.tsx` signup flow.

### 6.2 M-Pesa SMS → Auto Contribution

1. Member forwards M-Pesa SMS to the WhatsApp bot
2. `whatsapp-webhook` receives it, sends to Gemini parser
3. Gemini returns `{amount: 5000, sender: "JOHN DOE", date: "15/1/2024", code: "MX12ABC"}`
4. System creates contribution record via `supabase.from('contributions').insert()`
5. System replies: *"Received! KSh 5,000 from JOHN logged as contribution ✅"*

**M-Pesa SMS format handled** (Kenyan Safaricom format):
> *"You received 5,000.00 from JOHN DOE on 15/1/2024 at 10:30 AM."*

### 6.3 AI Auditor (weekly)

Runs every Sunday via a Supabase cron-scheduled edge function `ai-auditor`.

1. Query: contributions, loans, expenses for the past 7 days per chama
2. Call Gemini to generate friendly summary
3. Send WhatsApp DM to every member who has a `wa_id` in their profile
4. Wait for "PING" or "DISPUTE" reply

### 6.4 Loan Risk Predictor

Shown when admin views a loan application (in the Loans page):

> ⚠️ *"WARNING: This person has missed 3 of last 8 contributions. Default risk: 74%."*

The risk badge appears inline on the loan card. Calls Gemini with the member's 6-month contribution history.

### 6.5 Voice Note → Minutes

1. Secretary sends WhatsApp voice note to the bot
2. Bot downloads audio, sends to Google Speech-to-Text
3. Gets transcript, sends to Gemini for structuring
4. Saves to `minutes_archive`
5. Replies: *"Minutes saved ✅"* + sends a copy back as text

## 7. Frontend Changes

Minimal frontend changes — most features are WhatsApp-driven:

| Component | Change |
|-----------|--------|
| `Settings.tsx` | Add "WhatsApp Integration" section: toggle auditor on/off, set risk threshold |
| `Loans.tsx` | Add `<LoanRiskBadge>` next to each loan showing risk % |
| `Dashboard.tsx` | Add "Auditor Summary" card showing last audit if available |
| `members/actions.ts` | Add `sendWhatsAppOnboarding()` to member add flow |

## 8. Environment Variables (new)

| Var | Where | Purpose |
|-----|-------|---------|
| `VITE_GEMINI_API_KEY` | Vercel + Supabase | Gemini API for all AI tasks |
| `AT_USERNAME` | Vercel + Supabase | Africa's Talking sandbox username |
| `AT_API_KEY` | Vercel + Supabase | Africa's Talking sandbox API key |
| `AT_SHORTCODE` | Vercel + Supabase | `24300` (sandbox shortcode) |

## 9. Testing

- New test file: `src/test/whatsapp.test.ts` — mock Africa's Talking webhook payloads
- New test file: `src/test/gemini.test.ts` — mock Gemini responses for each of the 4 tasks
- `data-context.test.tsx` — extend with contribution auto-create from parsed SMS

## 10. Files Summary

### New files (7)
| File | Lines (est.) |
|------|-------------|
| `supabase/functions/whatsapp-webhook/index.ts` | ~180 |
| `supabase/functions/ai-auditor/index.ts` | ~100 |
| `src/data/whatsapp-helper.ts` | ~60 |
| `src/data/gemini.ts` | ~120 |
| `src/components/features/LoanRiskBadge.tsx` | ~40 |
| `src/components/features/AuditorPanel.tsx` | ~80 |
| `src/test/whatsapp.test.ts` | ~80 |
| `src/test/gemini.test.ts` | ~60 |

### Modified files (7)
| File | Change |
|------|--------|
| `supabase/migration-multi-tenant.sql` | Add 3 new tables |
| `src/App.tsx` | Add routes |
| `src/components/Loans.tsx` | Add risk badge |
| `src/components/Dashboard.tsx` | Add auditor widget |
| `src/components/Settings.tsx` | Add WhatsApp section |
| `src/data/constants.ts` | Add AT + Gemini constants |
| `src/data/i18n.ts` | Add translation keys |
