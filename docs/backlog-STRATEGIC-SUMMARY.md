# Strategic Plan Summary - Post-MVP Development

**Date**: 2026-01-03  
**Status**: 🚀 MVP Launched (2-3 weeks live, ~200 visitors/day)  
**Development Capacity**: 4-5 hours/week

---

## Executive Summary

Based on strategic planning session, this document outlines the prioritized roadmap for post-MVP development. The plan focuses on **quick wins**, **time savings**, and **growth drivers** given limited development capacity.

**Primary Goals**: Community building, content quality, engagement, sharing  
**Key Constraint**: 4-5 hours/week development capacity  
**Success Metrics**: Followship growth, Weekly Active Users, SEO, sharing patterns

---

## Top 3 Priorities (Next 4 Weeks)

### 1. 📊 Analytics Foundation (Weeks 1-2, 4-5h)
**Why First**: Need data to inform all other decisions

**Deliverables**:
- Privacy-first analytics implementation (Plausible/Matomo/custom)
- Custom event tracking (WhatsApp shares, search queries, page views)
- Simple admin dashboard
- GDPR-compliant cookie consent (if needed)

**Impact**: Enables data-driven prioritization of all future work

---

### 2. 🔗 Search Result Sharing (Weeks 2-3, 2-3h)
**Why Second**: Quick win that enables WhatsApp sharing, drives engagement

**Deliverables**:
- URL parameters for search queries
- Shareable search result links
- WhatsApp-friendly sharing buttons

**Impact**: Users can share filtered searches, increases engagement and discovery

---

### 3. 🔍 SEO Quick Wins (Weeks 3-4, 3-5h)
**Why Third**: Critical foundation to prevent duplicate content issues, then improves social sharing previews and organic discovery

**Deliverables**:
- **Domain canonicalization** (CRITICAL FIRST - 1-2h)
  - Configure nginx redirects: `jingle.ar` → `www.jingle.ar`, `jinglero.duckdns.org` → `www.jingle.ar`
  - Set canonical URLs in HTML
  - Update sitemap to use canonical domain only
  - **Current Issue**: Site accessible via 4 routes (IP, jingle.ar, www.jingle.ar, jinglero.duckdns.org) causing duplicate content and split link equity
  - **Rationale**: `www.jingle.ar` leverages DuckDNS re-routing for resilience against IP changes on home server hosting
- Meta tags and Open Graph optimization (1-2h)
- Structured data (JSON-LD) for entities (1-2h)
- Sitemap generation and submission (30min)

**Impact**: Prevents duplicate content penalties, consolidates link equity, better link previews on Instagram/WhatsApp, improved search rankings

---

## 12-Week Roadmap Overview

### Phase 1: Foundation & Quick Wins (Weeks 1-4)
- Analytics foundation
- Search sharing
- SEO basics
- **Total**: ~8-11 hours

### Phase 2: Engagement & Time Savings (Weeks 5-8)
- Search filtering & sorting (core differentiator)
- Admin portal improvements (reduces curation time)
- UI polish for sharing
- **Total**: ~10-15 hours

### Phase 3: Automation & Growth (Weeks 9-12)
- Social media automation (daily posting)
- External automation (YouTube API + make.com)
- **Total**: ~12-16 hours

### Phase 4: Ongoing Enhancement
- Continuous improvement based on analytics
- Iterative refinements
- Performance optimization

---

## Strategic Themes Prioritized

| Theme | Priority | Effort | Impact | Timeline |
|-------|----------|--------|--------|----------|
| **Analytics & Tracking** | HIGH | LOW-MED | HIGH | Weeks 1-2 |
| **Search Sharing** | HIGH | LOW | HIGH | Weeks 2-3 |
| **SEO Basics** | MED-HIGH | LOW | HIGH | Weeks 3-4 |
| **Advanced Search UX** | HIGH | MED | HIGH | Weeks 5-6 |
| **Admin Portal Improvements** | HIGH | MED | HIGH | Weeks 6-7 |
| **Social Media Automation** | HIGH | MED | HIGH | Weeks 9-10 |
| **External Automation** | HIGH | MED-HIGH | HIGH | Weeks 11-12 |
| **UI/UX Refinements** | MED | LOW-MED | MED | Ongoing |
| **Feedback Loops** | LOW | MED | LOW-MED | Deferred |

---

## Key Decisions & Trade-offs

### ✅ Prioritized
1. **Analytics first** - Data informs all decisions
2. **Quick wins** - Search sharing, SEO basics
3. **Time savings** - Admin portal improvements, automation
4. **Growth drivers** - Social media automation, SEO

### ⏸️ Deferred
1. **Feedback loops** - Low current demand, can add when user base grows
2. **Major redesigns** - Incremental improvements instead
3. **Advanced features** - Focus on core differentiators first

### 🎯 Focus Areas
1. **Shareability** - WhatsApp sharing, Instagram-friendly visuals
2. **Pattern Discovery** - Search filtering enables relationship exploration
3. **Automation** - Reduce manual curation and social media work
4. **Data-Driven** - Analytics foundation for all decisions

---

## Success Metrics

### Primary KPIs
- **Weekly Active Users (WAU)**: Track growth from baseline
- **Instagram Followers**: Grow from 13
- **WhatsApp Shares**: Measure via analytics
- **Session Duration**: Track engagement
- **Search Usage**: Query patterns and frequency

### Baseline (Current)
- ~200 visitors/day
- 13 Instagram followers
- 2-3 weeks live
- No formal analytics
- Manual social media posting
- Manual database curation (bottleneck: Jingle→Cancion matching)

---

## Dependencies & Sequencing

### Critical Path
1. Analytics → Informs all decisions
2. Search Sharing → Quick engagement win
3. SEO Basics → Improves social sharing
4. Search UX → Core differentiator
5. Admin Improvements → Time savings
6. Social Automation → Growth driver

### Can Work in Parallel
- UI/UX polish (incremental)
- SEO improvements (ongoing)
- Database automation setup (independent)

---

## Risk Mitigation

**Limited Capacity (4-5h/week)**:
- ✅ Focus on quick wins first
- ✅ Automate repetitive tasks
- ✅ Defer low-impact items
- ✅ Batch similar work

**Low User Base**:
- ✅ Prioritize growth drivers
- ✅ Focus on shareability
- ✅ Defer feedback until user base grows

**Time-Consuming Curation**:
- ✅ Prioritize admin portal improvements
- ✅ Set up external automation early
- ✅ Batch curation work efficiently

---

## Next Steps

1. **Review & Approve**: Review this strategic plan and roadmap
2. **Start Phase 1**: Begin with analytics foundation
3. **Track Progress**: Update backlog as work progresses
4. **Iterate**: Use analytics data to adjust priorities

---

## Questions for Future Sessions

As you work through the roadmap, consider:
- Are the effort estimates accurate?
- What new insights emerge from analytics?
- Are there additional quick wins to prioritize?
- Should any priorities shift based on early results?

---

**See `docs/backlog.md` for detailed feature specifications and full roadmap.**

