# Design Tokens: Typography

## Status

- **Status**: draft
- **Last Updated**: 2025-11-24
- **Last Validated**: not yet validated
- **Code Reference**: `frontend/src/styles/theme/variables.css:12-14` (current implementation)
- **Design Reference**: `design-philosophy.md`

## Overview

Typography system for the Jinglero industrial design system. Based on **mid-century Argentine advertising** with **factory signage styles** for headings and navigation. Typography should feel utilitarian yet expressive, reflecting the Peronist-era industrial aesthetic.

## Design Philosophy

- **Reference**: Mid-century Argentine advertising
- **Headings/Navigation**: Factory signage style (bold, industrial, readable)
- **Body text**: Utilitarian, readable
- **Long-form content**: Typewritten report aesthetic for search results and documentation

## Typography Scale

### Font Families

#### Primary Font (Factory Signage)

- **Value**: `'Bebas Neue', 'Impact', 'Arial Black', 'Helvetica Neue', sans-serif`
- **CSS Variable**: `--font-family-signage`
- **Usage**: Headings, navigation buttons, factory signage elements
- **Design Intent**: Bold, industrial, mid-century factory signage aesthetic
- **Status**: draft
- **Notes**: Bebas Neue provides authentic mid-century feel; Impact/Arial Black as fallbacks

#### Body Font (Utilitarian)

- **Value**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`
- **CSS Variable**: `--font-family-body`
- **Usage**: Body text, paragraphs, general content
- **Design Intent**: Utilitarian, readable, system-native feel
- **Status**: draft

#### Monospace Font (Typewritten Reports)

- **Value**: `'Courier New', 'Courier', 'Lucida Console', monospace`
- **CSS Variable**: `--font-family-monospace`
- **Usage**: Search results, long-form documentation, typewritten reports
- **Design Intent**: Typewritten report aesthetic for functional clarity
- **Status**: draft

### Font Sizes

#### Display (Factory Signage - Extra Large)

- **Value**: `4rem` (64px)
- **CSS Variable**: `--font-size-display`
- **Usage**: Landing page hero, major factory signage
- **Line Height**: `1.1`
- **Font Weight**: `700` (bold)
- **Status**: draft

#### H1 (Factory Signage - Large)

- **Value**: `3rem` (48px)
- **CSS Variable**: `--font-size-h1`
- **Usage**: Page headings, major section headings
- **Line Height**: `1.2`
- **Font Weight**: `700` (bold)
- **Status**: draft

#### H2 (Factory Signage - Medium Large)

- **Value**: `2.25rem` (36px)
- **CSS Variable**: `--font-size-h2`
- **Usage**: Section headings, subsection headings
- **Line Height**: `1.3`
- **Font Weight**: `700` (bold)
- **Status**: draft

#### H3 (Factory Signage - Medium)

- **Value**: `1.75rem` (28px)
- **CSS Variable**: `--font-size-h3`
- **Usage**: Subsection headings, card titles
- **Line Height**: `1.4`
- **Font Weight**: `600` (semi-bold)
- **Status**: draft

#### H4 (Factory Signage - Small)

- **Value**: `1.5rem` (24px)
- **CSS Variable**: `--font-size-h4`
- **Usage**: Component headings, small section headings
- **Line Height**: `1.4`
- **Font Weight**: `600` (semi-bold)
- **Status**: draft

#### H5 (Navigation/Controls)

- **Value**: `1.25rem` (20px)
- **CSS Variable**: `--font-size-h5`
- **Usage**: Navigation items, control labels
- **Line Height**: `1.5`
- **Font Weight**: `600` (semi-bold)
- **Status**: draft

#### H6 (Labels)

- **Value**: `1rem` (16px)
- **CSS Variable**: `--font-size-h6`
- **Usage**: Form labels, small headings
- **Line Height**: `1.5`
- **Font Weight**: `600` (semi-bold)
- **Status**: draft

#### Body Large

- **Value**: `1.125rem` (18px)
- **CSS Variable**: `--font-size-body-large`
- **Usage**: Emphasized body text, lead paragraphs
- **Line Height**: `1.6`
- **Font Weight**: `400` (regular)
- **Status**: draft

#### Body (Base)

- **Value**: `1rem` (16px)
- **CSS Variable**: `--font-size-body`
- **Usage**: Standard body text, paragraphs
- **Line Height**: `1.5`
- **Font Weight**: `400` (regular)
- **Status**: draft

#### Body Small

- **Value**: `0.875rem` (14px)
- **CSS Variable**: `--font-size-body-small`
- **Usage**: Secondary text, metadata, captions
- **Line Height**: `1.5`
- **Font Weight**: `400` (regular)
- **Status**: draft

#### Caption

- **Value**: `0.75rem` (12px)
- **CSS Variable**: `--font-size-caption`
- **Usage**: Small labels, timestamps, fine print
- **Line Height**: `1.4`
- **Font Weight**: `400` (regular)
- **Status**: draft

### Font Weights

#### Bold (700)

- **CSS Variable**: `--font-weight-bold`
- **Usage**: Factory signage headings, strong emphasis
- **Status**: draft

#### Semi-Bold (600)

- **CSS Variable**: `--font-weight-semibold`
- **Usage**: Subheadings, navigation, medium emphasis
- **Status**: draft

#### Regular (400)

- **CSS Variable**: `--font-weight-regular`
- **Usage**: Body text, standard content
- **Status**: draft

#### Light (300)

- **CSS Variable**: `--font-weight-light`
- **Usage**: Decorative text, subtle emphasis (optional)
- **Status**: draft

### Line Heights

#### Tight (1.1)

- **CSS Variable**: `--line-height-tight`
- **Usage**: Display text, large headings
- **Status**: draft

#### Normal (1.5)

- **CSS Variable**: `--line-height-normal`
- **Usage**: Body text, standard content
- **Status**: draft

#### Relaxed (1.6)

- **CSS Variable**: `--line-height-relaxed`
- **Usage**: Long-form content, readable paragraphs
- **Status**: draft

### Letter Spacing

#### Tight (-0.02em)

- **CSS Variable**: `--letter-spacing-tight`
- **Usage**: Factory signage headings (condensed look)
- **Status**: draft

#### Normal (0)

- **CSS Variable**: `--letter-spacing-normal`
- **Usage**: Standard body text
- **Status**: draft

#### Wide (0.05em)

- **CSS Variable**: `--letter-spacing-wide`
- **Usage**: Uppercase labels, navigation items
- **Status**: draft

## Current Implementation

The current implementation uses a basic system font stack:

```css
--font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
--font-size-base: 16px;
--line-height-base: 1.5;
```

**Code Reference**: `frontend/src/styles/theme/variables.css:12-14`

## Usage Guidelines

### Typography Hierarchy

1. **Factory Signage**: Use `--font-family-signage` for all headings (H1-H4) and navigation buttons
2. **Body Text**: Use `--font-family-body` for paragraphs and general content
3. **Typewritten Reports**: Use `--font-family-monospace` for search results and long-form documentation

### Heading Usage

- **Display**: Landing page hero, major factory signage
- **H1**: Page titles, major sections
- **H2**: Section headings
- **H3**: Subsection headings, card titles
- **H4**: Component headings
- **H5**: Navigation items, control labels
- **H6**: Form labels, small headings

### Factory Signage Style

- **Bold weight**: All factory signage headings should use bold (700) or semi-bold (600)
- **Tight letter spacing**: Use `--letter-spacing-tight` for condensed industrial look
- **Uppercase**: Consider uppercase for navigation and labels (with `--letter-spacing-wide`)
- **High contrast**: Ensure readability on dark industrial backgrounds

### Typewritten Reports

- **Monospace font**: Use for search results, documentation, long-form text
- **Relaxed line height**: Use `--line-height-relaxed` for readability
- **Body size**: Use `--font-size-body` or `--font-size-body-large`

## Implementation Notes

### Font Loading

- **Bebas Neue**: Load from Google Fonts or self-host
- **Fallbacks**: Ensure Impact/Arial Black are available as fallbacks
- **Performance**: Consider font-display: swap for better loading performance

### Responsive Typography

- Scale font sizes appropriately for mobile devices
- Maintain readability across screen sizes
- Factory signage should remain bold and readable at all sizes

## Change History

| Date       | Change                                                           | Author      |
| ---------- | ---------------------------------------------------------------- | ----------- |
| 2025-11-24 | Redesigned typography system with factory signage styles (draft) | Design Team |
| 2025-11-19 | Initial documentation of current implementation                  | Design Team |
