# Performance Targets: Frontend Performance

## Status

- **Status**: current_implementation
- **Last Updated**: 2025-11-25
- **Last Validated**: not yet validated
- **Code Reference**: `frontend/src/`, `frontend/vite.config.ts`

## Overview

This document defines performance targets for the React frontend application. The frontend is built with React, TypeScript, and Vite. Performance targets focus on page load time, component rendering performance, API request optimization, and user experience metrics.

## Performance Targets

### Initial Page Load Time

**Metric**: Time to Interactive (TTI)  
**Target Value**: < 3 seconds on 3G connection  
**Current Value**: not yet measured  
**Measurement Method**: Lighthouse TTI metric or browser Performance API  
**Code Reference**: `frontend/src/main.tsx`, `frontend/src/App.tsx`

**Context**:

- First meaningful paint and interactive time
- Includes JavaScript bundle loading, React hydration, initial API calls
- Critical for user experience, especially on mobile devices
- MVP deployment target is local development, but should consider production performance

**Validation**:

- Measure TTI using Lighthouse or browser DevTools
- Test on various network conditions (3G, 4G, WiFi)
- Test on various devices (desktop, mobile)
- Validate bundle size and code splitting

**Monitoring**:

- Add performance monitoring to track TTI
- Monitor bundle size and loading time
- Track API request timing during page load
- Alert if TTI exceeds 3 seconds

---

### First Contentful Paint (FCP)

**Metric**: First Contentful Paint  
**Target Value**: < 1.5 seconds  
**Current Value**: not yet measured  
**Measurement Method**: Lighthouse FCP metric or browser Performance API  
**Code Reference**: `frontend/src/main.tsx`, `frontend/src/pages/`

**Context**:

- Time until first content is rendered (text, images, etc.)
- Critical for perceived performance
- Affected by bundle size, CSS loading, initial render

**Validation**:

- Measure FCP using Lighthouse or browser DevTools
- Test on various network conditions
- Optimize initial render performance

**Monitoring**:

- Add performance monitoring to track FCP
- Monitor CSS loading time
- Track initial render performance
- Alert if FCP exceeds 1.5 seconds

---

### API Request Performance

**Metric**: API Request Time  
**Target Value**: < 500ms (95th percentile) for search requests, < 200ms for entity detail requests  
**Current Value**: not yet measured  
**Measurement Method**: Time from API request initiation to response received  
**Code Reference**: `frontend/src/lib/api/client.ts`, `frontend/src/components/common/RelatedEntities.tsx`

**Context**:

- Frontend makes API requests to backend
- Search requests should align with backend search target (< 500ms)
- Entity detail requests should align with backend entity target (< 200ms)
- Request deduplication and abort controllers prevent redundant requests

**Validation**:

- Measure API request time in browser DevTools Network tab
- Test with typical usage patterns
- Validate request deduplication effectiveness

**Monitoring**:

- Add API request timing logging
- Track request times by endpoint
- Monitor request deduplication effectiveness
- Alert if request times exceed targets

---

### Component Render Performance

**Metric**: Component Render Time  
**Target Value**: < 16ms per frame (60 FPS) for interactive components  
**Current Value**: not yet measured  
**Measurement Method**: React DevTools Profiler or browser Performance API  
**Code Reference**: `frontend/src/components/`, `frontend/src/pages/`

**Context**:

- React components should render efficiently
- Interactive components (video player, search) should maintain 60 FPS
- Large lists may cause performance issues without virtualization

**Validation**:

- Profile component rendering using React DevTools
- Measure frame rendering time
- Test with large datasets (1,300+ Jingles in lists)

**Monitoring**:

- Use React DevTools Profiler for development
- Monitor component render times
- Track re-render frequency
- Alert if render times exceed 16ms consistently

---

### Search Autocomplete Performance

**Metric**: Autocomplete Response Time  
**Target Value**: < 300ms from user input to results display (debounced)  
**Current Value**: not yet measured  
**Measurement Method**: Time from debounced input to results rendered  
**Code Reference**: `frontend/src/components/search/SearchBar.tsx`, `frontend/src/lib/hooks/useSearch.ts`

**Context**:

- Autocomplete triggers after 3+ characters with debouncing
- Results should display quickly for good UX
- Uses search API endpoint

**Validation**:

- Measure autocomplete response time
- Test with various input patterns
- Validate debouncing effectiveness

**Monitoring**:

- Add autocomplete timing logging
- Track autocomplete request times
- Monitor debounce effectiveness
- Alert if response time exceeds 300ms

---

### Bundle Size

**Metric**: JavaScript Bundle Size  
**Target Value**: < 500 KB (main bundle, minified)  
**Current Value**: 515.16 KB (main bundle), 136.39 KB (gzipped)  
**Measurement Method**: Vite build output analysis  
**Code Reference**: `frontend/vite.config.ts`, `frontend/src/App.tsx`, `frontend/src/pages/AdminPage.tsx`

**Context**:

- Main bundle size affects initial page load time and Time to Interactive (TTI)
- Current build produces warning: "Some chunks are larger than 500 kB after minification"
- All routes are statically imported, causing all code to load upfront
- Bundle includes: vendor libraries (175.49 KB), UI libraries (18.85 KB), and application code (515.16 KB main bundle)
- Critical for user experience, especially on mobile devices and slower connections

**Validation**:

- Measure bundle size using `npm run build` output
- Analyze chunk sizes and identify optimization opportunities
- Test initial load time with optimized bundles
- Validate code splitting effectiveness

**Monitoring**:

- Track bundle size in CI/CD pipeline
- Monitor bundle size trends over time
- Alert if bundle size exceeds 500 KB threshold
- Use bundle analyzer tools to identify large dependencies

---

## Performance Metrics

### Time to Interactive (TTI)

**Type**: Response Time  
**Unit**: seconds (s)  
**Definition**: Time until page is interactive (user can interact with page)  
**Calculation**: Browser Performance API TTI metric  
**Code Reference**: Not yet implemented - performance monitoring needed

**Current Value**: not yet measured  
**Baseline**: not yet established  
**Trend**: not yet tracked

**Tracking**:

- Performance monitoring not yet implemented
- Need to add TTI tracking using Performance API
- Consider using Lighthouse CI for automated testing

---

### First Contentful Paint (FCP)

**Type**: Response Time  
**Unit**: seconds (s)  
**Definition**: Time until first content is painted to screen  
**Calculation**: Browser Performance API FCP metric  
**Code Reference**: Not yet implemented - performance monitoring needed

**Current Value**: not yet measured  
**Baseline**: not yet established  
**Trend**: not yet tracked

**Tracking**:

- Performance monitoring not yet implemented
- Need to add FCP tracking using Performance API
- Consider using Lighthouse CI for automated testing

---

### Bundle Size

**Type**: Resource Usage  
**Unit**: kilobytes (KB) or megabytes (MB)  
**Definition**: JavaScript bundle size after build  
**Calculation**: Vite build output analysis  
**Code Reference**: `frontend/vite.config.ts`, `frontend/package.json`, build output

**Current Value**:

- Main bundle: 515.16 KB (minified)
- Gzipped: 136.39 KB
- Vendor chunk: 175.49 KB (gzipped: 58.00 KB)
- UI chunk: 18.85 KB (gzipped: 7.66 KB)
- CSS: 66.75 KB (gzipped: 10.48 KB)

**Baseline**:

- Initial measurement: 2025-11-25
- Main bundle exceeds 500 KB threshold (warning generated)
- All routes statically imported in `App.tsx` and `AdminPage.tsx`

**Trend**:

- Not yet tracked over time
- Build warning indicates need for optimization

**Tracking**:

- Vite provides build size output in console
- Build warning generated when chunks exceed 500 KB
- Need to automate bundle size tracking in CI/CD
- Consider using bundle analyzer tools (e.g., `rollup-plugin-visualizer`)

---

### API Request Count

**Type**: Throughput  
**Unit**: requests per page load  
**Definition**: Number of API requests made during page load  
**Calculation**: Count of API requests in Network tab  
**Code Reference**: `frontend/src/lib/api/client.ts`, `frontend/src/components/common/RelatedEntities.tsx`

**Current Value**:

- Entity detail pages: 1+ requests (entity + relationships)
- Search pages: 1 request (search API)
- List pages: 1 request (list API)
  **Baseline**: Current implementation  
  **Trend**: Optimized with request deduplication and lazy loading

**Tracking**:

- Request counting not automated
- Browser DevTools Network tab shows requests
- Need to add request counting for monitoring

---

## Monitoring Strategy

### Monitoring Tools

#### Browser DevTools

- **Purpose**: Manual performance analysis and debugging
- **Configuration**: Built into browsers
- **Usage**: Performance profiling, Network analysis, React DevTools

#### React DevTools Profiler

- **Purpose**: Analyze React component rendering performance
- **Configuration**: React DevTools browser extension
- **Usage**: Component render profiling, performance optimization

#### Vite Build Analysis

- **Purpose**: Analyze bundle size and build performance
- **Configuration**: `frontend/vite.config.ts`
- **Usage**: Build size analysis, code splitting optimization

### Alerting Rules

#### Slow Page Load Alert

- **Condition**: TTI exceeds 3 seconds for 5+ page loads
- **Threshold**: TTI > 3 seconds
- **Action**: Alert development team, investigate bundle size and API performance

#### High API Request Time Alert

- **Condition**: API request time exceeds target for 5+ requests
- **Threshold**:
  - Search requests: > 500ms
  - Entity detail requests: > 200ms
- **Action**: Alert development team, investigate backend performance

### Dashboards

#### Frontend Performance Dashboard

- **Purpose**: Monitor frontend performance metrics
- **Metrics**:
  - TTI and FCP by page
  - Bundle size over time
  - API request times by endpoint
  - Component render times
- **Location**: Not yet implemented - need to set up monitoring dashboard

---

## Optimization Opportunities

### Current Performance

#### Bundle Size and Code Splitting

- **Current State**:
  - Main bundle: 515.16 KB (exceeds 500 KB threshold)
  - All routes statically imported in `App.tsx` and `AdminPage.tsx`
  - No route-based code splitting implemented
  - Basic vendor/ui chunking in `vite.config.ts` (vendor: react/react-dom/react-router, ui: emotion libraries)
- **Bottlenecks**:
  - All page components loaded upfront regardless of route
  - Admin pages (AdminDashboard, AdminEntityAnalyze, etc.) included in main bundle
  - Inspect pages (InspectJingle, InspectCancion, etc.) included in main bundle
  - Large vendor libraries bundled together
- **Issues**:
  - Large initial bundle size (515.16 KB)
  - Build warning: "Some chunks are larger than 500 kB after minification"
  - Slower initial page load, especially on mobile/slower connections
  - Users download code for routes they may never visit

#### Component Optimization

- **Current State**: Request deduplication, abort controllers, lazy loading implemented
- **Bottlenecks**: No memoization, no virtualization for large lists
- **Issues**: Potential re-render performance issues

#### API Request Optimization

- **Current State**: Request deduplication and abort controllers implemented
- **Bottlenecks**: No request caching
- **Issues**: Redundant requests for same data

### Optimization Opportunities

#### Bundle Size Optimization (High Priority)

**Description**: Implement route-based code splitting and enhanced chunk configuration to reduce initial bundle size from 515.16 KB to under 500 KB target, with goal of ~200-300 KB main bundle.

**Current State**:

- Main bundle: 515.16 KB (minified), 136.39 KB (gzipped)
- All routes statically imported: `App.tsx` imports Home, FabricaPage, InspectJingle, InspectCancion, InspectFabrica, InspectArtista, InspectTematica, AdminPage, SearchResultsPage
- Admin routes statically imported: `AdminPage.tsx` imports AdminHome, AdminDashboard, AdminEntityAnalyze, AdminEntityList, AdminLogin, DesignSystemShowcase
- Basic chunking: vendor (react/react-dom/react-router), ui (emotion libraries)

**Optimization Plan - Phase 1: Route-Based Code Splitting (High Impact)**

**Goal**: Split routes into separate chunks so users only load what they need

**Changes Needed**:

1. **Convert static imports to lazy loading in `App.tsx`**:

   - Convert page imports to `React.lazy()` with `Suspense` boundaries
   - Keep `Home` and `SearchResultsPage` in main bundle (most common routes)
   - Lazy load: `FabricaPage`, `InspectJingle`, `InspectCancion`, `InspectFabrica`, `InspectArtista`, `InspectTematica`, `AdminPage`

2. **Convert static imports to lazy loading in `AdminPage.tsx`**:
   - Lazy load all admin sub-pages: `AdminHome`, `AdminDashboard`, `AdminEntityAnalyze`, `AdminEntityList`, `AdminLogin`, `DesignSystemShowcase`
   - Keep `ProtectedRoute` wrapper in main bundle

**Files to Modify**:

- `frontend/src/App.tsx` - Add lazy loading and Suspense
- `frontend/src/pages/AdminPage.tsx` - Add lazy loading for admin routes

**Expected Impact**: Reduce main bundle by ~200-300KB (admin pages are large)

**Implementation Pattern**:

```typescript
// Example for App.tsx
import { lazy, Suspense } from "react";

const FabricaPage = lazy(() => import("./pages/FabricaPage"));
const InspectJingle = lazy(() => import("./pages/inspect/InspectJingle"));
// ... etc

// In Routes:
<Route
  path="/show/:fabricaId"
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <FabricaPage />
    </Suspense>
  }
/>;
```

**Optimization Plan - Phase 2: Enhanced Chunk Configuration (Medium Impact)**

**Goal**: Better separation of vendor libraries for improved caching and parallel loading

**Changes Needed**:

1. **Update `vite.config.ts`**:
   - Split large libraries into separate chunks:
     - `react-query`: `@tanstack/react-query`
     - `axios`: `axios`
     - `datepicker`: `react-datepicker`
     - `select`: `react-select`
     - `emotion`: `@emotion/react`, `@emotion/styled`
   - Group smaller utilities together

**Files to Modify**:

- `frontend/vite.config.ts` - Enhance `manualChunks` configuration

**Expected Impact**: Better caching, parallel loading, ~50-100KB reduction in main bundle

**Implementation Pattern**:

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        // React core
        if (id.includes("react") || id.includes("react-dom")) {
          return "react-vendor";
        }
        // React Router
        if (id.includes("react-router")) {
          return "router";
        }
        // React Query
        if (id.includes("@tanstack/react-query")) {
          return "react-query";
        }
        // HTTP client
        if (id.includes("axios")) {
          return "axios";
        }
        // UI libraries
        if (
          id.includes("@emotion") ||
          id.includes("react-datepicker") ||
          id.includes("react-select")
        ) {
          return "ui-libs";
        }
        // Admin pages
        if (id.includes("/pages/admin/")) {
          return "admin";
        }
        // Inspect pages
        if (id.includes("/pages/inspect/")) {
          return "inspect";
        }
      };
    }
  }
}
```

**Optimization Plan - Phase 3: Component-Level Splitting (Low Priority)**

**Goal**: Split large components that aren't always needed

**Considerations**:

- Large admin components (AdminDashboard, AdminEntityAnalyze)
- Design system showcase (only needed in dev/admin)
- Heavy inspection pages

**Note**: This may not be necessary if Phases 1-2 achieve sufficient reduction

**Impact**:

- Phase 1: Reduce main bundle by ~200-300KB (high impact)
- Phase 2: Additional ~50-100KB reduction, better caching (medium impact)
- Phase 3: Further optimization if needed (low priority)

**Effort**:

- Phase 1: Medium (4-8 hours) - Route splitting with testing
- Phase 2: Small (1-2 hours) - Config changes
- Phase 3: Medium (4-8 hours) - If needed
- **Total**: 5-10 hours (or 9-18 hours if Phase 3 needed)

**Cost**: Minimal (development time only)

**Risks**:

- **Low**: Lazy loading adds complexity but is well-supported
- **Low**: Need to add loading states (UX consideration)
- **Low**: Slight delay on first route navigation (acceptable trade-off)

**Success Criteria**:

- [ ] Main bundle under 500KB (target: ~200-300KB)
- [ ] No build warnings about large chunks
- [ ] All routes still functional
- [ ] Loading states implemented for lazy-loaded routes
- [ ] Initial page load time improved

**When to Implement**: After MVP when all core features are complete and component structure is stable

**Code References**:

- `frontend/vite.config.ts:32-43` - Current chunk configuration
- `frontend/src/App.tsx:4-12` - Static route imports
- `frontend/src/pages/AdminPage.tsx:2-7` - Static admin route imports

#### Add Component Memoization

- **Description**: Use React.memo, useMemo, useCallback for expensive operations
- **Impact**: Reduce unnecessary re-renders
- **Effort**: Medium (2-3 days)
- **Cost**: Minimal (development time)

#### Implement Virtual Scrolling

- **Description**: Virtualize long lists for better performance
- **Impact**: Improve rendering performance for large lists
- **Effort**: High (3-5 days)
- **Cost**: Minimal (library dependency)

#### Add Request Caching

- **Description**: Cache API responses to reduce redundant requests
- **Impact**: Reduce API load and improve perceived performance
- **Effort**: Medium (2-3 days)
- **Cost**: Minimal (memory usage)

### Cost Analysis

#### Current Cost

- **Infrastructure**: Local development (minimal cost)
- **Hosting**: Future deployment to Render/Vercel (post-MVP)
- **Monitoring**: None (no monitoring tools)

#### Optimization Impact

- **Code Splitting**: May require additional build configuration
- **Caching**: May require additional memory
- **Monitoring**: May require additional infrastructure
- **Cost Tradeoffs**: Performance improvements improve user experience and may reduce hosting costs

---

## Change History

- **2025-11-25**: Bundle size optimization plan documented

  - Added Bundle Size performance target (target: < 500 KB, current: 515.16 KB)
  - Updated Bundle Size metric with current measured values
  - Documented detailed bundle optimization plan with 3 phases
  - Identified route-based code splitting as high-priority optimization
  - Noted build warning about large chunks

- **2025-11-24**: Initial performance documentation created
  - Documented frontend performance targets
  - Documented current implementation characteristics
  - Noted absence of performance monitoring
  - Identified optimization opportunities
