# There Is Still Time - Implementation Roadmap

## Executive Summary

This roadmap implements the PRD's core philosophy: **Focus first, friction never.**
Every feature escalates identity investment rather than distraction.

---

## Refined Tier Structure (Post-Feedback)

| Tier | Price | Marketing Copy | Key Features |
|------|-------|----------------|--------------|
| **Anonymous** | $0 | Try it—no signup needed | 2 sessions/day for 7 days |
| **FREE** | $0 | Sign up for unlimited sessions | Unlimited timer, 5 Zen hourglasses |
| **FOCUS+** | $4.99/mo | Track your progress | Dashboard, analytics, 10 custom images/mo |
| **Student** | $29/year | For serious exam prep—MCAT, LSAT, Bar Exam | Study Rooms, unlimited images, 15% off prints |
| **Premium** | $9.99/mo | Custom animated backgrounds | 25 videos/mo, high-res exports, 30% off |
| **Lifetime** | $299 | Pay once, own forever | 50 videos/mo, commercial license, 40% off |

**Key Changes from Initial Plan:**
- ✅ Renamed "Basic" → "Focus+" (higher perceived value)
- ✅ Session presets locked to 25/50/90 (PRD compliance)
- ✅ Custom durations = Premium+ feature only
- ✅ Toned down gamification ("VIP badge" → contextual, not advertised)

---

## Phase Implementation (PRD-Aligned)

### **Phase 0: Pure Timer** (COMPLETE ✅)
**Goal:** Immediate value, one-tap to first session

- [x] 25/50/90 minute presets
- [x] Single Zen hourglass background
- [x] Session completion tracking
- [x] Deployed to app.thereisstilltime.com

---

### **Phase 1: Trial + Signup Flow** (IN PROGRESS 🔄)
**Goal:** Build habit, remove friction, server-side enforcement

**1.1 Trial Limits (Client-Side Prototype)**
- [x] `useTrialLimits` hook (localStorage tracking)
- [x] 2 sessions/day, 7 day period
- [ ] UI: Trial status indicator ("1 of 2 sessions today")
- [ ] UI: Signup prompt modal

**1.2 Server-Side Trial Enforcement** (Critical for Security)
```typescript
// Cloud Function: /functions/src/trial/checkTrialLimit.ts
// Mirror localStorage to Firestore /trials/{anonymousId}
// Prevent cache-clearing exploits
```

**1.3 Signup Flow**
- [ ] Email/password signup modal (Firebase Auth)
- [ ] Auto-upgrade anonymous sessions to registered user
- [ ] Welcome email via SendGrid
- [ ] Clear trial state on signup

**Deliverables:**
- `components/Auth/SignupModal.tsx`
- `components/Auth/TrialBanner.tsx`
- `functions/src/trial/checkTrialLimit.ts`
- `functions/src/auth/onUserSignup.ts`

---

### **Phase 2: Dashboard (Self-Reflection)**
**Goal:** Show value of tracking, upsell Focus+

**2.1 Free Tier: Stats Widget Only**
```tsx
Total Sessions: 23
Total Hours: 29.2h
[Upgrade to Focus+ to see detailed analytics →]
```

**2.2 Focus+ Tier: Full Dashboard**
- Daily streak widget
- Weekly chart (last 7 days, recharts)
- Recent sessions list (last 20)
- 90-day calendar heatmap (react-calendar-heatmap)
- Export to CSV (Cloud Function)

**2.3 Mid-Session Analytics Gating** (Critical UX Rule)
```typescript
// components/Dashboard/DashboardLink.tsx
if (timerState.isActive) {
  return null; // Hide all dashboard links during active sessions
}
```

**Deliverables:**
- `app/dashboard/page.tsx`
- `components/Dashboard/StatsWidget.tsx` (free tier)
- `components/Dashboard/DailyStreak.tsx`
- `components/Dashboard/WeeklyChart.tsx`
- `components/Dashboard/RecentSessions.tsx`
- `components/Dashboard/StudyCalendar.tsx`
- `functions/src/dashboard/exportCSV.ts`

---

### **Phase 3: Study Rooms (Social Presence)**
**Goal:** Drive Student tier subscriptions, community without distraction

**3.1 Firestore Optimization (Cost Control)**
- Use **Realtime Database** for presence (cheaper ephemeral writes)
- Batch heartbeats: 3-5 minutes (not 60s)
- Cloud Function cleanup: scheduled every 10 min
- Denormalized `activeCount` on room docs

**3.2 Room UI (Minimalist)**
```
Study Rooms Button (home screen)
  └─> Room Selection Modal
       ├─ 🧪 MCAT (142 studying)
       ├─ ⚖️ LSAT (89 studying)
       ├─ 🏛️ Bar Exam (201 studying)
       └─ 🩺 USMLE (76 studying)

During Session (collapsed by default):
  "You're in: 🧪 MCAT • 142 studying  ▸"
  Click to expand: Participant list (initials, hours, rank if opted-in)
```

**3.3 Privacy-First Design**
- Default: "Anonymous####" (auto-generated)
- Optional: Custom display name
- Opt-in: Show on leaderboards (default OFF)
- No chat, no reactions, no DMs

**Deliverables:**
- `components/StudyRooms/StudyRoomsButton.tsx`
- `components/StudyRooms/RoomModal.tsx`
- `components/StudyRooms/ActiveRoomStrip.tsx`
- `components/StudyRooms/ParticipantsList.tsx`
- `lib/firebase/realtimedb.ts` (presence in RTDB, not Firestore)
- `functions/src/presence/onSessionStart.ts`
- `functions/src/presence/heartbeat.ts`
- `functions/src/presence/sweepInactive.ts` (scheduled)

---

### **Phase 4: Custom AI Hourglasses**
**Goal:** Self-expression, drive Premium subscriptions

**4.1 Image Generation (Focus+, Student, Premium, Lifetime)**
- Text-to-image API (Stable Diffusion / DALL-E)
- 10/month (Focus+), Unlimited (Student+)
- Soft caps: 100/mo (Student), 200/mo (Premium), 500/mo (Lifetime)
- High-res exports: Premium+ only

**4.2 Video Generation (Premium, Lifetime only)**
- Text-to-video API (Runway Gen-3 / Pika)
- 25/month (Premium), 50/month (Lifetime)
- Rollover up to 2x monthly limit
- Commercial license: Lifetime only

**4.3 Credit Management**
- Monthly reset Cloud Function (tied to Stripe billing cycle)
- Usage dashboard in Settings
- Overage handling (deny or upsell)

**Deliverables:**
- `components/Hourglasses/CustomImageModal.tsx`
- `components/Hourglasses/CustomVideoModal.tsx`
- `lib/services/imageGeneration.ts`
- `lib/services/videoGeneration.ts` (from existing file)
- `functions/src/generation/createImage.ts`
- `functions/src/generation/createVideo.ts`
- `functions/src/billing/resetMonthlyCredits.ts`

---

### **Phase 5: Stripe Integration**
**Goal:** Enable paid subscriptions

**5.1 Stripe Setup**
```bash
# Products & Prices
stripe products create --name="Focus+" --description="Track your progress"
stripe prices create --product=<FOCUS_ID> --unit-amount=499 --currency=usd --recurring-interval=month

stripe products create --name="Student" --description="For serious exam prep"
stripe prices create --product=<STUDENT_ID> --unit-amount=2900 --currency=usd --recurring-interval=year

stripe products create --name="Premium"
stripe prices create --product=<PREMIUM_ID> --unit-amount=999 --currency=usd --recurring-interval=month

stripe products create --name="Lifetime"
stripe prices create --product=<LIFETIME_ID> --unit-amount=29900 --currency=usd
```

**5.2 Checkout Flow**
- Pricing page with tier comparison
- Stripe Checkout Session (hosted)
- Webhook handler for subscription events
- Firestore sync on `customer.subscription.created`

**5.3 Subscription Management**
- Settings page: view current plan
- Upgrade/downgrade flows
- Cancel subscription (retain access until period end)
- Stripe Customer Portal link

**Deliverables:**
- `app/pricing/page.tsx`
- `components/Pricing/TierCard.tsx`
- `functions/src/stripe/createCheckoutSession.ts`
- `functions/src/stripe/webhookHandler.ts`
- `functions/src/stripe/syncSubscription.ts`

---

## Critical UX Rules (PRD Compliance)

### **1. No Mid-Session Distractions**
```typescript
// Always check before showing UI elements
if (timerState.isActive) {
  // Hide: Dashboard links, upgrade prompts, settings changes
  // Show: Only pause/end buttons
}
```

### **2. Motion & Accessibility**
- Respect `prefers-reduced-motion`
- 200–400ms transitions (no jarring animations)
- 60 FPS on progress ring
- No red flashes (Zen palette only)
- WCAG AA contrast ratios

### **3. Copy Tone**
- ❌ "Unlock VIP status!"
- ✅ "Focus on what matters"

- ❌ "Level up your productivity!"
- ✅ "Track your progress"

- ❌ "Join the leaderboard!"
- ✅ "Study with others preparing for MCAT" (opt-in leaderboard buried in settings)

---

## Cost Optimization Strategies

### **1. Firestore Reads (Study Rooms)**
```typescript
// ❌ Bad: Heartbeat every 60s in Firestore
// 1,000 users × 60 heartbeats/hour = 60,000 writes/hour = $$

// ✅ Good: Realtime Database for presence
// $5/GB transferred (flat fee, not per-write)
// + Cloud Function batch updates Firestore activeCount every 5 min
```

### **2. Video Generation (Expensive)**
```typescript
// Tier limits prevent runaway costs:
// Free: 0 videos
// Focus+: 0 videos
// Student: 0 videos
// Premium: 25/mo (cost: $5-12.50) → profit: $-2.51 to $4.99 ✅
// Lifetime: 50/mo (cost: $10-25) → amortized over 2 years ✅
```

### **3. Image Generation (Cheap)**
```typescript
// Cost: ~$0.01/image
// Focus+: 10/mo = $0.10 cost → $4.89 profit ✅
// Student+: Unlimited* (soft cap 100/mo) = $1 cost → profit intact ✅
```

---

## Testing Checklist

### **Phase 1 Tests**
- [ ] Anonymous user hits 2-session limit → sees signup prompt
- [ ] Trial expires after 7 days → sees signup prompt
- [ ] New day resets session counter → can use 2 more sessions
- [ ] After signup, trial state clears → unlimited sessions
- [ ] Server-side trial tracking prevents localStorage reset exploit

### **Phase 2 Tests**
- [ ] Free user sees stats widget only
- [ ] Focus+ user sees full dashboard
- [ ] Dashboard links hidden during active timer
- [ ] CSV export downloads valid file
- [ ] Streak increments on consecutive days

### **Phase 3 Tests**
- [ ] Student user can join room, Free user sees "Upgrade" prompt
- [ ] Presence updates in real-time (3-5 min latency acceptable)
- [ ] Inactive users auto-removed after 10 min
- [ ] Privacy: Anonymous users show as "Anonymous####"
- [ ] Leaderboard respects opt-in setting

### **Phase 4 Tests**
- [ ] Focus+ user can generate 10 images, blocked at 11
- [ ] Premium user can generate 25 videos, credits rollover
- [ ] Lifetime user has higher rollover cap
- [ ] Commercial license flag set only for Lifetime

### **Phase 5 Tests**
- [ ] Stripe checkout redirects correctly
- [ ] Webhook syncs subscription to Firestore
- [ ] Tier features unlock immediately after payment
- [ ] Cancel subscription → access retained until period end
- [ ] Monthly credit reset aligns with Stripe billing date

---

## Next Immediate Actions

1. **Create Signup Modal** (`components/Auth/SignupModal.tsx`)
2. **Integrate Trial Limits into Main App** (app/page.tsx)
3. **Deploy Server-Side Trial Tracking** (Cloud Function)
4. **Build Pricing Page** (app/pricing/page.tsx)
5. **Set up Stripe Products**

**Estimated Timeline:**
- Phase 1: 3-5 days
- Phase 2: 5-7 days
- Phase 3: 7-10 days
- Phase 4: 10-14 days
- Phase 5: 5-7 days

**Total: ~6 weeks to full monetization**

---

## Success Metrics (Post-Launch)

**Conversion Funnel:**
- Anonymous → Free: 40% (no friction)
- Free → Focus+: 10% (after 20+ sessions)
- Focus+ → Student: 30% (exam studiers discover rooms)
- Student → Premium: 15% (want custom videos)
- Premium → Lifetime: 5% (committed users)

**Revenue Model (1,000 anonymous users):**
- 400 sign up FREE
- 40 upgrade to Focus+ ($4.99) = $199.60/mo
- 12 upgrade to Student ($29/12) = $29/mo
- 6 upgrade to Premium ($9.99) = $59.94/mo
- 3 buy Lifetime ($299) = $897 one-time

**MRR: ~$288/mo + Print sales + Lifetime purchases**

---

*Last updated: Based on ChatGPT feedback + PRD alignment review*
