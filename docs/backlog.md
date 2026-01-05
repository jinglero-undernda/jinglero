# Product Backlog - Post-MVP Development

**Status**: 🚀 MVP Launched (2-3 weeks live, ~200 visitors/day)  
**Last Updated**: 2026-01-03  
**Product Manager**: Strategic Planning Session  
**Development Capacity**: 4-5 hours/week

## Overview

This backlog captures post-MVP development priorities for "La Usina de la Fabrica de Jingles". The MVP has been successfully launched with core features (video player, search, entity pages, admin interface).

**Strategic Context**:

- **Primary Goals**: Community building, content quality, engagement, sharing
- **Current State**: 2-3 weeks live, ~200 visitors/day, 13 Instagram followers
- **User Base**: Radio show audience, discovery via Instagram, sharing via WhatsApp
- **Key Constraint**: Limited development capacity (4-5 hours/week)
- **Success Metrics**: Followship growth, Weekly Active Users, SEO, sharing patterns

**Strategic Priorities**:

1. **Quick Wins**: Low-effort, high-impact features that drive engagement and sharing
2. **Time Savings**: Automate manual curation tasks (especially Jingle→Cancion matching)
3. **Discovery**: Improve SEO and social media presence to grow audience
4. **Data-Driven**: Implement analytics to understand what works

## Strategic Themes

### 🎯 Theme 1: Advanced Search & Discovery

**Goal**: Enhance user ability to find and explore content  
**Status**: Planning

### 🗄️ Theme 2: Database Automation & Refinement

**Goal**: Improve data quality, reduce manual curation burden, enable scalability  
**Status**: Planning

### 🎨 Theme 3: UI/UX Refinements

**Goal**: Polish visual design, improve usability, enhance user experience  
**Status**: Planning

### 📈 Theme 4: SEO & Discovery Performance

**Goal**: Increase organic traffic, improve search engine visibility  
**Status**: Planning

### 📊 Theme 5: Analytics & Tracking

**Goal**: Understand user behavior, measure success, inform decisions  
**Status**: Planning

### 💬 Theme 6: Feedback Loops

**Goal**: Enable user feedback, improve content quality through community input  
**Status**: Planning

### 📱 Theme 7: Social Media & Marketing

**Goal**: Grow audience, increase engagement, automate promotion  
**Status**: Planning

---

## Backlog Items

### 🎯 Advanced Search UX (Major UI Change)

**Priority**: HIGH (Strategic Differentiator)  
**Effort**: MEDIUM (8-12 hours over 2-3 weeks)  
**Impact**: HIGH (Drives retention, competitive advantage, pattern discovery)  
**Dependencies**: Analytics (to understand search patterns), URL sharing capability

**Description**:  
Incremental improvements with major UX rethink. Make search more playful, add filtering and sorting to enable pattern discovery between Jingles. This is a key differentiator that drives retention and provides competitive advantage over raw link sharing.

**User Goals**:

- Discover patterns and links between Jingles
- Filter and sort results to explore relationships
- Shareable search results (URL parameters)
- Playful, engaging experience

**Planned Features** (Prioritized):

1. **Search Result Sharing via URL** (Quick Win - 2-3h)

   - Add URL parameters for search queries
   - Shareable links to filtered results
   - WhatsApp-friendly sharing

2. **Filtering & Sorting** (Core Feature - 4-6h)

   - Filter by entity type (Jingles, Canciones, Artistas, Tematicas, Fabricas)
   - Sort by relevance, date, popularity
   - Multi-select filters (e.g., multiple Tematicas)

3. **Playful UX Enhancements** (Enhancement - 2-3h)

   - Visual result previews
   - Pattern visualization hints
   - Related search suggestions
   - Search history (localStorage)

4. **Faceted Search Interface** (Future - if needed)
   - Advanced date range filters
   - Relationship-based filters

**Current State**: Search is functional with minor UX glitches. Backend supports filtering via `types` parameter.

**Success Criteria**:

- Users can share filtered search results via WhatsApp
- Users discover new patterns/relationships
- Increased session duration and return visits

**Related Items**:

- Analytics & Tracking (to understand search behavior) - **DEPENDENCY**
- UI/UX Refinements (design system alignment)

---

### 🗄️ Database Automation and Refinement

**Priority**: HIGH (Time Savings Critical)  
**Effort**: MEDIUM-HIGH (Split into phases)  
**Impact**: HIGH (Frees up time for other work, improves quality)  
**Dependencies**: None (can start immediately)

**Description**:  
**Biggest Time Sink**: Matching Jingles to Canciones. Two-pronged approach to automation:

1. External automation via YouTube API + make.com
2. Improved admin portal for manual validation

**Phase 1: Admin Portal Improvements** (Quick Win - 4-6h)

- A/B comparison interface for matching entries
- Match/transfer properties workflow
- Probable match suggestions (fuzzy matching)
- Batch operations for common tasks

**Phase 2: External Automation** (Strategic - 6-8h)

- YouTube API integration for content discovery
- make.com workflow setup
- Automated data enrichment pipeline
- Manual review queue for suggested matches

**Phase 3: Data Quality Tools** (Enhancement - 3-4h)

- Data validation and integrity checks
- Duplicate detection and merging
- Data quality scoring dashboard
- Automated cleanup scripts

**Success Criteria**:

- 50% reduction in time spent on Jingle→Cancion matching
- Improved match accuracy
- Faster content ingestion

**Related Items**:

- Analytics & Tracking (to identify data gaps)
- Feedback Loops (user-reported errors)

---

### 🎨 UI/UX Refinements

**Priority**: MEDIUM (Ongoing polish)  
**Effort**: LOW-MEDIUM (Incremental improvements)  
**Impact**: MEDIUM (Improves engagement, sharing appeal)  
**Dependencies**: None (can be done incrementally)

**Description**:  
Polish visual design, improve layouts, proportions, spacing. Focus on making screenshots more shareable for Instagram/WhatsApp.

**Priority Areas**:

1. **Shareable Visuals** (Quick Win - 2-3h)

   - Improve entity card designs for screenshots
   - Better visual hierarchy for social sharing
   - Consistent branding across pages

2. **Layout & Spacing** (Incremental - 1-2h/week)

   - Grid system improvements
   - Consistent spacing tokens
   - Responsive refinements

3. **Polish & Micro-interactions** (Ongoing - 1h/week)
   - Loading states
   - Error state improvements
   - Subtle animations

**Success Criteria**:

- Screenshots are visually appealing for Instagram
- Improved user engagement metrics
- Better mobile experience

**Related Items**:

- Advanced Search UX (major UI change)
- Analytics & Tracking (to identify UX issues)
- Social Media (shareable content)

---

### 📈 SEO and Discovery Performance

**Priority**: MEDIUM-HIGH (Growth Driver)  
**Effort**: LOW-MEDIUM (Quick wins available)  
**Impact**: HIGH (Long-term organic growth)  
**Dependencies**: None (can start immediately)

**Description**:  
Improve search engine visibility and organic discovery. Critical for long-term growth.

**Current Domain Configuration Issue**:
The site is currently accessible via 4 different routes, which can confuse search engines and dilute SEO:

- DNS A record (direct IP access)
- `jingle.ar`
- `www.jingle.ar`
- `jinglero.duckdns.org`

**Current nginx Configuration** (from `docs/9_ops_deployment/infrastructure/jinglero`):

- All three domains (`jinglero.duckdns.org`, `jingle.ar`, `www.jingle.ar`) are listed in the same `server_name` directive
- HTTP to HTTPS redirects are in place
- **Problem**: All domains serve identical content without canonicalization

**SEO Impact**: Multiple domains/URLs pointing to the same content can cause:

- Duplicate content penalties (search engines see same content at multiple URLs)
- Split link equity (backlinks spread across domains instead of consolidating)
- Confusion for search engines (which is the canonical version?)
- Diluted rankings and slower indexing
- Reduced authority signals (link juice divided)

**Quick Wins** (3-5h):

1. **Domain Canonicalization & Redirects** (1-2h) - **CRITICAL FIRST STEP**

   **Choose Primary Domain**: `www.jingle.ar` (recommended as canonical - leverages DuckDNS re-routing for resilience, handles IP changes on home server hosting)

   **nginx Configuration Changes**:

   - Modify `/etc/nginx/sites-available/jinglero` to separate server blocks:
     - **Primary server block** (HTTPS): `server_name www.jingle.ar;` (canonical)
     - **Redirect server blocks** (HTTPS): Redirect `jingle.ar` and `jinglero.duckdns.org` to `www.jingle.ar` with 301
     - **HTTP server block**: Redirect all HTTP to HTTPS, then to canonical domain
   - Example nginx configuration:

     ```nginx
     # Primary canonical domain (HTTPS)
     server {
         listen 443 ssl;
         server_name www.jingle.ar;
         # ... existing SSL and location blocks ...
     }

     # Redirect non-www to www (HTTPS)
     server {
         listen 443 ssl;
         server_name jingle.ar;
         ssl_certificate /etc/letsencrypt/live/jinglero.duckdns.org/fullchain.pem;
         ssl_certificate_key /etc/letsencrypt/live/jinglero.duckdns.org/privkey.pem;
         return 301 https://www.jingle.ar$request_uri;
     }

     # Redirect duckdns to canonical (HTTPS)
     server {
         listen 443 ssl;
         server_name jinglero.duckdns.org;
         ssl_certificate /etc/letsencrypt/live/jinglero.duckdns.org/fullchain.pem;
         ssl_certificate_key /etc/letsencrypt/live/jinglero.duckdns.org/privkey.pem;
         return 301 https://www.jingle.ar$request_uri;
     }
     ```

   **Application-Level Changes**:

   - Set canonical URLs in HTML (`<link rel="canonical">` tag in `<head>`)
   - Update all internal links to use `www.jingle.ar` (if hardcoded)
   - Update sitemap.xml to use only `www.jingle.ar` domain
   - Update robots.txt if it references domains
   - Ensure all Open Graph and meta tags use canonical domain

   **Verification Steps**:

   - Test all domain variants redirect correctly (301 status)
   - Verify canonical tag appears on all pages
   - Check Google Search Console for duplicate content warnings
   - Monitor redirect chains (should be minimal: HTTP → HTTPS → canonical)

   **Note on Direct IP Access**:

   - Direct IP access is harder to redirect (nginx needs to detect Host header)
   - Can add catch-all server block, but may not be necessary if DNS is properly configured
   - Consider blocking direct IP access or showing maintenance message

   **Priority**: Do this FIRST before other SEO work - it's foundational

2. **Meta Tags & Open Graph** (1-2h)

   - Entity-specific meta descriptions
   - Open Graph tags for social sharing
   - Twitter Card support
   - Ensure all meta tags use canonical domain

3. **Structured Data (JSON-LD)** (1-2h)

   - Schema.org markup for entities
   - VideoObject schema for Fabricas
   - MusicRecording schema for Canciones
   - Ensure all URLs in structured data use canonical domain

4. **Sitemap & Robots.txt** (30min)
   - Generate sitemap.xml (using canonical domain only)
   - Optimize robots.txt
   - Submit to search engines (Google Search Console, Bing Webmaster Tools)

**Medium-Term** (4-6h):

- Internal linking strategy (ensure all internal links use canonical domain)
- Content optimization for keywords
- Performance optimization (Core Web Vitals)
- Mobile-first improvements
- SSL certificate verification (ensure HTTPS on all domains)
- Domain verification in Google Search Console and Bing Webmaster Tools

**Success Criteria**:

- Single canonical domain established (all traffic redirects to `www.jingle.ar`)
- No duplicate content issues across domains
- Consolidated link equity (all backlinks point to canonical domain)
- Improved search engine rankings
- Increased organic traffic
- Better social media link previews
- All domains properly redirect (301) to canonical

**Related Items**:

- Analytics & Tracking (to measure SEO impact)
- UI/UX Refinements (performance affects SEO)
- Social Media (link previews)

---

### 📊 Visitor Analytics and Tracking

**Priority**: HIGH (Data-Driven Decisions)  
**Effort**: LOW-MEDIUM (Privacy-first, lightweight solution)  
**Impact**: HIGH (Informs all other priorities)  
**Dependencies**: None (foundation for other features)

**Description**:  
Implement privacy-respecting analytics to understand user behavior. Currently using goaccess for basic nginx log analysis.

**Key Metrics Needed**:

- Entry/exit points
- Time spent in app
- Location (country-level, not personal)
- WhatsApp sharing (via share button clicks)
- Search queries
- Page views and sessions

**Implementation Approach** (3-5h):

1. **Privacy-First Analytics** (2-3h)

   - Self-hosted or privacy-respecting tool (Plausible, Matomo, or custom)
   - GDPR-compliant (no personal data collection)
   - Cookie consent banner (if needed)
   - IP anonymization

2. **Custom Event Tracking** (1-2h)

   - WhatsApp share button clicks
   - Search query logging
   - Video playback events
   - Entity page views

3. **Admin Dashboard** (1-2h)
   - Simple analytics view
   - Key metrics at a glance
   - Export capabilities

**Privacy Considerations**:

- No personal information collection
- IP anonymization
- Cookie disclaimer if cookies are used
- GDPR compliance

**Success Criteria**:

- Understand user behavior patterns
- Measure WhatsApp sharing effectiveness
- Identify popular content and search terms
- Data-driven prioritization of features

**Related Items**:

- SEO & Discovery (traffic measurement)
- Feedback Loops (identify pain points)
- Social Media (campaign tracking)
- Advanced Search UX (search pattern analysis)

---

### 💬 Feedback Loops in App and Email Server

**Priority**: LOW (Defer - Limited Engagement)  
**Effort**: MEDIUM (2-4h)  
**Impact**: LOW-MEDIUM (Future value, low current demand)  
**Dependencies**: None

**Description**:  
Enable user feedback and error reporting. Currently minimal engagement, so this can be deferred until user base grows.

**Future Features** (When Needed):

- In-app feedback forms
- Error reporting ("frown" button)
- Content correction suggestions
- Email feedback system
- Admin notification system

**Current State**: No formal or informal feedback received. Instagram followers are minimal (13). Defer until user base grows or feedback demand emerges.

**Success Criteria** (When Implemented):

- Users can report errors easily
- Admin receives actionable feedback
- Feedback loop is closed with users

**Related Items**:

- Database Automation (fix reported errors)
- Analytics & Tracking (feedback patterns)

---

### 📱 Social Media Campaign and Automation

**Priority**: HIGH (Growth Driver)  
**Effort**: MEDIUM (Automation setup + content templates)  
**Impact**: HIGH (Direct growth mechanism)  
**Dependencies**: SEO improvements (for link previews), Analytics (for tracking)

**Description**:  
Automate daily social media content routine. Currently sharing screen-grabs manually, which is not visually appealing. Need automated, themed daily posts.

**Content Strategy** (Daily Themed Posts):

- **Monday**: Feature a Jinglero (factory floor, worker, time punchcard with featured Fabricas)
- **Tuesday**: Feature an Autor (delivery van with artist decals, boxes with songs)
- **Wednesday**: Feature a Cancion (manifest showing all Jingles based on that song)
- **Thursday**: Feature a Fabrica (remind visitors of show context)
- **Friday**: Feature a Tematica (canteen menu style, links to Jingles/Fabricas)

**Implementation** (6-8h):

1. **Content Generation Tools** (3-4h)

   - Automated image generation (templates)
   - Entity data extraction for posts
   - Link generation (search URLs, entity pages)
   - Caption templates with hashtags

2. **Automation Setup** (2-3h)

   - make.com or Zapier workflow
   - Scheduled posting (Instagram, YouTube)
   - Cross-platform posting
   - Link tracking

3. **Visual Improvements** (1-2h)
   - Better screenshot templates
   - Consistent branding
   - Shareable card designs

**Platforms**: Instagram (primary), YouTube (secondary), LinkedIn (future - professional journey posts)

**Success Criteria**:

- Consistent daily posting
- Improved visual appeal
- Increased followship
- Better cross-linking between website, Instagram, YouTube
- Measurable traffic from social media

**Related Items**:

- Analytics & Tracking (campaign performance) - **DEPENDENCY**
- SEO & Discovery (social signals, link previews)
- UI/UX Refinements (shareable visuals)

---

## Prioritized Roadmap

### Phase 1: Foundation & Quick Wins (Weeks 1-4, ~16-20 hours)

**Goal**: Establish analytics foundation, implement quick wins that drive engagement

#### Week 1-2: Analytics Foundation (4-5h)

- ✅ Implement privacy-first analytics
- ✅ Add custom event tracking (WhatsApp shares, search queries)
- ✅ Create simple admin dashboard
- ✅ Cookie consent (if needed)

**Why First**: Data informs all other decisions. Need to understand current behavior before optimizing.

#### Week 2-3: Search Sharing (2-3h)

- ✅ Add URL parameters for search queries
- ✅ Shareable search result links
- ✅ WhatsApp-friendly sharing buttons

**Why Second**: Quick win that enables sharing, drives engagement, low effort.

#### Week 3-4: SEO Quick Wins (3-5h)

- ✅ **Domain canonicalization** (CRITICAL FIRST - 1-2h)
  - Configure nginx redirects (jingle.ar → www.jingle.ar, jinglero.duckdns.org → www.jingle.ar)
  - Set canonical URLs in HTML
  - Update sitemap to use canonical domain only
- ✅ Meta tags and Open Graph (1-2h)
- ✅ Structured data (JSON-LD) (1-2h)
- ✅ Sitemap generation and submission (30min)

**Why Third**: Domain canonicalization is critical foundation (prevents duplicate content issues). Then improves social sharing previews and organic discovery.

### Phase 2: Engagement & Time Savings (Weeks 5-8, ~16-20 hours)

**Goal**: Improve search UX, reduce manual curation time

#### Week 5-6: Search Filtering & Sorting (4-6h)

- ✅ Filter by entity type
- ✅ Sort options (relevance, date)
- ✅ Multi-select filters
- ✅ Playful UX enhancements

**Why**: Core differentiator, drives retention, enables pattern discovery.

#### Week 6-7: Admin Portal Improvements (4-6h)

- ✅ A/B comparison for matching
- ✅ Match/transfer properties workflow
- ✅ Probable match suggestions
- ✅ Batch operations

**Why**: Reduces biggest time sink (Jingle→Cancion matching), frees up time for other work.

#### Week 7-8: UI Polish for Sharing (2-3h)

- ✅ Improve entity card designs
- ✅ Better visual hierarchy
- ✅ Consistent branding

**Why**: Makes screenshots more shareable, improves Instagram content quality.

### Phase 3: Automation & Growth (Weeks 9-12, ~16-20 hours)

**Goal**: Automate social media, external data integration

#### Week 9-10: Social Media Automation (6-8h)

- ✅ Content generation tools
- ✅ Automated posting workflow
- ✅ Visual template improvements
- ✅ Cross-platform posting

**Why**: Enables consistent daily posting, grows audience, reduces manual work.

#### Week 11-12: External Automation Setup (6-8h)

- ✅ YouTube API integration
- ✅ make.com workflow
- ✅ Automated data enrichment
- ✅ Manual review queue

**Why**: Further reduces curation time, enables scalability.

### Phase 4: Enhancement & Optimization (Ongoing, ~4-5h/week)

**Goal**: Continuous improvement based on data and feedback

- Monitor analytics and adjust priorities
- Iterate on search UX based on usage patterns
- Refine social media content strategy
- Ongoing UI/UX polish
- Performance optimization
- Additional SEO improvements

---

## Prioritization Framework

**Criteria** (in order of importance):

1. **Impact on Goals**: Community building, engagement, time savings
2. **Effort vs. Impact**: Quick wins prioritized
3. **Dependencies**: Foundation items first (analytics, SEO)
4. **Strategic Value**: Differentiators (search UX) vs. table stakes (SEO)

**Effort Scale**:

- **LOW**: 1-3 hours
- **MEDIUM**: 4-6 hours
- **HIGH**: 7+ hours

**Impact Scale**:

- **LOW**: Nice to have
- **MEDIUM**: Improves experience
- **HIGH**: Drives growth, saves time, differentiator

---

## Success Metrics & KPIs

### Primary Metrics

- **Weekly Active Users (WAU)**: Target growth from baseline
- **Instagram Followers**: Track growth from 13
- **WhatsApp Shares**: Measure via analytics
- **Session Duration**: Track engagement
- **Search Usage**: Query patterns and frequency

### Secondary Metrics

- **Organic Traffic**: SEO improvements
- **Social Media Referrals**: Track campaign effectiveness
- **Content Coverage**: Database growth rate
- **Time Saved**: Curation efficiency improvements

### Baseline (Current State)

- ~200 visitors/day
- 13 Instagram followers
- 2-3 weeks live
- No formal analytics (goaccess only)
- Manual social media posting
- Manual database curation (Jingle→Cancion matching is bottleneck)

---

## Dependencies & Sequencing

### Critical Path

1. **Analytics** → Informs all other decisions
2. **Search Sharing** → Quick engagement win
3. **SEO Basics** → Improves social sharing
4. **Search UX** → Core differentiator
5. **Admin Improvements** → Time savings
6. **Social Automation** → Growth driver

### Parallel Work

- UI/UX polish can happen incrementally alongside other work
- SEO improvements can continue in parallel
- Database automation (external) can be set up independently

---

## Risk Mitigation

**Limited Capacity (4-5h/week)**:

- Focus on quick wins first
- Automate repetitive tasks
- Defer low-impact items
- Batch similar work

**Low User Base**:

- Prioritize growth drivers (social media, SEO)
- Focus on shareability
- Defer feedback loops until user base grows

**Time-Consuming Curation**:

- Prioritize admin portal improvements
- Set up external automation early
- Batch curation work efficiently

---

## Change History

| Date       | Change                                                                                                                                        | Author          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 2026-01-03 | Strategic planning session completed. Added prioritized roadmap, success metrics, and detailed feature specifications based on user interview | Product Manager |
| 2025-01-20 | Initial backlog creation with strategic themes                                                                                                | Product Manager |

---

## Strategic Insights from Planning Session

### Key Findings

1. **Limited capacity (4-5h/week)** requires focus on high-impact, low-effort items
2. **Community building and engagement** are primary goals
3. **WhatsApp sharing** is critical distribution channel
4. **Database curation** (Jingle→Cancion matching) is biggest time sink
5. **Social media automation** needed for consistent daily posting
6. **Analytics foundation** required to make data-driven decisions

### Strategic Recommendations

1. **Start with analytics** - Need data to inform all other decisions
2. **Quick wins first** - Search sharing, SEO basics, UI polish for screenshots
3. **Automate time sinks** - Admin portal improvements, external automation
4. **Focus on growth** - Social media automation, SEO, shareability
5. **Defer low-impact** - Feedback loops can wait until user base grows

### Trade-offs Made

- **Feedback loops deferred**: Low current demand, can add later
- **Incremental approach**: Major redesigns avoided, focus on quick wins
- **Privacy-first analytics**: GDPR compliance prioritized
- **Automation over manual**: Social media and curation automation prioritized

---

**Note**: This backlog is a living document. Priorities, effort estimates, and timelines will be updated based on:

- Analytics data (once implemented)
- User feedback (as user base grows)
- Resource availability changes
- Strategic goal shifts
