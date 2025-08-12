## Daily Verse — Delivery Plan & TODO

Goal: Ship a beautiful, screenshot‑ready Daily Verse with one‑tap IG Stories share, reliable caching, and daily persistence.

### Phase 1 — Visual polish & behavior (Target: 0.5 day)
- [ ] Restore big off‑white card: generous padding, subtle shadow, rounded corners
- [ ] Typography scale locked:
  - [ ] Quote 19–22pt, line‑height 130–145%
  - [ ] Reference 13–14pt, muted gray
  - [ ] Label “DAILY VERSE” smallcaps with slight letter‑spacing
- [ ] Heart (bottom‑right): deep red active, medium haptic, larger hitSlop
- [ ] Per‑day like persistence (resets each day)
- [ ] Tap card opens Bible at verse reference (keeps selected version)
- [ ] Skeleton state + graceful error fallback (preserve card height)

### Phase 2 — Share to Instagram Stories (Target: 1 day)
- [ ] Share‑mode render at 1080×1920 (9:16), hide chrome/heart
- [ ] Subtle “Heavenly Hub” watermark (bottom, ~40–50% opacity)
- [ ] Export card view to PNG and write to disk
- [ ] iOS: `instagram-stories://share` + pasteboard (`com.instagram.sharedSticker.backgroundImage`)
- [ ] Android: `com.instagram.share.ADD_TO_STORY` with `background_asset_uri`
- [ ] Fallback: save image and open system share sheet if IG not installed
- [ ] Copy caption (verse ref + short link) to clipboard on share
- [ ] QA on device (iOS + Android) with EAS dev client

### Phase 3 — Reliability, offline, analytics (Target: 0.5 day)
- [ ] Cache last verse locally; show when offline
- [ ] Day rollover + timezone handling (local tz)
- [ ] Long‑verse handling (auto‑shrink within bounds or truncate with ellipsis)
- [ ] Accessibility: Dynamic Type bounds, VoiceOver labels, minimum contrast
- [ ] Dark mode pass (neutral dark card, high‑contrast text)
- [ ] Analytics events: like_tap, share_tap, ig_open, export_success/fail, open_bible

### Phase 4 — Version & history (v1.1, Target: 1–1.5 days)
- [ ] Version picker (NKJV/NIV/ESV…) + per‑user preference
- [ ] History (recent days) and “Liked” list
- [ ] Optional server sync (Supabase):
  - [ ] `daily_verses` (date, verse_ref, texts by version, tags)
  - [ ] `user_daily_verse` (user_id, date, liked, shared_at)
  - [ ] `user_preferences` (version, timezone)
- [ ] Cache + revalidation (24h TTL; refresh on foreground)

### QA checklist
- [ ] Card occupies meaningful viewport; typography legible and elegant
- [ ] Like persists for the current day; resets next day
- [ ] Tap opens Bible at exact reference and version
- [ ] Share opens IG Stories composer with our image prefilled
- [ ] Exported image has no app chrome; watermark visible yet subtle
- [ ] Works offline using cached verse

### Dependencies / gating
- [ ] EAS dev client rebuilt (includes permissions + URL schemes/intents)
- [ ] Instagram app installed on test devices
- [ ] Watermark asset and brand short link
  - [ ] Place watermark at `assets/branding/HBMAIN1.png` (PNG, transparent bg, ~600–800px width)
  - [ ] Export mode: bottom-center placement at 40–50% opacity
- [ ] Permissions: photo write (iOS/Android) handled just‑in‑time

### Timeline
- Day 1: Phase 1 (AM), Phase 2 export + iOS flow (PM)
- Day 2: Phase 2 Android + fallbacks (AM), Phase 3 QA/accessibility (PM)
- v1.0 ready EOD Day 2; v1.1 (version/history) Day 3–4

### Open questions
- [ ] Watermark style: wordmark only or logo + wordmark? exact placement?
- [ ] Short link domain for caption?
- [ ] MVP versions: which translations enabled at launch?
- [ ] Exact share caption copy (tone/length)?


