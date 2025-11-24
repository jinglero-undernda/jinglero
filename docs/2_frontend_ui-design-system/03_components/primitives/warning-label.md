# Component: Warning Label

## Status

- **Status**: implemented
- **Last Updated**: 2025-11-24
- **Last Implemented**: 2025-11-24
- **Design Reference**: `design-philosophy.md`

## Overview

Warning labels display statistics in a black octagon style, referencing contemporary Argentine food warning labels. Used for entity counts and stats reporting on landing page and Admin dashboard. The octagon shape with black background and white text creates a distinctive, industrial aesthetic that matches the design philosophy.

## Design Intent

- **Current**: Black octagon warning labels implemented ✅
- **Target**: Black octagon warning labels for stats reporting

## Variants

### Standard Warning Label (Medium)

- **Usage**: Entity counts, statistics display
- **Visual Spec**:
  - Octagon: 80px × 80px, black background (`--color-warning-label-bg`)
  - Value: Factory signage typography, white text (`--color-warning-label-text`)
  - Label: Factory signage typography, uppercase, below octagon
  - Shadow: `--shadow-md` (metal panel depth)
- **Design Intent**: Literal black octagon with white font, matching Argentine food warning labels
- **Status**: implemented

### Small Warning Label

- **Usage**: Compact spaces, smaller stats
- **Visual Spec**:
  - Octagon: 60px × 60px
  - Value: Smaller font size (`--font-size-h4`)
  - Label: Smaller font (`--font-size-caption`)
- **Status**: implemented

### Large Warning Label

- **Usage**: Prominent displays, landing page stats
- **Visual Spec**:
  - Octagon: 100px × 100px
  - Value: Larger font size (`--font-size-h2`)
  - Label: Larger font (`--font-size-body`)
- **Status**: implemented

## Implementation

### CSS File

- **Location**: `frontend/src/styles/components/warning-label.css` ✅
- **Status**: Implemented
- **Dependencies**:
  - Color tokens (`--color-warning-label-*`)
  - Typography tokens (`--font-*`)
  - Shadow tokens (`--shadow-*`)
  - Spacing tokens (`--spacing-*`)

### React Component

- **Location**: `frontend/src/components/common/WarningLabel.tsx` ✅
- **Status**: Implemented
- **Props**: `value` (number | string), `label` (string), `size` ('small' | 'medium' | 'large'), `className` (optional)
- **Usage**:

  ```tsx
  import WarningLabel from "../common/WarningLabel";

  <WarningLabel value={42} label="Fábricas" size="medium" />;
  ```

### Integration

- **AdminDashboard**: Used for entity counts display ✅
- **Home Page**: Available for stats display (if needed)

## Visual Specification

### Octagon Shape

- **Implementation**: CSS `clip-path: polygon()` for octagon shape
- **Background**: `var(--color-warning-label-bg)` (#000000 - black)
- **Shadow**: `var(--shadow-md)` for depth

### Typography

- **Value**: Factory signage font (`--font-family-signage`), bold weight
- **Label**: Factory signage font, semibold weight, uppercase, wide letter spacing
- **Colors**: White text on black octagon, primary text color for label

### Interactive States

- **Hover**: Enhanced shadow with glow effect, slight scale
- **Default**: Standard shadow, no transform

## Usage Guidelines

### When to Use

- **Entity Counts**: Display counts of entities (Fábricas, Jingles, etc.)
- **Statistics**: Show important statistics or metrics
- **Dashboard**: Admin dashboard entity counts
- **Landing Page**: Featured statistics (if applicable)

### Best Practices

- Use medium size for most cases
- Keep labels concise (single word or short phrase)
- Group related warning labels together
- Maintain consistent spacing between labels
- Use for important statistics, not all data

### Accessibility

- Component includes `role="status"` and `aria-label`
- High contrast (black/white) ensures readability
- Value and label are semantically structured

## Related Documentation

- Design tokens: `../../01_system-foundation/tokens/colors.md`
- Design tokens: `../../01_system-foundation/tokens/typography.md`
- Design tokens: `../../01_system-foundation/tokens/shadows.md`
- Design philosophy: `../../01_system-foundation/design-philosophy.md`

## Change History

| Date       | Change                                                                                                | Author           |
| ---------- | ----------------------------------------------------------------------------------------------------- | ---------------- |
| 2025-11-24 | WarningLabel component implemented - CSS and React component complete, integrated into AdminDashboard | Development Team |
